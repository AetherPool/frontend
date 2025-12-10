"use client";

import type React from "react";
import { useState } from "react";
import {
  Settings,
  Shield,
  Lock,
  Check,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useDepositLiquidity from "@/hooks/Liquidity/useDepositLiquidity";
import useSetFHEConfig from "@/hooks/FHE/useSetFHEConfig";
import { ethers } from "ethers";
import { toast } from "sonner";

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

  const { deposit, isLoading: isDepositing } = useDepositLiquidity();
  const { setConfig, isLoading: isSettingConfig } = useSetFHEConfig();

  const isSubmitting = isDepositing || isSettingConfig;

  const handleSubmit = async () => {
    if (!positionData) {
      toast.error("Position data is missing");
      return;
    }

    if (
      !minSwapSize ||
      isNaN(Number(minSwapSize)) ||
      Number(minSwapSize) <= 0
    ) {
      toast.error("Please enter a valid minimum swap size");
      return;
    }

    try {
      // Convert amounts to wei (6 decimals)
      const amount0Wei = ethers.parseUnits(positionData.amountA, 6).toString();
      const amount1Wei = ethers.parseUnits(positionData.amountB, 6).toString();
      const minSwapSizeWei = ethers.parseUnits(minSwapSize, 6).toString();

      const hookAddress = process.env.HOOK || "";

      // Step 1: Set FHE Configuration (encrypted parameters)
      toast.message("Setting encrypted JIT parameters...");

      const poolKey = {
        currency0: positionData.tokenA.address,
        currency1: positionData.tokenB.address,
        fee: 8388608, // Dynamic fee flag
        tickSpacing: 60,
        hooks: hookAddress,
      };

      const configSuccess = await setConfig({
        poolKey,
        minSwapSize: minSwapSizeWei,
        hedgePercentage0: hedgePercentageA,
        hedgePercentage1: hedgePercentageB,
        autoHedgeEnabled,
      });

      if (!configSuccess) {
        toast.error("Failed to set FHE configuration");
        return;
      }

      // Step 2: Deposit liquidity with JIT enabled
      toast.message("Depositing JIT liquidity...");

      const result = await deposit({
        poolKey,
        tickLower: parseInt(positionData.tickLower),
        tickUpper: parseInt(positionData.tickUpper),
        amount0Desired: amount0Wei,
        amount1Desired: amount1Wei,
        isJITEnabled: true,
      });

      if (result) {
        toast.success(`JIT Position created! Token ID: ${result.tokenId}`);
        onComplete();
      }
    } catch (error) {
      console.error("Error creating JIT position:", error);
      toast.error("Failed to create JIT position");
    }
  };

  if (!positionData) return null;

  // Calculate total value (simplified - using 1:1 ratio for stablecoins)
  const totalValue =
    Number(positionData.amountA) + Number(positionData.amountB);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-description="Configure JIT Strategy"
        className="bg-linear-to-b from-slate-900 via-slate-900 to-black border border-purple-500/30 max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            Configure JIT Strategy
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Position Summary */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <h4 className="text-sm text-gray-400 mb-3">Position Summary</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">
                {positionData.tokenA.symbol}/{positionData.tokenB.symbol}
              </span>
              <span className="text-cyan-400 font-medium">
                ~${totalValue.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {positionData.amountA} {positionData.tokenA.symbol} +{" "}
              {positionData.amountB} {positionData.tokenB.symbol}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Ticks: {positionData.tickLower} to {positionData.tickUpper}
            </div>
          </div>

          {/* Min Swap Size */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 font-medium">
              <Lock className="w-4 h-4 text-purple-400" />
              Minimum Swap Size (Encrypted)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.000001"
                value={minSwapSize}
                onChange={(e) => setMinSwapSize(e.target.value)}
                placeholder="e.g., 1000"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-gray-600 focus:border-cyan-400 outline-none transition-all disabled:opacity-50"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                {positionData.tokenA.symbol}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Only participate in swaps larger than this amount (encrypted
              on-chain)
            </p>
          </div>

          {/* Hedge Percentage for Token A */}
          <div>
            <label className="flex items-center justify-between text-sm text-gray-300 mb-2 font-medium">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Auto-Hedge Threshold - {positionData.tokenA.symbol}
              </span>
              <span className="text-cyan-400 font-mono">
                {hedgePercentageA}%
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={hedgePercentageA}
              onChange={(e) => setHedgePercentageA(Number(e.target.value))}
              disabled={isSubmitting}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, rgb(6, 182, 212) 0%, rgb(147, 51, 234) ${hedgePercentageA}%, rgb(30, 41, 59) ${hedgePercentageA}%, rgb(30, 41, 59) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Never hedge</span>
              <span>Always hedge</span>
            </div>
          </div>

          {/* Hedge Percentage for Token B */}
          <div>
            <label className="flex items-center justify-between text-sm text-gray-300 mb-2 font-medium">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Auto-Hedge Threshold - {positionData.tokenB.symbol}
              </span>
              <span className="text-purple-400 font-mono">
                {hedgePercentageB}%
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={hedgePercentageB}
              onChange={(e) => setHedgePercentageB(Number(e.target.value))}
              disabled={isSubmitting}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, rgb(6, 182, 212) 0%, rgb(147, 51, 234) ${hedgePercentageB}%, rgb(30, 41, 59) ${hedgePercentageB}%, rgb(30, 41, 59) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Never hedge</span>
              <span>Always hedge</span>
            </div>
          </div>

          {/* Auto Hedge Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <div>
              <div className="font-medium text-white flex items-center gap-2">
                Enable Auto-Hedging
                {autoHedgeEnabled && (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Active
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                Automatically hedge profits when thresholds are reached
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAutoHedgeEnabled(!autoHedgeEnabled)}
              disabled={isSubmitting}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-purple-300 mb-1">
                  FHE Encryption
                </p>
                <p>
                  Your JIT parameters (minimum swap size, hedge percentages)
                  will be encrypted using Fully Homomorphic Encryption. Only you
                  can decrypt and view your exact configuration.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex-1 border-slate-700 text-gray-300 hover:bg-slate-800 flex items-center justify-center gap-2 bg-transparent disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !minSwapSize}
              className="flex-1 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isSettingConfig ? "Encrypting..." : "Creating Position..."}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create JIT Position
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
