"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const localNetwork: Chain = {
  id: 12_345,
  name: "LocalNetwork",
  network: "localNetwork",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://192.168.2.106:8545"] },
    public: { http: ["http://192.168.2.106:8545"] },
  },
  // blockExplorers: {
  //   etherscan: { name: 'Etherscan', url: 'https://rinkeby.etherscan.io' },
  //   default: { name: 'Etherscan', url: 'https://rinkeby.etherscan.io' },
  // },
  contracts: {
    multicall3: {
      address: "0xbE21cE0Ab452035FE1c8Bc9B775A5FbB68d0820a",
      blockCreated: 65,
    },
  },
  iconUrl: "ethereum.png",
  testnet: true,
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    localNetwork,
    mainnet,
    polygon,
    optimism,
    arbitrum,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [goerli] : []),
  ],
  [publicProvider()],
);

const projectId = "";

const { wallets } = getDefaultWallets({
  appName: "ChatGPT Next Web3",
  projectId,
  chains,
});

const demoAppInfo = {
  appName: "ChatGPT Next Web3",
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "Other",
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      // ledgerWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        appInfo={demoAppInfo}
        modalSize="compact"
        showRecentTransactions={true}
      >
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
