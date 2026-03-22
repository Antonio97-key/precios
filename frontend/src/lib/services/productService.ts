import { db } from "../firebase";
import { errorManager } from "../errorManager";
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc, 
    updateDoc, 
    doc, 
    serverTimestamp,
    limit,
    getCountFromServer,
    orderBy
} from "firebase/firestore";

export interface Product {
    id?: string;
    url: string;
    nombre: string;
    tienda: string;
    precio_actual: number;
    image?: string;
}

export const productService = {
    /**
     * Busca o crea un producto en Firestore.
     */
    async upsertProduct(product: Product) {
        try {
            const productsRef = collection(db, "productos");
            const q = query(productsRef, where("url", "==", product.url), limit(1));
            const querySnapshot = await getDocs(q);

            let productId: string;

            if (querySnapshot.empty) {
                // Crear nuevo
                const docRef = await addDoc(productsRef, {
                    ...product,
                    last_updated: serverTimestamp()
                });
                productId = docRef.id;
            } else {
                const existingDoc = querySnapshot.docs[0];
                productId = existingDoc.id;
                const existingData = existingDoc.data();

                if (existingData.precio_actual !== product.precio_actual) {
                    // Actualizar precio y registrar historial
                    await this.recordPriceHistory(productId, existingData.precio_actual);
                    
                    await updateDoc(doc(db, "productos", productId), {
                        precio_actual: product.precio_actual,
                        last_updated: serverTimestamp()
                    });
                }
            }

            return { productId, success: true };
        } catch (error: any) {
            errorManager.captureError(error, 'HIGH', { service: 'productService', method: 'upsertProduct', product });
            console.error("Error in upsertProduct (Firebase):", error);
            return { success: false, error };
        }
    },

    /**
     * Registra un cambio de precio en el historial.
     */
    async recordPriceHistory(productId: string, price: number) {
        try {
            await addDoc(collection(db, "historial_precios"), {
                producto_id: productId,
                precio: price,
                fecha: serverTimestamp()
            });
        } catch (error) {
            console.error("Error recording price history:", error);
        }
    },

    /**
     * Obtiene el historial de precios de un producto.
     */
    async getPriceHistory(productId: string) {
        try {
            const historyRef = collection(db, "historial_precios");
            const q = query(
                historyRef, 
                where("producto_id", "==", productId), 
                orderBy("fecha", "asc"),
                limit(50)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                date: doc.data().fecha?.toDate()?.toLocaleDateString() || '',
                price: doc.data().precio
            })).filter(h => h.date !== '');
        } catch (error) {
            console.error("Error getting price history:", error);
            return [];
        }
    },

    /**
     * Obtiene estadísticas globales detalladas.
     */
    async getGlobalStats() {
        try {
            const [productsSnap, trackingsSnap, historySnap] = await Promise.all([
                getCountFromServer(collection(db, "productos")),
                getCountFromServer(collection(db, "rastreos")),
                getCountFromServer(collection(db, "historial_precios"))
            ]);

            // Simulación de ahorro potencial (puedes ajustarlo con lógica real)
            const potentialSavings = Math.floor(Math.random() * 5000) + 1000;

            return {
                totalProducts: productsSnap.data().count,
                activeTrackings: trackingsSnap.data().count,
                priceChanges: historySnap.data().count,
                potentialSavings
            };
        } catch (error) {
            console.error("Error getting stats:", error);
            return { totalProducts: 0, activeTrackings: 0, priceChanges: 0, potentialSavings: 0 };
        }
    }
};
