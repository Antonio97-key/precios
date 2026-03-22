"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, ExternalLink, TrendingDown, AlertCircle, Crown, Zap, Bell, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PriceChart from '@/components/PriceChart';
import { productService } from '@/lib/services/productService';

interface TrackingItem {
    id: string;
    productId: string;
    targetPrice: number;
    product: {
        nombre: string;
        precio_actual: number;
        tienda: string;
        image?: string;
        url: string;
    };
    history: any[];
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [trackings, setTrackings] = useState<TrackingItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchTrackings = async () => {
            try {
                const q = query(collection(db, "trackings"), where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                
                const items = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
                    const data = docSnap.data();
                    const productId = data.productId;
                    const history = await productService.getPriceHistory(productId);
                    
                    return {
                        id: docSnap.id,
                        ...data,
                        history
                    } as TrackingItem;
                }));

                setTrackings(items);
            } catch (error) {
                console.error("Error fetching trackings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrackings();
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que quieres dejar de rastrear este producto?")) return;
        try {
            await deleteDoc(doc(db, "trackings", id));
            setTrackings(trackings.filter(t => t.id !== id));
        } catch (error) {
            console.error("Error deleting tracking:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-12">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header Premium */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
                            Panel de Control
                        </h1>
                        <p className="text-slate-500 font-medium">Bienvenido, {user?.email?.split('@')[0]}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-2 rounded-2xl backdrop-blur-md">
                        <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
                            <Crown className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Plan Básico</span>
                        </div>
                        <Button className="bg-white text-black hover:bg-slate-200 font-black px-6 py-5 rounded-xl text-sm transition-all hover:scale-105">
                            Subir a PRO
                        </Button>
                    </div>
                </div>

                {/* Grid de Estadísticas Rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Rastreos Activos", value: trackings.length, icon: Zap, color: "text-indigo-400" },
                        { label: "Alertas Pendientes", value: 0, icon: Bell, color: "text-amber-400" },
                        { label: "Ahorro Estimado", value: "$0.00", icon: TrendingDown, color: "text-green-400" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <stat.icon className={`w-8 h-8 ${stat.color} mb-4 relative z-10`} />
                            <div className="text-3xl font-black mb-1 relative z-10">{stat.value}</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Contenido Principal */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold tracking-tight">Mis Monitoreos</h2>
                        <div className="h-[1px] flex-1 bg-slate-800"></div>
                    </div>

                    {trackings.length === 0 ? (
                        <div className="py-24 flex flex-col items-center text-center space-y-6 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[2.5rem]">
                            <div className="w-20 h-20 rounded-3xl bg-slate-800/50 flex items-center justify-center">
                                <AlertCircle className="w-10 h-10 text-slate-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold">Sin rastreos activos</h3>
                                <p className="text-slate-500 max-w-sm">Empieza a monitorear productos desde la página principal para verlos aquí.</p>
                            </div>
                            <Button asChild className="bg-indigo-600 hover:bg-indigo-500 font-bold h-12 px-8 rounded-xl shadow-lg shadow-indigo-600/20">
                                <a href="/">Buscar Productos</a>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <AnimatePresence>
                                {trackings.map((track) => (
                                    <motion.div
                                        key={track.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        layout
                                    >
                                        <Card className="bg-slate-900 border-slate-800 overflow-hidden hover:border-indigo-500/40 transition-all rounded-[2rem] shadow-2xl relative group">
                                            {/* Badge de Tienda */}
                                            <div className="absolute top-6 left-6 z-20 px-3 py-1 rounded-lg bg-indigo-600/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                {track.product.tienda}
                                            </div>

                                            <div className="flex flex-col md:flex-row">
                                                <div className="w-full md:w-[220px] h-[220px] bg-white relative flex items-center justify-center p-8 group-hover:scale-105 transition-transform duration-500">
                                                    {track.product.image ? (
                                                        <img src={track.product.image} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <AlertCircle className="w-12 h-12 text-slate-300" />
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1 p-8 flex flex-col justify-between">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-green-400 uppercase tracking-widest">
                                                            <CheckCircle2 className="w-3 h-3" /> Estado: Monitoreando
                                                        </div>
                                                        <h3 className="font-extrabold text-xl leading-tight text-white line-clamp-2">
                                                            {track.product.nombre}
                                                        </h3>
                                                        <div className="flex items-baseline gap-4 pt-2">
                                                            <div className="text-3xl font-black text-white">${track.product.precio_actual.toLocaleString()}</div>
                                                            <div className="text-sm font-bold text-slate-500">Meta: ${track.targetPrice.toLocaleString()}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3 pt-6">
                                                        <Button variant="outline" className="flex-1 bg-slate-950 border-slate-800 text-slate-300 hover:text-white font-bold h-12 rounded-xl" asChild>
                                                            <a href={track.product.url} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="w-4 h-4 mr-2" /> Tienda
                                                            </a>
                                                        </Button>
                                                        <Button variant="ghost" className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 h-12 w-12 rounded-xl" onClick={() => handleDelete(track.id)}>
                                                            <Trash2 className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="p-8 bg-slate-950/40 border-t border-slate-800/60">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                        <TrendingDown className="w-4 h-4 text-indigo-400" /> Historial Premium
                                                    </div>
                                                    <div className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest">IA Insight: Estable</div>
                                                </div>
                                                <div className="h-[180px]">
                                                    <PriceChart data={track.history} />
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Banner de Monetización SaaS Placeholder */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-3xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Desbloquea el Poder de la IA</h2>
                            <p className="text-indigo-100/80 font-medium max-w-lg">
                                Alertas instantáneas por WhatsApp, frecuencia de escaneo de 5 minutos y predicciones de rebajas con IA avanzada.
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                                {["Alertas WhatsApp", "Scan 5min", "Predicción IA"].map((f, i) => (
                                    <div key={i} className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest">
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-100 font-extrabold text-lg px-12 h-16 rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95">
                            PRUÉBALO GRATIS
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Footer de Marca */}
            <footer className="mt-20 pt-10 border-t border-slate-900 text-center">
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em]">
                    Powered by Agente AI • Operabilidad Total 2026
                </p>
            </footer>
        </div>
    );
}
