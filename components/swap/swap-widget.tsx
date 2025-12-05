"use client";
import { useState } from "react";
import { ArrowDown, Settings, Info, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  price: number;
}

const TOKENS: Token[] = [
  {
    symbol: "cNGN",
    name: "cNGN Stablecoin",
    balance: "50000.0",
    price: 0.00065,
  },
  { symbol: "USDC", name: "USD Coin", balance: "1000.0", price: 1.0 },
];

export function SwapWidget() {
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(Number(value))) {
      const computed = (Number(value) * fromToken.price) / toToken.price;
      setToAmount(computed.toFixed(6));
    } else {
      setToAmount("");
    }
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    if (value && !isNaN(Number(value))) {
      const computed = (Number(value) * toToken.price) / fromToken.price;
      setFromAmount(computed.toFixed(6));
    } else {
      setFromAmount("");
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = () => {
    console.log("Swap executed:", { fromToken, toToken, fromAmount, toAmount });
  };

  return (
    <div className="bg-linear-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 w-full max-w-md overflow-visible">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Swap</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {showSettings && (
        <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="text-sm text-gray-400 mb-2 block">
            Slippage Tolerance
          </label>
          <div className="flex gap-2">
            {["0.1", "0.5", "1.0"].map((value) => (
              <button
                key={value}
                onClick={() => setSlippage(value)}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  slippage === value
                    ? "bg-linear-to-r from-cyan-500 to-purple-600 text-white"
                    : "bg-slate-700/50 text-gray-400 hover:bg-slate-600/50"
                }`}
              >
                {value}%
              </button>
            ))}
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="w-16 px-2 py-1 rounded-lg bg-slate-700/50 text-white text-sm text-center border border-slate-600"
              placeholder="Custom"
            />
          </div>
        </div>
      )}

      {/* From Token */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-2">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">Sell</span>
          <span className="text-sm text-gray-400">
            Balance: {fromToken.balance}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => handleFromAmountChange(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl text-white font-medium outline-none placeholder:text-gray-600 min-w-0"
          />
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setShowFromDropdown(!showFromDropdown);
                setShowToDropdown(false);
              }}
              className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-xl font-medium cursor-pointer border border-slate-600 hover:border-slate-500 transition-colors"
            >
              {fromToken.symbol}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showFromDropdown && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-50 overflow-hidden">
                {TOKENS.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => {
                      setFromToken(token);
                      setShowFromDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                      fromToken.symbol === token.symbol
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
        <div className="text-sm text-gray-500 mt-1">
          ~$
          {fromAmount
            ? (Number(fromAmount) * fromToken.price).toFixed(2)
            : "0.00"}
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-3 relative z-10">
        <button
          onClick={handleSwapTokens}
          className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-400 transition-colors"
        >
          <ArrowDown className="w-5 h-5 text-cyan-400" />
        </button>
      </div>

      {/* To Token */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mt-2">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">Buy</span>
          <span className="text-sm text-gray-400">
            Balance: {toToken.balance}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={toAmount}
            onChange={(e) => handleToAmountChange(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl text-white font-medium outline-none placeholder:text-gray-600 min-w-0"
          />
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setShowToDropdown(!showToDropdown);
                setShowFromDropdown(false);
              }}
              className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-xl font-medium cursor-pointer border border-slate-600 hover:border-slate-500 transition-colors"
            >
              {toToken.symbol}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showToDropdown && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-50 overflow-hidden">
                {TOKENS.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => {
                      setToToken(token);
                      setShowToDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                      toToken.symbol === token.symbol
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
        <div className="text-sm text-gray-500 mt-1">
          ~${toAmount ? (Number(toAmount) * toToken.price).toFixed(2) : "0.00"}
        </div>
      </div>

      {/* Swap Details */}
      {fromAmount && toAmount && (
        <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-1 text-sm text-gray-400 mb-2">
            <Info className="w-4 h-4" />
            <span>Swap Details</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Rate</span>
              <span className="text-white">
                1 {fromToken.symbol} ={" "}
                {(fromToken.price / toToken.price).toFixed(4)} {toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Slippage</span>
              <span className="text-white">{slippage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network Fee</span>
              <span className="text-white">~$0.50</span>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handleSwap}
        disabled={!fromAmount || !toAmount}
        className="w-full mt-4 py-6 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold text-lg rounded-xl transition-all"
      >
        {!fromAmount ? "Enter Amount" : "Swap"}
      </Button>
    </div>
  );
}
