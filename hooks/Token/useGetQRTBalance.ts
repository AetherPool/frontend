"use client";

import { useReadContract } from "thirdweb/react";
import { useAccount } from "@/lib/thirdweb-hooks";
import { useThirdwebContracts } from "@/constants/contracts";

const useGetQRTBalance = () => {
  const { address } = useAccount();
  const { getQRTTokenContract } = useThirdwebContracts();

  const { data: balance } = useReadContract({
    contract: getQRTTokenContract,
    method: "function balanceOf(address) view returns (uint256)",
    params: [address as string],
    queryOptions: {
      enabled: !!address,
    },
  });

  // Convert BigInt to number with 6 decimals
  const formattedBalance = balance ? Number(balance) / 10 ** 6 : null;

  return formattedBalance;
};

export default useGetQRTBalance;
