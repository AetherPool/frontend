"use client";

import { getProvider } from "@/constants/providers";
import { isSupportedChain } from "@/constants/chain";
import {
  getFYNTokenContract,
  getQRTTokenContract,
} from "@/constants/contracts";
import { toast } from "sonner";
import { useChainId, useAccount } from "wagmi";
import { useAppKitProvider, type Provider } from "@reown/appkit/react";
import { ethers } from "ethers";
import { useLoading } from "../useLoading";

type ErrorWithReason = {
  reason?: string;
  message?: string;
};

const useApproveTokens = () => {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const { isLoading, startLoading, stopLoading } = useLoading();

  const approveToken = async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string
  ): Promise<boolean> => {
    if (!walletProvider) {
      toast.error(
        "Wallet provider is not available. Please try reconnecting your wallet."
      );
      return false;
    }

    if (!isConnected || !address) {
      toast.warning("Please connect your wallet first.");
      return false;
    }

    if (!isSupportedChain(chainId)) {
      toast.warning(
        "Unsupported network. Please switch to the correct network."
      );
      return false;
    }

    startLoading();

    try {
      const readWriteProvider = getProvider(walletProvider);
      const signer = await readWriteProvider.getSigner();

      // Get the token contract based on address
      let tokenContract;
      if (tokenAddress.toLowerCase() === process.env.FYN_TOKEN?.toLowerCase()) {
        tokenContract = getFYNTokenContract(signer);
      } else if (
        tokenAddress.toLowerCase() === process.env.QRT_TOKEN?.toLowerCase()
      ) {
        tokenContract = getQRTTokenContract(signer);
      } else {
        // Generic ERC20 contract
        tokenContract = new ethers.Contract(
          tokenAddress,
          [
            "function approve(address spender, uint256 amount) returns (bool)",
            "function allowance(address owner, address spender) view returns (uint256)",
          ],
          signer
        );
      }

      // Check current allowance
      const currentAllowance = await tokenContract.allowance(
        address,
        spenderAddress
      );

      // If already approved for this amount or more, no need to approve again
      if (currentAllowance >= BigInt(amount)) {
        toast.success("Token already approved");
        return true;
      }

      toast.message("Approving token...");

      // Estimate gas
      const estimateGas = await tokenContract.approve.estimateGas(
        spenderAddress,
        amount
      );

      // Approve the token
      const tx = await tokenContract.approve(spenderAddress, amount, {
        gasLimit: estimateGas,
      });

      toast.message("Waiting for approval confirmation...");
      const receipt = await tx.wait();

      if (!receipt.status) {
        throw new Error("Approval transaction failed");
      }

      toast.success("Token approved successfully");
      return true;
    } catch (error) {
      const err = error as ErrorWithReason;
      let errorMessage = "An error occurred while approving token.";

      if (err.reason) {
        errorMessage = err.reason;
      } else if (err.message?.includes("user rejected")) {
        errorMessage = "Approval was rejected.";
      }

      toast.error(errorMessage);
      console.error("Token approval error:", error);
      return false;
    } finally {
      stopLoading();
    }
  };

  const approveBothTokens = async (
    token0Address: string,
    token1Address: string,
    spenderAddress: string,
    amount0: string,
    amount1: string
  ): Promise<boolean> => {
    // Approve token0
    const token0Approved = await approveToken(
      token0Address,
      spenderAddress,
      amount0
    );
    if (!token0Approved) return false;

    // Approve token1
    const token1Approved = await approveToken(
      token1Address,
      spenderAddress,
      amount1
    );
    return token1Approved;
  };

  return { approveToken, approveBothTokens, isLoading };
};

export default useApproveTokens;
