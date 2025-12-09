"use client";

import { useReadContract } from "thirdweb/react";
import { useAccount } from "@/lib/thirdweb-hooks";
import { useThirdwebContracts } from "@/constants/contracts";

const useGetFYNBalance = () => {
  const { address } = useAccount();
  const { getFYNTokenContract } = useThirdwebContracts();

  const { data: balance } = useReadContract({
    contract: getFYNTokenContract,
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

export default useGetFYNBalance;
