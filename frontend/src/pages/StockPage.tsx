import { motion } from 'framer-motion'
import { BloodClusterCanvas } from '../components/stock/BloodClusterCanvas'
import type { InventoryItem } from '../types'

interface StockPageProps {
  inventory: InventoryItem[]
}

export function StockPage({ inventory }: StockPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto w-full pt-16 pb-12 space-y-6"
    >
      <div className="space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 font-bold">
          BIOLOGICAL CLUSTERS
        </div>
        <h1 className="text-3xl font-black text-white font-sans tracking-tight">
          WHAT IS IN THE FLOW?
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Blood component inventory rendered as live density clusters across ABO/Rh groups.
        </p>
      </div>

      <BloodClusterCanvas inventory={inventory} />
    </motion.div>
  )
}
