"use client";
import "@/styles/globals.css";
import { siteConfig } from "@/config/site";
import { Providers } from "./providers";
import Header from "@/components/header";
import TopBar from "@/components/Topbar";
import clsx from "clsx";
import { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  connectorsForWallets,
  lightTheme as rainbowLightTheme,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { ethereumService } from '@/utils/ethereumService';

const { chains, publicClient } = configureChains(
  [sepolia],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID as string }),
    publicProvider(),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({
        chains,
        projectId: "fbd0254e05f3184a5a70e0f44d0cad19",
        shimDisconnect: true,
      }),
      walletConnectWallet({ chains, projectId: "fbd0254e05f3184a5a70e0f44d0cad19" }),
      coinbaseWallet({ chains, appName: siteConfig.name }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [walletConnected, setWalletConnected] = useState(false);
  const toast = useToast();
  useEffect(() => {
    const initializeEthereum = async () => {
      try {
        await ethereumService.initialize();
        setWalletConnected(true);
      } catch (error: any) {
        console.error('Failed to initialize Ethereum service');
        setWalletConnected(false);
        toast({
          title: 'Wallet Not Connected',
          description:
            error.message || 'Please connect your wallet to use this application.',
          status: 'info',
          duration: 2000, // Toast will disappear after 2 seconds
          isClosable: true, // User can dismiss it manually
          position: 'top', // Display the toast at the top of the screen
        });
      }
    };

    initializeEthereum();
  }, [toast]);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>{siteConfig.name}</title>
        <link rel="icon" href={siteConfig.logo} />
      </head>

      <body
        className={clsx("min-h-screen bg-white text-black antialiased")}
        style={{ backgroundColor: "white" }}
      >
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains} theme={rainbowLightTheme()}>
            <ThirdwebProvider
              clientId={process.env.THIRDWEB_CLIENT_ID as string}
            >
              <Providers>
                <div className="flex flex-col min-h-screen bg-white">
                  {/* Render Header and TopBar */}
                  <Header />
                  <TopBar />
                  {/* Full-width main content */}
                  <main className="flex-grow">{children}</main>
                </div>
              </Providers>
            </ThirdwebProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
