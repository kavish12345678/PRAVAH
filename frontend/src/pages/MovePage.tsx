import { motion } from 'framer-motion'
import { VascularTransferCanvas } from '../components/move/VascularTransferCanvas'
import type { TransferItem, TransferStatusUpdate } from '../types'

interface MovePageProps {
  transfers: TransferItem[]
  onUpdateStatus: (id: number, status: TransferStatusUpdate) => Promise<void>
}

export function MovePage({ transfers, onUpdateStatus }: MovePageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto w-full pt-16 pb-12 space-y-6"
    >
      <div className="space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-400 font-bold">
          VASCULAR REDISTRIBUTION
        </div>
        <h1 className="text-3xl font-black text-white font-sans tracking-tight">
          WHERE SHOULD IT MOVE?
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Interactive transfer routes matching surplus inventory to critical emergency hospital deficits.
        </p>
      </div>

      <VascularTransferCanvas transfers={transfers} onUpdateStatus={onUpdateStatus} />
    </motion.div>
  )
}
