"use client"

import { useState, useTransition } from "react"
import { BellRing, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { saveTrackingAction } from "@/app/actions"

interface TrackModalProps {
    product: { name: string; price: number; url: string; store: string } | null;
    isOpen: boolean;
    onClose: () => void;
}

export function TrackModal({ product, isOpen, onClose }: TrackModalProps) {
    const [email, setEmail] = useState("")
    const [targetPrice, setTargetPrice] = useState(product?.price ? (product.price * 0.9).toFixed(2) : "")
    const [isPending, startTransition] = useTransition()

    if (!product) return null;

    async function handleTrack(e: React.FormEvent) {
        e.preventDefault()
        startTransition(async () => {
            try {
                const result = await saveTrackingAction(product!, email, parseFloat(targetPrice))
                if (result.success) {
                    alert("¡Rastreo configurado con éxito para " + product!.name + "!")
                    onClose()
                } else {
                    alert("Hubo un error al configurar el rastreo: " + result.error)
                }
            } catch (error) {
                alert("Ocurrió un error de red o de servidor.")
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogHeader>
                <DialogTitle>Vigilar Precio</DialogTitle>
                <DialogDescription>
                    Te avisaremos por correo cuando el precio de <strong>{product.name}</strong> baje de la cantidad que indiques.
                </DialogDescription>
            </DialogHeader>

            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center mb-6">
                <div>
                    <span className="text-xs text-slate-400 block uppercase tracking-wider">{product.store}</span>
                    <span className="font-medium text-white block">Precio Actual</span>
                </div>
                <span className="text-xl font-bold text-indigo-400">${product.price.toFixed(2)}</span>
            </div>

            <form onSubmit={handleTrack} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Avisarme cuando baje de:</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                        <Input
                            type="number"
                            step="0.01"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            className="pl-7 bg-slate-900 border-slate-700 text-white"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Enviarme alerta a:</label>
                    <Input
                        type="email"
                        placeholder="tu@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600"
                        required
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                    {isPending ? (
                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    ) : (
                        <BellRing className="w-4 h-4 mr-2" />
                    )}
                    {isPending ? "Configurando rastreo..." : "Guardar Rastreo"}
                </Button>
            </form>
        </Dialog>
    )
}
