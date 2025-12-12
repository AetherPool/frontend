import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import {
  getJITCoordinatorContract,
  getProfitManagerContract,
} from "@/constants/contracts";
import { readOnlyProvider } from "@/constants/providers";
import { formatUnits } from "ethers";

export interface PoolKey {
  currency0: string;
  currency1: string;
  fee: number;
  tickSpacing: number;
  hooks: string;
}

interface JITOperation {
  swapId: number;
  time: string;
  timeAgo: string;
  pair: string;
  amount: string;
  profit: string;
  profitUsd: number;
  status: "completed" | "pending";
  lpShare: string;
  fees0: number;
  fees1: number;
}

interface JITStats {
  totalProfit: number;
  totalOperations: number;
  avgProfitPerOp: number;
  successRate: number;
  weeklyChange: number;
}

const DEFAULT_POOL_KEY: PoolKey = {
  currency0: process.env.QRT_TOKEN as string,
  currency1: process.env.FYN_TOKEN as string,
  fee: 8388608,
  tickSpacing: 60,
  hooks: process.env.HOOK as string,
};

const DECIMALS = 6;

const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

export const useGetJITActivity = (poolKey: PoolKey = DEFAULT_POOL_KEY) => {
  const { address, isConnected } = useAccount();
  const [operations, setOperations] = useState<JITOperation[]>([]);
  const [stats, setStats] = useState<JITStats>({
    totalProfit: 0,
    totalOperations: 0,
    avgProfitPerOp: 0,
    successRate: 0,
    weeklyChange: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchJITActivity = useCallback(async () => {
    if (!address || !isConnected) {
      setOperations([]);
      setStats({
        totalProfit: 0,
        totalOperations: 0,
        avgProfitPerOp: 0,
        successRate: 0,
        weeklyChange: 0,
      });
      return;
    }

    setIsLoading(true);

    try {
      const jitCoordinator = getJITCoordinatorContract(readOnlyProvider);
      const profitManager = getProfitManagerContract(readOnlyProvider);

      // Get current swap ID to know the range
      const currentSwapId = await jitCoordinator.getNextSwapId();
      const maxSwapId = Number(currentSwapId) - 1;

      if (maxSwapId < 1) {
        setOperations([]);
        setIsLoading(false);
        return;
      }

      // Fetch last 50 JIT positions (or less if not that many exist)
      const fetchCount = Math.min(50, maxSwapId);
      const startId = Math.max(1, maxSwapId - fetchCount + 1);

      const jitOps: JITOperation[] = [];
      let totalProfit = 0;
      const weekStart = Math.floor(Date.now() / 1000) - 7 * 86400;
      let weeklyProfit = 0;

      for (let i = maxSwapId; i >= startId; i--) {
        try {
          const position = await jitCoordinator.getJITPosition(i);

          // Check if this LP participated
          const lpIndex = position.participatingLPs.findIndex(
            (lp: string) => lp.toLowerCase() === address.toLowerCase()
          );

          if (lpIndex === -1) continue; // LP didn't participate

          const fees0 = Number(formatUnits(position.totalFees0, DECIMALS));
          const fees1 = Number(formatUnits(position.totalFees1, DECIMALS));

          // Calculate this LP's share
          const lpContribution = Number(position.lpContributions[lpIndex]);
          const totalLiquidity = Number(position.totalLiquidity);
          const sharePercent = (lpContribution / totalLiquidity) * 100;

          const lpFees0 = (fees0 * lpContribution) / totalLiquidity;
          const lpFees1 = (fees1 * lpContribution) / totalLiquidity;
          const lpTotalProfit = lpFees0 + lpFees1;

          totalProfit += lpTotalProfit;

          const timestamp = Number(position.timestamp);
          if (timestamp >= weekStart) {
            weeklyProfit += lpTotalProfit;
          }

          jitOps.push({
            swapId: i,
            time: formatTimestamp(timestamp),
            timeAgo: formatTimeAgo(timestamp),
            pair: "QRT/FYN",
            amount: `${lpContribution.toLocaleString()} liquidity`,
            profit: `$${lpTotalProfit.toFixed(2)}`,
            profitUsd: lpTotalProfit,
            status: position.isActive ? "pending" : "completed",
            lpShare: `${sharePercent.toFixed(1)}%`,
            fees0: lpFees0,
            fees1: lpFees1,
          });
        } catch (err) {
          console.warn(`Failed to fetch JIT position ${i}:`, err);
        }
      }

      // Calculate stats
      const totalOps = jitOps.length;
      const avgProfit = totalOps > 0 ? totalProfit / totalOps : 0;

      // Success rate = operations with profit > 0
      const successfulOps = jitOps.filter((op) => op.profitUsd > 0).length;
      const successRate = totalOps > 0 ? (successfulOps / totalOps) * 100 : 0;

      // Weekly change
      const previousWeekProfit = totalProfit - weeklyProfit;
      const weeklyChange =
        previousWeekProfit > 0
          ? ((weeklyProfit - previousWeekProfit) / previousWeekProfit) * 100
          : weeklyProfit > 0
          ? 100
          : 0;

      setStats({
        totalProfit,
        totalOperations: totalOps,
        avgProfitPerOp: avgProfit,
        successRate,
        weeklyChange,
      });

      setOperations(jitOps);

      console.log("JIT Activity fetched:", {
        operations: jitOps.length,
        totalProfit,
        avgProfit,
      });
    } catch (error) {
      console.error("Error fetching JIT activity:", error);
      setOperations([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    fetchJITActivity();
  }, [fetchJITActivity]);

  // Refresh every 30 seconds
  useEffect(() => {
    if (!address || !isConnected) return;

    const interval = setInterval(() => {
      fetchJITActivity();
    }, 30000);

    return () => clearInterval(interval);
  }, [address, isConnected, fetchJITActivity]);

  return {
    operations,
    stats,
    isLoading,
    refetch: fetchJITActivity,
  };
};
