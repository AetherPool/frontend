"use client";

import { useReadContract } from "thirdweb/react";
import { useAccount } from "@/lib/thirdweb-hooks";
import { useThirdwebContracts } from "@/constants/contracts";

const useHasClaimedFYN = () => {
  const { address } = useAccount();
  const { getFYNTokenContract } = useThirdwebContracts();

  const { data: hasClaimed, isLoading } = useReadContract({
    contract: getFYNTokenContract,
    method: "function hasClaimed(address) view returns (bool)",
    params: [address as string],
    queryOptions: {
      enabled: !!address,
    },
  });

  return {
    hasClaimed: hasClaimed ?? null,
    isLoading,
  };
};

export default useHasClaimedFYN;
