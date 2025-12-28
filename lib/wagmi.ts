import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    arbitrum,
    base,
    mainnet,
    optimism,
    polygon,
    sepolia,
    baseSepolia
} from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'AmongFriends',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    chains: [
        mainnet,
        polygon,
        optimism,
        arbitrum,
        base,
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia, baseSepolia] : []),
    ],
    ssr: true,
});