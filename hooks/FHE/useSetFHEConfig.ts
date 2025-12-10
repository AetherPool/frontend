"use client";

import { getProvider } from "@/constants/providers";
import { isSupportedChain } from "@/constants/chain";
import { getConfigManagerContract } from "@/constants/contracts";
import { toast } from "sonner";
import { useChainId, useAccount } from "wagmi";
import { useAppKitProvider, type Provider } from "@reown/appkit/react";
import { useLoading } from "../useLoading";

type ErrorWithReason = {
  reason?: string;
  message?: string;
};

interface SetFHEConfigParams {
  poolKey: {
    currency0: string;
    currency1: string;
    fee: number;
    tickSpacing: number;
    hooks: string;
  };
  minSwapSize: string; // in wei
  hedgePercentage0: number; // 0-100
  hedgePercentage1: number; // 0-100
  autoHedgeEnabled: boolean;
}

const useSetFHEConfig = () => {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const { isLoading, startLoading, stopLoading } = useLoading();

  const setConfig = async (params: SetFHEConfigParams): Promise<boolean> => {
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
      const configContract = getConfigManagerContract(signer);

      toast.message("Encrypting JIT parameters...");

      // FIXED: Use object for PoolKey struct (named fields match ABI)
      const poolKeyStruct = {
        currency0: params.poolKey.currency0,
        currency1: params.poolKey.currency1,
        fee: params.poolKey.fee,
        tickSpacing: params.poolKey.tickSpacing,
        hooks: params.poolKey.hooks,
      };

      console.log("Setting FHE config with params:", {
        poolKeyStruct,
        minSwapSize: params.minSwapSize,
        hedgePercentage0: params.hedgePercentage0,
        hedgePercentage1: params.hedgePercentage1,
        autoHedgeEnabled: params.autoHedgeEnabled,
      });

      // Estimate gas with struct object
      const estimateGas = await configContract.configureLPSettings.estimateGas(
        poolKeyStruct, // Object, not array
        params.minSwapSize,
        params.hedgePercentage0,
        params.hedgePercentage1,
        params.autoHedgeEnabled
      );

      // Execute with struct object
      const tx = await configContract.configureLPSettings(
        poolKeyStruct, // Object, not array
        params.minSwapSize,
        params.hedgePercentage0,
        params.hedgePercentage1,
        params.autoHedgeEnabled,
        { gasLimit: estimateGas }
      );

      toast.message("Waiting for confirmation...");
      const receipt = await tx.wait();

      if (!receipt.status) {
        throw new Error("Transaction failed");
      }

      toast.success("JIT configuration encrypted and stored!");
      return true;
    } catch (error) {
      const err = error as ErrorWithReason;
      let errorMessage = "An error occurred while setting FHE configuration.";

      if (err.reason) {
        errorMessage = err.reason;
      } else if (err.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected.";
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for this transaction.";
      } else if (err.message?.includes("invalid tuple")) {
        errorMessage = "Invalid pool key format. Please try again.";
      }

      toast.error(errorMessage);
      console.error("Set FHE config error:", error);
      return false;
    } finally {
      stopLoading();
    }
  };

  return { setConfig, isLoading };
};

export default useSetFHEConfig;
