"use client"

import { useState } from "react"
import { Shield, Mail, Lock, ArrowRight, Chrome, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { auth } from "@/lib/firebase"
import { errorManager } from "@/lib/errorManager"
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup 
} from "firebase/auth"
import { useRouter } from "next/navigation"

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(initialMode === "login")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password)
            } else {
                await createUserWithEmailAndPassword(auth, email, password)
            }
            onClose()
            router.push("/dashboard")
        } catch (error: any) {
            errorManager.captureError(error, 'MEDIUM', { action: isLogin ? 'login' : 'signup', email });
            alert("Error: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        const provider = new GoogleAuthProvider()
        try {
            await signInWithPopup(auth, provider)
            onClose()
            router.push("/dashboard")
        } catch (error: any) {
            errorManager.captureError(error, 'MEDIUM', { action: 'google_auth' });
            alert("Error con Google: " + error.message)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <div className="p-4">
                <DialogHeader className="text-center mb-6">
                    <div className="mx-auto inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500 mb-4 shadow-lg shadow-indigo-500/20">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">
                        {isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-sm mt-1">
                        {isLogin ? "Accede a tus rastreos personales" : "Empieza a monitorear precios reales"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mb-6">
                    <Button 
                        onClick={handleGoogleAuth}
                        variant="outline" 
                        className="w-full border-slate-800 bg-slate-900/50 text-slate-300 gap-3 py-6 hover:bg-slate-800 transition-all"
                    >
                        <Chrome className="w-5 h-5" /> Continuar con Google
                    </Button>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                        <span className="bg-slate-950 px-3 text-slate-500">o vía email</span>
                    </div>
                </div>

                <form className="space-y-4" onSubmit={handleEmailAuth}>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                        <Input 
                            type="email" 
                            placeholder="tu@email.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 py-6 bg-slate-900/50 border-slate-800 focus:ring-indigo-500 text-white rounded-xl"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                        <Input 
                            type="password" 
                            placeholder="Contraseña" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 py-6 bg-slate-900/50 border-slate-800 focus:ring-indigo-500 text-white rounded-xl"
                            required
                        />
                    </div>

                    <Button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all gap-2 group"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isLogin ? "Entrar" : "Unirse")}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                    >
                        {isLogin ? "¿No tienes cuenta? Registrate" : "¿Ya tienes cuenta? Inicia sesión"}
                    </button>
                </div>
                
                <div className="mt-6 bg-indigo-600/5 py-3 px-4 text-center border-t border-slate-800 -mx-4 -mb-4">
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                        Protección de datos garantizada por AGENTE #19
                    </p>
                </div>
            </div>
        </Dialog>
    )
}
