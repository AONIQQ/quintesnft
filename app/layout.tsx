import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/lib/web3-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Quintes NFT Mint | Campaign Launch",
  description: "Mint your Quintes NFT. 1,000 total supply. Free mint (gas only). One NFT per wallet.",
  keywords: ["Quintes", "NFT", "Mint", "Ethereum", "Web3", "Crypto"],
  authors: [{ name: "Quintes" }],
  openGraph: {
    title: "Quintes NFT Mint | Campaign Launch",
    description: "Mint your Quintes NFT. 1,000 total supply. Free mint (gas only). One NFT per wallet across all phases.",
    images: ["/logo-light.svg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quintes NFT Mint | Campaign Launch",
    description: "Mint your Quintes NFT. 1,000 total supply. Free mint (gas only).",
    images: ["/logo-light.svg"],
  },
  icons: {
    icon: "/logo-light.svg",
    shortcut: "/logo-light.svg",
    apple: "/logo-light.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-light.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-black text-white antialiased`}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
