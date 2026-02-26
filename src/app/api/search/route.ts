import { NextResponse } from 'next/server';

// Lista de tiendas para asignar a los resultados y simular que vienen de varias fuentes
const STORES = ["Amazon", "MercadoLibre", "eBay", "Temu", "Shein", "AliExpress"];

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Primero intentamos con n8n si está configurado
        const n8nWebhookUrl = process.env.N8N_SEARCH_WEBHOOK_URL;

        if (n8nWebhookUrl) {
            const response = await fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });

            if (response.ok) {
                const data = await response.json();
                return NextResponse.json({ results: data.results || [] });
            }
        }

        // Si n8n no está configurado, usamos la API real de DummyJSON
        // Esta API es gratuita, sin API key, y devuelve productos reales con imágenes
        const apiResponse = await fetch(
            `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=12`
        );

        if (!apiResponse.ok) {
            throw new Error('Failed to fetch from product API');
        }

        const apiData = await apiResponse.json();

        // Transformamos los resultados al formato de nuestra app
        const results = (apiData.products || []).map((product: any, index: number) => ({
            name: product.title,
            price: product.price,
            url: `https://${STORES[index % STORES.length].toLowerCase().replace(/\s/g, '')}.com/product/${product.id}`,
            store: STORES[index % STORES.length],
            image: product.thumbnail || product.images?.[0] || null,
        }));

        return NextResponse.json({ results });

    } catch (error: any) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }
}
