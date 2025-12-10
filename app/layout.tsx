import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "sonner";
// import { ThirdwebProvider } from "thirdweb/react";
import { headers } from "next/headers";
import ContextProvider from "@/context";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AetherPool - Privacy-First JIT Liquidity",
  description: "Multi-LP JIT liquidity protocol with FHE encryption",
  generator: "v0.app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");
  
  return (
    <html lang="en">
      <body
        className={`font-sans antialiased ${_geist.className} ${_geistMono.className}`}
      >
        <ContextProvider cookies={cookies}>
          <Toaster />
          {children}
          <Analytics />
        </ContextProvider>
      </body>
    </html>
  );
}
