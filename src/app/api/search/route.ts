import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Aquí llamaremos al Webhook de n8n que construiremos
        const n8nWebhookUrl = process.env.N8N_SEARCH_WEBHOOK_URL;

        if (!n8nWebhookUrl) {
            // Mock de resultados si n8n no está configurado (para desarrollo/fallback)
            console.warn("N8N_SEARCH_WEBHOOK_URL no está configurado. Retornando datos simulados.");
            return NextResponse.json({
                results: [
                    { name: `${query} Original`, price: 299.99, url: `https://amazon.com/search?q=${query}`, store: "Amazon" },
                    { name: `${query} Oferta`, price: 289.00, url: `https://mercadolibre.com/search?q=${query}`, store: "MercadoLibre" },
                    { name: `${query} Importado`, price: 310.50, url: `https://ebay.com/search?q=${query}`, store: "eBay" },
                ]
            });
        }

        const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error(`n8n error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json({ results: data.results || [] });

    } catch (error: any) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }
}
