import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { QuintesABI, QUINTES_CONTRACT_ADDRESS } from "@/lib/contract";

export function useMintGTD() {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const mintGTD = (proof: string[]) => {
        writeContract({
            address: QUINTES_CONTRACT_ADDRESS,
            abi: QuintesABI,
            functionName: "mintGTD",
            args: [proof as `0x${string}`[]],
        });
    };

    return {
        mintGTD,
        hash,
        isPending, // Wallet confirmation pending
        isConfirming, // Transaction mining
        isSuccess,
        error,
    };
}
