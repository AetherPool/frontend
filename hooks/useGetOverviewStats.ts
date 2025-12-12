import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import {
  getPositionManagerContract,
  getProfitManagerContract,
  getJITCoordinatorContract,
  getHookContract,
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

interface LPPosition {
  tokenId: bigint;
  tickLower: bigint;
  tickUpper: bigint;
  liquidity: bigint;
  token0Amount: bigint;
  token1Amount: bigint;
  isActive: boolean;
  isJITEnabled: boolean;
  depositTimestamp: bigint;
}

interface OverviewStats {
  totalLiquidity: string;
  activePositions: number;
  totalEarnings: string;
  jitParticipations: number;
}

interface RecentJIT {
  time: string;
  timeAgo: string;
  pair: string;
  amount: string;
  profit: string;
  status: string;
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
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const useGetOverviewStats = (poolKey: PoolKey = DEFAULT_POOL_KEY) => {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState<OverviewStats>({
    totalLiquidity: "$0.00",
    activePositions: 0,
    totalEarnings: "$0.00",
    jitParticipations: 0,
  });
  const [recentJITs, setRecentJITs] = useState<RecentJIT[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOverviewData = useCallback(async () => {
    if (!address || !isConnected) {
      setStats({
        totalLiquidity: "$0.00",
        activePositions: 0,
        totalEarnings: "$0.00",
        jitParticipations: 0,
      });
      setRecentJITs([]);
      return;
    }

    setIsLoading(true);

    try {
      const positionManager = getPositionManagerContract(readOnlyProvider);
      const profitManager = getProfitManagerContract(readOnlyProvider);
      const jitCoordinator = getJITCoordinatorContract(readOnlyProvider);
      const hook = getHookContract(readOnlyProvider);

      // Get price ratio for USD calculations
      let priceRatio = 1;
      try {
        const ratio = await hook.getPriceRatio(poolKey);
        priceRatio = Number(ratio.toString()) / 1e18;
      } catch (err) {
        console.warn("Could not fetch price ratio", err);
      }

      // Get all positions
      const positions: LPPosition[] = await positionManager.getLPPositions(
        poolKey,
        address
      );
      const activePositions = positions.filter((p: LPPosition) => p.isActive);

      // Calculate total liquidity
      let totalLiquidityValue = 0;
      for (const position of activePositions) {
        const amount0 = Number(formatUnits(position.token0Amount, DECIMALS));
        const amount1 = Number(formatUnits(position.token1Amount, DECIMALS));
        totalLiquidityValue += amount0 + amount1 * priceRatio;
      }

      // Get total earnings (profits)
      const [profits0, profits1] = await profitManager.getLPProfits(
        poolKey,
        address
      );
      const profit0 = Number(formatUnits(profits0, DECIMALS));
      const profit1 = Number(formatUnits(profits1, DECIMALS));
      const totalEarnings = profit0 + profit1 * priceRatio;

      // Get JIT operations count and recent ones
      const currentSwapId = await jitCoordinator.getNextSwapId();
      const maxSwapId = Number(currentSwapId) - 1;

      let jitCount = 0;
      const recentOps: RecentJIT[] = [];

      if (maxSwapId >= 1) {
        const fetchCount = Math.min(5, maxSwapId); // Last 5 operations
        const startId = Math.max(1, maxSwapId - 49); // Check last 50 for count

        // Count all JIT participations
        for (let i = maxSwapId; i >= startId; i--) {
          try {
            const position = await jitCoordinator.getJITPosition(i);
            const lpIndex = position.participatingLPs.findIndex(
              (lp: string) => lp.toLowerCase() === address.toLowerCase()
            );
            if (lpIndex !== -1) {
              jitCount++;

              // Add to recent if within last 5
              if (recentOps.length < 5) {
                const fees0 = Number(
                  formatUnits(position.totalFees0, DECIMALS)
                );
                const fees1 = Number(
                  formatUnits(position.totalFees1, DECIMALS)
                );
                const lpContribution = Number(
                  position.lpContributions[lpIndex]
                );
                const totalLiquidity = Number(position.totalLiquidity);
                const lpFees0 = (fees0 * lpContribution) / totalLiquidity;
                const lpFees1 = (fees1 * lpContribution) / totalLiquidity;
                const lpTotalProfit = lpFees0 + lpFees1 * priceRatio;

                const timestamp = Number(position.timestamp);

                recentOps.push({
                  time: formatTimestamp(timestamp),
                  timeAgo: formatTimeAgo(timestamp),
                  pair: "QRT/FYN",
                  amount: `${lpContribution.toLocaleString()} liquidity`,
                  profit: `+$${lpTotalProfit.toFixed(2)}`,
                  status: position.isActive ? "pending" : "completed",
                });
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch JIT position ${i}:`, err);
          }
        }
      }

      setStats({
        totalLiquidity: `$${totalLiquidityValue.toFixed(2)}`,
        activePositions: activePositions.length,
        totalEarnings: `$${totalEarnings.toFixed(2)}`,
        jitParticipations: jitCount,
      });

      setRecentJITs(recentOps);

      console.log("Overview stats fetched:", {
        totalLiquidity: totalLiquidityValue,
        activePositions: activePositions.length,
        totalEarnings,
        jitParticipations: jitCount,
      });
    } catch (error) {
      console.error("Error fetching overview stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, poolKey]);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  // Refresh every 30 seconds
  useEffect(() => {
    if (!address || !isConnected) return;

    const interval = setInterval(() => {
      fetchOverviewData();
    }, 30000);

    return () => clearInterval(interval);
  }, [address, isConnected, fetchOverviewData]);

  return {
    stats,
    recentJITs,
    isLoading,
    refetch: fetchOverviewData,
  };
};
