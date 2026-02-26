"use client"

import { useState, useTransition } from "react";
import { Search, ShoppingBag, BellRing, TrendingDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TrackModal } from "@/components/TrackModal";

interface ProductType {
  name: string;
  price: number;
  url: string;
  store: string;
}

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

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
        }
      } catch (error) {
        console.error("Error searching:", error);
      }
    });
  };

  // Removemos mockProducts constante y lo usamos dinámicamente si no hay búsqueda
  // const mockProducts: ProductType[] = [...]; 

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      <nav className="border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Monitoreo de Precios</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-slate-300 hover:text-white">Mis Rastros</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">Login</Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center space-y-8">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
            Encuentra el precio perfecto.
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
            Buscamos precios en <span className="text-white font-semibold">Amazon, MercadoLibre, eBay, Temu, Shein, AliExpress</span> y cualquier otra plataforma, todo en un solo lugar. Te avisaremos exactamente cuando el precio baje.
          </p>
        </div>

        <div className="w-full max-w-2xl relative group mt-8">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl group-hover:bg-indigo-500/30 transition-all duration-500"></div>
          <form onSubmit={handleSearch} className="relative flex items-center bg-slate-900 border border-slate-700/50 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-500/50 transition-colors">
            <Search className="w-6 h-6 text-slate-400 ml-3" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ej. PlayStation 5 Pro, Zapatillas Nike..."
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg px-4 text-white placeholder:text-slate-500 h-14"
            />
            <Button type="submit" disabled={isPending || !searchQuery.trim()} size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-12 px-8 font-semibold min-w-[120px]">
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buscar"}
            </Button>
          </form>
        </div>

        <div className="pt-8 flex flex-wrap items-center justify-center gap-4 text-slate-500 text-sm font-medium">
          <span className="text-slate-400">Consultamos precios en:</span>
          <span className="flex items-center gap-1"><ShoppingBag className="w-4 h-4" /> Amazon</span>
          <span className="flex items-center gap-1"><ShoppingBag className="w-4 h-4" /> MercadoLibre</span>
          <span className="flex items-center gap-1"><ShoppingBag className="w-4 h-4" /> eBay</span>
          <span className="flex items-center gap-1"><ShoppingBag className="w-4 h-4" /> Temu</span>
          <span className="flex items-center gap-1"><ShoppingBag className="w-4 h-4" /> Shein</span>
          <span className="flex items-center gap-1"><ShoppingBag className="w-4 h-4" /> AliExpress</span>
          <span className="text-slate-600">y cualquier otra plataforma</span>
        </div>
      </main>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
              {hasSearched ? `Resultados para "${searchQuery}"` : "Haz una búsqueda para comenzar"}
            </h2>
            <p className="text-slate-400">
              {hasSearched ? "Selecciona el producto que deseas rastrear." : "Nuestra IA buscará en múltiples tiendas al mismo tiempo."}
            </p>
          </div>
        </div>

        {hasSearched && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No encontramos resultados. Intenta con otra búsqueda.</p>
          </div>
        )}

        {isPending && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {!isPending && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p, idx) => (
              <Card key={idx} className="bg-slate-900/50 border-slate-800 text-white hover:bg-slate-900 transition-colors group">
                <CardHeader className="p-0 overflow-hidden rounded-t-xl relative aspect-square bg-slate-100 flex items-center justify-center">
                  <div className="text-slate-400/50 font-medium">[{p.store} Image]</div>
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-semibold border border-white/10 uppercase">{p.store}</div>
                </CardHeader>
                <CardContent className="p-5">
                  <CardTitle className="text-lg leading-tight mb-2 group-hover:text-indigo-400 transition-colors truncate" title={p.name}>{p.name}</CardTitle>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">${p.price.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                  <Button
                    onClick={() => setSelectedProduct(p)}
                    className="w-full bg-slate-800 hover:bg-indigo-600 text-white border border-slate-700 hover:border-indigo-500 transition-all font-semibold"
                  >
                    <BellRing className="w-4 h-4 mr-2 text-indigo-400 group-hover:text-white transition-colors" />
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
      />
    </div>
  );
}
