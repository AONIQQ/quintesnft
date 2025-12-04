"use client";

import { useState, useCallback } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { motion } from "framer-motion";
import { useMintStatus } from "@/hooks/useMintStatus";
import { useMintGTD } from "@/hooks/useMintGTD";
import { useMintFCFS } from "@/hooks/useMintFCFS";
import PhaseToggle from "./PhaseToggle";
import StatsBar from "./StatsBar";
import EligibilityCard from "./EligibilityCard";
import TxStatus from "./TxStatus";

export default function MintPanel() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();

    const {
        phase,
        totalSupply,
        maxSupply,
        remaining,
        price,
        priceWei,
        hasMinted,
        isPaused,
        isLoading,
        refetch
    } = useMintStatus();

    const { mintGTD, hash: gtdHash, isPending: gtdPending, isConfirming: gtdConfirming, isSuccess: gtdSuccess, error: gtdError } = useMintGTD();
    const { mintFCFS, hash: fcfsHash, isPending: fcfsPending, isConfirming: fcfsConfirming, isSuccess: fcfsSuccess, error: fcfsError } = useMintFCFS();

    const [proof, setProof] = useState<string[]>([]);
    const [isEligible, setIsEligible] = useState(false);

    // Environment chain ID
    const targetChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111); // Default Sepolia

    const isWrongNetwork = isConnected && chainId !== targetChainId;

    const handleProofLoaded = useCallback((proofData: string[], eligible: boolean) => {
        setProof(proofData);
        setIsEligible(eligible);
    }, []);

    const handleMint = async () => {
        if (phase === "GTD" && isEligible) {
            mintGTD(proof);
        } else if (phase === "FCFS") {
            mintFCFS(priceWei);
        }
    };

    const isMinting = gtdPending || gtdConfirming || fcfsPending || fcfsConfirming;
    const isSuccess = gtdSuccess || fcfsSuccess;

    // Button disabled logic
    const isButtonDisabled =
        !isConnected ||
        isWrongNetwork ||
        isPaused ||
        hasMinted ||
        isMinting ||
        remaining === 0 ||
        (phase === "GTD" && !isEligible) ||
        phase === "PAUSED";

    // Refetch on success
    if (isSuccess && refetch) {
        refetch();
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-md quintes-card rounded-2xl p-8"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-display font-medium quintes-gradient-text">Mint Status</h2>
                    <p className="text-sm text-quintes-muted mt-1">Quintes NFT Collection</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-quintes-muted uppercase tracking-wider">Price</div>
                    <div className="font-display text-xl text-quintes-text">{price === "0" ? "FREE" : `${price} ETH`}</div>
                </div>
            </div>

            {/* Phase & Stats */}
            <PhaseToggle currentPhase={phase} />
            <StatsBar totalSupply={totalSupply} maxSupply={maxSupply} remaining={remaining} />

            {/* Network Warning */}
            {isWrongNetwork && (
                <div className="mb-6 p-4 bg-red-900/10 border border-red-500/30 rounded-xl text-center">
                    <p className="text-red-400 text-sm mb-3">Wrong Network</p>
                    <button
                        onClick={() => switchChain({ chainId: targetChainId })}
                        className="text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors border border-red-500/30"
                    >
                        Switch Network
                    </button>
                </div>
            )}

            {/* Wallet Connection / Mint Button */}
            {!isConnected ? (
                <div className="mt-8">
                    <ConnectKitButton.Custom>
                        {({ show }) => (
                            <button
                                onClick={show}
                                className="w-full py-4 quintes-btn-primary rounded-xl text-lg"
                            >
                                Connect Wallet
                            </button>
                        )}
                    </ConnectKitButton.Custom>
                </div>
            ) : (
                <>
                    <EligibilityCard phase={phase} onProofLoaded={handleProofLoaded} />

                    {hasMinted ? (
                        <div className="w-full py-4 bg-green-900/10 border border-green-500/30 text-green-400 font-medium rounded-xl text-center">
                            ✓ You have already minted!
                        </div>
                    ) : (
                        <button
                            onClick={handleMint}
                            disabled={isButtonDisabled}
                            className={`w-full py-4 rounded-xl text-lg font-medium transition-all
                ${isButtonDisabled
                                    ? "bg-quintes-surface text-quintes-muted cursor-not-allowed border border-quintes-border/20"
                                    : "quintes-btn-primary"
                                }`}
                        >
                            {isMinting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </span>
                            ) : phase === "GTD" ? (
                                "Mint GTD"
                            ) : phase === "FCFS" ? (
                                "Mint FCFS"
                            ) : (
                                "Mint Paused"
                            )}
                        </button>
                    )}
                </>
            )}

            {/* Transaction Status */}
            <TxStatus
                hash={gtdHash || fcfsHash}
                isPending={gtdPending || fcfsPending}
                isConfirming={gtdConfirming || fcfsConfirming}
                isSuccess={isSuccess}
                error={gtdError || fcfsError}
            />

            {/* Footer Note */}
            <p className="mt-8 text-xs text-center text-quintes-muted">
                1 NFT per wallet across all phases • Gas fees apply
            </p>
        </motion.div>
    );
}
