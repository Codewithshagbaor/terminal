"use client"

import type React from "react"

import { WagmiProvider } from "wagmi"
import {
    RainbowKitProvider,
    darkTheme,
    Theme
} from '@rainbow-me/rainbowkit'; import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { config } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';


const queryClient = new QueryClient()

const baseDark = darkTheme({
    accentColor: '#10B981',
    accentColorForeground: '#0D0D12',
    borderRadius: 'medium',
    fontStack: 'system',
    overlayBlur: 'small',
});

// Extremely robust theme merging to prevent 'null to object' conversion errors
const obsidianTheme: Theme = {
    ...baseDark,
    colors: {
        ...(baseDark.colors || {}),
        accentColor: '#10B981',
        accentColorForeground: '#0D0D12',
        actionButtonSecondaryBackground: 'rgba(255, 255, 255, 0.05)',
        modalBackground: '#0D0D12',
        modalBorder: 'rgba(255, 255, 255, 0.08)',
        modalText: '#E2E8F0',
        modalTextSecondary: '#94A3B8',
        actionButtonBorder: 'rgba(255, 255, 255, 0.1)',
        connectionIndicator: '#10B981',
        menuItemBackground: 'rgba(255, 255, 255, 0.05)',
        modalBackdrop: 'rgba(0, 0, 0, 0.8)',
        standby: '#10B981',
    },
    fonts: {
        ...(baseDark.fonts || {}),
        body: 'Inter, system-ui, sans-serif',
    }
};

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={obsidianTheme} modalSize="compact">
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
