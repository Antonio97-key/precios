module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/search/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const STORES = [
    "Amazon",
    "MercadoLibre",
    "eBay",
    "Temu",
    "Shein",
    "AliExpress"
];
// Traducción básica de términos comunes de búsqueda ES -> EN
const TRANSLATIONS = {
    "zapatos": "shoes",
    "zapatillas": "sneakers",
    "tenis": "sneakers",
    "telefono": "phone",
    "teléfono": "phone",
    "celular": "phone",
    "computadora": "laptop",
    "computador": "laptop",
    "portátil": "laptop",
    "portatil": "laptop",
    "televisor": "tv",
    "televisión": "tv",
    "television": "tv",
    "tele": "tv",
    "reloj": "watch",
    "relojes": "watches",
    "auriculares": "headphones",
    "audífonos": "headphones",
    "audifonos": "headphones",
    "cámara": "camera",
    "camara": "camera",
    "perfume": "perfume",
    "perfumes": "perfume",
    "bolso": "bag",
    "bolsa": "bag",
    "mochila": "backpack",
    "gafas": "sunglasses",
    "lentes": "sunglasses",
    "vestido": "dress",
    "camisa": "shirt",
    "camiseta": "tops",
    "pantalón": "pants",
    "pantalon": "pants",
    "jeans": "jeans",
    "negro": "black",
    "negros": "black",
    "negra": "black",
    "rojo": "red",
    "rojos": "red",
    "roja": "red",
    "blanco": "white",
    "blancos": "white",
    "blanca": "white",
    "azul": "blue",
    "verde": "green",
    "rosa": "pink",
    "cocina": "kitchen",
    "hogar": "home",
    "casa": "home",
    "juguete": "toys",
    "juguetes": "toys",
    "consola": "gaming",
    "videojuegos": "gaming",
    "maquillaje": "beauty",
    "crema": "skincare",
    "aceite": "oil",
    "jabón": "soap",
    "jabon": "soap",
    "lámpara": "lamp",
    "lampara": "lamp",
    "luz": "lighting",
    "silla": "chair",
    "mesa": "table",
    "escritorio": "desk"
};
function translateQuery(query) {
    const words = query.toLowerCase().split(/\s+/);
    const translated = words.map((word)=>TRANSLATIONS[word] || word);
    return translated.join(' ');
}
async function searchProducts(query) {
    try {
        const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=12`);
        if (response.ok) {
            const data = await response.json();
            return data.products || [];
        }
    } catch (e) {
        console.error("API fetch error:", e);
    }
    return [];
}
async function POST(req) {
    try {
        const { query } = await req.json();
        if (!query) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Query is required'
            }, {
                status: 400
            });
        }
        // Si n8n está configurado, lo usamos primero
        const n8nWebhookUrl = process.env.N8N_SEARCH_WEBHOOK_URL;
        if (n8nWebhookUrl) {
            try {
                const response = await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.results?.length > 0) {
                        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                            results: data.results
                        });
                    }
                }
            } catch (e) {}
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
            for (const word of words){
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
        const results = [];
        const priceVariations = {
            "Amazon": 1.05,
            "MercadoLibre": 0.98,
            "eBay": 1.02,
            "Temu": 0.82,
            "Shein": 0.88,
            "AliExpress": 0.78
        };
        for (const product of products){
            for (const store of STORES){
                const variation = priceVariations[store] || 1;
                const storePrice = Math.round(product.price * variation * 100) / 100;
                results.push({
                    name: product.title,
                    price: storePrice,
                    url: `https://${store.toLowerCase().replace(/\s/g, '')}.com/product/${product.id}`,
                    store: store,
                    image: product.thumbnail || product.images?.[0] || null
                });
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            results
        });
    } catch (error) {
        console.error("Search API Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch search results'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4ff705a3._.js.map