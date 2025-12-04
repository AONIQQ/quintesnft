import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="w-full py-12 px-6 md:px-12 border-t border-quintes-border/20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                    <Image
                        src="/logo-light.svg"
                        alt="Quintes"
                        width={28}
                        height={28}
                        className="w-7 h-7 opacity-60"
                    />
                    <span className="text-sm text-quintes-muted">
                        © 2025 Quintes. All rights reserved.
                    </span>
                </div>

                <nav className="flex gap-6 text-sm text-quintes-muted">
                    <Link href="https://x.com/Quintesorg" target="_blank" className="hover:text-quintes-text transition-colors">
                        X (Twitter)
                    </Link>
                    <Link href="#" className="hover:text-quintes-text transition-colors">
                        Discord
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
