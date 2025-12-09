"use client";

import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { prepareContractCall, sendTransaction } from "thirdweb";
import { toast } from "sonner";
import { useThirdwebContracts } from "@/constants/contracts";
import { isSupportedChain } from "@/constants/chain";
import { useState } from "react";

const useClaimQRT = () => {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
  const { getQRTTokenContract } = useThirdwebContracts();
  const [isLoading, setIsLoading] = useState(false);

  const claim = async () => {
    if (!account) {
      toast.warning("Please connect your wallet first.");
      return false;
    }
    if (!chain || !isSupportedChain(chain.id)) {
      toast.warning(
        "Unsupported network. Please switch to the correct network."
      );
      return false;
    }

    setIsLoading(true);

    try {
      // Prepare the contract call
      const transaction = prepareContractCall({
        contract: getQRTTokenContract,
        method: "function claim(address _user)",
        params: [account.address],
      });

      // Send the transaction
      const { transactionHash } = await sendTransaction({
        account,
        transaction,
      });

      toast.success(`QRT token claimed successfully! TX: ${transactionHash}`);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message.includes("Already claimed")
          ? "You have already claimed your QRT tokens."
          : "An error occurred while claiming the token.";
      toast.error(errorMessage);
      console.error("Claim error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { claim, isLoading };
};

export default useClaimQRT;
