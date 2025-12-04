"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItemProps {
    question: string;
    answer: React.ReactNode;
    isOpen: boolean;
    onClick: () => void;
}

function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
    return (
        <div className="border-b border-quintes-border/20">
            <button
                onClick={onClick}
                className="w-full py-6 flex items-center justify-between text-left hover:opacity-80 transition-opacity"
            >
                <span className="text-lg font-medium text-quintes-text pr-8">{question}</span>
                <span className={`text-quintes-border transition-transform ${isOpen ? 'rotate-45' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-6 text-quintes-muted leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const faqData = [
    {
        question: "What is the Quintes NFT collection?",
        answer: (
            <p>
                Quintes NFTs are a fixed 1,000-supply ERC-721 collection on Ethereum (or an EVM-compatible chain
                designated by the team). Each wallet can ever receive <strong className="text-quintes-text">one</strong> Quintes
                NFT via the public mint/airdrop paths. Mint is free; you only pay gas.
            </p>
        ),
    },
    {
        question: "How does the mint work?",
        answer: (
            <div className="space-y-4">
                <p>The mint happens in two phases, both drawing from the same 1,000-NFT pool:</p>
                <ol className="space-y-3 ml-4">
                    <li>
                        <strong className="text-quintes-text">1. GTD (Guaranteed) phase</strong>
                        <ul className="mt-2 ml-4 space-y-1 text-sm">
                            <li>• Only allowlisted addresses can mint</li>
                            <li>• 1 NFT per wallet</li>
                        </ul>
                    </li>
                    <li>
                        <strong className="text-quintes-text">2. FCFS (First-Come, First-Served) phase</strong>
                        <ul className="mt-2 ml-4 space-y-1 text-sm">
                            <li>• Open to everyone</li>
                            <li>• Any remaining supply from GTD becomes mintable</li>
                            <li>• Still 1 NFT per wallet</li>
                        </ul>
                    </li>
                </ol>
                <p>Once total supply hits 1,000, minting is permanently closed.</p>
            </div>
        ),
    },
    {
        question: 'What does "one wallet, one NFT" mean in practice?',
        answer: (
            <div className="space-y-3">
                <p>
                    If you mint during GTD, you <strong className="text-quintes-text">cannot</strong> mint again during FCFS.
                </p>
                <p>
                    If you receive a guaranteed airdrop from the team, you <strong className="text-quintes-text">cannot</strong> also
                    mint another one from the same wallet.
                </p>
                <p className="text-quintes-text">
                    In short: each user wallet gets <strong>one shot, one NFT</strong>.
                </p>
                <p className="text-sm opacity-70">
                    (Team / treasury wallets can hold multiple NFTs via admin mints; this doesn&apos;t affect user limits.)
                </p>
            </div>
        ),
    },
    {
        question: 'What is "rebasing" in this context?',
        answer: (
            <div className="space-y-3">
                <p>
                    &ldquo;Rebasing&rdquo; here means that original Quintes NFT holders are eligible for future drops,
                    evolutions, or airdrops that build on top of this genesis collection.
                </p>
                <p>
                    Instead of the NFTs changing their on-chain supply like an elastic token, Quintes will
                    periodically <strong className="text-quintes-text">reward existing holders</strong> with new NFTs or
                    upgraded versions, snapshotting the holder set at specific times and airdropping into those wallets.
                </p>
                <p className="text-sm opacity-70">
                    All of that logic is handled in future phases/contracts; you just need to mint and hold.
                </p>
            </div>
        ),
    },
    {
        question: "What utility will the NFTs have?",
        answer: (
            <div className="space-y-3">
                <p>High-level, Quintes NFTs are intended to be:</p>
                <ul className="space-y-2 ml-4">
                    <li>
                        <strong className="text-quintes-text">Access keys:</strong> priority whitelist for Quintes protocol
                        features and token-related events
                    </li>
                    <li>
                        <strong className="text-quintes-text">Reward multipliers:</strong> potential boosts or eligibility
                        for future airdrops, quests, and loyalty programs
                    </li>
                    <li>
                        <strong className="text-quintes-text">Identity:</strong> visual representation of early status
                        in the Quintes ecosystem
                    </li>
                </ul>
                <p>
                    Holding a Quintes NFT is the <strong className="text-quintes-text">safest default way not to miss
                        future rewards</strong> around the protocol.
                </p>
            </div>
        ),
    },
    {
        question: "How do I know if I'm allowlisted for the GTD phase?",
        answer: (
            <div className="space-y-3">
                <p>During GTD, you&apos;ll be able to:</p>
                <ul className="space-y-2 ml-4 text-sm">
                    <li>• Connect your wallet on this page</li>
                    <li>• See a &ldquo;You&apos;re allowlisted&rdquo; / &ldquo;Not allowlisted&rdquo; state</li>
                    <li>• If allowlisted, mint directly (as long as GTD is still open and supply remains)</li>
                </ul>
                <p className="text-sm opacity-70">
                    Community collabs, ambassadors, and partner campaigns will all feed into this allowlist.
                </p>
            </div>
        ),
    },
    {
        question: "Is the mint really free?",
        answer: (
            <p>
                Yes. Mint price is <strong className="text-quintes-text">0 ETH</strong>. You only pay the network gas
                fee for your transaction.
            </p>
        ),
    },
    {
        question: "What should I use to connect my wallet?",
        answer: (
            <div className="space-y-3">
                <p>You can connect using our wallet-connect UI that supports:</p>
                <ul className="space-y-1 ml-4 text-sm">
                    <li>• MetaMask and browser wallets</li>
                    <li>• WalletConnect-compatible wallets</li>
                    <li>• Popular mobile and hardware wallets via QR / deep link</li>
                </ul>
                <p className="text-sm opacity-70">
                    (If you already use MetaMask, Rainbow, Rabby, Phantom (EVM), or similar, you&apos;re good.)
                </p>
            </div>
        ),
    },
    {
        question: "When is reveal?",
        answer: (
            <div className="space-y-3">
                <p>
                    Initially, all NFTs may use a <strong className="text-quintes-text">pre-reveal</strong> placeholder
                    image and metadata.
                </p>
                <p>Once art is ready and the team flips reveal:</p>
                <ul className="space-y-1 ml-4 text-sm">
                    <li>• Your token metadata will point to the final IPFS base URI</li>
                    <li>• Your NFT will show its final artwork and traits in marketplaces and wallets</li>
                </ul>
                <p className="text-sm opacity-70">
                    Reveal timing will be announced through official Quintes channels (X, Discord, etc.).
                </p>
            </div>
        ),
    },
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="w-full py-20 md:py-32 relative">
            <div className="max-w-4xl mx-auto px-6 md:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-display font-normal quintes-gradient-text mb-12">
                        Frequently Asked Questions
                    </h2>

                    <div className="divide-y divide-quintes-border/20 border-t border-quintes-border/20">
                        {faqData.map((item, index) => (
                            <FAQItem
                                key={index}
                                question={item.question}
                                answer={item.answer}
                                isOpen={openIndex === index}
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
