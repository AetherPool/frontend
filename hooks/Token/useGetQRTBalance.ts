"use client";

import { getQRTTokenContract } from "@/constants/contracts";
import { useAccount } from "@/lib/thirdweb-hooks";
import { useEffect, useState, useCallback } from "react";
import { readOnlyProvider } from "@/constants/providers";
import { toast } from "sonner";
import { formatUnits } from "ethers";

const useGetQRTBalance = () => {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<number | null>(null);

  const checkTokenBalance = useCallback(async () => {
    if (!address) return;

    try {
      const contract = getQRTTokenContract(readOnlyProvider);
      const resp = await contract.balanceOf(address);
      const formattedAmount = formatUnits(resp, 6);
      setBalance(parseFloat(formattedAmount));
    } catch (error) {
      toast.error("Error checking token balance");
      console.error("Error checking user balance:", error);
      setBalance(null);
    }
  }, [address]);

  useEffect(() => {
    checkTokenBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  return balance;
};

export default useGetQRTBalance;
