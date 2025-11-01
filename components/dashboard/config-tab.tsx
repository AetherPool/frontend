"use client";

import { useState } from "react";
import { Shield, Users, ArrowUpRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConfigTab() {
  const [hedgePercentage, setHedgePercentage] = useState(25);
  const [autoHedge, setAutoHedge] = useState(true);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Strategy Configuration</h2>

      <div className="bg-linear-to-b from-slate-900/60 to-slate-900/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Privacy Settings</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">
              Min Swap Size (Encrypted)
            </label>
            <input
              type="text"
              placeholder="1000 USDC"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 focus:border-cyan-400 focus:outline-none rounded-lg text-white placeholder:text-gray-600 transition-all"
            />
            <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
              <Lock className="w-3 h-3" />
              <span>Encrypted using Fhenix FHE</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">
              Max Liquidity (Encrypted)
            </label>
            <input
              type="text"
              placeholder="50000 USDC"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 focus:border-cyan-400 focus:outline-none rounded-lg text-white placeholder:text-gray-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">
              Profit Threshold (Encrypted)
            </label>
            <input
              type="text"
              placeholder="50 basis points"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 focus:border-cyan-400 focus:outline-none rounded-lg text-white placeholder:text-gray-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">
              Auto-Hedge Percentage
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={hedgePercentage}
              onChange={(e) =>
                setHedgePercentage(Number.parseInt(e.target.value))
              }
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(34, 197, 94) 0%, rgb(34, 197, 94) ${hedgePercentage}%, rgb(30, 41, 59) ${hedgePercentage}%, rgb(30, 41, 59) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span className="text-cyan-400 font-medium">
                {hedgePercentage}%
              </span>
              <span>100%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 hover:border-purple-500/30 rounded-lg transition-all">
            <div>
              <div className="font-medium text-white">Enable Auto-Hedging</div>
              <div className="text-sm text-gray-400">
                Automatically hedge profits at threshold
              </div>
            </div>
            <button
              onClick={() => setAutoHedge(!autoHedge)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoHedge
                  ? "bg-linear-to-r from-cyan-500 to-purple-600"
                  : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  autoHedge ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <Button className="w-full mt-6 px-6 py-3 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all">
          Save Configuration
        </Button>
      </div>

      <div className="bg-linear-to-r from-purple-500/10 via-transparent to-pink-500/10 border border-purple-500/30 hover:border-purple-500/50 rounded-xl p-6 transition-all">
        <div className="flex items-center space-x-3 mb-3">
          <Users className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white">Multi-LP Coordination</h3>
        </div>
        <p className="text-gray-300 text-sm mb-4">
          When multiple LPs have overlapping ranges, AetherPool automatically
          coordinates JIT operations and distributes profits proportionally
          based on contributed liquidity.
        </p>
        <div className="flex items-center space-x-2 text-sm text-purple-300 hover:text-purple-200 cursor-pointer transition-all">
          <ArrowUpRight className="w-4 h-4" />
          <span>Learn more about multi-LP coordination</span>
        </div>
      </div>
    </div>
  );
}
