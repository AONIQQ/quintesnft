interface TxStatusProps {
    hash?: string;
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    error: Error | null;
}

export default function TxStatus({ hash, isPending, isConfirming, isSuccess, error }: TxStatusProps) {
    if (error) {
        return (
            <div className="mt-4 p-3 rounded-lg bg-red-900/10 border border-red-500/30 text-red-400 text-sm">
                Error: {error.message.slice(0, 60)}...
            </div>
        );
    }

    if (isPending) {
        return (
            <div className="mt-4 p-3 rounded-lg bg-quintes-surface border border-quintes-border/30 text-quintes-muted text-sm flex items-center gap-2">
                <div className="animate-spin w-3 h-3 border-2 border-quintes-text border-t-transparent rounded-full" />
                Confirm in wallet...
            </div>
        );
    }

    if (isConfirming) {
        return (
            <div className="mt-4 p-3 rounded-lg bg-quintes-surface border border-quintes-border/30 text-quintes-muted text-sm flex items-center gap-2">
                <div className="animate-spin w-3 h-3 border-2 border-quintes-text border-t-transparent rounded-full" />
                Transaction processing...
            </div>
        );
    }

    if (isSuccess && hash) {
        return (
            <div className="mt-4 p-3 rounded-lg bg-green-900/10 border border-green-500/30 text-green-400 text-sm break-all">
                ✓ Success! Tx: {hash.slice(0, 10)}...{hash.slice(-8)}
            </div>
        );
    }

    return null;
}
