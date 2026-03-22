"use client"

import { useState, useTransition, useEffect } from "react"
import { BellRing, Loader2, ShieldCheck, Lock as LockIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { saveTrackingAction } from "@/app/actions"
import { useAuth } from "@/context/AuthContext"

interface TrackModalProps {
    product: { name: string; price: number; url: string; store: string; image?: string } | null;
    isOpen: boolean;
    onClose: () => void;
    onOpenAuth: () => void;
}

export function TrackModal({ product, isOpen, onClose, onOpenAuth }: TrackModalProps) {
    const { user } = useAuth()
    const [email, setEmail] = useState("")
    const [targetPrice, setTargetPrice] = useState("")
    const [isPending, startTransition] = useTransition()
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (product) {
            setTargetPrice((product.price * 0.9).toFixed(2))
        }
        if (user?.email) {
            setEmail(user.email)
        }
    }, [product, user])

    if (!product) return null;

    async function handleTrack(e: React.FormEvent) {
        e.preventDefault()
        if (!user) {
            onOpenAuth();
            return;
        }

        startTransition(async () => {
            try {
                const result = await saveTrackingAction(product!, email, parseFloat(targetPrice))
                if (result.success) {
                    setSuccess(true)
                    setTimeout(() => {
                        setSuccess(false)
                        onClose()
                    }, 2500)
                } else {
                    alert("Error: " + result.error)
                }
            } catch (error) {
                alert("Ocurrió un error.");
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <div className="p-4">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-1">
                        Vigilar Precio Premium
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-sm">
                        Configura una alerta personalizada para <strong>{product.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                {!user ? (
                    <div className="py-8 flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg">
                            <LockIcon className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white tracking-tight">Acceso Protegido</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Para guardar rastreos y recibir alertas automatizadas por IA debes estar registrado.
                            </p>
                        </div>
                        <Button 
                            onClick={() => {
                                onClose();
                                onOpenAuth();
                            }}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 h-14 font-bold text-lg shadow-lg shadow-indigo-600/20"
                        >
                            Iniciar Sesión / Registro
                        </Button>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1 font-bold">
                            <ShieldCheck className="w-3 h-3 text-indigo-500" /> 100% Seguro & Operativo
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                {product.image && <img src={product.image} className="w-12 h-12 object-contain bg-white rounded-lg p-1.5 shadow-sm" />}
                                <div>
                                    <span className="text-[10px] text-indigo-400 block uppercase font-black tracking-widest">{product.store}</span>
                                    <span className="text-sm font-bold text-slate-300 block">Precio Actual</span>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-white">${product.price.toLocaleString()}</span>
                        </div>

                        {success ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-xl shadow-green-500/5">
                                    <BellRing className="w-10 h-10 text-green-500 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-extrabold text-white">¡Rastreo Activado!</h3>
                                    <p className="text-slate-400 font-medium">Monitorizando variaciones en tiempo real...</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleTrack} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Mi Precio Objetivo:</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3.5 text-slate-400 font-black text-xl">$</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={targetPrice}
                                            onChange={(e) => setTargetPrice(e.target.value)}
                                            className="pl-9 h-14 bg-slate-900 border-slate-700 text-white font-black text-2xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] px-1 font-bold">
                                        <span className="text-slate-500 italic">Pre-configurado con -10% ahorro</span>
                                        <span className="text-indigo-400 uppercase tracking-widest">IA Sugerencia</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Email de Notificación:</label>
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            value={email}
                                            readOnly
                                            className="h-12 bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed font-medium text-sm"
                                        />
                                        <ShieldCheck className="absolute right-4 top-3.5 w-5 h-5 text-slate-700" />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black h-16 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] gap-3 text-lg"
                                >
                                    {isPending ? (
                                        <Loader2 className="animate-spin w-6 h-6" />
                                    ) : (
                                        <BellRing className="w-6 h-6" />
                                    )}
                                    {isPending ? "PROCESANDO..." : "ACTIVAR MONITOR"}
                                </Button>
                            </form>
                        )}
                    </>
                )}
                <div className="bg-indigo-600/10 py-4 px-4 text-center border-t border-indigo-500/20 -mx-4 -mb-4">
                    <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em] animate-pulse">
                        Agente AI Operativo • Escaneo Multi-Plataforma Activo
                    </p>
                </div>
            </div>
        </Dialog>
    )
}
