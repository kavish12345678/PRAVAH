import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { usePravahData } from './hooks/usePravahData'
import { CommandHeader } from './components/CommandHeader'
import { KpiStrip } from './components/KpiStrip'
import { ArchitectureWorkflowView } from './components/ArchitectureWorkflowView'
import { InteractiveModelLab } from './components/InteractiveModelLab'
import { OptimizationStudio } from './components/OptimizationStudio'
import { IncidentSimulator } from './components/IncidentSimulator'
import { LiveNetwork } from './components/LiveNetwork'
import { IntelligencePanel } from './components/IntelligencePanel'
import { InventoryExplorer } from './components/InventoryExplorer'
import { RiskIntelligence } from './components/RiskIntelligence'
import { DemandForecastPanel } from './components/DemandForecastPanel'

type ActiveTab = 'workflow' | 'model_lab' | 'optimizer' | 'incident' | 'operations'

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('workflow')
  const {
    data,
    loading,
    scanning,
    scanStep,
    scanSteps,
    lastRunMessage,
    runIntelligence,
    updateTransferStatus,
    loadInventory,
  } = usePravahData()

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Operations Header */}
        <CommandHeader intelligence={data.intelligence} />

        {/* Global KPI Strip */}
        <KpiStrip summary={data.summary} />

        {/* Navigation Tabs Bar */}
        <div className="sticky top-4 z-40 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/80 p-2 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-wrap items-center gap-1">
            <TabButton
              active={activeTab === 'workflow'}
              onClick={() => setActiveTab('workflow')}
              icon="⚡"
              label="System Architecture & Workflow"
            />
            <TabButton
              active={activeTab === 'model_lab'}
              onClick={() => setActiveTab('model_lab')}
              icon="🧪"
              label="Interactive AI Model Lab"
            />
            <TabButton
              active={activeTab === 'optimizer'}
              onClick={() => setActiveTab('optimizer')}
              icon="🔄"
              label="LP Redistribution Optimizer"
              badge={data.transfers.length > 0 ? String(data.transfers.length) : undefined}
            />
            <TabButton
              active={activeTab === 'incident'}
              onClick={() => setActiveTab('incident')}
              icon="🚨"
              label="Incident Simulator (Dynamic Rescore)"
            />
            <TabButton
              active={activeTab === 'operations'}
              onClick={() => setActiveTab('operations')}
              icon="🌐"
              label="Live Network & Operations"
            />
          </div>

          <div className="hidden lg:flex items-center gap-3 pr-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {loading ? 'SYNCING...' : 'PRAVAH v1.1.0 ONLINE'}
            </span>
          </div>
        </div>

        {/* Tab Content Display */}
        <main className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'workflow' && (
              <motion.div
                key="workflow"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <ArchitectureWorkflowView />
              </motion.div>
            )}

            {activeTab === 'model_lab' && (
              <motion.div
                key="model_lab"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <InteractiveModelLab />
              </motion.div>
            )}

            {activeTab === 'optimizer' && (
              <motion.div
                key="optimizer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <OptimizationStudio
                  transfers={data.transfers}
                  onUpdateStatus={updateTransferStatus}
                />
              </motion.div>
            )}

            {activeTab === 'incident' && (
              <motion.div
                key="incident"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <IncidentSimulator />
              </motion.div>
            )}

            {activeTab === 'operations' && (
              <motion.div
                key="operations"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Live Network SVG Canvas */}
                  <div className="lg:col-span-8">
                    <LiveNetwork transfers={data.transfers} inventory={data.inventory} />
                  </div>

                  {/* AI Intelligence Scan Controller */}
                  <div className="lg:col-span-4">
                    <IntelligencePanel
                      intelligence={data.intelligence}
                      scanning={scanning}
                      scanStep={scanStep}
                      scanSteps={scanSteps}
                      lastRunMessage={lastRunMessage}
                      onRun={runIntelligence}
                    />
                  </div>
                </div>

                {/* Risk and Forecast Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RiskIntelligence risks={data.risks} />
                  <DemandForecastPanel forecasts={data.forecasts} />
                </div>

                {/* Searchable Multi-Bank Inventory Explorer */}
                <InventoryExplorer
                  inventory={data.inventory}
                  onFilterChange={loadInventory}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Global Footer */}
        <footer className="mt-12 pt-6 border-t border-white/5 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">PRAVAH Platform</span>
            <span>·</span>
            <span>AI Cold-Chain & Blood Supply Intelligence Command</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>GBDT Regressors</span>
            <span>·</span>
            <span>Isolation Forest</span>
            <span>·</span>
            <span>HiGHS LP Solver</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  icon: string
  label: string
  badge?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
        active
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {badge && (
        <span className="px-1.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold text-[10px]">
          {badge}
        </span>
      )}
    </button>
  )
}
