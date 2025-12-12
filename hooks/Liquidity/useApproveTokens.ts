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

// Maximum uint256 value for unlimited approval
const MAX_UINT256 = ethers.MaxUint256;

const useApproveTokens = () => {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const { isLoading, startLoading, stopLoading } = useLoading();

  /**
   * Approve token with option for maximum approval
   * @param tokenAddress Token contract address
   * @param spenderAddress Spender address (usually router)
   * @param amount Amount to approve (if useMaxApproval is false)
   * @param useMaxApproval If true, approve maximum amount (reduces future transactions)
   */
  const approveToken = async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    useMaxApproval: boolean = true // Default to max approval
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
            "function symbol() view returns (string)",
          ],
          signer
        );
      }

      // Get token symbol for better UX
      let tokenSymbol = "Token";
      try {
        tokenSymbol = await tokenContract.symbol();
      } catch {
        // Ignore if symbol() is not available
      }

      // Check current allowance
      const currentAllowance = await tokenContract.allowance(
        address,
        spenderAddress
      );

      // Determine approval amount
      const approvalAmount = useMaxApproval ? MAX_UINT256 : BigInt(amount);

      // If already approved for sufficient amount, no need to approve again
      if (currentAllowance >= approvalAmount) {
        toast.success(`${tokenSymbol} already approved`);
        return true;
      }

      const approvalMessage = useMaxApproval
        ? `Approving unlimited ${tokenSymbol}... (one-time approval)`
        : `Approving ${tokenSymbol}...`;

      toast.message(approvalMessage);

      // Estimate gas
      const estimateGas = await tokenContract.approve.estimateGas(
        spenderAddress,
        approvalAmount
      );

      // Add 20% buffer to gas estimate
      const gasLimit = (estimateGas * BigInt(120)) / BigInt(100);

      // Approve the token
      const tx = await tokenContract.approve(spenderAddress, approvalAmount, {
        gasLimit,
      });

      toast.message("Waiting for approval confirmation...");
      const receipt = await tx.wait();

      if (!receipt.status) {
        throw new Error("Approval transaction failed");
      }

      const successMessage = useMaxApproval
        ? `${tokenSymbol} approved (unlimited) - no more approvals needed!`
        : `${tokenSymbol} approved successfully`;

      toast.success(successMessage);
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

  /**
   * Approve both tokens for a swap
   * Uses maximum approval by default to reduce future transaction costs
   */
  const approveBothTokens = async (
    token0Address: string,
    token1Address: string,
    spenderAddress: string,
    amount0: string,
    amount1: string,
    useMaxApproval: boolean = true
  ): Promise<boolean> => {
    // Approve token0 (input token)
    const token0Approved = await approveToken(
      token0Address,
      spenderAddress,
      amount0,
      useMaxApproval
    );

    if (!token0Approved) return false;

    // For swaps, we typically only need to approve the input token
    // Output token approval is usually not needed
    // If amount1 is "0", skip second approval
    if (amount1 === "0" || BigInt(amount1) === BigInt(0)) {
      return true;
    }

    // Approve token1 if needed
    const token1Approved = await approveToken(
      token1Address,
      spenderAddress,
      amount1,
      useMaxApproval
    );

    return token1Approved;
  };

  /**
   * Check current allowance for a token
   */
  const checkAllowance = async (
    tokenAddress: string,
    spenderAddress: string
  ): Promise<bigint | null> => {
    if (!walletProvider || !isConnected || !address) {
      return null;
    }

    try {
      const readWriteProvider = getProvider(walletProvider);
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          "function allowance(address owner, address spender) view returns (uint256)",
        ],
        readWriteProvider
      );

      const allowance = await tokenContract.allowance(address, spenderAddress);
      return allowance;
    } catch (error) {
      console.error("Error checking allowance:", error);
      return null;
    }
  };

  return {
    approveToken,
    approveBothTokens,
    checkAllowance,
    isLoading,
  };
};

export default useApproveTokens;
