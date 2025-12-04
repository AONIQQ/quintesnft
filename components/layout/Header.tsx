import Link from "next/link";
import Image from "next/image";

export default function Header() {
    return (
        <header className="w-full py-6 px-6 md:px-12 flex justify-between items-center z-10 relative">
            <div className="flex items-center gap-2">
                {/* Quintes Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/logo-light.svg"
                        alt="Quintes"
                        width={36}
                        height={36}
                        className="w-9 h-9"
                    />
                    <span className="text-xl font-display font-semibold tracking-tight text-quintes-text">
                        QUINTES
                    </span>
                </Link>
            </div>
            <nav className="hidden md:flex gap-8 text-sm font-medium text-quintes-muted">
                <Link href="#about" className="hover:text-quintes-text transition-colors">
                    About
                </Link>
                <Link href="#faq" className="hover:text-quintes-text transition-colors">
                    FAQ
                </Link>
                <Link
                    href="https://x.com/Quintesorg"
                    target="_blank"
                    className="hover:text-quintes-text transition-colors"
                >
                    X (Twitter)
                </Link>
            </nav>
            <div className="w-8 h-8 md:hidden" />
        </header>
    );
}
