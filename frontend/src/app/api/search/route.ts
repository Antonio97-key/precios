import { NextResponse } from 'next/server';
import { productService } from '@/lib/services/productService';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const STORES = ["Amazon", "MercadoLibre", "eBay", "Temu", "Shein", "AliExpress"];

async function searchProducts(query: string): Promise<any[]> {
    try {
        // Usamos la API pública de MercadoLibre (Site MLA - Argentina por defecto, pero escalable)
        const response = await fetch(
            `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=15`
        );
        if (response.ok) {
            const data = await response.json();
            return data.results || [];
        }
    } catch (e) {
        console.error("Real search fetch error:", e);
    }
    return [];
}

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // CAPA 1: n8n (Prioridad Máxima)
        const n8nWebhookUrl = process.env.N8N_SEARCH_WEBHOOK_URL;
        let n8nResults = [];
        if (n8nWebhookUrl) {
            try {
                const response = await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query, timestamp: new Date().toISOString() }),
                    signal: AbortSignal.timeout(8000)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    n8nResults = data.results || [];
                }
            } catch (e) { 
                console.warn("n8n search failed, falling back to local aggregator");
            }
        }

        // CAPA 2: Agregador Local (Simulado)
        let rawProducts = await searchProducts(query);
        if (rawProducts.length === 0 && query.includes(' ')) {
            rawProducts = await searchProducts(query.split(' ')[0]);
        }

        const results: any[] = [];
        const now = new Date().toISOString();

        const marketMultipliers: Record<string, number> = {
            "Amazon": 1.0, "MercadoLibre": 0.95, "eBay": 1.02, "Temu": 0.75, "Shein": 0.82, "AliExpress": 0.70
        };

        // Si tenemos resultados de n8n, los procesamos. Si no, procesamos los de MercadoLibre.
        const sourceData = n8nResults.length > 0 ? n8nResults : rawProducts.map(p => ({
            name: p.title,
            price: p.price,
            url: p.permalink,
            store: "MercadoLibre",
            image: p.thumbnail,
            id: p.id // ID original de ML
        }));

        // PERSISTENCIA: Registramos los productos y trackeamos cambios de precio
        const persistencePromises = sourceData.slice(0, 5).map((p: any) => 
            productService.upsertProduct({
                nombre: p.name,
                url: p.url,
                tienda: p.store,
                precio_actual: p.price,
                image: p.image
            })
        );

        // Formatear para la UI
        const finalResults = sourceData.map((p: any) => ({
            ...p,
            verified: true,
            last_updated: now
        }));

        finalResults.sort((a: any, b: any) => a.price - b.price);

        // ANALÍTICA: Registrar la búsqueda en Firestore
        try {
            await addDoc(collection(db, "consultas_busqueda"), {
                query: query,
                resultados_count: finalResults.length,
                created_at: serverTimestamp()
            });
        } catch (e) {
            console.error("Error logging analytics to Firebase:", e);
        }

        await Promise.allSettled(persistencePromises);

        return NextResponse.json({ 
            results: finalResults.slice(0, 24),
            source: n8nResults.length > 0 ? "real-time" : "aggregator-cache"
        });

    } catch (error: any) {
        console.error("Critical Search API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
