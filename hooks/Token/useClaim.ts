"use client";

import { useCallback } from "react";
import { useAccount, useChainId, useSignMessage } from "@/lib/thirdweb-hooks";
import { toast } from "sonner";
import { isSupportedChain } from "@/constants/chain";
import { useLoading } from "../useLoading";
import { useRouter } from "next/navigation";

export const useClaim = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const router = useRouter();
  const RELAYER_URL = process.env.RELAYER_URL;

  const claim = useCallback(async () => {
    if (!isConnected || !address) {
      toast.warning("Please connect your wallet first.");
      return;
    }
    if (!isSupportedChain(chainId)) {
      toast.warning(
        "Unsupported network. Please switch to the correct network."
      );
      return;
    }

    startLoading();
    try {
      if (!RELAYER_URL) {
        throw new Error("Relayer URL is not defined");
      }

      const nonceResponse = await fetch(`${RELAYER_URL}/nonce/${address}`);
      const { nonce } = await nonceResponse.json();

      const functionName = "claim";
      const params = {};
      const gaslessMessage = JSON.stringify({
        functionName,
        user: address,
        params,
        nonce,
      });
      const gaslessSignature = await signMessageAsync(gaslessMessage);

      const response = await fetch(`${RELAYER_URL}/gasless-transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          functionName,
          user: address,
          params,
          signature: gaslessSignature,
          nonce,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Tokens claimed successfully");

        router.push("/authenticate/register/client");
      } else {
        toast.error(`Error: ${result.message}`);
      }
    } catch (error: unknown) {
      if ((error as Error).message.includes("User rejected")) {
        toast.info("Signature request cancelled");
      } else {
        toast.error("Error during claim");
        console.error(error);
      }
    } finally {
      stopLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isConnected, chainId, signMessageAsync]);

  return { claim, isLoading };
};
