"use client";
import { Zap, TrendingUp, BarChart3 } from "lucide-react";

interface JITActivityTabProps {
  recentJITs: Array<{
    time: string;
    pair: string;
    amount: string;
    profit: string;
    status: string;
  }>;
}

export function JITActivityTab({ recentJITs }: JITActivityTabProps) {
  const extendedJITs = recentJITs.concat(recentJITs);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Zap className="w-7 h-7 text-yellow-400" />
          <span>JIT Liquidity Activity</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-green-500/10 to-green-500/5 backdrop-blur-sm border border-green-500/30 hover:border-green-500/50 rounded-xl p-6 transition-all">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <div className="text-sm text-gray-400">Total JIT Profit</div>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-1">$3,456</div>
          <div className="text-xs text-gray-500">+15.3% this week</div>
        </div>
        <div className="bg-linear-to-br from-cyan-500/10 to-cyan-500/5 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl p-6 transition-all">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <div className="text-sm text-gray-400">Avg Profit/Operation</div>
          </div>
          <div className="text-3xl font-bold text-cyan-400 mb-1">$150</div>
          <div className="text-xs text-gray-500">23 operations</div>
        </div>
        <div className="bg-linear-to-br from-purple-500/10 to-purple-500/5 backdrop-blur-sm border border-purple-500/30 hover:border-purple-500/50 rounded-xl p-6 transition-all">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <div className="text-sm text-gray-400">Success Rate</div>
          </div>
          <div className="text-3xl font-bold text-purple-400 mb-1">94.8%</div>
          <div className="text-xs text-gray-500">22/23 profitable</div>
        </div>
      </div>

      <div className="bg-linear-to-b from-slate-900/60 to-slate-900/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span>Operation History</span>
        </h3>
        <div className="space-y-2">
          {extendedJITs.map((jit, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 hover:border-purple-500/30 rounded-lg transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-medium text-white text-sm">
                    {jit.pair}
                  </div>
                  <div className="text-xs text-gray-500">{jit.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">{jit.amount}</div>
                <div className="text-sm font-medium text-green-400">
                  {jit.profit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
