import { motion } from 'framer-motion'
import { CommandCenterHero } from '../components/command/CommandCenterHero'
import { KpiStrip } from '../components/KpiStrip'
import { LiveNetwork } from '../components/LiveNetwork'
import { RiskIntelligence } from '../components/RiskIntelligence'
import { DemandForecastPanel } from '../components/DemandForecastPanel'
import { OptimizationStudio } from '../components/OptimizationStudio'
import { InventoryExplorer } from '../components/InventoryExplorer'
import type { PravahData } from '../hooks/usePravahData'
import type { TransferStatusUpdate } from '../types'

interface CommandCenterPageProps {
  data: PravahData
  onUpdateTransferStatus: (id: number, status: TransferStatusUpdate) => Promise<void>
  onFilterInventory: (filters: { blood_group?: string; component?: string; bank_id?: number }) => void
}

export function CommandCenterPage({
  data,
  onUpdateTransferStatus,
  onFilterInventory,
}: CommandCenterPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Hero Header */}
      <CommandCenterHero summary={data.summary} />

      {/* KPI Metric Strip */}
      <KpiStrip summary={data.summary} />

      {/* Central Blood Supply & Flow Visual */}
      <div className="grid grid-cols-1 gap-6">
        <LiveNetwork transfers={data.transfers} inventory={data.inventory} />
      </div>

      {/* Operational Zones: Risk Intelligence & Demand Forecasting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskIntelligence risks={data.risks} />
        <DemandForecastPanel forecasts={data.forecasts} />
      </div>

      {/* Transfer Recommendations Matrix */}
      <OptimizationStudio
        transfers={data.transfers}
        onUpdateStatus={onUpdateTransferStatus}
      />

      {/* Searchable Inventory Explorer */}
      <InventoryExplorer
        inventory={data.inventory}
        onFilterChange={onFilterInventory}
      />
    </motion.div>
  )
}
