import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { getProfitManagerContract } from "@/constants/contracts";
import { BrowserProvider, parseUnits, Eip1193Provider } from "ethers";
import { toast } from "sonner";

export interface PoolKey {
  currency0: string;
  currency1: string;
  fee: number;
  tickSpacing: number;
  hooks: string;
}

const DEFAULT_POOL_KEY: PoolKey = {
  currency0: process.env.QRT_TOKEN as string,
  currency1: process.env.FYN_TOKEN as string,
  fee: 8388608,
  tickSpacing: 60,
  hooks: process.env.HOOK as string,
};

export const useWithdrawProfits = (poolKey: PoolKey = DEFAULT_POOL_KEY) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const withdrawAllProfits = async () => {
    if (!address || !walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsWithdrawing(true);

    try {
      const provider = new BrowserProvider(
        walletClient.transport as Eip1193Provider
      );
      const signer = await provider.getSigner();
      const profitManager = getProfitManagerContract(signer);

      toast.loading("Withdrawing all profits...");

      const tx = await profitManager.withdrawProfits(poolKey, address);

      toast.loading("Transaction submitted. Waiting for confirmation...");

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success("Successfully withdrew all profits!");
        return true;
      } else {
        toast.error("Transaction failed");
        return false;
      }
    } catch (error) {
      console.error("Error withdrawing profits:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("InsufficientProfit")) {
        toast.error("No profits available to withdraw");
      } else if (errorMessage.includes("user rejected")) {
        toast.error("Transaction cancelled");
      } else {
        toast.error("Failed to withdraw profits");
      }

      return false;
    } finally {
      setIsWithdrawing(false);
      toast.dismiss();
    }
  };

  const withdrawPartialProfits = async (
    amount0: string,
    amount1: string,
    decimals: number = 6
  ) => {
    if (!address || !walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsWithdrawing(true);

    try {
      const provider = new BrowserProvider(
        walletClient.transport as Eip1193Provider
      );
      const signer = await provider.getSigner();
      const profitManager = getProfitManagerContract(signer);

      const amount0Wei = parseUnits(amount0, decimals);
      const amount1Wei = parseUnits(amount1, decimals);

      toast.loading("Withdrawing selected profits...");

      const tx = await profitManager.withdrawPartialProfits(
        poolKey,
        address,
        amount0Wei,
        amount1Wei
      );

      toast.loading("Transaction submitted. Waiting for confirmation...");

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success(
          `Successfully withdrew ${amount0} QRT and ${amount1} FYN!`
        );
        return true;
      } else {
        toast.error("Transaction failed");
        return false;
      }
    } catch (error) {
      console.error("Error withdrawing partial profits:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("InsufficientProfit")) {
        toast.error("Insufficient profit balance");
      } else if (errorMessage.includes("user rejected")) {
        toast.error("Transaction cancelled");
      } else {
        toast.error("Failed to withdraw profits");
      }

      return false;
    } finally {
      setIsWithdrawing(false);
      toast.dismiss();
    }
  };

  return {
    withdrawAllProfits,
    withdrawPartialProfits,
    isWithdrawing,
  };
};
