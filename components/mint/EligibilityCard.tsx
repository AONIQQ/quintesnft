"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";

interface EligibilityCardProps {
    phase: string;
    onProofLoaded: (proof: string[], eligible: boolean) => void;
}

export default function EligibilityCard({ phase, onProofLoaded }: EligibilityCardProps) {
    const { address, isConnected } = useAccount();
    const [status, setStatus] = useState<"loading" | "eligible" | "ineligible" | "idle">("idle");

    const checkEligibility = useCallback(async () => {
        if (!isConnected || !address) {
            setStatus("idle");
            onProofLoaded([], false);
            return;
        }

        if (phase !== "GTD") {
            setStatus("idle");
            onProofLoaded([], false);
            return;
        }

        setStatus("loading");
        try {
            const res = await fetch(`/api/proof?address=${address}`);
            const data = await res.json();

            if (data.eligible && data.proof) {
                setStatus("eligible");
                onProofLoaded(data.proof, true);
            } else {
                setStatus("ineligible");
                onProofLoaded([], false);
            }
        } catch (err) {
            console.error("Failed to check eligibility", err);
            setStatus("ineligible");
            onProofLoaded([], false);
        }
    }, [address, isConnected, phase, onProofLoaded]);

    useEffect(() => {
        checkEligibility();
    }, [checkEligibility]);

    if (!isConnected) return null;

    return (
        <div className="mb-6 p-4 rounded-xl bg-quintes-surface/50 border border-quintes-border/20 text-sm">
            {status === "loading" && (
                <div className="flex items-center gap-2 text-quintes-muted">
                    <div className="w-2 h-2 rounded-full bg-quintes-muted animate-pulse" />
                    <span>Checking eligibility...</span>
                </div>
            )}

            {status === "eligible" && (
                <div className="flex items-center gap-2 text-green-400">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span>You are GTD-allowlisted</span>
                </div>
            )}

            {status === "ineligible" && phase === "GTD" && (
                <div className="flex items-center gap-2 text-quintes-muted">
                    <div className="w-2 h-2 rounded-full bg-quintes-muted" />
                    <span>Not on GTD list — wait for FCFS phase</span>
                </div>
            )}

            {phase === "FCFS" && (
                <div className="flex items-center gap-2 text-quintes-text">
                    <div className="w-2 h-2 rounded-full bg-quintes-text" />
                    <span>FCFS phase is open to everyone</span>
                </div>
            )}

            {phase === "PAUSED" && (
                <div className="flex items-center gap-2 text-quintes-muted">
                    <div className="w-2 h-2 rounded-full bg-quintes-muted" />
                    <span>Minting is currently paused</span>
                </div>
            )}
        </div>
    );
}
