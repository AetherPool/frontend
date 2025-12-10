"use client";

import { getQRTTokenContract } from "@/constants/contracts";
import { useAccount } from "wagmi";
import { useEffect, useState, useCallback } from "react";
import { readOnlyProvider } from "@/constants/providers";
import { toast } from "sonner";

const useHasClaimedQRT = () => {
  const { address, isConnected } = useAccount();
  const [hasClaimed, setHasClaimed] = useState<boolean | null>(null);

  const checkHasClaimed = useCallback(async () => {
    if (!address) return;

    try {
      const contract = getQRTTokenContract(readOnlyProvider);
      const resp = await contract.hasClaimed(address);
      setHasClaimed(resp);
    } catch (error) {
      toast.error("Error checking claim status");
      console.error("Error checking if user has claimed:", error);
      setHasClaimed(null);
    }
  }, [address]);

  useEffect(() => {
    checkHasClaimed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  return hasClaimed;
};

export default useHasClaimedQRT;
