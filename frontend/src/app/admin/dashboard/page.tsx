"use client"

import { useEffect, useState } from "react";
import { 
    LayoutDashboard, 
    Package, 
    Bell, 
    TrendingUp, 
    Activity, 
    Search, 
    ArrowUpRight, 
    ArrowDownRight,
    Loader2,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productService } from "@/lib/services/productService";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { errorManager } from "@/lib/errorManager";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeTrackings: 0,
        priceChanges: 0,
        systemHealth: "Óptimo"
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/auth");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const loadStats = async () => {
        setLoading(true);
        try {
            const data = await productService.getGlobalStats();
            setStats(prev => ({ ...prev, ...data }));
        } catch (error: any) {
            errorManager.captureError(error, 'HIGH', { component: 'AdminDashboard', action: 'loadStats' });
            console.error("Error loading admin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-indigo-500/30">
            {/* Sidebar (Desktop) */}
            <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-800/60 bg-slate-900/20 backdrop-blur-2xl hidden lg:flex flex-col p-6 z-50">
                <div className="flex items-center gap-2 mb-10">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">AdminPanel</span>
                </div>
                
                <nav className="space-y-2 flex-1">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 font-medium transition-all group">
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all group">
                        <Package className="w-5 h-5" /> Productos
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all group">
                        <Bell className="w-5 h-5" /> Alertas
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all group">
                        <Search className="w-5 h-5" /> Busquedas
                    </Link>
                </nav>

                <div className="pt-6 border-t border-slate-800/60">
                    <Link href="/" className="text-sm text-slate-500 hover:text-indigo-400 flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Volver a la Web
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 p-8">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
                            Control Center
                        </h1>
                        <p className="text-slate-400 mt-1">Monitoreo global del ecosistema PriceNode.</p>
                    </div>
                    <Button onClick={loadStats} variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 gap-2">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </Button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard 
                        title="Productos Totales" 
                        value={stats.totalProducts.toString()} 
                        icon={<Package className="text-indigo-400" />} 
                        trend="+12%" 
                        isUp={true} 
                    />
                    <StatCard 
                        title="Alertas Activas" 
                        value={stats.activeTrackings.toString()} 
                        icon={<Bell className="text-amber-400" />} 
                        trend="+5%" 
                        isUp={true} 
                    />
                    <StatCard 
                        title="Cambios de Precio" 
                        value={stats.priceChanges.toString()} 
                        icon={<TrendingUp className="text-green-400" />} 
                        trend="+24%" 
                        isUp={true} 
                    />
                    <StatCard 
                        title="Estado Sistema" 
                        value={stats.systemHealth} 
                        icon={<Activity className="text-emerald-400" />} 
                        trend="Estable" 
                        isUp={true} 
                    />
                </div>

                {/* Activity Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <Card className="xl:col-span-2 bg-[#0F172A]/40 border-slate-800/60 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-white text-xl">Flujo de Precios (Historial)</CardTitle>
                            <span className="text-xs text-slate-500">Últimos 7 días</span>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 w-full flex items-end gap-3 px-4 pb-2">
                                {/* Simulated Chart Bars */}
                                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                    <div key={i} className="flex-1 bg-indigo-500/20 border border-indigo-500/30 rounded-t-lg relative group overflow-hidden">
                                        <div 
                                            className="absolute bottom-0 left-0 w-full bg-indigo-500 transition-all duration-1000 group-hover:bg-indigo-400" 
                                            style={{ height: `${h}%` }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 mt-4 px-2 uppercase font-bold tracking-widest">
                                <span>Lunes</span><span>Martes</span><span>Miércoles</span><span>Jueves</span><span>Viernes</span><span>Sábado</span><span>Domingo</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#0F172A]/40 border-slate-800/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white text-xl text-center">Scrapers Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ScraperStatus name="Amazon Global" status="Online" color="bg-green-500" />
                            <ScraperStatus name="MercadoLibre Latam" status="Online" color="bg-green-500" />
                            <ScraperStatus name="eBay Global" status="Degraded" color="bg-amber-500" />
                            <ScraperStatus name="Temu/AliExpress" status="Online" color="bg-green-500" />
                            <div className="pt-4">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-500">
                                    Abrir n8n Engine
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, trend, isUp }: { title: string, value: string, icon: any, trend: string, isUp: boolean }) {
    return (
        <Card className="bg-[#0F172A]/40 border-slate-800/60 backdrop-blur-xl hover:border-slate-700 transition-all group overflow-hidden relative">
             {/* Glow Effect */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-all rounded-full" />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                <div className={`text-xs flex items-center gap-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend} <span className="text-slate-500 ml-1">vs mes anterior</span>
                </div>
            </CardContent>
        </Card>
    );
}

function ScraperStatus({ name, status, color }: { name: string, status: string, color: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
            <span className="text-sm font-medium text-slate-300">{name}</span>
            <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 px-2 py-0.5 rounded-full border border-slate-700">{status}</span>
                <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-[0_0_8px_rgba(34,197,94,0.3)]`} />
            </div>
        </div>
    );
}

function ArrowLeft(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
        </svg>
    )
}
