import { MintPhase } from "@/hooks/useMintStatus";

interface PhaseToggleProps {
    currentPhase: MintPhase;
}

export default function PhaseToggle({ currentPhase }: PhaseToggleProps) {
    return (
        <div className="flex gap-2 mb-6 p-1 bg-quintes-dark rounded-lg border border-quintes-border/20 w-fit">
            <div
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentPhase === "GTD"
                        ? "quintes-badge-active"
                        : "quintes-badge-inactive"
                    }`}
            >
                GTD Phase
            </div>
            <div
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentPhase === "FCFS"
                        ? "quintes-badge-active"
                        : "quintes-badge-inactive"
                    }`}
            >
                FCFS Phase
            </div>
        </div>
    );
}
