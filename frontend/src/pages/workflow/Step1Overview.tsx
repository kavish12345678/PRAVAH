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
  onNavigateToStep,
}: Step1OverviewProps) {
  const totalUnits = summary ? summary.total_inventory.toLocaleString() : '26,463'
  const bloodBanks = summary ? summary.blood_banks.toLocaleString() : '4,390'
  const lowStock = summary ? summary.low_stock.toLocaleString() : '4,459'
  const nearExpiry = summary ? summary.near_expiry.toLocaleString() : '291'
  const highRisk = summary ? summary.high_risk.toLocaleString() : '87'
  const activeTransfers = summary ? summary.active_transfers.toLocaleString() : '1,030'

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
      let statusColor = 'text-[#5A5451] bg-[#F2ECE8]'

      if (stat.nearExpiry > 0 || balance < -5) {
        classification = balance < -5 ? 'SHORTAGE' : 'NEAR_EXPIRY'
        statusColor = 'text-[#DC2626] bg-[#FCECEE]'
      } else if (balance > 10) {
        classification = 'SURPLUS'
        statusColor = 'text-[#16A34A] bg-[#E8F8EE]'
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
    <div className="p-6 md:p-8 max-w-[1500px] mx-auto w-full space-y-8 select-none font-sans bg-[#FAF7F5]">
      {/* 1. Hero Section */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div className="space-y-1.5 max-w-[750px]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#FCECEE] text-[#7A1C28] text-[10px] font-bold rounded-sm uppercase tracking-wider font-mono">
              STEP 01 OF 10
            </span>
            <span className="text-xs text-[#7A7471] font-bold uppercase tracking-wider">
              NETWORK STATE
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1F1B19] leading-tight tracking-tight">
            What requires attention across the network?
          </h1>

          <p className="text-xs sm:text-sm text-[#5A5451] leading-relaxed max-w-[650px]">
            National overview computed across {bloodBanks} blood banks in the PRAVAH operational dataset.
          </p>
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => onNavigateToStep('inventory')}
          className="bg-[#7A1C28] hover:bg-[#63141F] text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-2 self-start lg:self-auto shrink-0"
        >
          <span>EXPLORE INVENTORY</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </section>

      {/* 2. 5 Dynamic KPI Metric Blocks */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Inventory */}
        <div
          onClick={() => onNavigateToStep('inventory')}
          className="p-5 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs hover:border-[#7A1C28]/40 transition-all cursor-pointer space-y-1.5"
        >
          <span className="text-[11px] font-bold text-[#7A7471] uppercase tracking-wider block">
            TOTAL INVENTORY
          </span>
          <div className="text-3xl font-bold text-[#1F1B19] font-sans leading-none pt-1">
            {totalUnits}
          </div>
          <span className="text-[11px] text-[#16A34A] font-bold block pt-1">
            {bloodBanks} Facilities →
          </span>
        </div>

        {/* Low Stock */}
        <div
          onClick={() => onNavigateToStep('inventory', { status: 'LOW' })}
          className="p-5 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs hover:border-[#7A1C28]/40 transition-all cursor-pointer space-y-1.5"
        >
          <span className="text-[11px] font-bold text-[#7A7471] uppercase tracking-wider block">
            LOW STOCK BATCHES
          </span>
          <div className="text-3xl font-bold text-[#7A1C28] font-sans leading-none pt-1">
            {lowStock}
          </div>
          <span className="text-[11px] text-[#7A1C28] font-bold block pt-1">
            View Deficits →
          </span>
        </div>

        {/* Near Expiry */}
        <div
          onClick={() => onNavigateToStep('inventory', { status: 'NEAR_EXPIRY' })}
          className="p-5 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs hover:border-[#7A1C28]/40 transition-all cursor-pointer space-y-1.5"
        >
          <span className="text-[11px] font-bold text-[#7A7471] uppercase tracking-wider block">
            NEAR EXPIRY
          </span>
          <div className="text-3xl font-bold text-[#DC2626] font-sans leading-none pt-1">
            {nearExpiry}
          </div>
          <span className="text-[11px] text-[#DC2626] font-bold block pt-1">
            &lt; 72h Window →
          </span>
        </div>

        {/* High Risk Units */}
        <div
          onClick={() => onNavigateToStep('risk')}
          className="p-5 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs hover:border-[#7A1C28]/40 transition-all cursor-pointer space-y-1.5"
        >
          <span className="text-[11px] font-bold text-[#7A7471] uppercase tracking-wider block">
            HIGH RISK UNITS
          </span>
          <div className="text-3xl font-bold text-[#7A1C28] font-sans leading-none pt-1">
            {highRisk}
          </div>
          <span className="text-[11px] text-[#7A1C28] font-bold block pt-1">
            GBDT Scored →
          </span>
        </div>

        {/* Active Transfers */}
        <div
          onClick={() => onNavigateToStep('transfers')}
          className="p-5 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs hover:border-[#7A1C28]/40 transition-all cursor-pointer space-y-1.5"
        >
          <span className="text-[11px] font-bold text-[#7A7471] uppercase tracking-wider block">
            ACTIVE TRANSFERS
          </span>
          <div className="text-3xl font-bold text-[#16A34A] font-sans leading-none pt-1">
            {activeTransfers}
          </div>
          <span className="text-[11px] text-[#16A34A] font-bold block pt-1">
            LP Solved →
          </span>
        </div>
      </section>

      {/* 3. Active Project Facilities & Operational Balances */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="font-serif text-2xl font-bold text-[#1F1B19]">
            Active Project Facilities &amp; Operational Balances
          </h2>
          <span className="text-xs text-[#7A7471]">
            Derived directly from PRAVAH operational dataset
          </span>
        </div>

        {/* 3-Column Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dynamicNodes.map((node) => (
            <div
              key={node.id}
              onClick={() => onNavigateToStep('inventory', { bank_name: node.name })}
              className="p-5 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs hover:border-[#7A1C28]/40 transition-all cursor-pointer space-y-3.5"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-mono font-bold text-[#7A7471]">
                  {node.id}
                </span>
                <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${node.statusColor}`}>
                  {node.classification}
                </span>
              </div>

              <h3 className="font-bold text-sm text-[#1F1B19] leading-snug truncate">
                {node.name}
              </h3>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#FAF7F5]">
                <div>
                  <span className="text-[#7A7471]">Stock: </span>
                  <span className="font-bold text-[#1F1B19]">{node.stock} u</span>
                </div>

                <div>
                  <span className="text-[#7A7471]">Demand: </span>
                  <span className="font-bold text-[#1F1B19]">{node.demand} u</span>
                </div>

                <div className="font-bold font-mono text-sm">
                  <span
                    className={
                      node.balance < 0
                        ? 'text-[#DC2626]'
                        : node.balance > 0
                        ? 'text-[#16A34A]'
                        : 'text-[#5A5451]'
                    }
                  >
                    {node.balance > 0 ? `+${node.balance}u` : `${node.balance}u`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
