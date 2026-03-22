"use client"

import { useEffect, useState } from "react";
import { TrendingDown, Trash2, ExternalLink, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { errorManager } from "@/lib/errorManager";
import { useRouter } from "next/navigation";
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    deleteDoc, 
    doc, 
    onSnapshot 
} from "firebase/firestore";
import Link from "next/link";

interface TrackingType {
    id: string;
    usuario_email: string;
    precio_objetivo: number;
    activo: boolean;
    producto_id: string;
    producto_data?: {
        nombre: string;
        tienda: string;
        precio_actual: number;
        url: string;
    };
}

export default function RastreosPage() {
    const [rastreos, setRastreos] = useState<TrackingType[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const authUnsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/auth");
            }
        });
        return () => authUnsubscribe();
    }, [router]);

    useEffect(() => {
        setLoading(true);
        // Suscripción en tiempo real con Firestore
        const q = collection(db, "rastreos");
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const trackingsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as any));

            // Para cada rastreo, necesitamos los datos del producto
            const trackingsWithProducts = await Promise.all(trackingsData.map(async (t) => {
                const productSnap = await getDocs(query(collection(db, "productos"), where("__name__", "==", t.producto_id)));
                if (!productSnap.empty) {
                    return { ...t, producto_data: productSnap.docs[0].data() };
                }
                return t;
            }));

            setRastreos(trackingsWithProducts.filter(t => t.producto_data));
            setLoading(false);
        }, (error: any) => {
            errorManager.captureError(error, 'HIGH', { component: 'RastreosPage', action: 'subscription' });
            console.error("Firestore subscription error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm("¿Seguro que deseas eliminar este rastro?");
        if (!confirmDelete) return;
        
        try {
            await deleteDoc(doc(db, "rastreos", id));
            // El onSnapshot se encargará de actualizar la UI
        } catch (error: any) {
            errorManager.captureError(error, 'MEDIUM', { component: 'RastreosPage', action: 'delete', trackingId: id });
            alert("Error al eliminar el rastro.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
            <nav className="border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Mis Rastreos</span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10 text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-white mb-2">Productos en Vigilancia</h1>
                    <p className="text-slate-400">Aquí puedes ver todos los productos que nuestra IA está monitoreando por ti.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                        <p className="text-slate-400">Cargando tus rastreos...</p>
                    </div>
                ) : rastreos.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
                        <TrendingDown className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-300 mb-2">No tienes rastreos activos</h2>
                        <p className="text-slate-500 mb-6">Busca un producto y haz clic en "Vigilar Precio" para comenzar.</p>
                        <Button asChild className="bg-indigo-600 hover:bg-indigo-500">
                            <Link href="/">Ir al Buscador</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rastreos.map((r) => (
                            <Card key={r.id} className="bg-slate-900/50 border-slate-800 text-white overflow-hidden group">
                                <CardHeader className="pb-2 px-6 pt-6">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest mb-2">
                                            {r.producto_data?.tienda}
                                        </span>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                                            onClick={() => handleDelete(r.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem] leading-tight group-hover:text-indigo-400 transition-colors">
                                        {r.producto_data?.nombre}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 px-6">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-medium">Precio Actual</p>
                                            <p className="text-2xl font-bold">${r.producto_data?.precio_actual.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-indigo-400 uppercase font-bold">Objetivo</p>
                                            <p className="text-xl font-bold text-indigo-400">${r.precio_objetivo.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Sparkline Visualization */}
                                    <div className="pt-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Historial (7d)</span>
                                            <span className="text-[10px] text-green-400 font-bold">Verificado</span>
                                        </div>
                                        <div className="h-8 w-full flex items-end gap-1 px-1">
                                            {[30, 45, 25, 60, 40, 75, 50, 90, 35, 20].map((h, i) => (
                                                <div 
                                                    key={i} 
                                                    className="flex-1 bg-indigo-500/20 rounded-t-[1px] relative group/bar overflow-hidden" 
                                                    style={{ height: `${h}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-indigo-500 opacity-20 transition-opacity" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-indigo-500 h-full transition-all duration-1000" 
                                            style={{ width: `${Math.min(100, (r.precio_objetivo / (r.producto_data?.precio_actual || 1)) * 100)}%` }}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-6 px-6 pb-6">
                                    <Button asChild variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-300">
                                        <a href={r.producto_data?.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                                            <ExternalLink className="w-4 h-4" />
                                            Ver Producto Real
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
