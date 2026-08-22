import { useMemo } from 'react'
import { motion } from 'framer-motion'

import { BANK_NODES, resolveBankNode } from '../data/bankNodes'
import type { InventoryItem, TransferItem } from '../types'
import { GlassPanel } from './GlassPanel'

interface LiveNetworkProps {
  transfers: TransferItem[]
  inventory: InventoryItem[]
}

interface RouteVisual {
  id: number
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
  quantity: number
  status: string
}

function deriveActiveBanks(inventory: InventoryItem[]) {
  const names = new Set<string>()
  inventory.forEach((item) => names.add(item.bank_name))
  return names
}

export function LiveNetwork({ transfers, inventory }: LiveNetworkProps) {
  const activeBankNames = useMemo(() => deriveActiveBanks(inventory), [inventory])

  const routes = useMemo<RouteVisual[]>(() => {
    return transfers
      .map((transfer) => {
        const source = resolveBankNode(transfer.source_bank)
        const dest = resolveBankNode(transfer.destination_bank)
        if (!source || !dest) return null
        return {
          id: transfer.id,
          x1: source.x,
          y1: source.y,
          x2: dest.x,
          y2: dest.y,
          label: `${transfer.quantity}u ${transfer.blood_group}`,
          quantity: transfer.quantity,
          status: transfer.status,
        }
      })
      .filter((route): route is RouteVisual => route !== null)
  }, [transfers])

  return (
    <GlassPanel className="relative overflow-hidden p-4 md:p-6" glow="cyan">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            Live Network
          </h2>
          <p className="mt-1 text-xs text-slate-500">Blood supply flow across regional nodes</p>
        </div>
        <div className="text-xs text-slate-500">{routes.length} active routes</div>
      </div>

      <div className="relative aspect-[16/10] w-full min-h-[280px]">
        <svg
          viewBox="0 0 800 480"
          className="h-full w-full"
          role="img"
          aria-label="Blood bank network visualization"
        >
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[...Array(8)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 60 + 40}
              x2="800"
              y2={i * 60 + 40}
              stroke="rgba(148,163,184,0.06)"
              strokeWidth="1"
            />
          ))}

          {/* Transfer routes */}
          {routes.map((route, index) => {
            const pathId = `route-${route.id}`
            const pathD = `M ${route.x1} ${route.y1} L ${route.x2} ${route.y2}`
            const isPending = route.status === 'PENDING'
            const duration = Math.max(2.5, 6 - route.quantity * 0.15)

            return (
              <g key={route.id}>
                <path
                  id={pathId}
                  d={pathD}
                  fill="none"
                  stroke={isPending ? 'rgba(34,211,238,0.35)' : 'rgba(59,130,246,0.25)'}
                  strokeWidth="1.5"
                  strokeDasharray="6 8"
                />
                <circle r="3" fill="#22d3ee" filter="url(#glow)">
                  <animateMotion
                    dur={`${duration}s`}
                    repeatCount="indefinite"
                    begin={`${index * 0.4}s`}
                  >
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
                <circle r="2" fill="#67e8f9" opacity="0.6">
                  <animateMotion
                    dur={`${duration + 1}s`}
                    repeatCount="indefinite"
                    begin={`${index * 0.4 + 1}s`}
                  >
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
              </g>
            )
          })}

          {/* Bank nodes */}
          {BANK_NODES.map((node) => {
            const isActive = [...activeBankNames].some((name) => name.includes(node.city))
            return (
              <g key={node.id} filter="url(#glow)">
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isActive ? 18 : 12}
                  fill="url(#nodeGlow)"
                  opacity={isActive ? 1 : 0.45}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isActive ? 8 : 5}
                  fill={isActive ? '#ecfeff' : '#64748b'}
                />
                {isActive && (
                  <circle cx={node.x} cy={node.y} r="22" fill="none" stroke="#22d3ee" strokeOpacity="0.3">
                    <animate
                      attributeName="r"
                      values="18;28;18"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-opacity"
                      values="0.4;0.1;0.4"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <text
                  x={node.x}
                  y={node.y + 34}
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="11"
                  fontFamily="system-ui, sans-serif"
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[10px] uppercase tracking-wider text-slate-400 backdrop-blur"
        >
          Source ● •••••••••► ● Destination
        </motion.div>
      </div>
    </GlassPanel>
  )
}
