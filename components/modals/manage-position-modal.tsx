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

  if (!position) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-linear-to-b from-slate-900 via-slate-900 to-black border border-purple-500/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" />
            Manage Position - {position.pair}
          </DialogTitle>
        </DialogHeader>

        {action === "overview" && (
          <div className="space-y-6">
            {/* Position stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-gray-400 text-sm mb-2">Liquidity</p>
                <p className="text-2xl font-bold text-white">
                  {position.liquidity}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-gray-400 text-sm mb-2">Fees Earned</p>
                <p className="text-2xl font-bold text-green-400">
                  {position.fees}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-gray-400 text-sm mb-2">APY</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {position.apy}
                </p>
              </div>
            </div>

            {/* Info section */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
              <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                This position&apos;s LP parameters are encrypted. You have exclusive
                control over adjustments and hedging settings.
              </p>
            </div>

            {/* Action buttons */}
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
            <div>
              <Label className="text-gray-300 mb-2 block">
                Liquidity Change Amount
              </Label>
              <Input
                placeholder="Enter amount to add/remove"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400"
              />
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                You can increase or decrease your liquidity. Positive values add
                liquidity, negative values remove it.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setAction("overview")}
                variant="outline"
                className="flex-1 border-slate-700 text-gray-300"
              >
                Back
              </Button>
              <Button className="flex-1 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white">
                Apply Changes
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
                {position.liquidity} value in underlying tokens
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setAction("overview")}
                variant="outline"
                className="flex-1 border-slate-700 text-gray-300"
              >
                Cancel
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                Remove Position
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
