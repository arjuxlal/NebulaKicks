"use client";

import { useCart } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    images?: string[];
    description: string;
}

export default function ProductDetailModal({
    product,
    isOpen,
    onClose
}: {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [selectedSize, setSelectedSize] = useState("10");
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const addItem = useCart((state) => state.addItem);
    const toggleCart = useCart((state) => state.toggleCart);

    const [isHovering, setIsHovering] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    if (!product) return null;

    const sizes = ["7", "8", "9", "10", "11", "12"];

    const handleAddToCart = () => {
        addItem(product, selectedSize);
        onClose();
        toggleCart();
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePos({ x, y });
    };

    const images = (product.images && product.images.length > 0) ? product.images : [product.image];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200]"
                    />

                    {/* Modal Wrapper for Centering */}
                    <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-4xl max-h-[90vh] glass-dark rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row border-white/10 shadow-2xl"
                        >
                            {/* Image Section */}
                            <div className="md:w-1/2 bg-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                                <motion.div
                                    key={activeImageIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="w-full h-64 md:h-96 relative z-10 cursor-crosshair overflow-hidden rounded-xl"
                                    onMouseEnter={() => setIsHovering(true)}
                                    onMouseLeave={() => setIsHovering(false)}
                                    onMouseMove={handleMouseMove}
                                >
                                    <img
                                        src={images[activeImageIndex]}
                                        alt={product.name}
                                        className={`w-full h-full object-contain drop-shadow-[0_0_50px_rgba(0,242,234,0.3)] transition-opacity duration-300 ${isHovering ? "opacity-0" : "opacity-100"}`}
                                    />
                                    {isHovering && (
                                        <div
                                            className="absolute inset-0 w-full h-full pointer-events-none"
                                            style={{
                                                backgroundImage: `url(${images[activeImageIndex]})`,
                                                backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                                                backgroundSize: "200%",
                                                backgroundRepeat: "no-repeat"
                                            }}
                                        />
                                    )}
                                </motion.div>

                                {/* Thumbnails */}
                                {images.length > 1 && (
                                    <div className="flex gap-2 mt-6 relative z-10 overflow-x-auto pb-2 w-full justify-center">
                                        {images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onMouseEnter={() => setActiveImageIndex(idx)}
                                                onClick={() => setActiveImageIndex(idx)}
                                                className={`w-16 h-16 rounded-xl border-2 transition-all flex-shrink-0 bg-black/40 ${activeImageIndex === idx ? "border-neon-cyan shadow-[0_0_10px_#00f2ea]" : "border-white/10 opacity-50 hover:opacity-100"
                                                    }`}
                                            >
                                                <img src={img} className="w-full h-full object-contain p-2" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-neon-cyan/20 blur-[100px] rounded-full" />
                            </div>

                            {/* Info Section */}
                            <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-2">{product.name}</h2>
                                        <p className="text-neon-cyan text-2xl font-bold font-mono">₹{product.price}</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <p className="text-white/60 font-inter leading-relaxed">
                                        {product.description}
                                    </p>

                                    {/* Size Selection */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold font-orbitron text-sm tracking-widest text-white/40">SELECT SIZE (US)</h4>
                                            <button className="text-xs text-neon-cyan hover:underline">Size Guide</button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {sizes.map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`py-3 rounded-xl border font-bold transition-all ${selectedSize === size
                                                        ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-[0_0_15px_rgba(0,242,234,0.3)]"
                                                        : "border-white/10 hover:border-white/30"
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5 text-xs text-white/40 font-bold uppercase tracking-tighter">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="text-neon-cyan" size={18} />
                                            <span>Authentic Gear</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Zap className="text-ultraviolet" size={18} />
                                            <span>Rapid Delivery</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full neon-button-cyan py-5 text-lg font-bold flex items-center justify-center gap-3"
                                    >
                                        <ShoppingCart size={20} />
                                        ADD TO NEBULA CART
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
