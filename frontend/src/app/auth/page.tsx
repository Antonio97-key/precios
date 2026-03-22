"use client"

import { useState } from "react"
import { Shield, Mail, Lock, ArrowRight, Github, Chrome } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { auth } from "@/lib/firebase"
import { errorManager } from "@/lib/errorManager"
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup 
} from "firebase/auth"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
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
            router.push("/")
        } catch (error: any) {
            errorManager.captureError(error, 'MEDIUM', { action: isLogin ? 'login' : 'signup', email });
            alert("Error de autenticación: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        const provider = new GoogleAuthProvider()
        try {
            await signInWithPopup(auth, provider)
            router.push("/")
        } catch (error: any) {
            errorManager.captureError(error, 'MEDIUM', { action: 'google_auth' });
            alert("Error con Google: " + error.message)
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            
            <div className="w-full max-w-md z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500 mb-4 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        {isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {isLogin ? "Accede a tus rastreos personales" : "Empieza a ahorrar verificando precios reales"}
                    </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/60 p-8 rounded-3xl shadow-2xl">
                    <div className="space-y-4 mb-6">
                        <Button 
                            onClick={handleGoogleAuth}
                            variant="outline" 
                            className="w-full border-slate-800 bg-slate-900/30 text-slate-300 gap-3 py-6 hover:bg-slate-800 transition-all font-medium"
                        >
                            <Chrome className="w-5 h-5" /> Continuar con Google
                        </Button>
                        <Button variant="outline" className="w-full border-slate-800 bg-slate-900/30 text-slate-300 gap-3 py-6 hover:bg-slate-800 transition-all">
                            <Github className="w-5 h-5" /> Continuar con GitHub
                        </Button>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0f172a] px-3 text-slate-500 font-bold">o vía email</span>
                        </div>
                    </div>

                    <form className="space-y-4" onSubmit={handleEmailAuth}>
                        <div className="space-y-1">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                <Input 
                                    type="email" 
                                    placeholder="tu@email.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 py-6 bg-slate-900/50 border-slate-800 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder:text-slate-600 rounded-xl"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 py-6 bg-slate-900/50 border-slate-800 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder:text-slate-600 rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <Button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all gap-2 group"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isLogin ? "Iniciar Sesión" : "Registrarse")}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                        >
                            {isLogin ? "¿No tienes cuenta? Registrate aquí" : "¿Ya tienes cuenta? Inicia sesión"}
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm flex items-center justify-center gap-2">
                         ← Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    )
}
