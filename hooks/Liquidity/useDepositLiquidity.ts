"use client";

import { getProvider } from "@/constants/providers";
import { isSupportedChain } from "@/constants/chain";
import { getHookContract } from "@/constants/contracts";
import { toast } from "sonner";
import { useChainId, useAccount } from "wagmi";
import { useAppKitProvider, type Provider } from "@reown/appkit/react";
import { useLoading } from "../useLoading";
import { ethers } from "ethers";

type ErrorWithReason = {
  reason?: string;
  message?: string;
};

interface DepositLiquidityParams {
  poolKey: {
    currency0: string;
    currency1: string;
    fee: number;
    tickSpacing: number;
    hooks: string;
  };
  tickLower: number;
  tickUpper: number;
  amount0Desired: string; // in wei
  amount1Desired: string; // in wei
  isJITEnabled: boolean;
}

interface DepositResult {
  tokenId: string;
  liquidity: string;
  amount0: string;
  amount1: string;
}

const useDepositLiquidity = () => {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const { isLoading, startLoading, stopLoading } = useLoading();

  const deposit = async (
    params: DepositLiquidityParams
  ): Promise<DepositResult | null> => {
    if (!walletProvider) {
      toast.error(
        "Wallet provider is not available. Please try reconnecting your wallet."
      );
      return null;
    }

    if (!isConnected || !address) {
      toast.warning("Please connect your wallet first.");
      return null;
    }

    if (!isSupportedChain(chainId)) {
      toast.warning(
        "Unsupported network. Please switch to the correct network."
      );
      return null;
    }

    startLoading();

    try {
      const readWriteProvider = getProvider(walletProvider);
      const signer = await readWriteProvider.getSigner();
      const hookContract = getHookContract(signer);

      console.log("Depositing liquidity with params:", {
        poolKey: params.poolKey,
        tickLower: params.tickLower,
        tickUpper: params.tickUpper,
        amount0Desired: params.amount0Desired,
        amount1Desired: params.amount1Desired,
        isJITEnabled: params.isJITEnabled,
      });

      // Estimate gas for the transaction
      const estimateGas =
        await hookContract.depositLiquidityWithAmounts.estimateGas(
          params.poolKey,
          params.tickLower,
          params.tickUpper,
          params.amount0Desired,
          params.amount1Desired,
          params.isJITEnabled
        );

      toast.message("Approving transaction...");

      // Execute the deposit
      const tx = await hookContract.depositLiquidityWithAmounts(
        params.poolKey,
        params.tickLower,
        params.tickUpper,
        params.amount0Desired,
        params.amount1Desired,
        params.isJITEnabled,
        { gasLimit: estimateGas }
      );

      toast.message("Processing your liquidity deposit...");
      const receipt = await tx.wait();

      if (!receipt || receipt.status !== 1) {
        throw new Error("Transaction failed");
      }

      console.log("Transaction receipt:", receipt);

      // Find the LiquidityDeposited event in the logs
      const liquidityDepositedEvent = receipt.logs
        .map((log: ethers.Log) => {
          try {
            return hookContract.interface.parseLog({
              topics: [...log.topics],
              data: log.data,
            });
          } catch {
            return null;
          }
        })
        .filter(
          (
            parsedLog: ethers.LogDescription | null
          ): parsedLog is ethers.LogDescription => parsedLog !== null
        )
        .find(
          (parsedLog: ethers.LogDescription) =>
            parsedLog.name === "LiquidityDeposited"
        );

      if (liquidityDepositedEvent) {
        const result: DepositResult = {
          tokenId: liquidityDepositedEvent.args.tokenId.toString(),
          liquidity: liquidityDepositedEvent.args.liquidity.toString(),
          amount0: liquidityDepositedEvent.args.amount0.toString(),
          amount1: liquidityDepositedEvent.args.amount1.toString(),
        };

        console.log("Liquidity deposited successfully:", result);

        toast.success(
          `Liquidity deposited successfully! ${
            params.isJITEnabled ? "JIT enabled" : "Passive mode"
          }`
        );

        return result;
      }

      // Fallback: If event not found, still return success but with zeros
      console.warn("LiquidityDeposited event not found in receipt");

      toast.success(
        `Liquidity deposited successfully! ${
          params.isJITEnabled ? "JIT enabled" : "Passive mode"
        }`
      );

      return {
        tokenId: "0",
        liquidity: "0",
        amount0: "0",
        amount1: "0",
      };
    } catch (error) {
      const err = error as ErrorWithReason;
      let errorMessage = "An error occurred while depositing liquidity.";

      if (err.reason) {
        errorMessage = err.reason;
      } else if (err.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected.";
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for this transaction.";
      } else if (err.message) {
        // Log full error for debugging
        console.error("Full deposit error:", err.message);
        errorMessage = `Transaction failed: ${err.message.slice(0, 100)}`;
      }

      toast.error(errorMessage);
      console.error("Deposit liquidity error:", error);
      return null;
    } finally {
      stopLoading();
    }
  };

  return { deposit, isLoading };
};

export default useDepositLiquidity;
