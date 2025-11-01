"use client";
import { useState } from "react";
import { Droplets, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPositionModal } from "@/components/modals/add-position-modal";
import { ManagePositionModal } from "@/components/modals/manage-position-modal";

interface Position {
  id: number;
  pair: string;
  range: string;
  liquidity: string;
  fees: string;
  apy: string;
}

interface PositionsTabProps {
  positions: Position[];
}

export function PositionsTab({ positions }: PositionsTabProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );

  const handleManageClick = (position: Position) => {
    setSelectedPosition(position);
    setManageModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">
          Your Liquidity Positions
        </h2>
        <Button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Position</span>
        </Button>
      </div>

      <div className="grid gap-4">
        {positions.map((position) => (
          <div
            key={position.id}
            className="bg-linear-to-br from-slate-900/60 to-slate-900/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-linear-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {position.pair}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Range: {position.range}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Liquidity</div>
                  <div className="font-semibold text-white">
                    {position.liquidity}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Fees Earned</div>
                  <div className="font-semibold text-green-400">
                    {position.fees}
                  </div>
                </div>
                <div>
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
          </div>
        ))}
      </div>

      <AddPositionModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      <ManagePositionModal
        open={manageModalOpen}
        onOpenChange={setManageModalOpen}
        position={selectedPosition || undefined}
      />
    </div>
  );
}
