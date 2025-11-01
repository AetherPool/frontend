"use client";
import { Droplets, Activity, TrendingUp, Zap, Lock } from "lucide-react";

interface OverviewTabProps {
  stats: {
    totalLiquidity: string;
    activePositions: number;
    totalEarnings: string;
    jitParticipations: number;
  };
  recentJITs: Array<{
    time: string;
    pair: string;
    amount: string;
    profit: string;
    status: string;
  }>;
}

export function OverviewTab({ stats, recentJITs }: OverviewTabProps) {
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

  return (
    <div className="space-y-6">
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
                  Performance metric
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
          <button className="text-primary hover:text-accent text-sm font-medium transition-colors">
            View All →
          </button>
        </div>
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
