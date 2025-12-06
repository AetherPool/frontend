"use client";
import { useState } from "react";
import { Plus, Zap, Droplets, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  price: number;
}

const TOKENS: Token[] = [
  { symbol: "FYN", name: "FYN Token", balance: "10000.0", price: 1.0 },
  { symbol: "QRT", name: "QRT Token", balance: "10000.0", price: 1.0 },
];

interface AddLiquidityWidgetProps {
  onJITConfigRequired?: (positionData: {
    tokenA: Token;
    tokenB: Token;
    amountA: string;
    amountB: string;
    tickLower: string;
    tickUpper: string;
  }) => void;
}

export function AddLiquidityWidget({
  onJITConfigRequired,
}: AddLiquidityWidgetProps) {
  const [tokenA, setTokenA] = useState<Token>(TOKENS[0]);
  const [tokenB, setTokenB] = useState<Token>(TOKENS[1]);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [tickLower, setTickLower] = useState("");
  const [tickUpper, setTickUpper] = useState("");
  const [liquidityType, setLiquidityType] = useState<"jit" | "passive">("jit");
  const [lastEdited, setLastEdited] = useState<"A" | "B" | null>(null);
  const [showTokenADropdown, setShowTokenADropdown] = useState(false);
  const [showTokenBDropdown, setShowTokenBDropdown] = useState(false);

  const priceRatio = tokenA.price / tokenB.price;

  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    setLastEdited("A");
    if (value && !isNaN(Number(value))) {
      const computed = Number(value) * priceRatio;
      setAmountB(computed.toFixed(6));
    } else {
      setAmountB("");
    }
  };

  const handleAmountBChange = (value: string) => {
    setAmountB(value);
    setLastEdited("B");
    if (value && !isNaN(Number(value))) {
      const computed = Number(value) / priceRatio;
      setAmountA(computed.toFixed(6));
    } else {
      setAmountA("");
    }
  };

  const handleAddLiquidity = () => {
    if (liquidityType === "jit" && onJITConfigRequired) {
      onJITConfigRequired({
        tokenA,
        tokenB,
        amountA,
        amountB,
        tickLower,
        tickUpper,
      });
    } else {
      console.log("Adding passive liquidity:", {
        tokenA,
        tokenB,
        amountA,
        amountB,
      });
    }
  };

  const totalValue =
    (Number(amountA) || 0) * tokenA.price +
    (Number(amountB) || 0) * tokenB.price;
  console.log("Total Value:", totalValue);

  return (
    <div className="bg-linear-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 w-full max-w-md overflow-visible">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">Add Liquidity</h3>
      </div>

      {/* Liquidity Type Toggle */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-3 block">
          Liquidity Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLiquidityType("jit")}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
              liquidityType === "jit"
                ? "bg-linear-to-r from-cyan-500 to-purple-600 text-white"
                : "bg-slate-800/50 text-gray-400 border border-slate-700 hover:border-slate-600"
            }`}
          >
            <Zap className="w-4 h-4" />
            JIT Liquidity
          </button>
          <button
            onClick={() => setLiquidityType("passive")}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
              liquidityType === "passive"
                ? "bg-linear-to-r from-cyan-500 to-purple-600 text-white"
                : "bg-slate-800/50 text-gray-400 border border-slate-700 hover:border-slate-600"
            }`}
          >
            <Droplets className="w-4 h-4" />
            Passive
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {liquidityType === "jit"
            ? "Participate in JIT auctions with encrypted parameters"
            : "Standard liquidity provision without JIT participation"}
        </p>
      </div>

      {/* Token A Input */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-3">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">
            Token A{" "}
            {lastEdited === "A" && (
              <span className="text-cyan-400">(editing)</span>
            )}
          </span>
          <span className="text-sm text-gray-400">
            Balance: {tokenA.balance}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={amountA}
            onChange={(e) => handleAmountAChange(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl text-white font-medium outline-none placeholder:text-gray-600 min-w-0"
          />
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setShowTokenADropdown(!showTokenADropdown);
                setShowTokenBDropdown(false);
              }}
              className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-xl font-medium cursor-pointer border border-slate-600 hover:border-slate-500 transition-colors"
            >
              {tokenA.symbol}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showTokenADropdown && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-50 overflow-hidden">
                {TOKENS.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => {
                      setTokenA(token);
                      setShowTokenADropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                      tokenA.symbol === token.symbol
                        ? "text-cyan-400 bg-slate-700/50"
                        : "text-white"
                    }`}
                  >
                    {token.symbol}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plus Icon */}
      <div className="flex justify-center -my-1.5 relative z-10">
        <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
          <Plus className="w-4 h-4 text-cyan-400" />
        </div>
      </div>

      {/* Token B Input */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mt-3">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">
            Token B{" "}
            {lastEdited === "B" && (
              <span className="text-cyan-400">(editing)</span>
            )}
          </span>
          <span className="text-sm text-gray-400">
            Balance: {tokenB.balance}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={amountB}
            onChange={(e) => handleAmountBChange(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl text-white font-medium outline-none placeholder:text-gray-600 min-w-0"
          />
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setShowTokenBDropdown(!showTokenBDropdown);
                setShowTokenADropdown(false);
              }}
              className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-xl font-medium cursor-pointer border border-slate-600 hover:border-slate-500 transition-colors"
            >
              {tokenB.symbol}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showTokenBDropdown && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-50 overflow-hidden">
                {TOKENS.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => {
                      setTokenB(token);
                      setShowTokenBDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                      tokenB.symbol === token.symbol
                        ? "text-cyan-400 bg-slate-700/50"
                        : "text-white"
                    }`}
                  >
                    {token.symbol}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
        <label className="text-sm text-gray-400 mb-3 block">
          Price Range (Ticks)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Min Price
            </label>
            <input
              type="text"
              value={tickLower}
              onChange={(e) => setTickLower(e.target.value)}
              placeholder="-887220"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-gray-600 focus:border-cyan-400 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Max Price
            </label>
            <input
              type="text"
              value={tickUpper}
              onChange={(e) => setTickUpper(e.target.value)}
              placeholder="887220"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-gray-600 focus:border-cyan-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      {(amountA || amountB) && (
        <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Value</span>
            <span className="text-white font-medium">
              {Number(amountA || 0).toFixed(2)} {tokenA.symbol} +{" "}
              {Number(amountB || 0).toFixed(2)} {tokenB.symbol}
            </span>
          </div>
        </div>
      )}

      <Button
        onClick={handleAddLiquidity}
        disabled={!amountA || !amountB}
        className="w-full mt-4 py-6 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold text-lg rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {liquidityType === "jit" ? (
          <>
            Continue to Configuration
            <ArrowRight className="w-5 h-5" />
          </>
        ) : (
          "Add Liquidity"
        )}
      </Button>
    </div>
  );
}
