import { NextResponse } from 'next/server';
import { productService } from '@/lib/services/productService';
import { db } from '@/lib/firebase';
import { errorManager } from '@/lib/errorManager';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const STORES = ["Amazon", "MercadoLibre", "eBay", "Temu", "Shein", "AliExpress"];

// MOTOR DE AFILIADOS: Añade tags de afiliado automáticamente
function applyAffiliateTags(url: string, store: string): string {
    const affiliateIds: Record<string, string> = {
        "Amazon": process.env.AMAZON_AFFILIATE_ID || "monitorpremium-20",
        "AliExpress": process.env.ALIEXPRESS_AFFILIATE_ID || "adp_123",
        "eBay": process.env.EBAY_AFFILIATE_ID || "ebay_camp_555",
        "MercadoLibre": process.env.MELI_AFFILIATE_ID || "social_share"
    };

    const tag = affiliateIds[store];
    if (!tag) return url;

    try {
        const urlObj = new URL(url);
        if (store === "Amazon") urlObj.searchParams.set("tag", tag);
        if (store === "AliExpress") urlObj.searchParams.set("aff_platform", "api-fallback");
        if (store === "MercadoLibre") urlObj.searchParams.set("utm_source", "monitor_ia");
        return urlObj.toString();
    } catch (e) {
        return url;
    }
}

async function searchProducts(query: string): Promise<any[]> {
    try {
        const response = await fetch(
            `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=15`
        );
        if (response.ok) {
            const data = await response.json();
            return data.results || [];
        }
    } catch (e: any) {
        errorManager.captureError(e, 'MEDIUM', { endpoint: 'searchProducts', query });
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

        // CAPA 2: Agregador Local (Fallback)
        let rawProducts = await searchProducts(query);
        if (rawProducts.length === 0 && query.includes(' ')) {
            rawProducts = await searchProducts(query.split(' ')[0]);
        }

        const sourceData = n8nResults.length > 0 ? n8nResults : rawProducts.map(p => ({
            name: p.title,
            price: p.price,
            url: p.permalink,
            store: "MercadoLibre",
            image: p.thumbnail,
            id: p.id
        }));

        // PROCESAMIENTO: Aplicar Afiliados y Persistencia
        const processedResults = sourceData.map((p: any) => ({
            ...p,
            url: applyAffiliateTags(p.url, p.store),
            verified: true,
            last_updated: new Date().toISOString()
        }));

        const persistencePromises = processedResults.slice(0, 5).map((p: any) => 
            productService.upsertProduct({
                nombre: p.name,
                url: p.url,
                tienda: p.store,
                precio_actual: p.price,
                image: p.image
            })
        );

        processedResults.sort((a: any, b: any) => a.price - b.price);

        // ANALÍTICA DE NEGOCIO: Registrar búsqueda y volumen
        try {
            await addDoc(collection(db, "consultas_busqueda"), {
                query_text: query,
                resultados_count: processedResults.length,
                created_at: serverTimestamp()
            });
        } catch (e) {
            console.error("Error logging analytics:", e);
        }

        await Promise.allSettled(persistencePromises);

        return NextResponse.json({ 
            results: processedResults.slice(0, 24),
            source: n8nResults.length > 0 ? "real-time" : "aggregator-cache"
        });

    } catch (error: any) {
        errorManager.captureError(error, 'HIGH', { endpoint: 'POST /api/search', query: 'unknown' });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
