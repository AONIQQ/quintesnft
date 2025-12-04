"use client";

import { WagmiProvider } from "wagmi";
import { ConnectKitProvider } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./wagmi";

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider
                    mode="dark"
                    customTheme={{
                        "--ck-font-family": "var(--font-inter)",
                        "--ck-accent-color": "#FAFAFA",
                        "--ck-accent-text-color": "#000000",
                        "--ck-body-background": "#111111",
                        "--ck-body-background-secondary": "#1E1D1E",
                        "--ck-body-background-tertiary": "#000000",
                        "--ck-body-color": "#FAFAFA",
                        "--ck-body-color-muted": "#949494",
                        "--ck-border-radius": "12px",
                    }}
                >
                    {children}
                </ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};
