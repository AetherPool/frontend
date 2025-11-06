"use client";

import type React from "react";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddPositionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPositionModal({
  open,
  onOpenChange,
}: AddPositionModalProps) {
  const [formData, setFormData] = useState({
    token0: "",
    token1: "",
    amount0: "",
    amount1: "",
    tickLower: "",
    tickUpper: "",
  });

  const [isJIT, setIsJIT] = useState(true);
  const [priceRatio, setPriceRatio] = useState("1.0"); // Price of Token B in terms of Token A
  const [lastEditedField, setLastEditedField] = useState<
    "amount0" | "amount1" | null
  >(null);

  const computeAmount = (
    inputAmount: string,
    fromField: "amount0" | "amount1"
  ) => {
    if (
      !inputAmount ||
      isNaN(Number(inputAmount)) ||
      Number(inputAmount) <= 0
    ) {
      return "";
    }

    const ratio = Number.parseFloat(priceRatio) || 1;
    const input = Number.parseFloat(inputAmount);

    if (fromField === "amount0") {
      // User entered Amount A, compute Amount B
      return (input * ratio).toFixed(6);
    } else {
      // User entered Amount B, compute Amount A
      return (input / ratio).toFixed(6);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "amount0") {
      setLastEditedField("amount0");
      const newAmount1 = computeAmount(value, "amount0");
      setFormData((prev) => ({
        ...prev,
        amount0: value,
        amount1: newAmount1,
      }));
    } else if (name === "amount1") {
      setLastEditedField("amount1");
      const newAmount0 = computeAmount(value, "amount1");
      setFormData((prev) => ({
        ...prev,
        amount1: value,
        amount0: newAmount0,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePriceRatioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceRatio(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[v0] Form submitted:", { ...formData, isJIT, priceRatio });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-linear-to-b from-slate-900 via-slate-900 to-black border border-purple-500/30 max-w-xl">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 mb-2 block">Token A</Label>
              <Input
                name="token0"
                placeholder="e.g., ETH"
                value={formData.token0}
                onChange={handleChange}
                className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400"
              />
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Token B</Label>
              <Input
                name="token1"
                placeholder="e.g., USDC"
                value={formData.token1}
                onChange={handleChange}
                className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">
              Price Ratio (Token B per Token A)
            </Label>
            <Input
              type="number"
              step="0.000001"
              placeholder="1.0"
              value={priceRatio}
              onChange={handlePriceRatioChange}
              className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Used to auto-compute amounts
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 mb-2 block">
                Amount A{" "}
                {lastEditedField === "amount0" && (
                  <span className="text-cyan-400 text-xs">(editing)</span>
                )}
              </Label>
              <Input
                name="amount0"
                type="number"
                step="0.000001"
                placeholder="0.00"
                value={formData.amount0}
                onChange={handleChange}
                className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter amount or edit B to auto-compute
              </p>
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">
                Amount B{" "}
                {lastEditedField === "amount1" && (
                  <span className="text-cyan-400 text-xs">(editing)</span>
                )}
              </Label>
              <Input
                name="amount1"
                type="number"
                step="0.000001"
                placeholder="0.00"
                value={formData.amount1}
                onChange={handleChange}
                className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter amount or edit A to auto-compute
              </p>
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
                  name="tickLower"
                  placeholder="-887220"
                  value={formData.tickLower}
                  onChange={handleChange}
                  className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400 mb-1 block">
                  Upper Tick
                </Label>
                <Input
                  name="tickUpper"
                  placeholder="887220"
                  value={formData.tickUpper}
                  onChange={handleChange}
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
              className="flex-1 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium"
            >
              Create Position
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
