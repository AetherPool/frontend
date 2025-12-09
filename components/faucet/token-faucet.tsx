"use client";

import { Droplets, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useHasClaimedQRT from "@/hooks/Token/useHasClaimedQRT";
import useHasClaimedFYN from "@/hooks/Token/useHasClaimedFYN";
import useClaimFYN from "@/hooks/Token/useClaimFYN";
import useClaimQRT from "@/hooks/Token/useClaimQRT";

interface Token {
  symbol: string;
  name: string;
  claimAmount: string;
  icon: string;
}

const FAUCET_TOKENS: Token[] = [
  { symbol: "FYN", name: "Fyntera", claimAmount: "1,000,000", icon: "F" },
  { symbol: "QRT", name: "Quarita", claimAmount: "1,000,000", icon: "Q" },
];

export function TokenFaucet() {
  const { hasClaimed: hasClaimedQRT, isLoading: isCheckingQRT } =
    useHasClaimedQRT();
  const { hasClaimed: hasClaimedFYN, isLoading: isCheckingFYN } =
    useHasClaimedFYN();
  const { claim: claimFYN, isLoading: isClaimingFYN } = useClaimFYN();
  const { claim: claimQRT, isLoading: isClaimingQRT } = useClaimQRT();

  const handleClaim = async (symbol: string) => {
    if (symbol === "FYN") {
      await claimFYN();
    } else if (symbol === "QRT") {
      await claimQRT();
    }
  };

  const getClaimStatus = (symbol: string) => {
    if (symbol === "FYN") {
      return {
        hasClaimed: hasClaimedFYN,
        isLoading: isClaimingFYN,
        isCheckingClaim: isCheckingFYN,
      };
    } else if (symbol === "QRT") {
      return {
        hasClaimed: hasClaimedQRT,
        isLoading: isClaimingQRT,
        isCheckingClaim: isCheckingQRT,
      };
    }
    return { hasClaimed: null, isLoading: false, isCheckingClaim: false };
  };

  return (
    <div className="bg-linear-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 w-full max-w-md">
      <div className="flex items-center gap-2 mb-2">
        <Droplets className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">Test Token Faucet</h3>
      </div>
      <p className="text-sm text-gray-400 mb-6">
        Claim free test tokens to try out AetherPool
      </p>

      <div className="space-y-3">
        {FAUCET_TOKENS.map((token) => {
          const { hasClaimed, isLoading, isCheckingClaim } = getClaimStatus(
            token.symbol
          );

          return (
            <div
              key={token.symbol}
              className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center text-xl font-bold text-cyan-400">
                  {token.icon}
                </div>
                <div>
                  <div className="font-medium text-white">{token.symbol}</div>
                  <div className="text-sm text-gray-400">{token.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">
                  {token.claimAmount} {token.symbol}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleClaim(token.symbol)}
                  disabled={isLoading || isCheckingClaim || hasClaimed === true}
                  className={`min-w-20 ${
                    hasClaimed === true
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                  }`}
                >
                  {isLoading || isCheckingClaim ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : hasClaimed === true ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    "Claim"
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
        <p className="text-xs text-cyan-300">
          These are test tokens on the testnet. They have no real value and are
          meant for testing the AetherPool protocol.
        </p>
      </div>
    </div>
  );
}
