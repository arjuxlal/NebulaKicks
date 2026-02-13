"use client";

import { useCart } from "@/lib/store";
import { motion } from "framer-motion";
import { Plus, Eye } from "lucide-react";

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    images?: string[];
    description: string;
}

export default function ProductCard({ product, onView }: { product: Product; onView?: () => void }) {
    const addItem = useCart((state) => state.addItem);
    const toggleCart = useCart((state) => state.toggleCart);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addItem(product, "10"); // Default size for now
        toggleCart();
    };

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onView) onView();
    };

    const displayImage = (product.images && product.images.length > 0) ? product.images[0] : product.image;

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="group relative glass-dark rounded-[2rem] overflow-hidden border border-white/5 hover:border-neon-cyan/50 transition-all duration-500 shadow-xl"
        >
            {/* Product Image */}
            <div className="aspect-[4/5] overflow-hidden bg-white/5 flex items-center justify-center p-8 relative">
                <img
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_0_20px_rgba(0,242,234,0.2)]"
                />

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <button
                        onClick={handleAddToCart}
                        className="w-12 h-12 bg-neon-cyan text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_15px_#00f2ea]"
                    >
                        <Plus size={24} />
                    </button>
                    <button
                        onClick={handleView}
                        className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                        <Eye size={24} />
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold font-orbitron">{product.name}</h3>
                    <span className="text-neon-cyan font-bold">₹{product.price}</span>
                </div>
                <p className="text-sm text-white/50 line-clamp-2 font-inter mb-4">
                    {product.description}
                </p>

                <button
                    onClick={handleAddToCart}
                    className="w-full py-3 rounded-xl border border-white/10 group-hover:bg-neon-cyan group-hover:text-black transition-all font-bold text-xs tracking-widest font-orbitron"
                >
                    QUICK ADD
                </button>
            </div>

            {/* Glowing Border Background Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan to-ultraviolet opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 -z-10" />
        </motion.div>
    );
}
