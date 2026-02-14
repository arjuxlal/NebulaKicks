"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
            {/* Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src="/assets/HomeSectionBackgorund.mp4" type="video/mp4" />
            </video>

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-deep-dark/40 to-deep-dark z-10" />

            {/* Content */}
            <div className="relative z-20 text-center px-4">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-6xl md:text-8xl font-orbitron font-extrabold tracking-tight mb-6"
                >
                    STEP INTO <br />
                    <span className="text-neon-cyan glow-text-cyan">THE FUTURE</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 font-inter"
                >
                    Experience the pinnacle of footwear engineering. <br className="hidden md:block" />
                    Nebula Kicks: Designed for the neon-lit streets of 2077.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Link href="/shop" className="block w-fit mx-auto">
                        <button className="neon-button-cyan text-lg font-bold group flex items-center gap-2">
                            <span>SHOP COLLECTION</span>
                            <div className="w-2 h-2 rounded-full bg-neon-cyan group-hover:animate-ping" />
                        </button>
                    </Link>
                </motion.div>
            </div>

            {/* Subtle Glow Accents */}
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 blur-[120px] rounded-full z-0" />
            <div className="absolute top-[10%] right-[-5%] w-[30%] h-[30%] bg-ultraviolet/10 blur-[100px] rounded-full z-0" />
        </section>
    );
}
