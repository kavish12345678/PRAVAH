import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { InventoryItem } from '../../types'

interface BloodClusterCanvasProps {
  inventory: InventoryItem[]
}

const BLOOD_GROUPS = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-']

export function BloodClusterCanvas({ inventory }: BloodClusterCanvasProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>('O+')

  // Count units and batches per blood group
  const groupStats = useMemo(() => {
    const map: Record<string, { totalUnits: number; batches: InventoryItem[] }> = {}
    BLOOD_GROUPS.forEach((g) => {
      map[g] = { totalUnits: 0, batches: [] }
    })

    inventory.forEach((item) => {
      const g = item.blood_group
      if (map[g]) {
        map[g].totalUnits += item.quantity
        map[g].batches.push(item)
      }
    })

    return map
  }, [inventory])

  const selectedBatches = groupStats[selectedGroup]?.batches || []

  return (
    <div className="space-y-8 select-none">
      {/* 1. DYNAMIC BLOOD CLUSTER CANVAS */}
      <div className="p-8 rounded-3xl border border-white/5 bg-[#0a0e17] space-y-6 shadow-2xl network-canvas-grid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
              BIOLOGICAL INVENTORY TOPOLOGY
            </div>
            <h2 className="text-xl font-bold text-white font-sans mt-0.5">
              Blood Group Cluster Density
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Click cluster to expand regional distribution
          </div>
        </div>

        {/* Dynamic Visual Clusters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BLOOD_GROUPS.map((bg) => {
            const stats = groupStats[bg] || { totalUnits: 0, batches: [] }
            const isSelected = selectedGroup === bg
            const particleCount = Math.min(18, Math.max(3, Math.round(stats.totalUnits / 15)))

            return (
              <div
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'border-rose-500 bg-rose-950/20 shadow-lg shadow-rose-900/20'
                    : 'border-white/5 bg-black/40 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black font-mono text-white">{bg}</span>
                  <span className="text-xs font-mono text-rose-400 font-bold">
                    {stats.totalUnits} Units
                  </span>
                </div>

                {/* Microscopic Particle Cloud */}
                <div className="flex flex-wrap gap-1.5 h-12 items-center content-center overflow-hidden">
                  {[...Array(particleCount)].map((_, i) => (
                    <motion.span
                      key={i}
                      animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 3, delay: i * 0.15, repeat: Infinity }}
                      className={`h-2.5 w-2.5 rounded-full ${
                        i % 3 === 0
                          ? 'bg-rose-600' // Packed RBC
                          : i % 3 === 1
                          ? 'h-1.5 w-1.5 bg-rose-400' // Platelets
                          : 'bg-rose-300/60' // Plasma
                      }`}
                    />
                  ))}
                </div>

                <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                  <span>{stats.batches.length} Batches</span>
                  <span>{isSelected ? '● ACTIVE' : 'Inspect'}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. ZOOMED CLUSTER BREAKDOWN */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedGroup}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="p-8 rounded-3xl border border-white/10 bg-[#0a0e17] space-y-6 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                CLUSTER FOCUS
              </span>
              <h3 className="text-xl font-bold text-white font-sans mt-0.5">
                {selectedGroup} Component Distribution & Expiry Horizon
              </h3>
            </div>
            <div className="text-sm font-mono font-bold text-white">
              {groupStats[selectedGroup]?.totalUnits || 0} Total Units
            </div>
          </div>

          {/* Secondary Data Stream Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/10 text-slate-500 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Blood Bank Node</th>
                  <th className="py-2.5 px-3">Component Type</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3">Expiry Boundary</th>
                  <th className="py-2.5 px-3">Vascular Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {selectedBatches.slice(0, 12).map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 text-white font-medium">
                      {item.bank_name.replace('[DEMO] ', '')}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{item.component}</td>
                    <td className="py-3 px-3 text-right font-bold text-rose-400">
                      {item.quantity} u
                    </td>
                    <td className="py-3 px-3 text-slate-400">{item.expiry_date}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'NEAR_EXPIRY'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
