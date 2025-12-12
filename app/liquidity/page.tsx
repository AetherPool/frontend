"use client";

import { useState } from "react";
import { AddLiquidityWidget } from "@/components/liquidity/add-liquidity-widget";
import { JITConfigModal } from "@/components/jit-config/jit-config-modal";
import { Zap, BarChart3 } from "lucide-react";
import Link from "next/link";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  address: string;
}

interface PositionData {
  tokenA: Token;
  tokenB: Token;
  amountA: string;
  amountB: string;
  tickLower: string;
  tickUpper: string;
}

export default function LiquidityPage() {
  const [showJITConfig, setShowJITConfig] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<PositionData | null>(
    null
  );

  const handleJITConfigRequired = (positionData: PositionData) => {
    setPendingPosition(positionData);
    setShowJITConfig(true);
  };

  const handleJITComplete = () => {
    setShowJITConfig(false);
    setPendingPosition(null);
  };

  const handleJITBack = () => {
    setShowJITConfig(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                AetherPool
              </span>
            </Link>

            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Add Liquidity
          </h1>
          <p className="text-muted-foreground">
            Provide liquidity and earn fees
          </p>
        </div>

        <div className="flex justify-center">
          <AddLiquidityWidget onJITConfigRequired={handleJITConfigRequired} />
        </div>
      </main>

      <JITConfigModal
        open={showJITConfig}
        onOpenChange={setShowJITConfig}
        positionData={pendingPosition}
        onComplete={handleJITComplete}
        onBack={handleJITBack}
      />
    </div>
  );
}
