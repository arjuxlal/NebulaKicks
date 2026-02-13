
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Mail, User, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            const result = await signIn("credentials", {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });
            if (result?.ok) {
                onClose();
                window.location.reload();
            } else {
                alert("Login failed. Please check your credentials.");
            }
        } else {
            // Signup logic would go here - for now user can only be created via admin seed or future API
            alert("Sign up is currently disabled. Please use the guest checkout or contact admin.");
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md glass-dark rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8">
                        <h2 className="text-3xl font-orbitron font-bold mb-2">
                            {isLogin ? "SYSTEM LOGIN" : "NEW UPLINK"}
                        </h2>
                        <p className="text-white/40 mb-8">
                            {isLogin ? "Authenticate to access your dashboard." : "Join the Nebula network."}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-white/40 tracking-widest ml-1">CODENAME</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                        <input
                                            type="text"
                                            className="w-full bg-deep-dark/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-neon-cyan transition-colors"
                                            placeholder="CyberPunk99"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-white/40 tracking-widest ml-1">EMAIL SIGNAL</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                    <input
                                        type="email"
                                        className="w-full bg-deep-dark/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-neon-cyan transition-colors"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-white/40 tracking-widest ml-1">ACCESS KEY</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                    <input
                                        type="password"
                                        className="w-full bg-deep-dark/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-neon-cyan transition-colors"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full neon-button-cyan py-4 font-bold flex items-center justify-center gap-2 mt-6 group"
                            >
                                {isLogin ? "ESTABLISH LINK" : "INITIALIZE ID"}
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-white/5 text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm text-white/50 hover:text-neon-cyan transition-colors"
                            >
                                {isLogin ? "Need access? Initialize Uplink" : "Already verified? System Login"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
