"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ArrowDown,
  Settings,
  Info,
  AlertCircle,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useGetFYNBalance from "@/hooks/Token/useGetFYNBalance";
import useGetQRTBalance from "@/hooks/Token/useGetQRTBalance";
import useApproveTokens from "@/hooks/Liquidity/useApproveTokens";
import useSwap from "@/hooks/Swap/useSwap";
import useGetPoolPrice from "@/hooks/Liquidity/useGetPoolPrice";
import useGetPoolLiquidity from "@/hooks/Liquidity/useGetPoolLiquidity";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

interface Token {
  symbol: string;
  name: string;
  address: string;
}

const FYN_ADDRESS = process.env.FYN_TOKEN || "";
const QRT_ADDRESS = process.env.QRT_TOKEN || "";
const HOOK_ADDRESS = process.env.HOOK || "";
const HOOK_SWAP_ROUTER = process.env.HOOK_SWAP_ROUTER || "";

const TOKENS: Token[] = [
  { symbol: "QRT", name: "Quarita", address: QRT_ADDRESS },
  { symbol: "FYN", name: "Fyntera", address: FYN_ADDRESS },
];

export function SwapWidget() {
  const { isConnected } = useAccount();
  const fynBalance = useGetFYNBalance();
  const qrtBalance = useGetQRTBalance();
  const { approveBothTokens, isLoading: isApproving } = useApproveTokens();
  const { swap, isLoading: isSwapping, isPreparingSwap } = useSwap();

  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [slippageTolerance, setSlippageTolerance] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const [expectedOutput, setExpectedOutput] = useState<number | null>(null);
  const [priceImpact, setPriceImpact] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showError, setShowError] = useState(false);

  // Pool key configuration
  const poolKey = useMemo(() => ({
    currency0: QRT_ADDRESS,
    currency1: FYN_ADDRESS,
    fee: 8388608,
    tickSpacing: 60,
    hooks: HOOK_ADDRESS,
  }), []);

  // Get current pool price and liquidity
  const { price: poolPrice, refetch: refetchPrice } = useGetPoolPrice(poolKey);
  const { liquidity: poolLiquidityData, refetch: refetchLiquidity } =
    useGetPoolLiquidity(poolKey);
  console.log("Pool Liquidity Data:", poolLiquidityData);

  const poolLiquidity = poolLiquidityData?.totalToken0 || 70000;

  const getTokenBalance = (tokenSymbol: string): string => {
    if (!isConnected) return "0.0";

    if (tokenSymbol === "FYN") {
      return fynBalance !== null ? fynBalance.toFixed(4) : "0.0";
    } else if (tokenSymbol === "QRT") {
      return qrtBalance !== null ? qrtBalance.toFixed(4) : "0.0";
    }
    return "0.0";
  };

  // Improved output and price impact calculation using actual pool price
  useEffect(() => {
    if (
      !fromAmount ||
      Number.parseFloat(fromAmount) <= 0 ||
      !poolPrice ||
      !poolLiquidity ||
      poolLiquidity === 0
    ) {
      setTimeout(() => {
        setExpectedOutput(null);
        setPriceImpact(null);
        setShowWarning(false);
        setShowError(false);
      }, 0);
      return;
    }

    const amount = Number.parseFloat(fromAmount);

    // Use actual price ratio from the pool
    const currentPriceRatio = poolPrice.ratio;

    // Determine direction
    const isToken0ToToken1 =
      fromToken.address.toLowerCase() === poolKey.currency0.toLowerCase();

    // Calculate expected output using actual price
    let expectedOut: number;
    if (isToken0ToToken1) {
      expectedOut = amount * currentPriceRatio;
    } else {
      expectedOut = amount / currentPriceRatio;
    }

    // Apply trading fee (0.3%)
    const outputAfterFee = expectedOut * 0.997;

    // Calculate price impact using constant product formula
    const k = poolLiquidity * poolLiquidity;
    const newX = poolLiquidity + amount;
    const newY = k / newX;
    const actualOutput = poolLiquidity - newY;
    const actualOutputAfterFee = actualOutput * 0.997;

    // Price impact is the difference between expected and actual
    const impact = ((expectedOut - actualOutputAfterFee) / expectedOut) * 100;

    setTimeout(() => {
      setExpectedOutput(actualOutputAfterFee);
      setPriceImpact(Math.max(0, impact));
    }, 0);

    // Show warnings based on price impact vs slippage tolerance
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
  }, [
    fromAmount,
    slippageTolerance,
    poolLiquidity,
    poolPrice,
    fromToken,
    toToken,
    poolKey,
  ]);

  const getRecommendedSlippage = () => {
    if (!priceImpact) return slippageTolerance;
    // Recommend slippage that's 50% higher than price impact, minimum 2%
    return Math.max(Math.ceil(priceImpact * 1.5 * 10) / 10, 2.0);
  };

  const minReceived =
    expectedOutput && slippageTolerance
      ? expectedOutput * (1 - slippageTolerance / 100)
      : 0;

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount("");
    setExpectedOutput(null);
  };

  const handleMaxClick = () => {
    const balance = getTokenBalance(fromToken.symbol);
    setFromAmount(balance);
  };

  const handleSwap = async () => {
    if (!isConnected) {
      console.log("Please connect wallet");
      return;
    }

    if (!expectedOutput || !fromAmount) {
      return;
    }

    try {
      // Convert amounts to wei (6 decimals)
      const amountInWei = ethers.parseUnits(fromAmount, 6).toString();

      // Calculate minimum output with slippage protection
      // Use the expected output and apply slippage tolerance
      const minOut = expectedOutput * (1 - slippageTolerance / 100);
      const minAmountOutWei = ethers
        .parseUnits(minOut.toFixed(6), 6)
        .toString();

      console.log("Swap parameters:", {
        amountIn: fromAmount,
        expectedOutput: expectedOutput.toFixed(6),
        minOut: minOut.toFixed(6),
        slippageTolerance: slippageTolerance,
      });

      // Step 1: Approve tokens
      const approved = await approveBothTokens(
        fromToken.address,
        toToken.address,
        HOOK_SWAP_ROUTER,
        amountInWei,
        "0"
      );

      if (!approved) {
        return;
      }

      // Step 2: Execute swap with JIT preparation
      const result = await swap(
        {
          poolKey,
          tokenIn: fromToken.address,
          tokenOut: toToken.address,
          amountIn: amountInWei,
          minAmountOut: minAmountOutWei,
        },
        slippageTolerance // Pass slippage for accurate calculation
      );

      if (result) {
        // Reset form on success
        setFromAmount("");
        setExpectedOutput(null);
        setPriceImpact(null);

        // Refetch balances and pool data
        setTimeout(() => {
          refetchPrice();
          refetchLiquidity();
        }, 2000);
      }
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  const fromBalance = getTokenBalance(fromToken.symbol);
  const toBalance = getTokenBalance(toToken.symbol);
  const insufficientBalance =
    fromAmount &&
    Number.parseFloat(fromAmount) > Number.parseFloat(fromBalance);

  const isProcessing = isApproving || isSwapping || isPreparingSwap;

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
              • Slippage tolerance is the maximum price movement you&apos;ll accept
            </p>
            <p>• Higher slippage = higher chance of success but worse price</p>
            <p>• Recommended: 2-5% for JIT liquidity pools</p>
          </div>
        </div>
      )}

      {isPreparingSwap && (
        <div className="mb-4 p-4 bg-purple-900/20 border border-purple-600 rounded-xl">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-purple-300 mb-1">
                Preparing JIT Liquidity
              </div>
              <div className="text-sm text-slate-300">
                Decrypting LP configurations and preparing optimal liquidity...
                This may take a few moments.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sell Token */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-2">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">Sell</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              Balance: {fromBalance}
            </span>
            {isConnected && Number.parseFloat(fromBalance) > 0 && (
              <button
                onClick={handleMaxClick}
                disabled={isProcessing}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold disabled:opacity-50"
              >
                MAX
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            placeholder="0.0"
            disabled={isProcessing}
            className="flex-1 bg-transparent text-2xl text-white font-medium outline-none placeholder:text-gray-600 min-w-0 disabled:opacity-50"
          />
          <div className="relative shrink-0">
            <button
              onClick={() => {
                if (!isProcessing) {
                  setShowFromDropdown(!showFromDropdown);
                  setShowToDropdown(false);
                }
              }}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-xl font-medium cursor-pointer border border-slate-600 hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fromToken.symbol}
            </button>
            {showFromDropdown && !isProcessing && (
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
        {insufficientBalance && (
          <div className="mt-2 text-sm text-red-400">
            Insufficient {fromToken.symbol} balance
          </div>
        )}
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-3 relative z-10">
        <button
          onClick={handleSwapTokens}
          disabled={isProcessing}
          className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowDown className="w-5 h-5 text-cyan-400" />
        </button>
      </div>

      {/* Buy Token */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mt-2">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">Buy</span>
          <span className="text-sm text-gray-400">Balance: {toBalance}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 text-2xl text-white font-medium min-w-0">
            {expectedOutput ? expectedOutput.toFixed(4) : "0.0"}
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => {
                if (!isProcessing) {
                  setShowToDropdown(!showToDropdown);
                  setShowFromDropdown(false);
                }
              }}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-xl font-medium cursor-pointer border border-slate-600 hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {toToken.symbol}
            </button>
            {showToDropdown && !isProcessing && (
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
                {showError && "Transaction May Fail"}
                {showWarning && "High Price Impact"}
                {!showError && !showWarning && "Price Impact"}
              </div>
              <div className="text-sm text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span>Price Impact:</span>
                  <span
                    className={`font-semibold ${
                      priceImpact && priceImpact > 10
                        ? "text-red-400"
                        : priceImpact && priceImpact > 5
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {priceImpact !== null ? priceImpact.toFixed(2) : "0.00"}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Current Slippage:</span>
                  <span className="font-semibold text-white">
                    {slippageTolerance.toFixed(1)}%
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
                    <strong>Warning:</strong> Price impact (
                    {priceImpact.toFixed(2)}%) exceeds slippage tolerance (
                    {slippageTolerance}%).
                  </p>
                  <button
                    onClick={() =>
                      setSlippageTolerance(getRecommendedSlippage())
                    }
                    disabled={isProcessing}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Increase Slippage to {getRecommendedSlippage()}%
                  </button>
                </div>
              )}

              {showWarning && !showError && (
                <div className="mt-3 pt-3 border-t border-yellow-800">
                  <p className="text-sm text-yellow-200">
                    Consider increasing slippage to {getRecommendedSlippage()}%
                    or reducing trade size.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {fromAmount && expectedOutput && poolLiquidityData && (
        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <h4 className="text-slate-300 font-medium mb-3">Swap Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Pool Liquidity:</span>
              <span className="text-white">
                {poolLiquidityData.totalToken0.toLocaleString()}{" "}
                {TOKENS[0].symbol} +{" "}
                {poolLiquidityData.totalToken1.toLocaleString()}{" "}
                {TOKENS[1].symbol}
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
              <span className="text-white">
                {poolPrice
                  ? `1 ${fromToken.symbol} = ${poolPrice.ratio.toFixed(6)} ${
                      toToken.symbol
                    }`
                  : "Loading..."}
              </span>
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
          JIT Liquidity Integration
        </h4>
        <div className="text-xs text-slate-400 space-y-1">
          <p>• Swap automatically detects and activates JIT liquidity</p>
          <p>• LP configurations are decrypted before execution</p>
          <p>• May take 10-30 seconds for JIT preparation</p>
        </div>
      </div>

      <Button
        onClick={handleSwap}
        disabled={
          !isConnected ||
          !fromAmount ||
          showError ||
          insufficientBalance ||
          isProcessing
        }
        className={`w-full mt-4 py-6 text-white font-semibold text-lg rounded-xl transition-all ${
          !isConnected || showError || insufficientBalance || isProcessing
            ? "bg-slate-700 cursor-not-allowed"
            : "bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            {isApproving && "Approving Tokens..."}
            {isPreparingSwap && "Preparing JIT..."}
            {isSwapping && "Swapping..."}
          </span>
        ) : !isConnected ? (
          "Connect Wallet"
        ) : !fromAmount ? (
          "Enter Amount"
        ) : insufficientBalance ? (
          `Insufficient ${fromToken.symbol} Balance`
        ) : showError ? (
          "Increase Slippage to Swap"
        ) : (
          "Swap"
        )}
      </Button>
    </div>
  );
}
