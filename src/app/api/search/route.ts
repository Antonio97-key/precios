import { NextResponse } from 'next/server';

const STORES = ["Amazon", "MercadoLibre", "eBay", "Temu", "Shein", "AliExpress"];

// Traducción básica de términos comunes de búsqueda ES -> EN
const TRANSLATIONS: Record<string, string> = {
    "zapatos": "shoes", "zapatillas": "sneakers", "tenis": "sneakers",
    "telefono": "phone", "teléfono": "phone", "celular": "phone",
    "computadora": "laptop", "computador": "laptop", "portátil": "laptop", "portatil": "laptop",
    "televisor": "tv", "televisión": "tv", "television": "tv", "tele": "tv",
    "reloj": "watch", "relojes": "watches",
    "auriculares": "headphones", "audífonos": "headphones", "audifonos": "headphones",
    "cámara": "camera", "camara": "camera",
    "perfume": "perfume", "perfumes": "perfume",
    "bolso": "bag", "bolsa": "bag", "mochila": "backpack",
    "gafas": "sunglasses", "lentes": "sunglasses",
    "vestido": "dress", "camisa": "shirt", "camiseta": "tops",
    "pantalón": "pants", "pantalon": "pants", "jeans": "jeans",
    "negro": "black", "negros": "black", "negra": "black",
    "rojo": "red", "rojos": "red", "roja": "red",
    "blanco": "white", "blancos": "white", "blanca": "white",
    "azul": "blue", "verde": "green", "rosa": "pink",
    "cocina": "kitchen", "hogar": "home", "casa": "home",
    "juguete": "toys", "juguetes": "toys",
    "consola": "gaming", "videojuegos": "gaming",
    "maquillaje": "beauty", "crema": "skincare",
    "aceite": "oil", "jabón": "soap", "jabon": "soap",
    "lámpara": "lamp", "lampara": "lamp", "luz": "lighting",
    "silla": "chair", "mesa": "table", "escritorio": "desk",
};

function translateQuery(query: string): string {
    const words = query.toLowerCase().split(/\s+/);
    const translated = words.map(word => TRANSLATIONS[word] || word);
    return translated.join(' ');
}

async function searchProducts(query: string): Promise<any[]> {
    try {
        const response = await fetch(
            `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=12`
        );
        if (response.ok) {
            const data = await response.json();
            return data.products || [];
        }
    } catch (e) {
        console.error("API fetch error:", e);
    }
    return [];
}

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Si n8n está configurado, lo usamos primero
        const n8nWebhookUrl = process.env.N8N_SEARCH_WEBHOOK_URL;
        if (n8nWebhookUrl) {
            try {
                const response = await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query })
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.results?.length > 0) {
                        return NextResponse.json({ results: data.results });
                    }
                }
            } catch (e) { /* Fallback a DummyJSON */ }
        }

        // Búsqueda con la query tal cual
        let products = await searchProducts(query);

        // Si no encontró nada, intentar traducir
        if (products.length === 0) {
            const translatedQuery = translateQuery(query);
            if (translatedQuery !== query.toLowerCase()) {
                products = await searchProducts(translatedQuery);
            }
        }

        // Si aún no hay resultados, buscar palabra por palabra
        if (products.length === 0) {
            const words = translateQuery(query).split(/\s+/);
            for (const word of words) {
                if (word.length > 2) {
                    products = await searchProducts(word);
                    if (products.length > 0) break;
                }
            }
        }

        // Si TODAVÍA no hay resultados, mostrar productos populares
        if (products.length === 0) {
            products = await searchProducts("phone");
        }

        // Transformar: cada producto aparece en TODAS las tiendas con precios diferentes
        const results: any[] = [];
        const priceVariations: Record<string, number> = {
            "Amazon": 1.05,        // 5% más caro (envío Prime)
            "MercadoLibre": 0.98,   // 2% más barato
            "eBay": 1.02,          // 2% más caro
            "Temu": 0.82,          // 18% más barato (directo de fábrica)
            "Shein": 0.88,         // 12% más barato
            "AliExpress": 0.78,    // 22% más barato (envío lento)
        };

        for (const product of products) {
            for (const store of STORES) {
                const variation = priceVariations[store] || 1;
                const storePrice = Math.round(product.price * variation * 100) / 100;
                results.push({
                    name: product.title,
                    price: storePrice,
                    url: `https://${store.toLowerCase().replace(/\s/g, '')}.com/product/${product.id}`,
                    store: store,
                    image: product.thumbnail || product.images?.[0] || null,
                });
            }
        }

        return NextResponse.json({ results });

    } catch (error: any) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }
}
