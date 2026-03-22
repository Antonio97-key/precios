import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit, serverTimestamp } from 'firebase/firestore';
import { productService } from '@/lib/services/productService';

// Clave secreta para proteger el cron (configurable en Vercel)
const CRON_SECRET = process.env.CRON_SECRET || 'dev_secret_123';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get('Authorization');

    // Verificación de seguridad básica
    if (searchParams.get('secret') !== CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('--- Iniciando Cron de Actualización de Precios ---');
        
        // 1. Obtener productos activos (limitado a 50 por ejecución para evitar timeouts en Vercel Free)
        const productsRef = collection(db, "productos");
        const q = query(productsRef, limit(50)); 
        const querySnapshot = await getDocs(q);
        
        const results = {
            processed: 0,
            updated: 0,
            errors: 0
        };

        const updatePromises = querySnapshot.docs.map(async (productDoc) => {
            const productData = productDoc.data();
            const productId = productDoc.id;

            try {
                // 2. Simular búsqueda de nuevo precio (en una versión real llamaríamos a la API de la tienda)
                // Por ahora usamos la lógica de MercadoLibre como base si está disponible
                let newPrice = productData.precio_actual;
                
                // Simulación de fluctuación de precio para demostrar funcionamiento (±5%)
                const change = 1 + (Math.random() * 0.1 - 0.05);
                newPrice = Math.round(newPrice * change * 100) / 100;

                // 3. Registrar si hay cambio
                if (newPrice !== productData.precio_actual) {
                    await productService.recordPriceHistory(productId, productData.precio_actual);
                    
                    // Actualizar el documento principal
                    const { doc, updateDoc } = await import('firebase/firestore');
                    await updateDoc(doc(db, "productos", productId), {
                        precio_actual: newPrice,
                        last_updated: serverTimestamp()
                    });
                    results.updated++;
                }
                
                results.processed++;
            } catch (e) {
                console.error(`Error procesando producto ${productId}:`, e);
                results.errors++;
            }
        });

        await Promise.allSettled(updatePromises);

        console.log('--- Cron Finalizado ---', results);

        return NextResponse.json({
            success: true,
            summary: results,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Fatal Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
