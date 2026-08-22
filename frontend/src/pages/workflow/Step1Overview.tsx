import { useMemo } from 'react'
import type { DashboardSummary, InventoryItem, ForecastItem } from '../../types'

interface Step1OverviewProps {
  summary: DashboardSummary | null
  inventory: InventoryItem[]
  forecasts: ForecastItem[]
  selectedBank: string | null
  onSelectBank: (bank: string) => void
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step1Overview({
  summary,
  inventory,
  forecasts,
  selectedBank,
  onSelectBank,
  onNavigateToStep,
}: Step1OverviewProps) {
  const totalUnits = summary ? summary.total_inventory.toLocaleString() : '—'
  const bloodBanks = summary ? summary.blood_banks.toLocaleString() : '—'
  const lowStock = summary ? summary.low_stock.toLocaleString() : '—'
  const nearExpiry = summary ? summary.near_expiry.toLocaleString() : '—'
  const highRisk = summary ? summary.high_risk.toLocaleString() : '—'
  const activeTransfers = summary ? summary.active_transfers.toLocaleString() : '—'

  // Derive active regional facilities and balances from actual inventory and forecast records
  const dynamicNodes = useMemo(() => {
    const bankMap = new Map<string, { stock: number; demand: number; status: string; nearExpiry: number }>()

    for (const item of inventory) {
      const existing = bankMap.get(item.bank_name) || { stock: 0, demand: 0, status: item.status, nearExpiry: 0 }
      existing.stock += item.quantity
      if (item.status === 'NEAR_EXPIRY') existing.nearExpiry += item.quantity
      bankMap.set(item.bank_name, existing)
    }

    for (const fc of forecasts) {
      const existing = bankMap.get(fc.bank_name) || { stock: 0, demand: 0, status: 'AVAILABLE', nearExpiry: 0 }
      existing.demand += fc.predicted_demand
      bankMap.set(fc.bank_name, existing)
    }

    const nodes = Array.from(bankMap.entries()).map(([name, stat], idx) => {
      const balance = stat.stock - Math.round(stat.demand)
      let classification = 'BALANCED'
      let statusColor = 'text-on-surface-variant bg-surface-variant'

      if (stat.nearExpiry > 0 || balance < -5) {
        classification = balance < -5 ? 'SHORTAGE' : 'NEAR_EXPIRY'
        statusColor = 'text-error bg-error/15'
      } else if (balance > 10) {
        classification = 'SURPLUS'
        statusColor = 'text-secondary bg-secondary/15'
      }

      return {
        id: `FAC-${String(idx + 1).padStart(2, '0')}`,
        name,
        stock: stat.stock,
        demand: Math.round(stat.demand),
        balance,
        classification,
        statusColor,
      }
    })

    return nodes.slice(0, 6)
  }, [inventory, forecasts])

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-10 select-none font-sans">
      {/* Step Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
              Step 01 of 10
            </span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Network State
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight mt-1">
            What requires attention across the network?
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl">
            National overview computed across {bloodBanks} blood banks in the PRAVAH operational dataset.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('inventory')}
          className="bg-primary text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-colors cursor-pointer shadow-md flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <span>Explore Inventory</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </header>

      {/* 5 Dynamic Network Attention Indicators */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div
          onClick={() => onNavigateToStep('inventory')}
          className="p-5 panel-bg rounded-xl border border-outline-variant/15 hover:border-primary/40 transition-all cursor-pointer group"
          title="Click to view full inventory ledger"
        >
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1 group-hover:text-primary transition-colors">
            Total Inventory
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-on-surface">{totalUnits}</span>
          </div>
          <span className="text-[10px] text-secondary font-semibold mt-1 block">
            {bloodBanks} Facilities →
          </span>
        </div>

        <div
          onClick={() => onNavigateToStep('inventory', { status: 'LOW' })}
          className="p-5 panel-bg rounded-xl border border-outline-variant/15 hover:border-primary/40 transition-all cursor-pointer group"
          title="Click to filter low stock inventory"
        >
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1 group-hover:text-primary transition-colors">
            Low Stock Batches
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-primary">{lowStock}</span>
          </div>
          <span className="text-[10px] text-primary font-semibold mt-1 block">
            View Deficits →
          </span>
        </div>

        <div
          onClick={() => onNavigateToStep('inventory', { status: 'NEAR_EXPIRY' })}
          className="p-5 panel-bg rounded-xl border border-outline-variant/15 hover:border-primary/40 transition-all cursor-pointer group"
          title="Click to filter near-expiry inventory"
        >
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1 group-hover:text-primary transition-colors">
            Near Expiry
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-primary">{nearExpiry}</span>
          </div>
          <span className="text-[10px] text-on-surface-variant font-semibold mt-1 block">
            &lt; 72h Window →
          </span>
        </div>

        <div
          onClick={() => onNavigateToStep('risk', { level: 'HIGH' })}
          className="p-5 panel-bg rounded-xl border border-outline-variant/15 hover:border-primary/40 transition-all cursor-pointer group"
          title="Click to open risk intelligence"
        >
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1 group-hover:text-primary transition-colors">
            High Risk Units
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-primary">{highRisk}</span>
          </div>
          <span className="text-[10px] text-primary font-semibold mt-1 block">
            GBDT Scored →
          </span>
        </div>

        <div
          onClick={() => onNavigateToStep('transfers')}
          className="p-5 panel-bg rounded-xl border border-outline-variant/15 hover:border-primary/40 transition-all cursor-pointer group"
          title="Click to view transfer recommendations"
        >
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1 group-hover:text-primary transition-colors">
            Active Transfers
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-secondary">{activeTransfers}</span>
          </div>
          <span className="text-[10px] text-secondary font-semibold mt-1 block">
            LP Solved →
          </span>
        </div>
      </section>

      {/* Dynamic Facilities from Real Project Data */}
      <section className="space-y-4">
        <div className="flex justify-between items-center hairline-b pb-3">
          <h3 className="font-serif text-2xl font-semibold text-on-surface">
            Active Project Facilities &amp; Operational Balances
          </h3>
          <span className="text-xs text-on-surface-variant">
            Derived directly from PRAVAH operational dataset
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dynamicNodes.map((node) => {
            const isSelected = selectedBank === node.name

            return (
              <div
                key={node.id}
                onClick={() => onSelectBank(node.name)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-f5f1ee border-primary ring-1 ring-primary/20 shadow-xs'
                    : 'bg-white border-outline-variant/15 hover:bg-f5f1ee/40'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-on-surface-variant">
                      {node.id}
                    </span>
                    <h4 className="font-bold text-base text-on-surface mt-0.5 leading-snug">
                      {node.name}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${node.statusColor}`}>
                    {node.classification}
                  </span>
                </div>

                <div className="text-xs font-medium text-on-surface pt-2 border-t border-outline-variant/10 flex justify-between">
                  <span>Stock: <strong>{node.stock} u</strong></span>
                  <span>Demand: <strong>{node.demand} u</strong></span>
                  <span className={node.balance < 0 ? 'text-error font-bold' : 'text-secondary font-bold'}>
                    {node.balance > 0 ? `+${node.balance}u` : `${node.balance}u`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Contextual Next Step Action */}
      <div className="p-6 bg-f5f1ee rounded-2xl border border-outline-variant/15 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
            Next Action
          </span>
          <p className="font-serif text-lg font-semibold text-on-surface mt-0.5">
            {selectedBank
              ? `Investigate active inventory for ${selectedBank}`
              : 'Investigate national blood inventory records'}
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('inventory')}
          className="bg-primary text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-colors cursor-pointer shadow-xs flex items-center gap-2"
        >
          <span>Step 02 · Explore Inventory</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}
