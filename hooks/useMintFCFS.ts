import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { QuintesABI, QUINTES_CONTRACT_ADDRESS } from "@/lib/contract";

export function useMintFCFS() {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const mintFCFS = (priceWei: bigint) => {
        writeContract({
            address: QUINTES_CONTRACT_ADDRESS,
            abi: QuintesABI,
            functionName: "mintFCFS",
            value: priceWei,
        });
    };

    return {
        mintFCFS,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}
