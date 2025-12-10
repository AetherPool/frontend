"use client";
import { useState } from "react";
import { Plus, Zap, Droplets, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useDepositLiquidity from "@/hooks/Liquidity/useDepositLiquidity";
import useApproveTokens from "@/hooks/Liquidity/useApproveTokens";
import useGetFYNBalance from "@/hooks/Token/useGetFYNBalance";
import useGetQRTBalance from "@/hooks/Token/useGetQRTBalance";
import useGetPoolPrice from "@/hooks/Liquidity/useGetPoolPrice";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { useMemo } from "react";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  address: string;
}

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
  const { isConnected } = useAccount();
  const fynBalance = useGetFYNBalance();
  const qrtBalance = useGetQRTBalance();
  const { deposit, isLoading: isDepositing } = useDepositLiquidity();
  const { approveBothTokens, isLoading: isApproving } = useApproveTokens();

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [tickLower, setTickLower] = useState("-887220");
  const [tickUpper, setTickUpper] = useState("887220");
  const [liquidityType, setLiquidityType] = useState<"jit" | "passive">("jit");
  const [lastEdited, setLastEdited] = useState<"A" | "B" | null>(null);

  // Token configurations - update these with your actual token addresses
  const TOKEN_A: Token = {
    symbol: "QRT",
    name: "QRT Token",
    balance: qrtBalance?.toFixed(2) || "0.0",
    address: process.env.QRT_TOKEN || "",
  };

  const TOKEN_B: Token = {
    symbol: "FYN",
    name: "FYN Token",
    balance: fynBalance?.toFixed(2) || "0.0",
    address: process.env.FYN_TOKEN || "",
  };

  // Pool configuration
  const poolKey = useMemo(
    () => ({
      currency0: TOKEN_A.address,
      currency1: TOKEN_B.address,
      fee: 8388608,
      tickSpacing: 60,
      hooks: process.env.HOOK || "",
    }),
    [TOKEN_A.address, TOKEN_B.address]
  );

  // Get dynamic pool price
  const { price: poolPrice, isLoading: isPriceLoading } = useGetPoolPrice(
    poolKey.currency0 && poolKey.currency1 ? poolKey : null
  );

  // Use actual pool price ratio, fallback to 1:1 if not available
  // This ratio updates dynamically as swaps happen in the pool
  const priceRatio = poolPrice?.ratio || 1.0;

  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    setLastEdited("A");
    if (value && !isNaN(Number(value))) {
      // Calculate token B amount based on current pool price
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
      // Calculate token A amount based on current pool price
      const computed = Number(value) / priceRatio;
      setAmountA(computed.toFixed(6));
    } else {
      setAmountA("");
    }
  };

  const handleAddLiquidity = async () => {
    if (!isConnected) {
      return;
    }

    // Convert amounts to wei (assuming 6 decimals for your tokens)
    const amount0Wei = ethers.parseUnits(amountA, 6).toString();
    const amount1Wei = ethers.parseUnits(amountB, 6).toString();

    // Get the hook contract address from your environment
    const hookAddress = process.env.HOOK || "";

    try {
      // First, approve both tokens
      const approved = await approveBothTokens(
        TOKEN_A.address,
        TOKEN_B.address,
        hookAddress,
        amount0Wei,
        amount1Wei
      );

      if (!approved) {
        return;
      }

      // If JIT liquidity, proceed to configuration
      if (liquidityType === "jit" && onJITConfigRequired) {
        onJITConfigRequired({
          tokenA: TOKEN_A,
          tokenB: TOKEN_B,
          amountA,
          amountB,
          tickLower,
          tickUpper,
        });
        return;
      }

      // For passive liquidity, deposit directly
      const poolKey = {
        currency0: TOKEN_A.address,
        currency1: TOKEN_B.address,
        fee: 8388608,
        tickSpacing: 60,
        hooks: hookAddress,
      };

      const result = await deposit({
        poolKey,
        tickLower: parseInt(tickLower),
        tickUpper: parseInt(tickUpper),
        amount0Desired: amount0Wei,
        amount1Desired: amount1Wei,
        isJITEnabled: false,
      });

      if (result) {
        // Clear form on success
        setAmountA("");
        setAmountB("");
      }
    } catch (error) {
      console.error("Error adding liquidity:", error);
    }
  };

  const isLoading = isApproving || isDepositing;
  const canSubmit =
    isConnected && amountA && amountB && tickLower && tickUpper && !isLoading;

  return (
    <div className="bg-linear-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 w-full max-w-md overflow-visible">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">Add Liquidity</h3>
      </div>

      {/* Connection Warning */}
      {!isConnected && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-300">
            Please connect your wallet to add liquidity
          </p>
        </div>
      )}

      {/* Current Pool Price Display */}
      {poolPrice && (
        <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-cyan-300">Current Pool Price:</span>
            <span className="text-sm font-medium text-white">
              1 {TOKEN_A.symbol} = {poolPrice.ratio.toFixed(6)} {TOKEN_B.symbol}
            </span>
          </div>
        </div>
      )}

      {isPriceLoading && (
        <div className="mb-4 p-3 bg-slate-800/50 border border-slate-700/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span className="text-sm text-gray-400">Loading pool price...</span>
          </div>
        </div>
      )}

      {/* Liquidity Type Toggle */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-3 block">
          Liquidity Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLiquidityType("jit")}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
              liquidityType === "jit"
                ? "bg-linear-to-r from-cyan-500 to-purple-600 text-white"
                : "bg-slate-800/50 text-gray-400 border border-slate-700 hover:border-slate-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Zap className="w-4 h-4" />
            JIT Liquidity
          </button>
          <button
            onClick={() => setLiquidityType("passive")}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
              liquidityType === "passive"
                ? "bg-linear-to-r from-cyan-500 to-purple-600 text-white"
                : "bg-slate-800/50 text-gray-400 border border-slate-700 hover:border-slate-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
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

      {/* Token A Input - QRT */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-3">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">
            Token A{" "}
            {lastEdited === "A" && (
              <span className="text-cyan-400">(editing)</span>
            )}
          </span>
          <span className="text-sm text-gray-400">
            Balance: {TOKEN_A.balance}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={amountA}
            onChange={(e) => handleAmountAChange(e.target.value)}
            placeholder="0.0"
            disabled={isLoading}
            className="flex-1 bg-transparent text-2xl text-white font-medium outline-none placeholder:text-gray-600 min-w-0 disabled:opacity-50"
          />
          <div className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-xl font-medium border border-slate-600">
            {TOKEN_A.symbol}
          </div>
        </div>
      </div>

      {/* Plus Icon */}
      <div className="flex justify-center -my-1.5 relative z-10">
        <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
          <Plus className="w-4 h-4 text-cyan-400" />
        </div>
      </div>

      {/* Token B Input - FYN */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mt-3">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">
            Token B{" "}
            {lastEdited === "B" && (
              <span className="text-cyan-400">(editing)</span>
            )}
          </span>
          <span className="text-sm text-gray-400">
            Balance: {TOKEN_B.balance}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={amountB}
            onChange={(e) => handleAmountBChange(e.target.value)}
            placeholder="0.0"
            disabled={isLoading}
            className="flex-1 bg-transparent text-2xl text-white font-medium outline-none placeholder:text-gray-600 min-w-0 disabled:opacity-50"
          />
          <div className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-xl font-medium border border-slate-600">
            {TOKEN_B.symbol}
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
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-gray-600 focus:border-cyan-400 outline-none disabled:opacity-50"
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
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-gray-600 focus:border-cyan-400 outline-none disabled:opacity-50"
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
              {Number(amountA || 0).toFixed(2)} {TOKEN_A.symbol} +{" "}
              {Number(amountB || 0).toFixed(2)} {TOKEN_B.symbol}
            </span>
          </div>
        </div>
      )}

      <Button
        onClick={handleAddLiquidity}
        disabled={!canSubmit}
        className="w-full mt-4 py-6 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold text-lg rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {isApproving ? "Approving..." : "Depositing..."}
          </>
        ) : liquidityType === "jit" ? (
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
