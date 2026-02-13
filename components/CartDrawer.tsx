"use client";

import { useCart } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import CheckoutModal from "./CheckoutModal";

export default function CartDrawer() {
    const { items, isOpen, toggleCart, removeItem, total } = useCart();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md glass-dark z-[101] shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-2xl font-orbitron font-bold flex items-center gap-2">
                                <ShoppingBag className="text-neon-cyan" />
                                YOUR CART
                            </h2>
                            <button
                                onClick={toggleCart}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-white/40 space-y-4">
                                    <ShoppingBag size={64} strokeWidth={1} />
                                    <p className="font-inter">Your cart is empty.</p>
                                    <button
                                        onClick={toggleCart}
                                        className="neon-button-cyan py-2 text-sm"
                                    >
                                        CONTINUE SHOPPING
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={`${item.id}-${item.size}`} className="flex gap-4 group">
                                        <div className="w-24 h-24 bg-white/5 rounded-xl overflow-hidden border border-white/10">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{item.name}</h3>
                                            <p className="text-white/50 text-sm">Size: {item.size || 'N/A'}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-neon-cyan font-bold">₹{item.price} x {item.quantity}</span>
                                                <button
                                                    onClick={() => removeItem(item.id, item.size)}
                                                    className="text-white/30 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="p-6 border-t border-white/10 space-y-4">
                                <div className="flex items-center justify-between text-xl font-bold">
                                    <span>TOTAL</span>
                                    <span className="text-neon-cyan">₹{total().toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        toggleCart();
                                        setIsCheckoutOpen(true);
                                    }}
                                    className="w-full neon-button-purple font-bold py-4"
                                >
                                    PROCEED TO CHECKOUT
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
            <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
        </AnimatePresence>
    );
}
