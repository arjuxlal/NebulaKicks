"use client";

import Link from "next/link";
import { ShoppingCart, LayoutDashboard, Zap, LogOut } from "lucide-react";
import { useCart } from "@/lib/store";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import AuthModal from "./AuthModal";

export default function Navbar() {
    const toggleCart = useCart((state) => state.toggleCart);
    const cartItemsCount = useCart((state) => state.items.length);
    const { data: session } = useSession();
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="sticky top-0 z-50 w-full py-4 bg-transparent backdrop-blur-sm"
            >
                <div className="container mx-auto px-4 md:px-6">
                    <div className="glass-dark rounded-full px-6 py-4 flex items-center justify-between shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/5">
                        <Link href="/" className="flex items-center gap-2 group shrink-0">
                            <Zap className="w-8 h-8 text-neon-cyan group-hover:animate-pulse" />
                            <span className="font-orbitron font-bold text-xl tracking-tighter glow-text-cyan hidden sm:block">
                                NEBULA KICKS
                            </span>
                        </Link>

                        <div className="flex items-center gap-4 md:gap-8">
                            <Link href="/shop" className="hover:text-neon-cyan transition-colors font-medium text-sm">Shop</Link>

                            {session?.user?.id === "admin_user" || session?.user?.role === "ADMIN" ? (
                                <Link href="/admin" className="flex items-center gap-2 text-ultraviolet hover:text-white transition-colors text-sm font-bold">
                                    <LayoutDashboard size={18} />
                                    <span className="hidden md:inline">Command</span>
                                </Link>
                            ) : null}

                            <div className="flex items-center gap-4 border-l border-white/10 pl-4 md:pl-6">
                                {session ? (
                                    <div className="flex items-center gap-3">
                                        <div className="hidden md:flex flex-col text-right">
                                            <span className="text-xs font-bold text-neon-cyan max-w-[100px] truncate">{session.user.name}</span>
                                        </div>
                                        <button
                                            onClick={() => signOut()}
                                            className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-full transition-colors"
                                            title="Logout"
                                        >
                                            <LogOut size={20} />
                                        </button>
                                    </div>
                                ) : null}

                                <button
                                    onClick={toggleCart}
                                    className="relative p-2 hover:bg-white/10 rounded-full transition-colors group"
                                >
                                    <ShoppingCart size={24} className="text-white group-hover:text-neon-cyan transition-colors" />
                                    {cartItemsCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-neon-cyan text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                            {cartItemsCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.nav>

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </>
    );
}
