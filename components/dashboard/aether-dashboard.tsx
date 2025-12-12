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
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "positions" && <PositionsTab />}
        {activeTab === "jit" && <JITActivityTab />}
      </main>
    </div>
  );
}
