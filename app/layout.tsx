import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { headers } from "next/headers";
import ContextProvider from "@/context";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AetherPool - Privacy-First JIT Liquidity",
  description: "Multi-LP JIT liquidity protocol with FHE encryption",
  generator: "v0.app",
};

async function getHeaders() {
  try {
    const headersList = await headers();
    return headersList.get("cookie") ?? null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieHeader = await getHeaders();

  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ContextProvider cookies={cookieHeader}>
          {children}
        </ContextProvider>
        <Analytics />
      </body>
    </html>
  );
}
