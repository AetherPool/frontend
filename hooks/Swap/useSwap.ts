"use client";

import { useState } from "react";
import { getProvider } from "@/constants/providers";
import { isSupportedChain } from "@/constants/chain";
import {
  getHookSwapRouterContract,
  getConfigManagerContract,
  getPositionManagerContract,
} from "@/constants/contracts";
import { toast } from "sonner";
import { useChainId, useAccount } from "wagmi";
import { useAppKitProvider, type Provider } from "@reown/appkit/react";
import { ethers } from "ethers";
import { useLoading } from "../useLoading";

interface PoolKey {
  currency0: string;
  currency1: string;
  fee: number;
  tickSpacing: number;
  hooks: string;
}

interface SwapParams {
  poolKey: PoolKey;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  minAmountOut: string;
  deadline?: number;
}

interface SwapResult {
  amountOut: string;
  txHash: string;
}

type ErrorWithReason = {
  reason?: string;
  message?: string;
  data?: string;
};

type ContractError = Error & {
  data?: string;
  code?: string;
};

const useSwap = () => {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [isPreparingSwap, setIsPreparingSwap] = useState(false);

  /**
   * Get all JIT-enabled LPs for the pool
   */
  const getJITEnabledLPs = async (
    poolKey: PoolKey,
    provider: ethers.Provider
  ): Promise<string[]> => {
    try {
      const positionManager = getPositionManagerContract(provider);
      const jitLPs = await positionManager.getJITEnabledLPs(poolKey);

      console.log("JIT-enabled LPs found:", jitLPs);
      return jitLPs;
    } catch (error) {
      console.error("Error getting JIT-enabled LPs:", error);
      return [];
    }
  };

  /**
   * Decrypt minimum swap sizes and hedge percentages for JIT LPs (in parallel)
   */
  const decryptJITConfigs = async (
    poolKey: PoolKey,
    jitLPs: string[]
  ): Promise<void> => {
    if (jitLPs.length === 0) {
      console.log("No JIT LPs to decrypt");
      return;
    }

    try {
      const readWriteProvider = getProvider(walletProvider);
      const signer = await readWriteProvider.getSigner();
      const configManager = getConfigManagerContract(signer);

      console.log(
        `Decrypting configs for ${jitLPs.length} JIT LPs in parallel...`
      );

      const decryptionPromises: Promise<void>[] = [];

      for (const lp of jitLPs) {
        const decryptLP = async () => {
          try {
            const isActive = await configManager.isActive(poolKey, lp);

            if (!isActive) {
              console.log(`LP ${lp} is not active, skipping...`);
              return;
            }

            console.log(`Initiating decryption for LP: ${lp}`);

            const hasAutoHedge = await configManager.hasAutoHedgeEnabled(
              poolKey,
              lp
            );

            const minSwapTx = await configManager.decryptMinSwapSize(
              poolKey,
              lp
            );

            if (hasAutoHedge) {
              console.log(
                `LP ${lp} has auto-hedge enabled, decrypting hedge percentages...`
              );
              const hedgeTx = await configManager.decryptHedgePercentage(
                poolKey,
                lp
              );

              await Promise.all([minSwapTx.wait(), hedgeTx.wait()]);
              console.log(
                `✓ Decrypted min swap size and hedge percentages for LP ${lp}`
              );
            } else {
              await minSwapTx.wait();
              console.log(`✓ Decrypted min swap size for LP ${lp}`);
            }
          } catch (error) {
            console.error(`Failed to decrypt config for LP ${lp}:`, error);
          }
        };

        decryptionPromises.push(decryptLP());
      }

      await Promise.all(decryptionPromises);

      console.log(
        "All JIT configs decryption initiated, waiting for finalization..."
      );

      // Wait for decryptions to be fully processed
      await new Promise((resolve) => setTimeout(resolve, 10000));

      console.log("All JIT configs ready");
    } catch (error) {
      console.error("Error during JIT config decryption:", error);
      throw error;
    }
  };

  /**
   * Get a more accurate minimum output using on-chain price
   */
  const getAccurateMinOutput = async (
    poolKey: PoolKey,
    amountIn: string,
    slippagePercent: number,
    provider: ethers.Provider
  ): Promise<string> => {
    try {
      const positionManager = getPositionManagerContract(provider);

      // Get actual price ratio from contract
      const ratio = await positionManager.getPriceRatio(poolKey);
      const priceRatio = Number(ratio.toString()) / 1e18;

      // Calculate expected output
      const amountInNum = Number(ethers.formatUnits(amountIn, 6));
      const expectedOutput = amountInNum * priceRatio;

      // Apply slippage tolerance with buffer
      const slippageFactor = 1 - slippagePercent / 100;
      const minOutput = expectedOutput * slippageFactor * 0.95; // Extra 5% buffer for fees/impact

      console.log("Accurate min output calculation:", {
        amountIn: amountInNum,
        priceRatio,
        expectedOutput,
        slippagePercent,
        minOutput,
      });

      return ethers.parseUnits(minOutput.toFixed(6), 6).toString();
    } catch (error) {
      console.error("Error calculating accurate min output:", error);
      // Fallback to very conservative estimate
      const amountInNum = Number(ethers.formatUnits(amountIn, 6));
      const conservativeMin = amountInNum * 0.85; // 15% buffer
      return ethers.parseUnits(conservativeMin.toFixed(6), 6).toString();
    }
  };

  /**
   * Execute the swap
   */
  const executeSwap = async (
    params: SwapParams,
    slippagePercent: number
  ): Promise<SwapResult> => {
    if (!walletProvider) {
      throw new Error("Wallet provider is not available");
    }

    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    if (!isSupportedChain(chainId)) {
      throw new Error("Unsupported network");
    }

    const readWriteProvider = getProvider(walletProvider);
    const signer = await readWriteProvider.getSigner();
    const swapRouter = getHookSwapRouterContract(signer);

    // Set deadline (10 minutes from now if not provided)
    const deadline = params.deadline || Math.floor(Date.now() / 1000) + 600;

    // Get more accurate minimum output
    const accurateMinOut = await getAccurateMinOutput(
      params.poolKey,
      params.amountIn,
      slippagePercent,
      readWriteProvider
    );

    console.log("Executing swap with params:", {
      poolKey: params.poolKey,
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      minAmountOut: accurateMinOut,
      originalMinOut: params.minAmountOut,
      deadline,
    });

    try {
      // Estimate gas with accurate parameters
      const estimatedGas = await swapRouter.swapExactInputForOutput.estimateGas(
        params.poolKey,
        params.tokenIn,
        params.tokenOut,
        params.amountIn,
        accurateMinOut, // Use accurate min output
        deadline
      );

      // Add 30% buffer to gas estimate (JIT operations can be gas-intensive)
      const gasLimit = (estimatedGas * BigInt(130)) / BigInt(100);

      // Execute swap with accurate min output
      const tx = await swapRouter.swapExactInputForOutput(
        params.poolKey,
        params.tokenIn,
        params.tokenOut,
        params.amountIn,
        accurateMinOut,
        deadline,
        { gasLimit }
      );

      toast.message("Swap transaction submitted, waiting for confirmation...");
      const receipt = await tx.wait();

      if (!receipt.status) {
        throw new Error("Swap transaction failed");
      }

      // Parse events to get actual output amount
      let amountOut = "0";

      for (const log of receipt.logs) {
        try {
          const parsed = swapRouter.interface.parseLog({
            topics: [...log.topics],
            data: log.data,
          });

          if (parsed && parsed.name === "SwapExecuted") {
            amountOut = parsed.args.amountOut.toString();
            break;
          }
        } catch {
          continue;
        }
      }

      // If no SwapExecuted event found, try to parse Swap event
      if (amountOut === "0") {
        for (const log of receipt.logs) {
          try {
            const parsed = swapRouter.interface.parseLog({
              topics: [...log.topics],
              data: log.data,
            });

            if (parsed && parsed.name === "Swap") {
              amountOut = parsed.args.amountOut.toString();
              break;
            }
          } catch {
            continue;
          }
        }
      }

      return {
        amountOut,
        txHash: receipt.hash,
      };
    } catch (error) {
      const contractError = error as ContractError;
      console.error("Swap execution error:", contractError);

      // Better error handling
      if (contractError.data) {
        console.error("Error data:", contractError.data);
      }

      throw contractError;
    }
  };

  /**
   * Main swap function that handles the full flow
   */
  const swap = async (
    params: SwapParams,
    slippagePercent: number = 0.5
  ): Promise<SwapResult | null> => {
    if (!walletProvider) {
      toast.error("Wallet provider is not available");
      return null;
    }

    if (!isConnected || !address) {
      toast.warning("Please connect your wallet first");
      return null;
    }

    if (!isSupportedChain(chainId)) {
      toast.warning("Please switch to the correct network");
      return null;
    }

    startLoading();
    setIsPreparingSwap(true);

    try {
      const readWriteProvider = getProvider(walletProvider);

      // Step 1: Get JIT-enabled LPs
      toast.message("Checking for JIT liquidity providers...");
      const jitLPs = await getJITEnabledLPs(params.poolKey, readWriteProvider);

      // Step 2: Decrypt JIT configs if there are any JIT LPs
      if (jitLPs.length > 0) {
        toast.message(
          `Found ${jitLPs.length} JIT LP(s), preparing configurations...`
        );
        await decryptJITConfigs(params.poolKey, jitLPs);
      } else {
        toast.message("No JIT LPs found, proceeding with regular swap...");
      }

      setIsPreparingSwap(false);

      // Step 3: Execute the swap with accurate parameters
      toast.message("Executing swap...");
      const result = await executeSwap(params, slippagePercent);
      console.log("Swap executed successfully:", result);

      toast.success(
        `Swap successful! Received ${ethers.formatUnits(
          result.amountOut,
          6
        )} tokens`
      );

      return result;
    } catch (error) {
      const err = error as ErrorWithReason;
      let errorMessage = "Failed to execute swap";

      if (err.data) {
        // Try to decode the custom error
        errorMessage = `Contract error: ${err.data}`;
      } else if (err.reason) {
        errorMessage = err.reason;
      } else if (err.message) {
        if (err.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected";
        } else if (err.message.includes("insufficient")) {
          errorMessage = "Insufficient balance or allowance";
        } else if (err.message.includes("slippage")) {
          errorMessage = "Price moved beyond slippage tolerance";
        } else if (err.message.includes("execution reverted")) {
          errorMessage =
            "Transaction would fail. Try increasing slippage or reducing amount.";
        } else {
          errorMessage = err.message;
        }
      }

      toast.error(errorMessage);
      console.error("Swap error:", error);
      return null;
    } finally {
      stopLoading();
      setIsPreparingSwap(false);
    }
  };

  return {
    swap,
    isLoading,
    isPreparingSwap,
  };
};

export default useSwap;
