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
      pair: "cNGN/USDC",
      range: "0.00060-0.00070",
      liquidity: "$50,000",
      fees: "$234",
      apy: "12.5%",
      tokenA: {
        symbol: "cNGN",
        amount: "25000000",
        price: 0.00065,
        profit: "125000",
        profitUsd: 81.25,
      },
      tokenB: {
        symbol: "USDC",
        amount: "16250",
        price: 1.0,
        profit: "125",
        profitUsd: 125,
      },
      totalValue: "$32,500",
    },
    {
      id: 2,
      pair: "cNGN/USDC",
      range: "0.00062-0.00068",
      liquidity: "$30,000",
      fees: "$156",
      apy: "18.2%",
      tokenA: {
        symbol: "cNGN",
        amount: "15000000",
        price: 0.00065,
        profit: "75000",
        profitUsd: 48.75,
      },
      tokenB: {
        symbol: "USDC",
        amount: "9750",
        price: 1.0,
        profit: "80",
        profitUsd: 80,
      },
      totalValue: "$19,500",
    },
  ];

  const recentJITs = [
    {
      time: "2m ago",
      pair: "cNGN/USDC",
      amount: "$25,000",
      profit: "+$127",
      status: "completed",
    },
    {
      time: "15m ago",
      pair: "cNGN/USDC",
      amount: "$18,500",
      profit: "+$94",
      status: "completed",
    },
    {
      time: "1h ago",
      pair: "cNGN/USDC",
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
