"use server"

import { db } from "@/lib/firebase";
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    serverTimestamp,
    limit
} from "firebase/firestore";
import { productService } from "@/lib/services/productService";

export async function saveTrackingAction(
    product: { name: string; price: number; url: string; store: string; image?: string },
    email: string,
    targetPrice: number
) {
    try {
        // 1. Asegurar que el producto existe en Firestore (Capa de Servicios)
        const { productId, success: productSuccess, error: productError } = await productService.upsertProduct({
            url: product.url,
            nombre: product.name,
            tienda: product.store,
            precio_actual: product.price,
            image: product.image
        });

        if (!productSuccess || !productId) {
            throw new Error(productError as string || "No se pudo registrar el producto");
        }

        // 2. Crear el registro de rastreo en Firebase
        const rastreosRef = collection(db, "rastreos");
        
        // Verificar duplicados para este usuario/producto
        const q = query(
            rastreosRef, 
            where("usuario_email", "==", email), 
            where("producto_id", "==", productId),
            limit(1)
        );
        const existing = await getDocs(q);

        if (!existing.empty) {
            return { success: false, error: "Ya estás rastreando este producto." };
        }

        await addDoc(rastreosRef, {
            producto_id: productId,
            usuario_email: email,
            precio_objetivo: targetPrice,
            activo: true,
            created_at: serverTimestamp()
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error in saveTrackingAction (Firebase):", error);
        return { success: false, error: error.message || "Error desconocido" };
    }
}
