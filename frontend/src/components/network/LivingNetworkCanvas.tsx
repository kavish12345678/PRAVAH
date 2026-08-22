import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SpatialFocusPanel } from './SpatialFocusPanel'
import type { InventoryItem, ForecastItem, RiskItem, TransferItem } from '../../types'

interface LivingNetworkCanvasProps {
  inventory: InventoryItem[]
  forecasts: ForecastItem[]
  risks: RiskItem[]
  transfers: TransferItem[]
  onNavigateToMove: () => void
}

interface LivingNode {
  id: string
  cityName: string
  label: string
  x: number
  y: number
  hasRisk: boolean
  isSurplus: boolean
  isDeficit: boolean
  tempCelsius: number
}

const LIVING_NODES: LivingNode[] = [
  { id: 'delhi', cityName: 'Delhi', label: 'DELHI HUB', x: 440, y: 90, hasRisk: false, isSurplus: true, isDeficit: false, tempCelsius: 22.0 },
  { id: 'mumbai', cityName: 'Mumbai', label: 'MUMBAI CENTRAL', x: 190, y: 270, hasRisk: false, isSurplus: false, isDeficit: true, tempCelsius: 22.4 },
  { id: 'hyderabad', cityName: 'Hyderabad', label: 'HYDERABAD HUB', x: 470, y: 290, hasRisk: false, isSurplus: false, isDeficit: false, tempCelsius: 21.9 },
  { id: 'bengaluru', cityName: 'Bengaluru', label: 'BENGALURU BIO', x: 390, y: 440, hasRisk: true, isSurplus: false, isDeficit: true, tempCelsius: 23.8 },
  { id: 'chennai', cityName: 'Chennai', label: 'CHENNAI COASTAL', x: 570, y: 430, hasRisk: false, isSurplus: true, isDeficit: false, tempCelsius: 22.1 },
]

