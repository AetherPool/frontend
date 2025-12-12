"use client";
import {
  Zap,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Loader2,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetJITActivity } from "@/hooks/useGetJITActivity";
import { useAccount } from "wagmi";

export function JITActivityTab() {
  const { isConnected } = useAccount();
  const { operations, stats, isLoading, refetch } = useGetJITActivity();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Zap className="w-16 h-16 text-gray-500" />
        <h3 className="text-xl font-semibold text-gray-400">
          Connect Wallet to View JIT Activity
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          Connect your wallet to view your JIT liquidity operations and earnings
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Zap className="w-7 h-7 text-yellow-400" />
          <span>JIT Liquidity Activity</span>
        </h2>
        <Button
          onClick={refetch}
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className="text-gray-400 hover:text-white"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-green-500/10 to-green-500/5 backdrop-blur-sm border border-green-500/30 hover:border-green-500/50 rounded-xl p-6 transition-all">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <div className="text-sm text-gray-400">Total JIT Profit</div>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-1">
            ${stats.totalProfit.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            {stats.weeklyChange >= 0 ? "+" : ""}
            {stats.weeklyChange.toFixed(1)}% this week
          </div>
        </div>

        <div className="bg-linear-to-br from-cyan-500/10 to-cyan-500/5 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl p-6 transition-all">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <div className="text-sm text-gray-400">Avg Profit/Operation</div>
          </div>
          <div className="text-3xl font-bold text-cyan-400 mb-1">
            ${stats.avgProfitPerOp.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            {stats.totalOperations} operation
            {stats.totalOperations !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="bg-linear-to-br from-purple-500/10 to-purple-500/5 backdrop-blur-sm border border-purple-500/30 hover:border-purple-500/50 rounded-xl p-6 transition-all">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <div className="text-sm text-gray-400">Success Rate</div>
          </div>
          <div className="text-3xl font-bold text-purple-400 mb-1">
            {stats.successRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            {Math.round((stats.successRate / 100) * stats.totalOperations)}/
            {stats.totalOperations} profitable
          </div>
        </div>
      </div>

      {/* Operations History */}
      <div className="bg-linear-to-b from-slate-900/60 to-slate-900/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-yellow-400" />
          <span>Operation History</span>
        </h3>

        {isLoading && operations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            <p className="text-gray-400">Loading JIT operations...</p>
          </div>
        ) : operations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Zap className="w-12 h-12 text-gray-500" />
            <h4 className="text-lg font-semibold text-gray-400">
              No JIT Operations Yet
            </h4>
            <p className="text-gray-500 text-center max-w-md text-sm">
              Your JIT liquidity operations will appear here when you
              participate in providing just-in-time liquidity for swaps
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {operations.map((jit, idx) => (
              <div
                key={`${jit.swapId}-${idx}`}
                className="flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 hover:border-purple-500/30 rounded-lg transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      jit.status === "completed"
                        ? "bg-green-400"
                        : "bg-yellow-400 animate-pulse"
                    }`}
                  ></div>
                  <div>
                    <div className="font-medium text-white text-sm flex items-center gap-2">
                      {jit.pair}
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                        #{jit.swapId}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{jit.timeAgo}</span>
                      <span className="text-gray-600">•</span>
                      <span>Share: {jit.lpShare}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">{jit.amount}</div>
                  <div className="text-sm font-medium text-green-400 flex items-center gap-1 justify-end">
                    <span>{jit.profit}</span>
                    {jit.profitUsd > 0 && (
                      <span className="text-xs text-gray-500">
                        ({jit.fees0.toFixed(2)} QRT + {jit.fees1.toFixed(2)}{" "}
                        FYN)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
