import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { FluidNodeFocus } from './FluidNodeFocus'
import type { DashboardSummary, InventoryItem, ForecastItem, RiskItem, TransferItem } from '../../types'

interface FluidLivingNetworkProps {
  summary: DashboardSummary | null
  inventory: InventoryItem[]
  forecasts: ForecastItem[]
  risks: RiskItem[]
  transfers: TransferItem[]
  onNavigateToMove: () => void
}

interface AnchorNode {
  id: string
  name: string
  x: number
  y: number
  units: number
  isRisk: boolean
  isColdIssue: boolean
}

const ANCHORS: AnchorNode[] = [
  { id: 'delhi', name: 'Delhi', x: 420, y: 100, units: 1420, isRisk: false, isColdIssue: false },
  { id: 'mumbai', name: 'Mumbai', x: 190, y: 270, units: 890, isRisk: false, isColdIssue: false },
  { id: 'hyderabad', name: 'Hyderabad', x: 460, y: 290, units: 480, isRisk: false, isColdIssue: false },
  { id: 'bengaluru', name: 'Bengaluru', x: 370, y: 440, units: 620, isRisk: true, isColdIssue: false },
  { id: 'chennai', name: 'Chennai', x: 550, y: 430, units: 580, isRisk: false, isColdIssue: false },
]

export function FluidLivingNetwork({
  summary,
  inventory,
  forecasts,
  risks,
  transfers,
  onNavigateToMove,
}: FluidLivingNetworkProps) {
  const [focusedAnchor, setFocusedAnchor] = useState<AnchorNode | null>(null)

  const totalUnits = summary ? summary.total_inventory.toLocaleString() : '3,216'
  const highRisk = summary ? summary.high_risk : 3
  const nearExpiry = summary ? summary.near_expiry : 56
  const movements = transfers.length || (summary ? summary.active_transfers : 8)

  return (
    <div className="relative w-full min-h-[85vh] flex flex-col justify-between py-12 px-4 sm:px-8 select-none">
      {/* 1. ELEGANT HOME HEADING (MOSTLY OPEN SPACE) */}
      <div className="space-y-1.5 pt-6 max-w-xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#F4EFE7] font-serif leading-[1.08]">
          Blood, in motion.
        </h1>
        <p className="text-xs sm:text-sm font-mono tracking-widest text-[#9A8BC7] uppercase">
          5 connected blood banks across the fluid network.
        </p>
      </div>

      {/* 2. SPATIAL NETWORK CANVAS EMBEDDED IN THE FLUID FLOW */}
      <div className="relative w-full max-w-5xl mx-auto aspect-[16/9] flex items-center justify-center my-4">
        <svg viewBox="0 0 740 540" className="w-full h-full" role="img" aria-label="Living blood flow network">
          {/* Vascular Connecting Curves */}
          <path d="M 420 100 Q 280 170 190 270" fill="none" stroke="rgba(154, 139, 199, 0.15)" strokeWidth="1.5" />
          <path d="M 420 100 Q 450 190 460 290" fill="none" stroke="rgba(154, 139, 199, 0.15)" strokeWidth="1.5" />
          <path d="M 190 270 Q 300 350 370 440" fill="none" stroke="rgba(154, 139, 199, 0.15)" strokeWidth="1.5" />
          <path d="M 460 290 Q 520 360 550 430" fill="none" stroke="rgba(154, 139, 199, 0.15)" strokeWidth="1.5" />
          <path d="M 370 440 Q 460 430 550 430" fill="none" stroke="rgba(154, 139, 199, 0.15)" strokeWidth="1.5" />

          {/* Active Flowing Vascular Streams with Blood Particles */}
          {/* Delhi -> Mumbai Stream */}
          <path d="M 420 100 Q 280 170 190 270" fill="none" stroke="#E96B73" strokeWidth="2.5" strokeDasharray="6 14" className="animate-vascular-flow" opacity="0.85" />
          {/* Chennai -> Bengaluru Stream */}
          <path d="M 550 430 Q 460 430 370 440" fill="none" stroke="#E96B73" strokeWidth="2.5" strokeDasharray="6 14" className="animate-vascular-flow" opacity="0.85" />

          {/* Luminous Blood Bank Anchors */}
          {ANCHORS.map((node) => {
            const isSelected = focusedAnchor?.id === node.id

            return (
              <g
                key={node.id}
                onClick={() => setFocusedAnchor(node)}
                className="cursor-pointer transition-transform duration-500 hover:scale-110"
              >
                {/* Soft Surrounding Ring (Breathing or Risk Coral) */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 32 : 24}
                  fill="none"
                  stroke={node.isRisk ? '#E96B73' : node.isColdIssue ? '#70B9C6' : '#9A8BC7'}
                  strokeWidth="1.5"
                  opacity={node.isRisk ? 0.9 : 0.4}
                  className={node.isRisk ? 'animate-pulse' : 'animate-node-breathe'}
                />

                {/* Central Luminous Core */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={8}
                  fill={node.isRisk ? '#E96B73' : '#F4EFE7'}
                  className="transition-all"
                />

                {/* City Typography Label */}
                <text
                  x={node.x}
                  y={node.y + 38}
                  textAnchor="middle"
                  fill="#F4EFE7"
                  fontSize="13"
                  fontWeight="300"
                  fontFamily="serif"
                  letterSpacing="0.05em"
                >
                  {node.name}
                </text>

                <text
                  x={node.x}
                  y={node.y + 52}
                  textAnchor="middle"
                  fill={node.isRisk ? '#E96B73' : '#9A8BC7'}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {node.isRisk ? 'RISK ALERT' : `${node.units}u`}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* 3. THIN BOTTOM INFORMATION RAIL (NO CARDS) */}
      <div className="w-full max-w-5xl mx-auto pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#9A8BC7] tracking-wider uppercase">
        <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
          <div><span className="text-[#F4EFE7] font-bold">5</span> BANKS</div>
          <div><span className="text-[#F4EFE7] font-bold">{totalUnits}</span> UNITS</div>
          <div><span className="text-[#E96B73] font-bold">{highRisk}</span> HIGH RISK</div>
          <div><span className="text-[#F4EFE7] font-bold">{nearExpiry}</span> NEAR EXPIRY</div>
          <div><span className="text-[#70B9C6] font-bold">{movements}</span> MOVEMENTS</div>
        </div>

        <button
          onClick={onNavigateToMove}
          className="text-xs text-[#E96B73] hover:underline cursor-pointer tracking-widest uppercase font-mono"
        >
          Inspect Movements →
        </button>
      </div>

      {/* Focus Modal Overlay */}
      <AnimatePresence>
        {focusedAnchor && (
          <FluidNodeFocus
            nodeId={focusedAnchor.id}
            cityName={focusedAnchor.name}
            inventory={inventory}
            forecasts={forecasts}
            risks={risks}
            transfers={transfers}
            onClose={() => setFocusedAnchor(null)}
            onNavigateToMove={() => {
              setFocusedAnchor(null)
              onNavigateToMove()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
