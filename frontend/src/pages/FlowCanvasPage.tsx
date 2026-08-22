import { motion } from 'framer-motion'
import { LivingNetworkCanvas } from '../components/network/LivingNetworkCanvas'
import type { PravahData } from '../hooks/usePravahData'

interface FlowCanvasPageProps {
  data: PravahData
  onNavigateToMove: () => void
}

export function FlowCanvasPage({ data, onNavigateToMove }: FlowCanvasPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex-1 flex flex-col items-center justify-center pt-8"
    >
      <LivingNetworkCanvas
        inventory={data.inventory}
        forecasts={data.forecasts}
        risks={data.risks}
        transfers={data.transfers}
        onNavigateToMove={onNavigateToMove}
      />
    </motion.div>
  )
}
