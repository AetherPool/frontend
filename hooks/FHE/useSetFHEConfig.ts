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

      toast.message("Initializing FHE encryption...");

      // Import cofhejs dynamically
      const { cofhejs, Encryptable } = await import("cofhejs/web");

      // Initialize cofhejs with ethers provider
      await cofhejs.initializeWithEthers({
        ethersProvider: readWriteProvider,
        ethersSigner: signer,
        environment: "TESTNET", // Change to "MAINNET" for production
      });

      console.log("Encrypting parameters with FHE...");

      // Callback to track encryption state
      const logState = (state: string) => {
        console.log(`Encryption state: ${state}`);
        if (state === "Extract") {
          toast.message("Preparing data for encryption...");
        } else if (state === "Prove") {
          toast.message("Signing encrypted data...");
        } else if (state === "Verify") {
          toast.message("Verifying encrypted data...");
        }
      };

      // Convert minSwapSize string to bigint
      const minSwapSizeValue = BigInt(params.minSwapSize);

      // Encrypt all three parameters using cofhejs
      // minSwapSize needs uint128, hedge percentages need uint32
      const encryptedResult = await cofhejs.encrypt(
        [
          Encryptable.uint128(minSwapSizeValue),
          Encryptable.uint32(BigInt(params.hedgePercentage0)),
          Encryptable.uint32(BigInt(params.hedgePercentage1)),
        ],
        logState
      );

      // Extract the encrypted values
      if (!encryptedResult.data) {
        throw new Error("Encryption result is null.");
      }
      const [minSwapSizeInput, hedgePercentage0Input, hedgePercentage1Input] =
        encryptedResult.data;

      console.log("Encrypted values:", {
        minSwapSize: minSwapSizeInput,
        hedge0: hedgePercentage0Input,
        hedge1: hedgePercentage1Input,
      });

      const poolKeyStruct = {
        currency0: params.poolKey.currency0,
        currency1: params.poolKey.currency1,
        fee: params.poolKey.fee,
        tickSpacing: params.poolKey.tickSpacing,
        hooks: params.poolKey.hooks,
      };

      console.log("Submitting encrypted configuration to contract...");
      toast.message("Submitting encrypted configuration...");

      // Estimate gas with buffer for encryption overhead
      let estimateGas: bigint;
      try {
        estimateGas = await configContract.configureLPSettings.estimateGas(
          poolKeyStruct,
          minSwapSizeInput,
          hedgePercentage0Input,
          hedgePercentage1Input,
          params.autoHedgeEnabled
        );
      } catch (estimateError) {
        console.warn("Gas estimation failed, using fallback:", estimateError);
        estimateGas = BigInt(800000); // Higher fallback for FHE operations
      }

      // Execute transaction with gas buffer
      const gasLimit = (estimateGas * BigInt(150)) / BigInt(100); // 50% buffer

      const tx = await configContract.configureLPSettings(
        poolKeyStruct,
        minSwapSizeInput,
        hedgePercentage0Input,
        hedgePercentage1Input,
        params.autoHedgeEnabled,
        { gasLimit }
      );

      toast.message("Waiting for confirmation...");
      const receipt = await tx.wait(2);

      if (!receipt || receipt.status !== 1) {
        throw new Error("Transaction failed");
      }

      toast.success("JIT configuration encrypted and stored!");
      console.log("Configuration set successfully:", receipt.hash);
      return true;
    } catch (error) {
      const err = error as ErrorWithReason;
      let errorMessage = "An error occurred while setting FHE configuration.";

      if (err.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected.";
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for this transaction.";
      } else if (err.message?.includes("invalid tuple")) {
        errorMessage = "Invalid pool key format. Please try again.";
      } else if (err.message?.includes("Failed to encrypt")) {
        errorMessage =
          "Encryption failed. Please ensure you're on the correct network.";
      } else if (err.message?.includes("not initialized")) {
        errorMessage =
          "FHE client not initialized. Please refresh and try again.";
      } else if (err.reason) {
        errorMessage = err.reason;
      } else if (err.message) {
        // For debugging, include part of the error message
        const shortMsg = err.message.slice(0, 100);
        errorMessage = `Error: ${shortMsg}${
          err.message.length > 100 ? "..." : ""
        }`;
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
