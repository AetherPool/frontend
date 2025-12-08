"use client";

import type React from "react";
import { useState } from "react";
import { Settings, Shield, Lock, Check, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  price: number;
}

interface PositionData {
  tokenA: Token;
  tokenB: Token;
  amountA: string;
  amountB: string;
  tickLower: string;
  tickUpper: string;
}

interface JITConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positionData: PositionData | null;
  onComplete: () => void;
  onBack: () => void;
}

export function JITConfigModal({
  open,
  onOpenChange,
  positionData,
  onComplete,
  onBack,
}: JITConfigModalProps) {
  const [minSwapSize, setMinSwapSize] = useState("");
  const [hedgePercentageA, setHedgePercentageA] = useState(25);
  const [hedgePercentageB, setHedgePercentageB] = useState(25);
  const [autoHedgeEnabled, setAutoHedgeEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("[v0] JIT Position created:", {
      positionData,
      config: {
        minSwapSize,
        hedgePercentageA,
        hedgePercentageB,
        autoHedgeEnabled,
      },
    });

    setIsSubmitting(false);
    onComplete();
  };

  if (!positionData) return null;

  const totalValue =
    Number(positionData.amountA) * positionData.tokenA.price +
    Number(positionData.amountB) * positionData.tokenB.price;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-linear-to-b from-slate-900 via-slate-900 to-black border border-purple-500/30 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            Configure JIT Strategy
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Position Summary */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <h4 className="text-sm text-gray-400 mb-3">Position Summary</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">
                {positionData.tokenA.symbol}/{positionData.tokenB.symbol}
              </span>
              <span className="text-cyan-400 font-medium">
                ${totalValue.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {positionData.amountA} {positionData.tokenA.symbol} +{" "}
              {positionData.amountB} {positionData.tokenB.symbol}
            </div>
          </div>

          {/* Min Swap Size */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 font-medium">
              <Lock className="w-4 h-4 text-purple-400" />
              Minimum Swap Size (Encrypted)
            </label>
            <input
              type="text"
              value={minSwapSize}
              onChange={(e) => setMinSwapSize(e.target.value)}
              placeholder="e.g., 1000"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-gray-600 focus:border-cyan-400 outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum swap size to participate in JIT auctions
            </p>
          </div>

          {/* Hedge Percentage for Token A */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 font-medium">
              <Shield className="w-4 h-4 text-cyan-400" />
              Hedge Percentage - {positionData.tokenA.symbol}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={hedgePercentageA}
              onChange={(e) => setHedgePercentageA(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(6, 182, 212) 0%, rgb(147, 51, 234) ${hedgePercentageA}%, rgb(30, 41, 59) ${hedgePercentageA}%, rgb(30, 41, 59) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span className="text-cyan-400 font-medium">
                {hedgePercentageA}%
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Hedge Percentage for Token B */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 font-medium">
              <Shield className="w-4 h-4 text-purple-400" />
              Hedge Percentage - {positionData.tokenB.symbol}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={hedgePercentageB}
              onChange={(e) => setHedgePercentageB(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(6, 182, 212) 0%, rgb(147, 51, 234) ${hedgePercentageB}%, rgb(30, 41, 59) ${hedgePercentageB}%, rgb(30, 41, 59) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span className="text-purple-400 font-medium">
                {hedgePercentageB}%
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Auto Hedge Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <div>
              <div className="font-medium text-white">Enable Auto-Hedging</div>
              <div className="text-sm text-gray-400">
                Automatically hedge profits at threshold
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAutoHedgeEnabled(!autoHedgeEnabled)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                autoHedgeEnabled
                  ? "bg-linear-to-r from-cyan-500 to-purple-600"
                  : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  autoHedgeEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-gray-300">
              Your JIT parameters will be encrypted using FHE (Fully Homomorphic
              Encryption). Only you can decrypt and view your exact
              configuration.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 border-slate-700 text-gray-300 hover:bg-slate-800 flex items-center justify-center gap-2 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !minSwapSize}
              className="flex-1 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Creating Position...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create JIT Position
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
