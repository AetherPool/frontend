"use client";

import type React from "react";

import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  price: number;
}

const TOKENS: Token[] = [
  {
    symbol: "cNGN",
    name: "cNGN Stablecoin",
    balance: "50000.0",
    price: 0.00065,
  },
  { symbol: "USDC", name: "USD Coin", balance: "1000.0", price: 1.0 },
];

interface AddPositionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPositionModal({
  open,
  onOpenChange,
}: AddPositionModalProps) {
  const [tokenA, setTokenA] = useState<Token>(TOKENS[0]);
  const [tokenB, setTokenB] = useState<Token>(TOKENS[1]);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [tickLower, setTickLower] = useState("");
  const [tickUpper, setTickUpper] = useState("");
  const [isJIT, setIsJIT] = useState(true);
  const [lastEditedField, setLastEditedField] = useState<
    "amountA" | "amountB" | null
  >(null);
  const [showTokenADropdown, setShowTokenADropdown] = useState(false);
  const [showTokenBDropdown, setShowTokenBDropdown] = useState(false);

  const priceRatio = tokenA.price / tokenB.price;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Position created:", {
      tokenA,
      tokenB,
      amountA,
      amountB,
      tickLower,
      tickUpper,
      isJIT,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-linear-to-b from-slate-900 via-slate-900 to-black border border-purple-500/30 max-w-xl overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Plus className="w-6 h-6 text-cyan-400" />
            Add New Position
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
            <Label className="text-gray-300 mb-3 block font-medium">
              Liquidity Type
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsJIT(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  isJIT
                    ? "bg-linear-to-r from-cyan-500 to-purple-600 text-white"
                    : "bg-slate-700/50 text-gray-400 border border-slate-600 hover:border-slate-500"
                }`}
              >
                JIT Liquidity
              </button>
              <button
                type="button"
                onClick={() => setIsJIT(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  !isJIT
                    ? "bg-linear-to-r from-cyan-500 to-purple-600 text-white"
                    : "bg-slate-700/50 text-gray-400 border border-slate-600 hover:border-slate-500"
                }`}
              >
                Standard Liquidity
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {isJIT
                ? "Participate in JIT auctions and earn dynamic fees from arbitrage"
                : "Provide standard liquidity to the pool without JIT participation"}
            </p>
          </div>

          {/* Token A Input with Dropdown */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">
                Token A{" "}
                {lastEditedField === "amountA" && (
                  <span className="text-cyan-400">(editing)</span>
                )}
              </span>
              <span className="text-sm text-gray-400">
                Balance: {tokenA.balance}
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
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowTokenADropdown(!showTokenADropdown);
                    setShowTokenBDropdown(false);
                  }}
                  className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-xl font-medium cursor-pointer border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  {tokenA.symbol}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showTokenADropdown && (
                  <div className="absolute right-0 top-full mt-2 w-32 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-50 overflow-hidden">
                    {TOKENS.map((token) => (
                      <button
                        type="button"
                        key={token.symbol}
                        onClick={() => {
                          setTokenA(token);
                          setShowTokenADropdown(false);
                          // Recalculate amounts with new token
                          if (amountA) {
                            const newRatio = token.price / tokenB.price;
                            setAmountB((Number(amountA) * newRatio).toFixed(6));
                          }
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                          tokenA.symbol === token.symbol
                            ? "text-cyan-400 bg-slate-700/50"
                            : "text-white"
                        }`}
                      >
                        {token.symbol}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              ~${amountA ? (Number(amountA) * tokenA.price).toFixed(2) : "0.00"}
            </div>
          </div>

          {/* Price Ratio Display (Non-editable) */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Price Ratio</span>
              <span className="text-white font-medium">
                1 {tokenA.symbol} = {priceRatio.toFixed(6)} {tokenB.symbol}
              </span>
            </div>
          </div>

          {/* Token B Input with Dropdown */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">
                Token B{" "}
                {lastEditedField === "amountB" && (
                  <span className="text-cyan-400">(editing)</span>
                )}
              </span>
              <span className="text-sm text-gray-400">
                Balance: {tokenB.balance}
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
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowTokenBDropdown(!showTokenBDropdown);
                    setShowTokenADropdown(false);
                  }}
                  className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-xl font-medium cursor-pointer border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  {tokenB.symbol}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showTokenBDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-32 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-50 overflow-hidden">
                    {TOKENS.map((token) => (
                      <button
                        type="button"
                        key={token.symbol}
                        onClick={() => {
                          setTokenB(token);
                          setShowTokenBDropdown(false);
                          // Recalculate amounts with new token
                          if (amountB) {
                            const newRatio = tokenA.price / token.price;
                            setAmountA((Number(amountB) / newRatio).toFixed(6));
                          }
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                          tokenB.symbol === token.symbol
                            ? "text-cyan-400 bg-slate-700/50"
                            : "text-white"
                        }`}
                      >
                        {token.symbol}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              ~${amountB ? (Number(amountB) * tokenB.price).toFixed(2) : "0.00"}
            </div>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Price Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-400 mb-1 block">
                  Lower Tick
                </Label>
                <Input
                  value={tickLower}
                  onChange={(e) => setTickLower(e.target.value)}
                  placeholder="-887220"
                  className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400 mb-1 block">
                  Upper Tick
                </Label>
                <Input
                  value={tickUpper}
                  onChange={(e) => setTickUpper(e.target.value)}
                  placeholder="887220"
                  className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              {isJIT
                ? "Your LP parameters will be encrypted using FHE. Only you can decrypt and view the exact amounts and ranges. You'll participate in JIT auctions."
                : "Your liquidity will be provided to the standard pool. Parameters are visible to the protocol but not to other users."}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-slate-700 text-gray-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!amountA || !amountB}
              className="flex-1 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium"
            >
              Create Position
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
