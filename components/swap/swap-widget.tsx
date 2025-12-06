"use client";

import { useState, useEffect } from "react";
import {
  ArrowDown,
  Settings,
  Info,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Token {
  symbol: string;
  name: string;
  balance: string;
}

const TOKENS: Token[] = [
  { symbol: "FYN", name: "FYN Token", balance: "10000.0" },
  { symbol: "QRT", name: "QRT Token", balance: "10000.0" },
];

export function SwapWidget() {
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const [poolLiquidity] = useState(70000); // tokens per side
  const [expectedOutput, setExpectedOutput] = useState<number | null>(null);
  const [priceImpact, setPriceImpact] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) {
      setTimeout(() => {
        setExpectedOutput(null);
        setPriceImpact(null);
        setShowWarning(false);
        setShowError(false);
      }, 0);
      return;
    }

    const amount = Number.parseFloat(fromAmount);

    // Constant product formula: x * y = k
    const k = poolLiquidity * poolLiquidity;
    const newX = poolLiquidity + amount;
    const newY = k / newX;
    const outputAmount = poolLiquidity - newY;

    // Account for 0.3% fee
    const outputAfterFee = outputAmount * 0.997;

    // Calculate price impact (1:1 base price)
    const idealOutput = amount * 1.0;
    const impact = ((idealOutput - outputAfterFee) / idealOutput) * 100;

    setTimeout(() => {
      setExpectedOutput(outputAfterFee);
      setPriceImpact(impact);
    }, 0);

    // Show warnings based on price impact vs slippage
    setTimeout(() => {
      if (impact > slippageTolerance) {
        setShowError(true);
        setShowWarning(false);
      } else if (impact > slippageTolerance * 0.7) {
        setShowWarning(true);
        setShowError(false);
      } else {
        setShowWarning(false);
        setShowError(false);
      }
    }, 0);
  }, [fromAmount, slippageTolerance, poolLiquidity]);

  const getRecommendedSlippage = () => {
    if (!priceImpact) return slippageTolerance;
    return Math.max(Math.ceil(priceImpact * 1.5 * 10) / 10, 0.5);
  };

  const minReceived = expectedOutput
    ? expectedOutput * (1 - slippageTolerance / 100)
    : 0;

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount("");
    setExpectedOutput(null);
  };

  const handleSwap = () => {
    console.log("Swap executed:", {
      fromToken,
      toToken,
      fromAmount,
      expectedOutput,
    });
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
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-gray-300 font-medium">
              Slippage Tolerance
            </label>
            <span className="text-white font-semibold">
              {slippageTolerance}%
            </span>
          </div>
          <div className="flex gap-2 mb-3">
            {[0.5, 1.0, 2.0, 5.0].map((value) => (
              <button
                key={value}
                onClick={() => setSlippageTolerance(value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  slippageTolerance === value
                    ? "bg-linear-to-r from-cyan-500 to-purple-600 text-white"
                    : "bg-slate-700/50 text-gray-400 hover:bg-slate-600/50"
                }`}
              >
                {value}%
              </button>
            ))}
          </div>
          <input
            type="range"
            min="0.1"
            max="20"
            step="0.1"
            value={slippageTolerance}
            onChange={(e) =>
              setSlippageTolerance(Number.parseFloat(e.target.value))
            }
            className="w-full accent-cyan-500"
          />
          <div className="mt-3 text-xs text-slate-400 space-y-1">
            <p>
              • Slippage tolerance is the maximum price movement you&apos;ll
              accept
            </p>
            <p>• If price impact {">"} slippage, the transaction will revert</p>
          </div>
        </div>
      )}

      {/* Sell Token */}
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
            onChange={(e) => setFromAmount(e.target.value)}
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

      {/* Buy Token */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mt-2">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">Buy</span>
          <span className="text-sm text-gray-400">
            Balance: {toToken.balance}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 text-2xl text-white font-medium min-w-0">
            {expectedOutput ? expectedOutput.toFixed(4) : "0.0"}
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setShowToDropdown(!showToDropdown);
                setShowFromDropdown(false);
              }}
              className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-xl font-medium cursor-pointer border border-slate-600 hover:border-slate-500 transition-colors"
            >
              {toToken.symbol}
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
      </div>

      {priceImpact !== null && priceImpact > 0 && (
        <div
          className={`rounded-xl p-4 mt-4 border ${
            showError
              ? "bg-red-900/20 border-red-600"
              : showWarning
              ? "bg-yellow-900/20 border-yellow-600"
              : "bg-blue-900/20 border-blue-600"
          }`}
        >
          <div className="flex items-start gap-3">
            {showError ? (
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            ) : showWarning ? (
              <TrendingDown className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              <div
                className={`font-semibold mb-2 ${
                  showError
                    ? "text-red-300"
                    : showWarning
                    ? "text-yellow-300"
                    : "text-blue-300"
                }`}
              >
                {showError && "Transaction Will Fail"}
                {showWarning && "High Price Impact"}
                {!showError && !showWarning && "Price Impact"}
              </div>
              <div className="text-sm text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span>Price Impact:</span>
                  <span
                    className={`font-semibold ${
                      priceImpact > 10
                        ? "text-red-400"
                        : priceImpact > 5
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Current Slippage:</span>
                  <span className="font-semibold text-white">
                    {slippageTolerance}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Received:</span>
                  <span className="font-semibold text-white">
                    {minReceived.toFixed(4)} {toToken.symbol}
                  </span>
                </div>
              </div>

              {showError && (
                <div className="mt-3 pt-3 border-t border-red-800">
                  <p className="text-sm text-red-200 mb-2">
                    <strong>Why this fails:</strong> Your price impact (
                    {priceImpact.toFixed(2)}%) exceeds your slippage tolerance (
                    {slippageTolerance}%).
                  </p>
                  <p className="text-sm text-red-200 mb-3">
                    The swap will output {expectedOutput?.toFixed(4)} tokens,
                    but your minimum acceptable amount is{" "}
                    {minReceived.toFixed(4)} tokens.
                  </p>
                  <button
                    onClick={() =>
                      setSlippageTolerance(getRecommendedSlippage())
                    }
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Increase Slippage to {getRecommendedSlippage()}%
                  </button>
                </div>
              )}

              {showWarning && !showError && (
                <div className="mt-3 pt-3 border-t border-yellow-800">
                  <p className="text-sm text-yellow-200">
                    Your trade is close to the slippage limit. Consider
                    increasing slippage to {getRecommendedSlippage()}% or
                    reducing trade size.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {fromAmount && expectedOutput && (
        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <h4 className="text-slate-300 font-medium mb-3">Swap Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Pool Liquidity:</span>
              <span className="text-white">
                {poolLiquidity.toLocaleString()} tokens
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Your Trade Size:</span>
              <span className="text-white">
                {fromAmount || "0"} {fromToken.symbol} (
                {(
                  (Number.parseFloat(fromAmount || "0") / poolLiquidity) *
                  100
                ).toFixed(2)}
                % of pool)
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Current Price:</span>
              <span className="text-white">1 FYN = 1 QRT</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Execution Price:</span>
              <span className="text-white">
                1 {fromToken.symbol} ={" "}
                {(expectedOutput / Number.parseFloat(fromAmount)).toFixed(4)}{" "}
                {toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Network Fee:</span>
              <span className="text-white">0.3%</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-purple-900/20 border border-purple-800/50 rounded-lg">
        <h4 className="text-purple-300 font-semibold mb-2 flex items-center gap-2 text-sm">
          <Info className="w-4 h-4" />
          How Price Impact Works
        </h4>
        <div className="text-xs text-slate-400 space-y-1">
          <p>• Larger trades cause larger price impact due to AMM mechanics</p>
          <p>
            • If price impact {">"} slippage tolerance, the transaction reverts
          </p>
          <p>• Reduce trade size or increase slippage to proceed</p>
        </div>
      </div>

      <Button
        onClick={handleSwap}
        disabled={!fromAmount || showError}
        className={`w-full mt-4 py-6 text-white font-semibold text-lg rounded-xl transition-all ${
          showError
            ? "bg-slate-700 cursor-not-allowed"
            : "bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
        }`}
      >
        {!fromAmount
          ? "Enter Amount"
          : showError
          ? "Increase Slippage to Swap"
          : "Swap"}
      </Button>
    </div>
  );
}
