"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutSection() {
    return (
        <section id="about" className="w-full py-20 md:py-32 relative">
            <div className="max-w-4xl mx-auto px-6 md:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center gap-4 mb-8">
                        <Image
                            src="/logo-light.svg"
                            alt="Quintes"
                            width={48}
                            height={48}
                            className="w-12 h-12 opacity-60"
                        />
                        <h2 className="text-3xl md:text-4xl font-display font-normal quintes-gradient-text">
                            About
                        </h2>
                    </div>

                    <div className="space-y-6 text-quintes-muted text-lg leading-relaxed">
                        <p>
                            Quintes NFTs are a <span className="text-quintes-text">1,000-supply, free-to-mint</span> collection
                            that sits at the center of the Quintes protocol launch.
                        </p>

                        <p>
                            Each wallet can mint exactly one NFT. The mint runs in two phases:
                        </p>

                        <ul className="space-y-3 ml-6">
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-quintes-border mt-2.5 flex-shrink-0" />
                                <span>
                                    <strong className="text-quintes-text">GTD (Guaranteed) phase:</strong> allowlisted addresses only
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-quintes-border mt-2.5 flex-shrink-0" />
                                <span>
                                    <strong className="text-quintes-text">FCFS (First-Come, First-Served) phase:</strong> remaining supply, open to anyone
                                </span>
                            </li>
                        </ul>

                        <p>
                            These NFTs are designed with future on-chain utility in mind: holders will be the first
                            in line for future &ldquo;rebases&rdquo; (follow-up drops, evolutions, and airdrops to the original minters),
                            similar in spirit to how early Berachain NFT holders were rewarded across multiple iterations.
                        </p>

                        <p className="text-quintes-text font-medium">
                            Holding a Quintes NFT is your ticket into the core community, future experiments,
                            and protocol-level perks as Quintes rolls out its full product stack.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
