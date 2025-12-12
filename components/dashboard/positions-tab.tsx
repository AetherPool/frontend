"use client";
import { useState } from "react";
import {
  Droplets,
  Plus,
  Coins,
  ArrowDownToLine,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPositionModal } from "@/components/modals/add-position-modal";
import { ManagePositionModal } from "@/components/modals/manage-position-modal";
import useGetLPPositions, { Position } from "@/hooks/useGetLPPositions";
import { useAccount } from "wagmi";

export function PositionsTab() {
  const { isConnected } = useAccount();
  const { positions, isLoading, refetch } = useGetLPPositions();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );

  const handleManageClick = (position: Position) => {
    setSelectedPosition(position);
    setManageModalOpen(true);
  };

  const handleWithdrawProfit = (
    position: Position,
    token: "tokenA" | "tokenB"
  ) => {
    const tokenData = position[token];
    console.log(
      `Withdrawing ${tokenData.profit} ${tokenData.symbol} profit from position ${position.id}`
    );
    // This would trigger the actual withdrawal transaction
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Droplets className="w-16 h-16 text-gray-500" />
        <h3 className="text-xl font-semibold text-gray-400">
          Connect Wallet to View Positions
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          Connect your wallet to view and manage your liquidity positions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">
            Your Liquidity Positions
          </h2>
          <Button
            onClick={refetch}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className="text-gray-400 hover:text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
        <Button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Position</span>
        </Button>
      </div>

      {isLoading && positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
          <p className="text-gray-400">Loading your positions...</p>
        </div>
      ) : positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Droplets className="w-16 h-16 text-gray-500" />
          <h3 className="text-xl font-semibold text-gray-400">
            No Positions Yet
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Add your first liquidity position to start earning fees
          </p>
          <Button
            onClick={() => setAddModalOpen(true)}
            className="mt-4 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Position
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {positions.map((position) => (
            <div
              key={position.id}
              className="bg-linear-to-br from-slate-900/60 to-slate-900/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all group"
            >
              <div className="flex flex-col space-y-4">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-linear-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                      <Droplets className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {position.pair}
                        {position.isJITEnabled && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                            JIT Active
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Range: {position.range}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">
                        Your Liquidity
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-white text-sm">
                          {position.tokenA.amount} {position.tokenA.symbol}
                        </div>
                        <div className="font-semibold text-white text-sm">
                          {position.tokenB.amount} {position.tokenB.symbol}
                        </div>
                        <div className="text-xs text-cyan-400 mt-2">
                          ≈ {position.totalValue}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">
                        Total Fees
                      </div>
                      <div className="font-semibold text-green-400">
                        {position.fees}
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-xs text-gray-400 mb-1">APY</div>
                      <div className="font-semibold text-cyan-400">
                        {position.apy}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleManageClick(position)}
                    className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-purple-500/50 text-white rounded-lg transition-all text-sm font-medium"
                  >
                    Manage
                  </button>
                </div>

                {/* Profits Section */}
                {(Number(position.tokenA.profit) > 0 ||
                  Number(position.tokenB.profit) > 0) && (
                  <div className="border-t border-slate-700/50 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Coins className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-gray-300">
                        Accrued Profits (Withdrawable)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Token A Profit */}
                      {Number(position.tokenA.profit) > 0 && (
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <div className="text-xs text-gray-400 mb-1">
                              {position.tokenA.symbol} Profit
                            </div>
                            <div className="font-semibold text-green-400">
                              +{position.tokenA.profit} {position.tokenA.symbol}
                            </div>
                            <div className="text-xs text-gray-500">
                              ≈ ${position.tokenA.profitUsd?.toFixed(2)}
                            </div>
                          </div>
                          <Button
                            onClick={() =>
                              handleWithdrawProfit(position, "tokenA")
                            }
                            size="sm"
                            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 text-xs px-3"
                          >
                            <ArrowDownToLine className="w-3 h-3 mr-1" />
                            Withdraw
                          </Button>
                        </div>
                      )}

                      {/* Token B Profit */}
                      {Number(position.tokenB.profit) > 0 && (
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <div className="text-xs text-gray-400 mb-1">
                              {position.tokenB.symbol} Profit
                            </div>
                            <div className="font-semibold text-green-400">
                              +{position.tokenB.profit} {position.tokenB.symbol}
                            </div>
                            <div className="text-xs text-gray-500">
                              ≈ ${position.tokenB.profitUsd?.toFixed(2)}
                            </div>
                          </div>
                          <Button
                            onClick={() =>
                              handleWithdrawProfit(position, "tokenB")
                            }
                            size="sm"
                            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 text-xs px-3"
                          >
                            <ArrowDownToLine className="w-3 h-3 mr-1" />
                            Withdraw
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddPositionModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      <ManagePositionModal
        open={manageModalOpen}
        onOpenChange={setManageModalOpen}
        position={selectedPosition || undefined}
      />
    </div>
  );
}
