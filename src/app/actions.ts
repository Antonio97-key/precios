"use server"

import { supabase } from "@/lib/supabase"

export async function saveTrackingAction(
    product: { name: string; price: number; url: string; store: string },
    email: string,
    targetPrice: number
) {
    try {
        // 1. Upsert del Producto
        // Como las políticas RLS permiten Insert/Select, primero intentamos insertar y luego leer
        const { data: existingProduct, error: selectError } = await supabase
            .from('productos')
            .select('id')
            .eq('url', product.url)
            .single()

        let productId = existingProduct?.id

        if (!productId) {
            // No existe, crearlo
            const { data: newProduct, error: insertProdError } = await supabase
                .from('productos')
                .insert({
                    url: product.url,
                    nombre: product.name,
                    tienda: product.store,
                    precio_actual: product.price
                })
                .select('id')
                .single()

            if (insertProdError) throw new Error("Error guardando producto: " + insertProdError.message)
            productId = newProduct.id
        }

        // 2. Insertar el Rastreo asociado
        const { error: trackError } = await supabase
            .from('rastreos')
            .insert({
                producto_id: productId,
                usuario_email: email,
                precio_objetivo: targetPrice,
                activo: true
            })

        if (trackError) throw new Error("Error guardando rastreo: " + trackError.message)

        return { success: true }
    } catch (error: any) {
        console.error("Save tracking error:", error)
        return { success: false, error: error.message }
    }
}
