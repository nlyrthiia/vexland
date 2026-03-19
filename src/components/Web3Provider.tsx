'use client';
import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: 'VexLand',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'vexland-dev',
  chains: [avalancheFuji],
  transports: { [avalancheFuji.id]: http() },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
