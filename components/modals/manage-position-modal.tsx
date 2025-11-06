"use client";

import { useState } from "react";
import { Settings, TrendingUp, Lock, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ManagePositionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: {
    id: number;
    pair: string;
    liquidity: string;
    fees: string;
    apy: string;
    tokenA: {
      symbol: string;
      amount: string;
      price?: number;
    };
    tokenB: {
      symbol: string;
      amount: string;
      price?: number;
    };
    totalValue: string;
  };
}

export function ManagePositionModal({
  open,
  onOpenChange,
  position,
}: ManagePositionModalProps) {
  const [action, setAction] = useState<"overview" | "adjust" | "remove">(
    "overview"
  );
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustByToken, setAdjustByToken] = useState<"tokenA" | "tokenB">(
    "tokenA"
  );
  const [tokenAAmount, setTokenAAmount] = useState("");
  const [tokenBAmount, setTokenBAmount] = useState("");

  if (!position) return null;

  const handleTokenAChange = (value: string) => {
    setTokenAAmount(value);
    if (value && position.tokenA.price && position.tokenB.price) {
      const tokenBValue =
        (Number.parseFloat(value) * position.tokenA.price) /
        position.tokenB.price;
      setTokenBAmount(tokenBValue.toFixed(6));
    }
  };

  const handleTokenBChange = (value: string) => {
    setTokenBAmount(value);
    if (value && position.tokenA.price && position.tokenB.price) {
      const tokenAValue =
        (Number.parseFloat(value) * position.tokenB.price) /
        position.tokenA.price;
      setTokenAAmount(tokenAValue.toFixed(6));
    }
  };

  const calculateNewPosition = () => {
    const newTokenA = (
      Number.parseFloat(position.tokenA.amount) +
      Number.parseFloat(tokenAAmount || "0")
    ).toFixed(6);
    const newTokenB = (
      Number.parseFloat(position.tokenB.amount) +
      Number.parseFloat(tokenBAmount || "0")
    ).toFixed(6);
    return { newTokenA, newTokenB };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-linear-to-b from-slate-900 via-slate-900 to-black border border-purple-500/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" />
            Manage {position.pair} Position
          </DialogTitle>
        </DialogHeader>

        {action === "overview" && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <p className="text-gray-400 text-sm mb-3 font-medium">
                Current Position
              </p>
              <div className="space-y-2">
                <p className="text-white font-semibold">
                  • {position.tokenA.amount} {position.tokenA.symbol} +{" "}
                  {position.tokenB.amount} {position.tokenB.symbol}
                </p>
                <p className="text-gray-300 text-sm">
                  • Liquidity: {position.liquidity} units
                </p>
                <p className="text-cyan-400 font-semibold">
                  • Value: {position.totalValue}
                </p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
              <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                This position&apos;s LP parameters are encrypted. You have exclusive
                control over adjustments and hedging settings.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setAction("adjust")}
                className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Adjust Position
              </Button>
              <Button
                onClick={() => setAction("remove")}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove Position
              </Button>
            </div>

            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white"
            >
              Close
            </Button>
          </div>
        )}

        {action === "adjust" && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <p className="text-gray-400 text-sm mb-3 font-medium">
                Adjust {position.pair} Position
              </p>
              <div className="space-y-2">
                <p className="text-white font-semibold">
                  Current: {position.tokenA.amount} {position.tokenA.symbol} +{" "}
                  {position.tokenB.amount} {position.tokenB.symbol}
                </p>
                <p className="text-gray-300 text-sm">
                  Value: {position.totalValue}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300 text-sm font-medium">
                Add tokens (enter either field, the other auto-computes):
              </p>

              <div className="space-y-2">
                <Label className="text-gray-300">
                  {position.tokenA.symbol} Amount
                </Label>
                <Input
                  type="number"
                  placeholder={`Enter ${position.tokenA.symbol} amount`}
                  value={tokenAAmount}
                  onChange={(e) => handleTokenAChange(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">
                  {position.tokenB.symbol} Amount
                </Label>
                <Input
                  type="number"
                  placeholder={`Enter ${position.tokenB.symbol} amount`}
                  value={tokenBAmount}
                  onChange={(e) => handleTokenBChange(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400"
                />
              </div>
            </div>

            {(tokenAAmount || tokenBAmount) && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 space-y-3">
                <p className="text-sm text-gray-300 font-medium">
                  You will deposit:
                </p>
                <div className="space-y-1">
                  <p className="text-white font-semibold">
                    • {tokenAAmount || "0"} {position.tokenA.symbol} (approve)
                  </p>
                  <p className="text-white font-semibold">
                    • {tokenBAmount || "0"} {position.tokenB.symbol} (approve)
                  </p>
                </div>
                <hr className="border-purple-500/20 my-3" />
                {(() => {
                  const newPos = calculateNewPosition();
                  return (
                    <>
                      <p className="text-sm text-gray-300 font-medium">
                        New position will be:
                      </p>
                      <div className="space-y-1">
                        <p className="text-cyan-400 font-semibold">
                          • {newPos.newTokenA} {position.tokenA.symbol} +{" "}
                          {newPos.newTokenB} {position.tokenB.symbol}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setAction("overview");
                  setTokenAAmount("");
                  setTokenBAmount("");
                }}
                variant="outline"
                className="flex-1 border-slate-700 text-gray-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button className="flex-1 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium">
                Confirm Deposit
              </Button>
            </div>
          </div>
        )}

        {action === "remove" && (
          <div className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                Are you sure you want to remove this position? This action will
                withdraw all your liquidity and cannot be undone.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-sm text-gray-400 mb-2">You will receive:</p>
              <p className="text-xl font-bold text-white">
                {position.tokenA.amount} {position.tokenA.symbol} +{" "}
                {position.tokenB.amount} {position.tokenB.symbol}
              </p>
              <p className="text-cyan-400 text-sm mt-2">
                ≈ {position.totalValue}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setAction("overview")}
                variant="outline"
                className="flex-1 border-slate-700 text-gray-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium">
                Remove Position
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
