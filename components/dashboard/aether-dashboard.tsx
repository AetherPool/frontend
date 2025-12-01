"use client";

import { useState } from "react";
import { Droplets, BarChart3, Zap } from "lucide-react";
import { Header } from "./header";
import { OverviewTab } from "./overview-tab";
import { PositionsTab } from "./positions-tab";
import { JITActivityTab } from "./jit-activity-tab";

export function AetherDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock data
  const stats = {
    totalLiquidity: "$1,234,567",
    activePositions: 5,
    totalEarnings: "$12,345",
    jitParticipations: 23,
  };

  const positions = [
    {
      id: 1,
      pair: "ETH/cNGN",
      range: "1800-2200",
      liquidity: "$50,000",
      fees: "$234",
      apy: "12.5%",
      tokenA: {
        symbol: "ETH",
        amount: "2.5",
        price: 2000,
        profit: "0.125",
        profitUsd: 250,
      },
      tokenB: {
        symbol: "cNGN",
        amount: "5000000",
        price: 0.00065,
        profit: "125000",
        profitUsd: 81.25,
      },
      totalValue: "$55,000",
    },
    {
      id: 2,
      pair: "ETH/cNGN",
      range: "14-16",
      liquidity: "$30,000",
      fees: "$156",
      apy: "18.2%",
      tokenA: {
        symbol: "ETH",
        amount: "1.5",
        price: 2000,
        profit: "0.08",
        profitUsd: 160,
      },
      tokenB: {
        symbol: "cNGN",
        amount: "3000000",
        price: 0.00065,
        profit: "75000",
        profitUsd: 48.75,
      },
      totalValue: "$33,600",
    },
  ];

  const recentJITs = [
    {
      time: "2m ago",
      pair: "ETH/cNGN",
      amount: "$25,000",
      profit: "+$127",
      status: "completed",
    },
    {
      time: "15m ago",
      pair: "ETH/cNGN",
      amount: "$18,500",
      profit: "+$94",
      status: "completed",
    },
    {
      time: "1h ago",
      pair: "ETH/cNGN",
      amount: "$40,000",
      profit: "+$203",
      status: "completed",
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "positions", label: "Positions", icon: Droplets },
    { id: "jit", label: "JIT Activity", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        tabs={tabs}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <OverviewTab stats={stats} recentJITs={recentJITs} />
        )}
        {activeTab === "positions" && <PositionsTab positions={positions} />}
        {activeTab === "jit" && <JITActivityTab recentJITs={recentJITs} />}
      </main>
    </div>
  );
}
