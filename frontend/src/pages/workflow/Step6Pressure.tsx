import { useMemo } from 'react'
import type { InventoryItem, ForecastItem } from '../../types'

interface Step6PressureProps {
  inventory: InventoryItem[]
  forecasts: ForecastItem[]
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step6Pressure({
  inventory,
  forecasts,
  onNavigateToStep,
}: Step6PressureProps) {
  // Aggregate real inventory and demand by facility
  const pressureNodes = useMemo(() => {
    const facilityStats = new Map<string, { currentStock: number; projectedDemand: number; component: string }>()

    for (const item of inventory) {
      const existing = facilityStats.get(item.bank_name) || { currentStock: 0, projectedDemand: 0, component: item.component }
      existing.currentStock += item.quantity
      facilityStats.set(item.bank_name, existing)
    }

    for (const fc of forecasts) {
      const existing = facilityStats.get(fc.bank_name) || { currentStock: 0, projectedDemand: 0, component: fc.component }
      existing.projectedDemand += fc.predicted_demand
      facilityStats.set(fc.bank_name, existing)
    }

    const calculated = Array.from(facilityStats.entries()).map(([name, stat]) => {
      const cur = stat.currentStock
      const dem = Math.round(stat.projectedDemand)
      const balanceVal = cur - dem

      let classification = 'BALANCED'
      let badgeColor = 'bg-surface-variant text-on-surface-variant'
      let barColor = 'bg-outline'
      let barWidth = '50%'

      if (balanceVal < 0) {
        classification = 'SHORTAGE'
        badgeColor = 'bg-error-container text-error'
        barColor = 'bg-error'
        barWidth = `${Math.max(15, Math.min(45, (cur / (dem || 1)) * 100))}%`
      } else if (balanceVal > 10) {
        classification = 'SURPLUS'
        badgeColor = 'bg-secondary/15 text-secondary'
        barColor = 'bg-secondary'
        barWidth = `${Math.min(95, Math.max(60, (cur / (dem || 1)) * 50))}%`
      }

      return {
        name,
        currentStock: cur,
        projectedDemand: dem,
        balance: balanceVal > 0 ? `+${balanceVal} Units Surplus` : (balanceVal < 0 ? `${balanceVal} Units Shortage` : 'Balanced'),
        classification,
        badgeColor,
        barColor,
        barWidth,
      }
    })

    return calculated.slice(0, 6)
  }, [inventory, forecasts])

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
              Step 06 of 10
            </span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Supply &amp; Deficit Pressure
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight mt-1">
            Where is there too much or too little blood?
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl">
            Synthesizing actual inventory ledger counts and GBDT 24h demand predictions to detect regional deficits before stockouts occur.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('optimize')}
          className="bg-primary text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-colors cursor-pointer shadow-md flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <span>Optimize Network</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </header>

      {/* Network Imbalance Visualization */}
      <div className="bg-f5f1ee p-8 md:p-10 rounded-2xl border border-outline-variant/15 space-y-6">
        <div className="flex justify-between items-center hairline-b pb-4">
          <h3 className="font-serif text-2xl font-semibold text-on-surface">
            Regional Stock vs. Demand Balances
          </h3>
          <span className="text-xs text-on-surface-variant font-semibold">
            Calculated Dynamically from Real Project Records
          </span>
        </div>

        {pressureNodes.length === 0 ? (
          <div className="p-8 text-center text-xs text-on-surface-variant bg-white rounded-xl">
            No facility data available for pressure calculation.
          </div>
        ) : (
          <div className="space-y-4">
            {pressureNodes.map((node) => (
              <div
                key={node.name}
                className="p-5 bg-white rounded-xl border border-outline-variant/15 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="w-full md:w-1/3 space-y-1">
                  <h4 className="font-bold text-sm text-on-surface">{node.name}</h4>
                  <p className="text-xs text-on-surface-variant">
                    Current: {node.currentStock}u · Demand: {node.projectedDemand}u
                  </p>
                </div>

                <div className="w-full md:w-1/3 flex items-center gap-3">
                  <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className={`h-full ${node.barColor} rounded-full transition-all`}
                      style={{ width: node.barWidth }}
                    />
                  </div>
                </div>

                <div className="w-full md:w-1/3 flex md:justify-end items-center gap-3">
                  <span className="text-xs font-bold text-on-surface">{node.balance}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${node.badgeColor}`}>
                    {node.classification}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contextual Action */}
      <div className="p-6 bg-f5f1ee rounded-2xl border border-outline-variant/15 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
            Mathematical Decision Layer
          </span>
          <p className="font-serif text-lg font-semibold text-on-surface mt-0.5">
            Formulate minimum-cost linear programming network flow to resolve identified shortages
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => onNavigateToStep('risk')}
            className="px-5 py-3 border border-outline-variant text-on-surface-variant rounded-full text-xs font-bold uppercase hover:text-primary transition-colors cursor-pointer"
          >
            ← Step 04 Risk
          </button>
          <button
            onClick={() => onNavigateToStep('optimize')}
            className="flex-1 sm:flex-none bg-primary text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <span>Step 07 · Optimize Network</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}
