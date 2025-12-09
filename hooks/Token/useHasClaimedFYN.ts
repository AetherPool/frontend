"use client";

import { getFYNTokenContract } from "@/constants/contracts";
import { useAccount } from "@/lib/thirdweb-hooks";
import { useEffect, useState, useCallback } from "react";
import { readOnlyProvider } from "@/constants/providers";
import { toast } from "sonner";

const useHasClaimedFYN = () => {
  const { address, isConnected } = useAccount();
  const [hasClaimed, setHasClaimed] = useState<boolean | null>(null);

  const checkHasClaimed = useCallback(async () => {
    if (!address) return;

    try {
      const contract = getFYNTokenContract(readOnlyProvider);
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

export default useHasClaimedFYN;
