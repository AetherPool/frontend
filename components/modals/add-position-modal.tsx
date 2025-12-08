"use client";

import type React from "react";

import { useState } from "react";
import {
  Plus,
  Zap,
  Droplets,
  ArrowRight,
  Settings,
  Shield,
  Lock,
  Check,
  ArrowLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  price: number;
}

const TOKEN_A: Token = {
  symbol: "QRT",
  name: "QRT Token",
  balance: "10000.0",
  price: 1.0,
};
const TOKEN_B: Token = {
  symbol: "FYN",
  name: "FYN Token",
  balance: "10000.0",
  price: 1.0,
};

interface AddPositionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPositionModal({
  open,
  onOpenChange,
}: AddPositionModalProps) {
  const [step, setStep] = useState<"liquidity" | "jit-config">("liquidity");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [tickLower, setTickLower] = useState("");
  const [tickUpper, setTickUpper] = useState("");
  const [liquidityType, setLiquidityType] = useState<"jit" | "passive">("jit");
  const [lastEditedField, setLastEditedField] = useState<
    "amountA" | "amountB" | null
  >(null);

  // JIT Config state
  const [minSwapSize, setMinSwapSize] = useState("");
  const [hedgePercentageA, setHedgePercentageA] = useState(25);
  const [hedgePercentageB, setHedgePercentageB] = useState(25);
  const [autoHedgeEnabled, setAutoHedgeEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priceRatio = TOKEN_A.price / TOKEN_B.price;

  const computeAmount = (
    inputAmount: string,
    fromField: "amountA" | "amountB"
  ) => {
    if (
      !inputAmount ||
      isNaN(Number(inputAmount)) ||
      Number(inputAmount) <= 0
    ) {
      return "";
    }
    const input = Number.parseFloat(inputAmount);
    if (fromField === "amountA") {
      return (input * priceRatio).toFixed(6);
    } else {
      return (input / priceRatio).toFixed(6);
    }
  };

  const handleAmountAChange = (value: string) => {
    setLastEditedField("amountA");
    const newAmountB = computeAmount(value, "amountA");
    setAmountA(value);
    setAmountB(newAmountB);
  };

  const handleAmountBChange = (value: string) => {
    setLastEditedField("amountB");
    const newAmountA = computeAmount(value, "amountB");
    setAmountB(value);
    setAmountA(newAmountA);
  };

  const handleContinueToConfig = () => {
    if (liquidityType === "jit") {
      setStep("jit-config");
    } else {
      handleSubmitPassive();
    }
  };

  const handleSubmitPassive = () => {
    console.log("Passive position created:", {
      tokenA: TOKEN_A,
      tokenB: TOKEN_B,
      amountA,
      amountB,
      tickLower,
      tickUpper,
    });
    resetAndClose();
  };

  const handleSubmitJIT = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("JIT Position created:", {
      tokenA: TOKEN_A,
      tokenB: TOKEN_B,
      amountA,
      amountB,
      tickLower,
      tickUpper,
      config: {
        minSwapSize,
        hedgePercentageA,
        hedgePercentageB,
        autoHedgeEnabled,
      },
    });
    setIsSubmitting(false);
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep("liquidity");
    setAmountA("");
    setAmountB("");
    setTickLower("");
    setTickUpper("");
    setMinSwapSize("");
    setHedgePercentageA(25);
    setHedgePercentageB(25);
    setAutoHedgeEnabled(true);
    onOpenChange(false);
  };

  const totalValue =
    (Number(amountA) || 0) * TOKEN_A.price +
    (Number(amountB) || 0) * TOKEN_B.price;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetAndClose();
        else onOpenChange(isOpen);
      }}
    >
      <DialogContent className="bg-linear-to-b from-slate-900 via-slate-900 to-black border border-purple-500/30 max-w-xl max-h-[90vh] overflow-y-auto">
        {step === "liquidity" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Plus className="w-6 h-6 text-cyan-400" />
                Add New Position
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Liquidity Type Toggle */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                <Label className="text-gray-300 mb-3 block font-medium">
                  Liquidity Type
                </Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setLiquidityType("jit")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      liquidityType === "jit"
                        ? "bg-linear-to-r from-cyan-500 to-purple-600 text-white"
                        : "bg-slate-700/50 text-gray-400 border border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    JIT Liquidity
                  </button>
                  <button
                    type="button"
                    onClick={() => setLiquidityType("passive")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      liquidityType === "passive"
                        ? "bg-linear-to-r from-cyan-500 to-purple-600 text-white"
                        : "bg-slate-700/50 text-gray-400 border border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <Droplets className="w-4 h-4" />
                    Passive
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {liquidityType === "jit"
                    ? "Participate in JIT auctions and earn dynamic fees from arbitrage"
                    : "Provide standard liquidity to the pool without JIT participation"}
                </p>
              </div>

              {/* Token A Input - Fixed to QRT */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    Token A{" "}
                    {lastEditedField === "amountA" && (
                      <span className="text-cyan-400">(editing)</span>
                    )}
                  </span>
                  <span className="text-sm text-gray-400">
                    Balance: {TOKEN_A.balance}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={amountA}
                    onChange={(e) => handleAmountAChange(e.target.value)}
                    placeholder="0.0"
                    step="0.000001"
                    className="flex-1 bg-transparent text-2xl text-white font-medium outline-none placeholder:text-gray-600 min-w-0"
                  />
                  <div className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-xl font-medium border border-slate-600">
                    {TOKEN_A.symbol}
                  </div>
                </div>
              </div>

              {/* Price Ratio Display (Non-editable) */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Price Ratio</span>
                  <span className="text-white font-medium">
                    1 {TOKEN_A.symbol} = {priceRatio.toFixed(4)}{" "}
                    {TOKEN_B.symbol}
                  </span>
                </div>
              </div>

              {/* Token B Input - Fixed to FYN */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    Token B{" "}
                    {lastEditedField === "amountB" && (
                      <span className="text-cyan-400">(editing)</span>
                    )}
                  </span>
                  <span className="text-sm text-gray-400">
                    Balance: {TOKEN_B.balance}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={amountB}
                    onChange={(e) => handleAmountBChange(e.target.value)}
                    placeholder="0.0"
                    step="0.000001"
                    className="flex-1 bg-transparent text-2xl text-white font-medium outline-none placeholder:text-gray-600 min-w-0"
                  />
                  <div className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-xl font-medium border border-slate-600">
                    {TOKEN_B.symbol}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Price Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">
                      Lower Tick
                    </Label>
                    <input
                      value={tickLower}
                      onChange={(e) => setTickLower(e.target.value)}
                      placeholder="-887220"
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-gray-500 focus:border-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">
                      Upper Tick
                    </Label>
                    <input
                      value={tickUpper}
                      onChange={(e) => setTickUpper(e.target.value)}
                      placeholder="887220"
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-gray-500 focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              {(amountA || amountB) && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Value</span>
                    <span className="text-white font-medium">
                      {Number(amountA || 0).toFixed(2)} {TOKEN_A.symbol} +{" "}
                      {Number(amountB || 0).toFixed(2)} {TOKEN_B.symbol}
                    </span>
                  </div>
                </div>
              )}

              {/* Info box */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  {liquidityType === "jit"
                    ? "Your LP parameters will be encrypted using FHE. Only you can decrypt and view the exact amounts and ranges. You'll participate in JIT auctions."
                    : "Your liquidity will be provided to the standard pool. Parameters are visible to the protocol but not to other users."}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 border-slate-700 text-gray-300 hover:bg-slate-800 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleContinueToConfig}
                  disabled={!amountA || !amountB}
                  className="flex-1 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium flex items-center justify-center gap-2"
                >
                  {liquidityType === "jit" ? (
                    <>
                      Continue to Configuration
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    "Create Position"
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* JIT Configuration Step */}
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Settings className="w-6 h-6 text-cyan-400" />
                Configure JIT Strategy
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmitJIT} className="space-y-6">
              {/* Position Summary */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <h4 className="text-sm text-gray-400 mb-3">Position Summary</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">
                    {TOKEN_A.symbol}/{TOKEN_B.symbol}
                  </span>
                  <span className="text-cyan-400 font-medium">
                    ${totalValue.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {amountA} {TOKEN_A.symbol} + {amountB} {TOKEN_B.symbol}
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
                  Hedge Percentage - {TOKEN_A.symbol}
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
                  Hedge Percentage - {TOKEN_B.symbol}
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
                  <div className="font-medium text-white">
                    Enable Auto-Hedging
                  </div>
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
                  Your JIT parameters will be encrypted using FHE (Fully
                  Homomorphic Encryption). Only you can decrypt and view your
                  exact configuration.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("liquidity")}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
