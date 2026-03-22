"use client"

import { useState, useTransition, useEffect } from "react";
import { Search, ShoppingBag, BellRing, TrendingDown, Loader2, CheckCircle2, Clock, AlertTriangle, UserPlus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TrackModal } from "@/components/TrackModal";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface ProductType {
  name: string;
  price: number;
  url: string;
  store: string;
  image?: string;
}

const SEARCH_LIMIT = 3;

export default function Home() {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [searchCount, setSearchCount] = useState(0);
  const [showLimitReached, setShowLimitReached] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const savedCount = localStorage.getItem("guest_search_count");
    if (savedCount) setSearchCount(parseInt(savedCount));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (!user && searchCount >= SEARCH_LIMIT) {
      setShowLimitReached(true);
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data.results || []);
          setHasSearched(true);
          
          if (!user) {
            const nextCount = searchCount + 1;
            setSearchCount(nextCount);
            localStorage.setItem("guest_search_count", nextCount.toString());
          }
        }
      } catch (error) {
        console.error("Error searching:", error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      <nav className="border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block text-slate-100">Monitor de Precios Justos</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-slate-500 hover:text-indigo-400 text-xs font-bold uppercase tracking-widest hidden md:flex">
              <Link href="/admin/dashboard">Admin</Link>
            </Button>
            <Button variant="ghost" asChild className="text-slate-300 hover:text-indigo-400">
              <Link href="/dashboard">Mis Rastreos</Link>
            </Button>
            {user ? (
               <div className="flex items-center gap-3">
                 <span className="text-xs text-slate-400 hidden md:block">{user.email}</span>
                 <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                 </div>
               </div>
            ) : (
              <Button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 font-bold px-6"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-2">
            <BellRing className="w-3 h-3" />
            Operabilidad Total Activada
          </div>
          <h1 className="text-6xl sm:text-8xl font-extrabold tracking-tighter bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent">
            Monitor de Precios Justos
          </h1>
          <p className="text-lg sm:text-2xl text-slate-400 max-w-2xl mx-auto font-medium">
             <span className="text-white">Amazon, AliExpress, eBay, Shein, Temu</span> y más en un solo lugar. 
            Te avisamos por IA cuando el precio baje.
          </p>
        </motion.div>

        <div className="w-full max-w-2xl relative group mt-8">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-2xl group-hover:bg-indigo-500/30 transition-all duration-500"></div>
          <form onSubmit={handleSearch} className="relative flex items-center bg-slate-900 border border-slate-700/50 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-500/50 transition-colors">
            <Search className="w-6 h-6 text-slate-400 ml-3" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ej. Galaxy Tab S9 FE, iPhone 15 Pro..."
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-xl px-4 text-white placeholder:text-slate-600 h-16 font-medium"
            />
            <Button type="submit" disabled={isPending || !searchQuery.trim()} size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-14 px-10 font-bold text-lg min-w-[140px] shadow-lg shadow-indigo-600/30">
              {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Analizar"}
            </Button>
          </form>
          
          {!user && (
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 uppercase tracking-widest font-bold bg-slate-900/50 border border-slate-800 px-3 py-1 rounded-full">
              Créditos gratuitos: <span className="text-indigo-400">{Math.max(0, SEARCH_LIMIT - searchCount)}</span> / {SEARCH_LIMIT}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showLimitReached && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-12 p-8 bg-slate-900 border border-indigo-500/50 rounded-3xl max-w-md shadow-3xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-indigo-500/5 blur-3xl"></div>
              <div className="relative flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                   <UserPlus className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">¡Operabilidad Limitada!</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Has agotado tus búsquedas de invitado. <span className="text-white font-semibold">Crea una cuenta gratis</span> para desbloquear el motor de búsqueda infinito y las alertas 24/7.
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setShowLimitReached(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 h-14 font-bold text-lg shadow-lg shadow-indigo-600/20"
                >
                  Regístrate Ahora
                </Button>
                <button 
                  onClick={() => setShowLimitReached(false)}
                  className="text-xs text-slate-500 hover:text-slate-300 underline font-bold"
                >
                  Explorar la web
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-[1px] flex-1 bg-slate-800"></div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">
            {hasSearched ? `Resultados del Mercado` : "Plataformas Aliadas"}
          </h2>
          <div className="h-[1px] flex-1 bg-slate-800"></div>
        </div>

        {isPending && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin h-12 w-12 text-indigo-500" />
          </div>
        )}

        {!isPending && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p, idx) => (
              <Card key={idx} className="bg-slate-900 border-slate-800 text-white hover:border-indigo-500/40 transition-all group overflow-hidden rounded-2xl shadow-xl">
                <CardHeader className="p-0 overflow-hidden relative aspect-square bg-white flex items-center justify-center p-6">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-contain transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="text-slate-400 text-xs font-bold uppercase">Sin Imagen</div>
                  )}
                  <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {p.store}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1 bg-green-500/10 text-green-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-green-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      PRECIO REAL
                    </div>
                  </div>
                  <CardTitle className="text-sm font-bold leading-tight line-clamp-2 h-10 mb-4 text-slate-100 group-hover:text-indigo-400 transition-colors">
                    {p.name}
                  </CardTitle>
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-black text-white">${p.price.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Verified by AI</div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    onClick={() => setSelectedProduct(p)}
                    className="w-full bg-slate-800 hover:bg-indigo-600 text-white border border-slate-700 hover:border-indigo-500 transition-all font-bold h-12 rounded-xl"
                  >
                    Vigilar Precio
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <TrackModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-black tracking-tighter text-white">Planes diseñados para ahorrar</h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">Selecciona la potencia que necesitas para tus compras inteligentes.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plan Free */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Básico</span>
              <h3 className="text-3xl font-black text-white">$0</h3>
            </div>
            <ul className="space-y-4">
              {["3 Búsquedas diarias", "Alertas cada 24h", "Dashboard estándar", "Acceso invitado"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" /> {item}
                </li>
              ))}
            </ul>
            <Button onClick={() => setIsAuthModalOpen(true)} className="w-full h-14 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl">
              Empezar Gratis
            </Button>
          </div>

          {/* Plan Pro */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-500/30 p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden shadow-2xl shadow-indigo-500/5">
            <div className="absolute top-8 right-8 bg-indigo-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Recomendado</div>
            <div className="space-y-2">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Premium Pro</span>
              <h3 className="text-3xl font-black text-white">$9.99<span className="text-sm text-slate-500 font-medium">/mes</span></h3>
            </div>
            <ul className="space-y-4">
              {["Búsquedas ilimitadas", "Alertas cada 5 minutos", "Notificaciones WhatsApp", "Gráficos predictivos IA", "Soporte Prioritario"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-200">
                  <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400" /> {item}
                </li>
              ))}
            </ul>
            <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-105">
              Obtener Premium
            </Button>
          </div>
        </div>
      </section>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
