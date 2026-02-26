export type Producto = {
    id: string;
    url: string;
    nombre: string | null;
    tienda: string;
    precio_actual: number | null;
    imagen_url: string | null;
    created_at: string;
    updated_at: string;
};

export type Rastreo = {
    id: string;
    producto_id: string;
    usuario_email: string;
    precio_objetivo: number;
    activo: boolean;
    created_at: string;
};

export type HistorialPrecio = {
    id: string;
    producto_id: string;
    precio: number;
    fecha_registro: string;
};
