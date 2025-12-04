"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function MintHero() {
    return (
        <div className="flex flex-col justify-center h-full max-w-2xl">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Logo */}
                <div className="mb-8">
                    <Image
                        src="/logo-light.svg"
                        alt="Quintes"
                        width={80}
                        height={80}
                        className="w-20 h-20"
                    />
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-normal leading-[0.95] mb-8 tracking-[-0.03em]">
                    <span className="quintes-gradient-text">
                        Quintes NFT<br />Launch
                    </span>
                </h1>

                {/* Subtext */}
                <p className="text-lg md:text-xl text-quintes-muted mb-10 max-w-md leading-relaxed font-light">
                    1,000 total supply. Free mint (gas only).
                    One NFT per wallet across all phases.
                </p>

                {/* Stats Row */}
                <div className="flex gap-12">
                    <div>
                        <div className="text-3xl md:text-4xl font-display quintes-gradient-text font-normal">1,000</div>
                        <div className="text-sm text-quintes-muted mt-1">Total Supply</div>
                    </div>
                    <div>
                        <div className="text-3xl md:text-4xl font-display quintes-gradient-text font-normal">FREE</div>
                        <div className="text-sm text-quintes-muted mt-1">Mint Price</div>
                    </div>
                    <div>
                        <div className="text-3xl md:text-4xl font-display quintes-gradient-text font-normal">1</div>
                        <div className="text-sm text-quintes-muted mt-1">Per Wallet</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
