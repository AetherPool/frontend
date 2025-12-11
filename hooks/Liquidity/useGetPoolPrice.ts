"use client";

import { useState, useEffect, useRef } from "react";
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
  const isFetchingRef = useRef(false);
  const poolKeyRef = useRef<string>("");

  useEffect(() => {
    if (!poolKey) {
      setPrice(null);
      return;
    }

    // Create a stable key from poolKey for comparison
    const currentPoolKey = JSON.stringify(poolKey);

    // If poolKey hasn't changed and we already have a price, don't refetch
    if (currentPoolKey === poolKeyRef.current && price !== null) {
      return;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return;
    }

    const fetchPoolPrice = async () => {
      isFetchingRef.current = true;
      startLoading();

      try {
        const contract = getHookContract(readOnlyProvider);

        // Get current price from the pool
        const [sqrtPriceX96, tick] = await contract.getCurrentPrice(poolKey);
        const ratio = await contract.getPriceRatio(poolKey);

        // The ratio from contract is scaled by 1e18, so divide by 1e18
        const contractRatio = Number(ratio.toString()) / 1e18;

        setPrice({
          sqrtPriceX96: sqrtPriceX96.toString(),
          tick: Number(tick),
          ratio: contractRatio,
        });

        poolKeyRef.current = currentPoolKey;

        console.log("Pool Price fetched:", {
          sqrtPriceX96: sqrtPriceX96.toString(),
          tick: Number(tick),
          ratio: contractRatio,
        });
      } catch (error) {
        console.error("Error fetching pool price:", error);
        setPrice(null);
      } finally {
        stopLoading();
        isFetchingRef.current = false;
      }
    };

    fetchPoolPrice();

    // Optional: Set up interval for periodic updates (every 30 seconds instead of 60)
    const interval = setInterval(() => {
      if (!isFetchingRef.current) {
        poolKeyRef.current = ""; // Force refetch
        fetchPoolPrice();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [poolKey, price, startLoading, stopLoading]);

  const refetch = () => {
    if (!isFetchingRef.current) {
      poolKeyRef.current = ""; // Force refetch
      setPrice(null); // Clear current price to trigger useEffect
    }
  };

  return { price, isLoading, refetch };
};

export default useGetPoolPrice;
