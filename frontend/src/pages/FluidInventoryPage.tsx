import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { InventoryItem } from '../types'

interface FluidInventoryPageProps {
  inventory: InventoryItem[]
}

const BLOOD_GROUPS = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-']

export function FluidInventoryPage({ inventory }: FluidInventoryPageProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>('O+')

  const groupData = useMemo(() => {
    const map: Record<string, { count: number; items: InventoryItem[] }> = {}
    BLOOD_GROUPS.forEach((g) => {
      map[g] = { count: 0, items: [] }
    })
    inventory.forEach((item) => {
      if (map[item.blood_group]) {
        map[item.blood_group].count += item.quantity
        map[item.blood_group].items.push(item)
      }
    })
    return map
  }, [inventory])

  const activeItems = groupData[selectedGroup]?.items || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto w-full pt-20 pb-16 px-4 space-y-12 select-none"
    >
      {/* Editorial Header */}
      <div className="space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#9A8BC7]">
          BIOLOGICAL CLUSTERS
        </div>
        <h1 className="text-4xl sm:text-5xl font-light text-[#F4EFE7] font-serif">
          Inside the flow.
        </h1>
        <p className="text-xs font-mono text-[#9A8BC7]/80">
          Component densities flowing across primary ABO/Rh blood groupings.
        </p>
      </div>

      {/* Dynamic Blood Group Particle Clusters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {BLOOD_GROUPS.map((bg) => {
          const count = groupData[bg]?.count || 0
          const isSelected = selectedGroup === bg
          const particleCount = Math.min(16, Math.max(3, Math.round(count / 18)))

          return (
            <div
              key={bg}
              onClick={() => setSelectedGroup(bg)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'border-[#E96B73] bg-[#E96B73]/10 shadow-2xl shadow-black'
                  : 'border-white/5 bg-[#181631]/40 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-light font-serif text-[#F4EFE7]">{bg}</span>
                <span className="text-xs font-mono text-[#E96B73] font-bold">
                  {count} Units
                </span>
              </div>

              {/* Particle Cluster */}
              <div className="flex flex-wrap gap-1.5 h-10 items-center content-center overflow-hidden">
                {[...Array(particleCount)].map((_, i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-[#E96B73] animate-pulse"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>

              <div className="text-[10px] text-[#9A8BC7] font-mono flex justify-between">
                <span>{groupData[bg]?.items.length || 0} Batches</span>
                <span>{isSelected ? '● ACTIVE' : 'Inspect'}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Zoomed Group Details & Minimal Table */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedGroup}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="p-8 rounded-3xl border border-white/10 bg-[#181631]/50 space-y-6 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E96B73]">
                GROUP FOCUS
              </span>
              <h3 className="text-2xl font-light text-[#F4EFE7] font-serif mt-0.5">
                {selectedGroup} Component Ledger
              </h3>
            </div>
            <div className="text-sm font-mono text-[#F4EFE7]">
              {groupData[selectedGroup]?.count || 0} Units In Flow
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/10 text-[#9A8BC7] text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Blood Bank</th>
                  <th className="py-2.5 px-3">Component</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3">Expiry Date</th>
                  <th className="py-2.5 px-3">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeItems.slice(0, 10).map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 text-[#F4EFE7]">
                      {item.bank_name.replace('[DEMO] ', '')}
                    </td>
                    <td className="py-3 px-3 text-[#9A8BC7]">{item.component}</td>
                    <td className="py-3 px-3 text-right font-bold text-[#E96B73]">
                      {item.quantity} u
                    </td>
                    <td className="py-3 px-3 text-[#9A8BC7]">{item.expiry_date}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          item.status === 'NEAR_EXPIRY'
                            ? 'bg-[#E96B73]/20 text-[#E96B73]'
                            : 'bg-[#7EAA92]/20 text-[#7EAA92]'
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
    </motion.div>
  )
}
