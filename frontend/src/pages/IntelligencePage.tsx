import { motion } from 'framer-motion'
import { RiskIntelligence } from '../components/RiskIntelligence'
import { IntelligencePanel } from '../components/IntelligencePanel'
import { GlassPanel } from '../components/GlassPanel'
import type { IntelligenceStatus, RiskItem } from '../types'

interface IntelligencePageProps {
  risks: RiskItem[]
  intelligence: IntelligenceStatus | null
  scanning: boolean
  scanStep: number
  scanSteps: readonly string[]
  lastRunMessage: string | null
  onRunScan: () => void
}

export function IntelligencePage({
  risks,
  intelligence,
  scanning,
  scanStep,
  scanSteps,
  lastRunMessage,
  onRunScan,
}: IntelligencePageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <GlassPanel className="p-6" glow="red">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-rose-400">
              Unit Degradation & Spoilage Intelligence
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              AI Risk Prediction & Clinical Decision Support
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Unit-level spoilage probability fusing shelf life aging, thermal stress, and demand velocity.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs font-mono text-rose-300">
            Model: <span className="font-bold">GBDT Classifier & Regressor</span>
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <RiskIntelligence risks={risks} />
        </div>
        <div className="lg:col-span-4">
          <IntelligencePanel
            intelligence={intelligence}
            scanning={scanning}
            scanStep={scanStep}
            scanSteps={scanSteps}
            lastRunMessage={lastRunMessage}
            onRun={onRunScan}
          />
        </div>
      </div>
    </motion.div>
  )
}
