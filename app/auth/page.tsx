"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, User, ArrowRight, Zap, ChevronLeft } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";

function AuthContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const error = searchParams.get("error");

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (isLogin) {
            const result = await signIn("credentials", {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (result?.ok) {
                router.push(callbackUrl);
                router.refresh();
            } else {
                alert("Login failed. Please check your credentials.");
            }
        } else {
            alert("Sign up is currently restricted. Please use guest checkout or contact the administrator.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-deep-dark text-white font-inter flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ultraviolet/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-cyan/20 blur-[120px] rounded-full animate-pulse-slow" />
            </div>

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors group z-10">
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-xs tracking-widest">BACK TO BASE</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-dark rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                    <div className="p-8 md:p-12">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-10 h-10 bg-gradient-to-tr from-ultraviolet to-neon-cyan rounded-xl flex items-center justify-center">
                                <Zap size={24} className="text-white" />
                            </div>
                            <h1 className="font-orbitron font-bold text-2xl tracking-tighter">NEBULA<span className="text-neon-cyan">KICKS</span></h1>
                        </div>

                        <div className="space-y-2 mb-10">
                            <h2 className="text-3xl font-orbitron font-bold leading-none tracking-tight">
                                ADMIN CLEARANCE
                            </h2>
                            <p className="text-white/40 text-sm">
                                Unauthorized access is strictly prohibited. Authenticate for system dashboard access.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                {error === "CredentialsSignin" ? "INVALID AUTHENTICATION KEY" : "SYSTEM ERROR: ACCESS DENIED"}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-1.5"
                                    >
                                        <label className="text-[10px] font-bold text-white/40 tracking-[0.2em] ml-1 uppercase">Codename</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-neon-cyan transition-colors" size={18} />
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-neon-cyan focus:bg-white/10 transition-all font-medium text-sm"
                                                placeholder="CyberRunner_01"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-white/40 tracking-[0.2em] ml-1 uppercase">Comm Link (Email)</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-neon-cyan transition-colors" size={18} />
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-neon-cyan focus:bg-white/10 transition-all font-medium text-sm"
                                        placeholder="pilot@nebula.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-white/40 tracking-[0.2em] ml-1 uppercase">Access Key (Password)</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-neon-cyan transition-colors" size={18} />
                                    <input
                                        required
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-neon-cyan focus:bg-white/10 transition-all font-medium text-sm"
                                        placeholder="••••••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full neon-button-cyan py-5 font-bold flex items-center justify-center gap-3 mt-8 group text-sm tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? "ESTABLISH LINK" : "INITIALIZE PROFILE"}
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4 text-center">
                            <p className="text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase">
                                SYSTEM REGISTRATION RESTRICTED TO ADMINISTRATORS ONLY
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-[10px] text-white/20 font-bold tracking-[0.4em] uppercase">
                    &copy; 2026 Nebula Systems. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-deep-dark flex items-center justify-center italic text-white/20 tracking-widest">
                INITIALIZING AUTH PROTOCOLS...
            </div>
        }>
            <AuthContent />
        </Suspense>
    );
}
