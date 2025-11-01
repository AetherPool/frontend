import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import ContextProvider from "@/context";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AetherPool - Privacy-First JIT Liquidity",
  description: "Multi-LP JIT liquidity protocol with FHE encryption",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {/* Wrap children with ContextProvider so wagmi/AppKit are available when configured */}
        <ContextProvider cookies={null}>{children}</ContextProvider>
        <Analytics />
      </body>
    </html>
  );
}
