"use client";

import { getFYNTokenContract } from "@/constants/contracts";
import { useAccount } from "wagmi";
import { useEffect, useState, useCallback } from "react";
import { readOnlyProvider } from "@/constants/providers";
import { toast } from "sonner";
import { useLoading } from "../useLoading";

const useHasClaimedFYN = () => {
  const { address, isConnected } = useAccount();
  const [hasClaimed, setHasClaimed] = useState<boolean | null>(null);
  const { isLoading, startLoading, stopLoading } = useLoading();

  const checkHasClaimed = useCallback(async () => {
    if (!address) {
      setHasClaimed(null);
      return;
    }

    startLoading();
    try {
      const contract = getFYNTokenContract(readOnlyProvider);
      const resp = await contract.hasClaimed(address);
      setHasClaimed(resp);
    } catch (error) {
      toast.error("Error checking claim status");
      console.error("Error checking if user has claimed:", error);
      setHasClaimed(null);
    } finally {
      stopLoading();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  useEffect(() => {
    checkHasClaimed();
  }, [checkHasClaimed, isConnected]);

  return { hasClaimed, isLoading };
};

export default useHasClaimedFYN;
