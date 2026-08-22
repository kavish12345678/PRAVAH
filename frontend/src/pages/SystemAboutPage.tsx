import { motion } from 'framer-motion'
import { ArchitectureWorkflowView } from '../components/ArchitectureWorkflowView'
import { IncidentSimulator } from '../components/IncidentSimulator'
import { GlassPanel } from '../components/GlassPanel'

interface SystemAboutPageProps {
  onReplayIntro: () => void
}

export function SystemAboutPage({ onReplayIntro }: SystemAboutPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <GlassPanel className="p-6" glow="cyan">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
              System Architecture & Provenance
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              PRAVAH Intelligence Infrastructure
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              End-to-end data pipelines, mathematical formulations, and real-time event simulation.
            </p>
          </div>
          <button
            onClick={onReplayIntro}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-cyan-500 text-white text-xs font-bold font-mono tracking-wider transition hover:opacity-90 cursor-pointer flex items-center gap-2"
          >
            <span>↺ Replay Product Intro</span>
          </button>
        </div>
      </GlassPanel>

      {/* End-to-End Architecture Workflow View */}
      <ArchitectureWorkflowView />

      {/* Real-Time Incident Simulator */}
      <IncidentSimulator />
    </motion.div>
  )
}
