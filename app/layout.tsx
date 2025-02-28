"use client";
import "@/styles/globals.css";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import Header from "@/components/header";
import TopBar from "@/components/Topbar";
import clsx from "clsx";

import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider, lightTheme as rainbowLightTheme } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { ThirdwebProvider } from "@thirdweb-dev/react";

const { chains, publicClient } = configureChains(
  [sepolia],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID as string }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: siteConfig.name,
  projectId: "fbd0254e05f3184a5a70e0f44d0cad19",
  chains,
});

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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{siteConfig.name}</title>
        <link rel="icon" href={siteConfig.logo} />
      </head>

      <body
        className={clsx(
          "min-h-screen bg-white text-black font-sans antialiased",
          fontSans.variable
        )}
        style={{ backgroundColor: "white" }}
      >
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains} theme={rainbowLightTheme()}>
            <ThirdwebProvider clientId={process.env.THIRDWEB_CLIENT_ID}>
              <Providers>
                <div className="flex flex-col min-h-screen bg-white">
                  {/* Render Header and TopBar */}
                  <Header />
                  <TopBar />
                  {/* Full-width main content */}
                  <main className="flex-grow">
                    {children}
                  </main>
                </div>
              </Providers>
            </ThirdwebProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
