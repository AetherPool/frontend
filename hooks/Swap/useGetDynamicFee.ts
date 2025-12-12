"use client";

import { useState, useEffect } from "react";
import { getFeeManagerContract } from "@/constants/contracts";
import { readOnlyProvider } from "@/constants/providers";

type FeeLevel = "HIGH_GAS" | "NORMAL" | "LOW_GAS";

const useGetDynamicFee = () => {
  const [currentFee, setCurrentFee] = useState<number | null>(null);
  const [feeLevel, setFeeLevel] = useState<FeeLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDynamicFee = async () => {
      setIsLoading(true);

      try {
        const feeManager = getFeeManagerContract(readOnlyProvider);

        // Get current fee without updating state (view function)
        const [fee, level] = await feeManager.getCurrentFee();

        setCurrentFee(Number(fee));

        // Convert enum to string
        const levelMap: { [key: number]: FeeLevel } = {
          0: "LOW_GAS",
          1: "NORMAL",
          2: "HIGH_GAS",
        };

        setFeeLevel(levelMap[Number(level)] || "NORMAL");

        console.log("Dynamic fee fetched:", {
          fee: Number(fee),
          feePercent: (Number(fee) / 10000) * 100,
          level: levelMap[Number(level)],
        });
      } catch (error) {
        console.error("Error fetching dynamic fee:", error);
        // Default to 0.3% (3000 basis points)
        setCurrentFee(3000);
        setFeeLevel("NORMAL");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDynamicFee();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDynamicFee();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return { currentFee, feeLevel, isLoading };
};

export default useGetDynamicFee;