export function LivingNetworkCanvas({
  inventory,
  forecasts,
  risks,
  transfers,
  onNavigateToMove,
}: LivingNetworkCanvasProps) {
  const [focusedNode, setFocusedNode] = useState<LivingNode | null>(null)

  // Derive stats per node
  const nodeStats = useMemo(() => {
    const stats: Record<string, { units: number; nearExpiry: number; demand: number }> = {}

    LIVING_NODES.forEach((n) => {
      const cityItems = inventory.filter((i) =>
        i.bank_name.toLowerCase().includes(n.cityName.toLowerCase()) || i.bank_name.toLowerCase().includes(n.id)
      )
      const totalUnits = cityItems.reduce((acc, curr) => acc + curr.quantity, 0)
      const nearExp = cityItems.filter((i) => i.status === 'NEAR_EXPIRY').reduce((acc, curr) => acc + curr.quantity, 0)

      const f = forecasts.find((fc) => fc.bank_name.toLowerCase().includes(n.cityName.toLowerCase()))
      const dem = f ? f.predicted_demand : 35

      stats[n.id] = { units: totalUnits || 120, nearExpiry: nearExp, demand: dem }
    })

    return stats
  }, [inventory, forecasts])

  return (
    <div className="relative w-full min-h-[75vh] flex flex-col items-center justify-center p-2 select-none">
      {/* Top Subtle Subtitle */}
      <div className="absolute top-2 left-4 z-10 space-y-0.5">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500 font-bold">
          LIVING VASCULAR TOPOLOGY
        </div>
        <div className="text-sm font-bold text-white font-sans">
          THE NETWORK IS MOVING.
        </div>
      </div>

      {/* Main Spatial Canvas (80% Viewport Canvas) */}
      <div className="relative w-full max-w-5xl aspect-[16/10] bg-[#06090e] rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center shadow-2xl network-canvas-grid">
        <svg viewBox="0 0 760 560" className="w-full h-full" role="img" aria-label="Living blood supply network topology">
          {/* Subtle Background Vascular Matrix */}
          <path d="M 440 90 Q 280 160 190 270" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M 440 90 Q 480 180 470 290" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M 190 270 Q 320 340 390 440" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M 470 290 Q 540 360 570 430" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M 390 440 Q 480 420 570 430" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M 190 270 Q 360 270 470 290" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" strokeDasharray="3 3" />

          {/* Active Flow Routes with Moving Blood Particles */}
          {/* Delhi -> Mumbai Route */}
          <path d="M 440 90 Q 280 160 190 270" fill="none" stroke="#dc2626" strokeWidth="3" strokeDasharray="8 16" className="animate-vascular-flow" opacity="0.8" />
          {/* Chennai -> Bengaluru Route */}
          <path d="M 570 430 Q 480 420 390 440" fill="none" stroke="#dc2626" strokeWidth="3" strokeDasharray="8 16" className="animate-vascular-flow" opacity="0.8" />
          {/* Mumbai -> Bengaluru Route */}
          <path d="M 190 270 Q 320 340 390 440" fill="none" stroke="#dc2626" strokeWidth="3" strokeDasharray="8 16" className="animate-vascular-flow" opacity="0.6" />

          {/* Primary Living Nodes */}
          {LIVING_NODES.map((node) => {
            const stats = nodeStats[node.id] || { units: 100, nearExpiry: 0, demand: 25 }
            const isSelected = focusedNode?.id === node.id

            return (
              <g
                key={node.id}
                onClick={() => setFocusedNode(node)}
                className="cursor-pointer transition-transform duration-300 hover:scale-110"
              >
                {/* Outer Breathing Risk/Health Halo Ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={38}
                  fill="none"
                  stroke={node.hasRisk ? '#dc2626' : node.isDeficit ? '#f59e0b' : 'rgba(255, 255, 255, 0.18)'}
                  strokeWidth={node.hasRisk ? '2.5' : '1.5'}
                  strokeDasharray={node.hasRisk ? '6 4' : 'none'}
                  className={node.hasRisk ? 'animate-pulse' : 'animate-heartbeat'}
                />

                {/* Inner Vessel Body */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={28}
                  fill="#0a0e17"
                  stroke={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'}
                  strokeWidth="1.5"
                />

                {/* Node Biological Inventory Count */}
                <text
                  x={node.x}
                  y={node.y - 6}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {stats.units}u
                </text>

                {/* Node Blood Group Indicator */}
                <text
                  x={node.x}
                  y={node.y + 8}
                  textAnchor="middle"
                  fill="#dc2626"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  O+
                </text>

                {/* City Label Below */}
                <text
                  x={node.x}
                  y={node.y + 48}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                  letterSpacing="0.1em"
                >
                  {node.cityName.toUpperCase()}
                </text>

                {/* Demand Pressure / Status Subtext */}
                <text
                  x={node.x}
                  y={node.y + 60}
                  textAnchor="middle"
                  fill={node.hasRisk ? '#f87171' : node.isDeficit ? '#fcd34d' : '#94a3b8'}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {node.hasRisk ? 'EXCURSION WATCH' : node.isDeficit ? `DEFICIT (${stats.demand}u)` : `SURPLUS (${stats.units}u)`}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Unobtrusive Canvas Instruction Pill */}
        <div className="absolute bottom-4 right-4 z-10 px-3 py-1 rounded-full border border-white/10 bg-black/70 text-[10px] font-mono text-slate-400">
          Click any regional node to expand spatial cross
        </div>
      </div>

      {/* Spatial Focus Mode Modal */}
      <AnimatePresence>
        {focusedNode && (
          <SpatialFocusPanel
            nodeId={focusedNode.id}
            cityName={focusedNode.cityName}
            inventory={inventory}
            forecasts={forecasts}
            risks={risks}
            transfers={transfers}
            onClose={() => setFocusedNode(null)}
            onNavigateToMove={() => {
              setFocusedNode(null)
              onNavigateToMove()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
