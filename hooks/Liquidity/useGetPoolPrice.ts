"use client";

import { useState, useEffect, useCallback } from "react";
import { getHookContract } from "@/constants/contracts";
import { readOnlyProvider } from "@/constants/providers";
import { useLoading } from "../useLoading";

interface PoolKey {
  currency0: string;
  currency1: string;
  fee: number;
  tickSpacing: number;
  hooks: string;
}

interface PoolPrice {
  sqrtPriceX96: string;
  tick: number;
  ratio: number; // Actual price ratio (token1/token0)
}

const useGetPoolPrice = (poolKey: PoolKey | null) => {
  const [price, setPrice] = useState<PoolPrice | null>(null);
  const { isLoading, startLoading, stopLoading } = useLoading();

  const fetchPoolPrice = useCallback(async () => {
    if (!poolKey) return;

    startLoading();
    try {
      const contract = getHookContract(readOnlyProvider);

      // Get current price from the pool
      const [sqrtPriceX96, tick] = await contract.getCurrentPrice(poolKey);

      // Get the human-readable price ratio
      const ratio = await contract.getPriceRatio(poolKey);

      setPrice({
        sqrtPriceX96: sqrtPriceX96.toString(),
        tick: tick,
        ratio: parseFloat(ratio.toString()) / 1e12, // Assuming ratio is scaled by 1e18
      });
    } catch (error) {
      console.error("Error fetching pool price:", error);
      // Don't show error toast on initial load, just log it
      setPrice(null);
    } finally {
      stopLoading();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolKey]);

  useEffect(() => {
    fetchPoolPrice();

    // Optionally refresh price every 10 seconds
    const interval = setInterval(fetchPoolPrice, 10000);

    return () => clearInterval(interval);
  }, [fetchPoolPrice]);

  return { price, isLoading, refetch: fetchPoolPrice };
};

export default useGetPoolPrice;
