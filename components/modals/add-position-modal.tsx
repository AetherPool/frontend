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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[v0] Form submitted:", formData);
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 mb-2 block">Amount A</Label>
              <Input
                name="amount0"
                placeholder="0.00"
                value={formData.amount0}
                onChange={handleChange}
                className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400"
              />
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Amount B</Label>
              <Input
                name="amount1"
                placeholder="0.00"
                value={formData.amount1}
                onChange={handleChange}
                className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-400"
              />
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
              Your LP parameters will be encrypted using FHE. Only you can
              decrypt and view the exact amounts and ranges.
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
