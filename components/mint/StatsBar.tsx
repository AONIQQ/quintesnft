interface StatsBarProps {
    totalSupply: number;
    maxSupply: number;
    remaining: number;
}

export default function StatsBar({ totalSupply, maxSupply, remaining }: StatsBarProps) {
    const percent = Math.min(100, (totalSupply / maxSupply) * 100);

    return (
        <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col">
                <span className="text-xs text-quintes-muted uppercase tracking-wider">Total Supply</span>
                <span className="text-xl font-display font-medium text-quintes-text">{maxSupply.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-quintes-muted uppercase tracking-wider">Minted</span>
                <span className="text-xl font-display font-medium text-quintes-text">{totalSupply.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-quintes-muted uppercase tracking-wider">Remaining</span>
                <span className="text-xl font-display font-medium text-quintes-text">{remaining.toLocaleString()}</span>
            </div>

            {/* Progress Bar */}
            <div className="col-span-3 mt-2 quintes-progress h-1 w-full rounded-full">
                <div
                    className="h-full quintes-progress-bar rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
