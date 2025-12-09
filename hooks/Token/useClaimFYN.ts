"use client";

import { useCallback } from "react";
import { getProvider } from "@/constants/providers";
import { isSupportedChain } from "@/constants/chain";
import { getFYNTokenContract } from "@/constants/contracts";
import { toast } from "sonner";
import { useChainId, useAccount } from "wagmi";
import { useAppKitProvider, type Provider } from "@reown/appkit/react";
import { useLoading } from "../useLoading";

type ErrorWithReason = {
  reason?: string;
  message?: string;
};

const useClaimFYN = () => {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const { isLoading, startLoading, stopLoading } = useLoading();

  const claim = useCallback(
    async () => {
      if (!walletProvider) {
        toast.error(
          "Wallet provider is not available. Please try reconnecting your wallet."
        );
        return;
      }

      if (!isConnected) {
        toast.warning("Please connect your wallet first.");
        return;
      }
      if (!isSupportedChain(chainId)) {
        toast.warning(
          "Unsupported network. Please switch to the correct network."
        );
        return;
      }

      const readWriteProvider = getProvider(walletProvider);
      const signer = await readWriteProvider.getSigner();
      const contract = getFYNTokenContract(signer);

      startLoading();

      try {
        const estimateGas = await contract.claim.estimateGas();
        const tx = await contract.claim({ gasLimit: estimateGas });

        toast.message("Please wait while we process your transaction.");
        const receipt = await tx.wait();

        if (!receipt.status) {
          throw new Error("Transaction failed");
        }
        toast.success("Token claimed successfully");
      } catch (error) {
        const err = error as ErrorWithReason;
        const errorMessage =
          err.reason === "Already claimed"
            ? "You have already claimed your token."
            : "An error occurred while claiming the token.";
        toast.error(errorMessage);
        console.error("Registration error:", error);
      } finally {
        stopLoading();
      }
    },

    [walletProvider, isConnected, chainId, startLoading, stopLoading]
  );

    return { claim, isLoading };
};

export default useClaimFYN;
