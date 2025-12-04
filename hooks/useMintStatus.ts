import { useAccount, useReadContracts } from "wagmi";
import { QuintesABI, QUINTES_CONTRACT_ADDRESS } from "@/lib/contract";
import { formatEther } from "viem";

export type MintPhase = "GTD" | "FCFS" | "PAUSED";

export function useMintStatus() {
    const { address } = useAccount();

    const contractConfig = {
        address: QUINTES_CONTRACT_ADDRESS,
        abi: QuintesABI,
    } as const;

    const { data, isLoading, isError, refetch } = useReadContracts({
        contracts: [
            { ...contractConfig, functionName: "totalSupply" },
            { ...contractConfig, functionName: "maxSupply" },
            { ...contractConfig, functionName: "price" },
            { ...contractConfig, functionName: "gtdPhaseActive" },
            { ...contractConfig, functionName: "fcfsPhaseActive" },
            { ...contractConfig, functionName: "paused" },
            ...(address
                ? [{ ...contractConfig, functionName: "hasMinted", args: [address] }]
                : []),
        ],
    });

    const totalSupply = data?.[0]?.result ? Number(data[0].result) : 0;
    const maxSupply = data?.[1]?.result ? Number(data[1].result) : 1000; // Default to 1000 if not read
    const priceWei = data?.[2]?.result ? data[2].result : 0n;
    const gtdActive = !!data?.[3]?.result;
    const fcfsActive = !!data?.[4]?.result;
    const isPaused = !!data?.[5]?.result;
    const hasMinted = address && data?.[6] ? !!data[6].result : false;

    let phase: MintPhase = "PAUSED";
    if (gtdActive) phase = "GTD";
    else if (fcfsActive) phase = "FCFS";

    // Override if paused is explicitly true, though usually phases imply not paused.
    // The contract might have a separate paused state.
    if (isPaused) phase = "PAUSED";

    return {
        phase,
        totalSupply,
        maxSupply,
        remaining: maxSupply - totalSupply,
        price: formatEther(BigInt(priceWei as bigint)),
        priceWei: BigInt(priceWei as bigint),
        hasMinted,
        isPaused,
        isLoading,
        isError,
        refetch,
    };
}
