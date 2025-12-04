import { createConfig, http } from "wagmi";
import { mainnet, arbitrum, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

const chains = [mainnet, arbitrum, sepolia] as const;

export const config = createConfig(
    getDefaultConfig({
        // Your dApps chains
        chains,
        transports: {
            [mainnet.id]: http(),
            [arbitrum.id]: http(),
            [sepolia.id]: http(),
        },

        // Required API Keys
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "f0e39a65122b99311b30fb9b43f49dc8",

        // Required App Info
        appName: "Quintes Mint",

        // Optional App Info
        appDescription: "Mint your Quintes NFT",
        appUrl: "https://quintes.xyz", // Placeholder
        appIcon: "https://family.co/logo.png", // Placeholder
    })
);
