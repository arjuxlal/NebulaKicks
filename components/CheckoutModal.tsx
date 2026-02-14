"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Truck, CheckCircle } from "lucide-react";
import { useCart } from "@/lib/store";
import { useSession } from "next-auth/react";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
    const { items, total, clearCart } = useCart();
    const { data: session } = useSession();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
    });

    if (!isOpen) return null;



    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const orderRes = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerName: formData.name,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zip}`,
                    items: items.map(item => ({
                        productId: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        size: item.size,
                        image: item.image
                    })),
                    total: total(),
                    status: "Pending Payment",
                }),
            });

            if (!orderRes.ok) throw new Error("Failed to create order");
            const orderData = await orderRes.json();
            const firestoreOrderId = orderData.id;

            const paymentRes = await fetch("/api/payment/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: total(), currency: "INR" }),
            });

            if (!paymentRes.ok) throw new Error("Failed to create payment");
            const paymentData = await paymentRes.json();

            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: paymentData.keyId,
                    amount: paymentData.amount,
                    currency: paymentData.currency,
                    name: "Nebula Kicks",
                    description: "Sneaker Purchase",
                    order_id: paymentData.orderId,
                    handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
                        const verifyRes = await fetch("/api/payment/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                firestore_order_id: firestoreOrderId,
                            }),
                        });

                        if (verifyRes.ok) {
                            clearCart();
                            setStep(2);
                        } else {
                            alert("Payment verification failed");
                        }
                        setLoading(false);
                    },
                    prefill: { name: formData.name, email: formData.email },
                    theme: { color: "#8B5CF6" },
                    modal: { ondismiss: () => setLoading(false) }
                };
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const razorpay = new (window as any).Razorpay(options);
                razorpay.open();
            };
        } catch (err) {
            console.error("Checkout Error:", err);
            alert(`Checkout failed: ${err instanceof Error ? err.message : "Unknown error"}`);
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[250] flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="w-full max-w-2xl glass-dark rounded-3xl border border-white/10 overflow-hidden flex flex-col md:flex-row"
                >
                    <div className="w-full md:w-1/3 bg-white/5 p-6 border-r border-white/5">
                        <h3 className="font-orbitron font-bold text-lg mb-6 text-neon-cyan">ORDER MANIFEST</h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {items.map((item) => (
                                <div key={`${item.id}-${item.size}`} className="flex gap-3">
                                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded bg-black/40 object-cover" />
                                    <div>
                                        <p className="font-bold text-sm line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-white/50">Size: {item.size} x{item.quantity}</p>
                                        <p className="text-neon-cyan text-xs font-mono">₹{item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <div className="flex justify-between font-bold text-xl">
                                <span>TOTAL</span>
                                <span className="text-neon-cyan">₹{total().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-2/3 p-8 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {step === 1 ? (
                            <form onSubmit={handleCheckout} className="space-y-4">
                                <h2 className="text-2xl font-orbitron font-bold mb-6 flex items-center gap-2">
                                    <CreditCard className="text-ultraviolet" />
                                    SECURE CHECKOUT
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-white/40 tracking-widest">FULL NAME</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-deep-dark/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon-cyan"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-white/40 tracking-widest">EMAIL</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-deep-dark/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon-cyan"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-white/40 tracking-widest">CONTACT NUMBER</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full bg-deep-dark/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon-cyan"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-white/40 tracking-widest">DELIVERY ADDRESS</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-deep-dark/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon-cyan"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-white/40 tracking-widest">CITY</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-deep-dark/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon-cyan"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-white/40 tracking-widest">STATE</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-deep-dark/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon-cyan"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-white/40 tracking-widest">ZIP CODE</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-deep-dark/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon-cyan"
                                        value={formData.zip}
                                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                    />
                                </div>
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full mt-6 neon-button-purple py-4 font-bold flex items-center justify-center gap-3"
                                >
                                    {loading ? "PROCESSING..." : "CONFIRM TRANSMISSION"}
                                    {!loading && <Truck size={18} />}
                                </button>
                            </form>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-6">
                                    <CheckCircle size={40} />
                                </div>
                                <h2 className="text-3xl font-orbitron font-bold mb-2">ORDER CONFIRMED</h2>
                                <p className="text-white/60 mb-8">Your gear is being prepared for hyper-speed delivery.</p>
                                <button
                                    onClick={onClose}
                                    className="neon-button-cyan px-8 py-3 font-bold"
                                >
                                    RETURN TO BASE
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
