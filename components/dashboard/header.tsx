"use client";
import { Droplets, Menu, X } from "lucide-react";
import ConnectButton from "@/components/web3/ConnectButton";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  tabs: Array<{ id: string; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }>;
}

export function Header({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  tabs,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Branding */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-linear-to-br from-primary via-accent to-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
              <Droplets className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg font-bold text-foreground leading-tight">
                AetherPool
              </h1>
              <p className="text-xs text-muted-foreground">
                Privacy-First JIT Liquidity
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Wallet / Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* <ConnectButton /> */}
            <appkit-button />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-card/50 rounded-lg transition-all"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/40 space-y-1 mb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg transition-all font-medium ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
