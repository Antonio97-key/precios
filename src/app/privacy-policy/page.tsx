import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold tracking-tighter">Política de Privacidad</h1>
                
                <Card className="bg-slate-900 border-slate-800 text-slate-300">
                    <CardHeader>
                        <CardTitle className="text-white">1. Información que Recopilamos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>Solo recopilamos información necesaria para el servicio de monitoreo:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Correo electrónico (para alertas de precio).</li>
                            <li>URLs de productos que deseas rastrear.</li>
                            <li>Historial de búsquedas (anonimizado para analítica).</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-slate-300">
                    <CardHeader>
                        <CardTitle className="text-white">2. Uso de la Información</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Utilizamos tus datos exclusivamente para notificarte cambios de precios y mejorar la precisión de nuestras herramientas de búsqueda mediante IA.</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-slate-300">
                    <CardHeader>
                        <CardTitle className="text-white">3. Terceros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>No vendemos tus datos a terceros. Los datos de productos se obtienen de fuentes públicas (MercadoLibre, Amazon, etc.) y se procesan para brindarte el mejor servicio posible.</p>
                    </CardContent>
                </Card>

                <footer className="text-center text-slate-500 text-sm pt-8">
                    Última actualización: Marzo 2026
                </footer>
            </div>
        </div>
    );
}
