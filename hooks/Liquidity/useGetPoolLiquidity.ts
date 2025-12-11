"use client";

import { useState, useEffect, useRef } from "react";
import { getPositionManagerContract } from "@/constants/contracts";
import { readOnlyProvider } from "@/constants/providers";

interface PoolKey {
  currency0: string;
  currency1: string;
  fee: number;
  tickSpacing: number;
  hooks: string;
}

interface PoolLiquidity {
  totalToken0: number; // Total token0 deposited
  totalToken1: number; // Total token1 deposited
  liquidityValue: bigint; // Raw liquidity uint128
}

const useGetPoolLiquidity = (poolKey: PoolKey | null) => {
  const [liquidity, setLiquidity] = useState<PoolLiquidity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const poolKeyRef = useRef<string>("");

  useEffect(() => {
    if (!poolKey) {
      setLiquidity(null);
      return;
    }

    const currentPoolKey = JSON.stringify(poolKey);

    if (currentPoolKey === poolKeyRef.current && liquidity !== null) {
      return;
    }

    if (isFetchingRef.current) {
      return;
    }

    const fetchPoolLiquidity = async () => {
      isFetchingRef.current = true;
      setIsLoading(true);

      try {
        const positionManager = getPositionManagerContract(readOnlyProvider);

        // Get all LPs for the pool
        const allLPs = await positionManager.getPoolLPs(poolKey);

        // Calculate total token amounts from all LP positions
        let totalToken0 = BigInt(0);
        let totalToken1 = BigInt(0);
        let totalLiquidity = BigInt(0);

        for (const lp of allLPs) {
          const positions = await positionManager.getLPPositions(poolKey, lp);

          for (const position of positions) {
            if (position.isActive) {
              totalToken0 += BigInt(position.token0Amount.toString());
              totalToken1 += BigInt(position.token1Amount.toString());
              totalLiquidity += BigInt(position.liquidity.toString());
            }
          }
        }

        // If no liquidity found, use defaults
        if (totalToken0 === BigInt(0) && totalToken1 === BigInt(0)) {
          totalToken0 = BigInt(70000 * 1e6); // 70,000 tokens with 6 decimals
          totalToken1 = BigInt(70000 * 1e6);
        }

        // Format token amounts (6 decimals)
        const token0Formatted = Number(totalToken0) / 1e6;
        const token1Formatted = Number(totalToken1) / 1e6;

        setLiquidity({
          totalToken0: token0Formatted,
          totalToken1: token1Formatted,
          liquidityValue: totalLiquidity,
        });

        poolKeyRef.current = currentPoolKey;
      } catch (error) {
        console.error("Error fetching pool liquidity:", error);
        // Set default fallback
        setLiquidity({
          totalToken0: 70000,
          totalToken1: 70000,
          liquidityValue: BigInt(0),
        });
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchPoolLiquidity();

    const interval = setInterval(() => {
      if (!isFetchingRef.current) {
        poolKeyRef.current = "";
        fetchPoolLiquidity();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [poolKey, liquidity]);

  const refetch = () => {
    if (!isFetchingRef.current) {
      poolKeyRef.current = "";
      setLiquidity(null);
    }
  };

  return { liquidity, isLoading, refetch };
};

export default useGetPoolLiquidity;
