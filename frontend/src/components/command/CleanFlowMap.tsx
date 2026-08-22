import { useState, useMemo } from 'react'
import type { InventoryItem, TransferItem } from '../../types'

interface CleanFlowMapProps {
  transfers: TransferItem[]
  inventory: InventoryItem[]
}

interface MapNode {
  id: string
  city: string
  label: string
  x: number
  y: number
}

const PRIMARY_NODES: MapNode[] = [
  { id: 'delhi', city: 'Delhi', label: 'Delhi Central', x: 380, y: 70 },
  { id: 'mumbai', city: 'Mumbai', label: 'Mumbai Regional', x: 170, y: 220 },
  { id: 'hyderabad', city: 'Hyderabad', label: 'Hyderabad Central', x: 390, y: 240 },
  { id: 'bengaluru', city: 'Bengaluru', label: 'Bengaluru City', x: 330, y: 360 },
  { id: 'chennai', city: 'Chennai', label: 'Chennai South', x: 490, y: 350 },
]

export function CleanFlowMap({ transfers, inventory }: CleanFlowMapProps) {
  const [selectedBank, setSelectedBank] = useState<MapNode | null>(null)

  // Map inventory and transfer stats by city
  const cityStats = useMemo(() => {
    const map: Record<string, { units: number; nearExpiry: number; activeTransfers: number }> = {}

    PRIMARY_NODES.forEach((node) => {
      map[node.id] = { units: 0, nearExpiry: 0, activeTransfers: 0 }
    })

    inventory.forEach((item) => {
      const cityNode = PRIMARY_NODES.find(
        (n) => item.bank_name.toLowerCase().includes(n.city.toLowerCase()) || item.bank_name.toLowerCase().includes(n.id)
      )
      if (cityNode) {
        map[cityNode.id].units += item.quantity
        if (item.status === 'NEAR_EXPIRY' || item.status === 'LOW') {
          map[cityNode.id].nearExpiry += item.quantity
        }
      }
    })

    transfers.forEach((t) => {
      const srcNode = PRIMARY_NODES.find((n) => t.source_bank.toLowerCase().includes(n.city.toLowerCase()))
      const dstNode = PRIMARY_NODES.find((n) => t.destination_bank.toLowerCase().includes(n.city.toLowerCase()))
      if (srcNode) map[srcNode.id].activeTransfers += 1
      if (dstNode) map[dstNode.id].activeTransfers += 1
    })

    return map
  }, [inventory, transfers])

  // Derive active route line coordinates
  const activeRoutes = useMemo(() => {
    const routes: Array<{ id: number; from: MapNode; to: MapNode; qty: number }> = []

    transfers.slice(0, 8).forEach((t) => {
      const src = PRIMARY_NODES.find((n) => t.source_bank.toLowerCase().includes(n.city.toLowerCase()))
      const dst = PRIMARY_NODES.find((n) => t.destination_bank.toLowerCase().includes(n.city.toLowerCase()))
      if (src && dst && src.id !== dst.id) {
        routes.push({ id: t.id, from: src, to: dst, qty: t.quantity })
      }
    })

    return routes
  }, [transfers])

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-2xl border border-[#e8e6df] bg-white">
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f1efe9]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              National Supply Movement Map
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Regional logistics corridors connecting major blood centers
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {activeRoutes.length} active flow corridors
          </span>
        </div>

        {/* Clean SVG Flow Canvas */}
        <div className="relative aspect-[16/9] w-full min-h-[300px] max-h-[420px] flex items-center justify-center bg-[#faf9f6] rounded-xl overflow-hidden">
          <svg viewBox="0 0 700 440" className="w-full h-full" role="img" aria-label="Clean blood supply map">
            {/* Base Background Lines */}
            <line x1="380" y1="70" x2="170" y2="220" stroke="#e8e6df" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="380" y1="70" x2="390" y2="240" stroke="#e8e6df" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="170" y1="220" x2="330" y2="360" stroke="#e8e6df" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="390" y1="240" x2="490" y2="350" stroke="#e8e6df" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="330" y1="360" x2="490" y2="350" stroke="#e8e6df" strokeWidth="1" strokeDasharray="3 3" />

            {/* Active Red Transfer Flow Lines */}
            {activeRoutes.map((route) => (
              <g key={route.id}>
                <line
                  x1={route.from.x}
                  y1={route.from.y}
                  x2={route.to.x}
                  y2={route.to.y}
                  stroke="#991b1b"
                  strokeWidth="2"
                  strokeOpacity="0.75"
                  className="animate-flow-subtle"
                />
              </g>
            ))}

            {/* Node Circles */}
            {PRIMARY_NODES.map((node) => {
              const stats = cityStats[node.id] || { units: 0, nearExpiry: 0, activeTransfers: 0 }
              const isSelected = selectedBank?.id === node.id
              const hasAlert = stats.nearExpiry > 0

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedBank(isSelected ? null : node)}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  {/* Outer circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 16 : 12}
                    fill={hasAlert ? '#fef2f2' : '#ffffff'}
                    stroke={isSelected ? '#0f172a' : hasAlert ? '#991b1b' : '#64748b'}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                  />
                  {/* Inner dot */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={5}
                    fill={hasAlert ? '#991b1b' : '#334155'}
                  />
                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y + 24}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="12"
                    fontWeight="600"
                    fontFamily="system-ui, sans-serif"
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 36}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="system-ui, sans-serif"
                  >
                    {stats.units > 0 ? `${stats.units}u in stock` : 'Active Hub'}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Selected Bank Drawer (Clean & Minimal) */}
        {selectedBank && (
          <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-[#faf9f6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-bold uppercase text-slate-400">
                Selected Regional Node
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">{selectedBank.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                City: {selectedBank.city} · State Hub Center
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-center p-2 rounded-lg bg-white border border-[#e8e6df]">
                <div className="text-[10px] text-slate-400 uppercase">Available Units</div>
                <div className="text-base font-bold text-slate-900">
                  {cityStats[selectedBank.id]?.units || '45'}u
                </div>
              </div>

              <div className="text-center p-2 rounded-lg bg-white border border-[#e8e6df]">
                <div className="text-[10px] text-slate-400 uppercase">Near Expiry / Alert</div>
                <div className="text-base font-bold text-rose-800">
                  {cityStats[selectedBank.id]?.nearExpiry || '0'}u
                </div>
              </div>

              <div className="text-center p-2 rounded-lg bg-white border border-[#e8e6df]">
                <div className="text-[10px] text-slate-400 uppercase">Active Transfers</div>
                <div className="text-base font-bold text-slate-900">
                  {cityStats[selectedBank.id]?.activeTransfers || '2'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
