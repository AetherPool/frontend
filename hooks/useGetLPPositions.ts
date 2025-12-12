import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import {
  getPositionManagerContract,
  getProfitManagerContract,
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

export interface Position {
  id: number;
  pair: string;
  range: string;
  liquidity: string;
  fees: string;
  apy: string;
  tokenA: {
    symbol: string;
    amount: string;
    price?: number;
    profit?: string;
    profitUsd?: number;
  };
  tokenB: {
    symbol: string;
    amount: string;
    price?: number;
    profit?: string;
    profitUsd?: number;
  };
  totalValue: string;
  tokenId: number;
  tickLower: number;
  tickUpper: number;
  isActive: boolean;
  isJITEnabled: boolean;
}

interface RawPosition {
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

const DECIMALS = 6; // Both QRT and FYN use 6 decimals

// Default pool key for QRT/FYN pool
const DEFAULT_POOL_KEY: PoolKey = {
  currency0: process.env.QRT_TOKEN as string,
  currency1: process.env.FYN_TOKEN as string,
  fee: 8388608, // Dynamic fee flag
  tickSpacing: 60,
  hooks: process.env.HOOK as string,
};

const useGetLPPositions = (poolKey: PoolKey = DEFAULT_POOL_KEY) => {
  const { address, isConnected } = useAccount();
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!address || !isConnected) {
      setPositions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const positionManager = getPositionManagerContract(readOnlyProvider);
      const profitManager = getProfitManagerContract(readOnlyProvider);
      const hook = getHookContract(readOnlyProvider);

      // Get all positions for the user
      const rawPositions: RawPosition[] = await positionManager.getLPPositions(
        poolKey,
        address
      );

      if (!rawPositions || rawPositions.length === 0) {
        setPositions([]);
        setIsLoading(false);
        return;
      }

      // Get current price for value calculations
      let priceRatio = 1;
      try {
        const ratio = await hook.getPriceRatio(poolKey);
        priceRatio = Number(ratio.toString()) / 1e18;
      } catch (err) {
        console.warn("Could not fetch price ratio, using 1:1", err);
      }

      // Get profits for the user
      let profits0 = BigInt(0);
      let profits1 = BigInt(0);
      try {
        const [p0, p1] = await profitManager.getLPProfits(poolKey, address);
        profits0 = p0;
        profits1 = p1;
      } catch (err) {
        console.warn("Could not fetch profits", err);
      }

      // Format positions
      const formattedPositions: Position[] = rawPositions
        .filter((pos) => pos.isActive)
        .map((pos, index) => {
          const token0Amount = Number(formatUnits(pos.token0Amount, DECIMALS));
          const token1Amount = Number(formatUnits(pos.token1Amount, DECIMALS));

          // Calculate total value in USD (assuming $1 per token for now)
          const token0Value = token0Amount;
          const token1Value = token1Amount * priceRatio;
          const totalValue = token0Value + token1Value;

          // Calculate tick range display
          const tickRange = `${Number(pos.tickLower)} to ${Number(
            pos.tickUpper
          )}`;
          const tickWidth = Number(pos.tickUpper) - Number(pos.tickLower);

          // Distribute profits proportionally based on liquidity
          const totalLiquidity = rawPositions.reduce(
            (sum, p) => sum + Number(p.liquidity),
            0
          );
          const positionLiquidity = Number(pos.liquidity);
          const liquidityShare =
            totalLiquidity > 0 ? positionLiquidity / totalLiquidity : 0;

          const profit0 =
            Number(formatUnits(profits0, DECIMALS)) * liquidityShare;
          const profit1 =
            Number(formatUnits(profits1, DECIMALS)) * liquidityShare;

          // Calculate APY (simplified - based on profits vs deposited amounts)
          // This is a rough estimate
          const daysActive = Math.max(
            1,
            (Date.now() / 1000 - Number(pos.depositTimestamp)) / 86400
          );
          const dailyReturn =
            totalValue > 0
              ? ((profit0 + profit1 * priceRatio) / totalValue) * 100
              : 0;
          const apy = dailyReturn * 365;

          return {
            id: index + 1,
            pair: "QRT/FYN",
            range: tickRange,
            liquidity: `${(positionLiquidity / 1e6).toFixed(2)}`,
            fees: `$${(profit0 + profit1 * priceRatio).toFixed(2)}`,
            apy: `${apy.toFixed(2)}%`,
            tokenA: {
              symbol: "QRT",
              amount: token0Amount.toFixed(6),
              price: 1, // Assuming $1 for now
              profit: profit0.toFixed(6),
              profitUsd: profit0,
            },
            tokenB: {
              symbol: "FYN",
              amount: token1Amount.toFixed(6),
              price: priceRatio,
              profit: profit1.toFixed(6),
              profitUsd: profit1 * priceRatio,
            },
            totalValue: `$${totalValue.toFixed(2)}`,
            tokenId: Number(pos.tokenId),
            tickLower: Number(pos.tickLower),
            tickUpper: Number(pos.tickUpper),
            isActive: pos.isActive,
            isJITEnabled: pos.isJITEnabled,
          };
        });

      setPositions(formattedPositions);
      console.log("Positions fetched:", formattedPositions);
    } catch (err) {
      console.error("Error fetching LP positions:", err);
      setError("Failed to fetch positions");
      setPositions([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, poolKey]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Refetch every 30 seconds
  useEffect(() => {
    if (!address || !isConnected) return;

    const interval = setInterval(() => {
      fetchPositions();
    }, 30000);

    return () => clearInterval(interval);
  }, [address, isConnected, fetchPositions]);

  return {
    positions,
    isLoading,
    error,
    refetch: fetchPositions,
  };
};

export default useGetLPPositions;
