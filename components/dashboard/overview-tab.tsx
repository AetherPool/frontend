"use client";
import {
  Droplets,
  Activity,
  TrendingUp,
  Zap,
  Lock,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetOverviewStats } from "@/hooks/useGetOverviewStats";
import { useAccount } from "wagmi";
import Link from "next/link";

export function OverviewTab() {
  const { isConnected } = useAccount();
  const { stats, recentJITs, isLoading, refetch } = useGetOverviewStats();

  const statItems = [
    {
      label: "Total Liquidity",
      value: stats.totalLiquidity,
      icon: Droplets,
      color: "accent",
    },
    {
      label: "Active Positions",
      value: stats.activePositions,
      icon: Activity,
      color: "primary",
    },
    {
      label: "Total Earnings",
      value: stats.totalEarnings,
      icon: TrendingUp,
      color: "secondary",
    },
    {
      label: "JIT Operations",
      value: stats.jitParticipations,
      icon: Zap,
      color: "accent",
    },
  ];

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Activity className="w-16 h-16 text-gray-500" />
        <h3 className="text-xl font-semibold text-gray-400">
          Connect Wallet to View Overview
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          Connect your wallet to view your liquidity overview and statistics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Portfolio Overview</h2>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="group relative bg-card/50 border border-border/50 rounded-xl p-6 hover:bg-card/80 hover:border-border/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className="p-2.5 bg-primary/15 rounded-lg group-hover:bg-primary/25 transition-all">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  Current metric
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent JIT Activity */}
      <div className="bg-card/50 border border-border/50 rounded-xl p-6 hover:border-border/80 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <div className="p-2 bg-primary/15 rounded-lg">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span>Recent JIT Operations</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Latest liquidity opportunities
            </p>
          </div>
          <Link
            href="/dashboard/jit"
            className="text-primary hover:text-accent text-sm font-medium transition-colors"
          >
            View All →
          </Link>
        </div>

        {isLoading && recentJITs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : recentJITs.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No JIT operations yet. Configure JIT settings to start
              participating.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentJITs.map((jit, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-background/40 border border-border/30 rounded-lg hover:bg-background/60 hover:border-border/60 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2.5 bg-primary/15 rounded-lg shrink-0">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">
                      {jit.pair}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {jit.time} • {jit.amount}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-primary">{jit.profit}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {jit.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Features Highlight */}
      <div className="bg-linear-to-br from-primary/10 via-background/50 to-accent/10 border border-primary/20 rounded-xl p-6 overflow-hidden relative">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-accent/5 opacity-0 hover:opacity-100 transition-opacity" />
        <div className="relative flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-lg shrink-0">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground mb-2">
              Privacy-Preserving Strategy
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Your JIT parameters are encrypted using Fhenix FHE. Competitors
              cannot observe or copy your strategies, giving you a competitive
              edge.
            </p>
            <div className="flex flex-wrap gap-2">
              {["FHE Encrypted", "Multi-LP Coordination", "Auto-Hedging"].map(
                (badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1.5 bg-primary/20 text-primary text-xs font-medium rounded-full border border-primary/30 hover:bg-primary/30 transition-all"
                  >
                    {badge}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
