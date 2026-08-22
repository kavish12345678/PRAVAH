import { useState } from 'react'
import type { ForecastItem } from '../../types'

interface Step3CentreForecastProps {
  forecasts: (ForecastItem & {
    distance_km: number
    current_stock: number
    balance_status: string
    is_anchor: boolean
  })[]
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step3CentreForecast({
  forecasts,
  onNavigateToStep,
}: Step3CentreForecastProps) {
  const [filterType, setFilterType] = useState<string>('ALL')

  const filteredForecasts = forecasts.filter((f) => {
    if (filterType === 'DEFICIT') return f.balance_status === 'DEFICIT'
    if (filterType === 'SURPLUS') return f.balance_status === 'SURPLUS'
    return true
  })

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1540px] mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 pb-2">
        <div className="space-y-3 max-w-[850px]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full uppercase tracking-wider">
              Step 03 of 10
            </span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              24h / 72h GBDT Clinical Demand Model
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-bold text-primary leading-[1.06] tracking-tight">
            What will we need across this network?
          </h1>

          <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-[800px]">
            HistGradientBoosting demand forecasting identifying impending stockouts and surplus reserves across the <strong className="text-on-surface font-semibold">200 km regional network</strong>.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('risk')}
          className="bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2.5 self-start lg:self-auto shrink-0"
        >
          <span>Inspect Expiry Risk</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </section>

      {/* Filter Tabs Bar */}
      <section className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-outline-variant/15 w-fit text-xs font-bold shadow-2xs">
        {[
          { key: 'ALL', label: 'All Projections' },
          { key: 'DEFICIT', label: 'Deficit Facilities' },
          { key: 'SURPLUS', label: 'Surplus Facilities' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              filterType === tab.key
                ? 'bg-primary text-white shadow-2xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {/* Forecast Table / Grid */}
      <section className="bg-white rounded-3xl border border-outline-variant/15 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-outline-variant/15 flex justify-between items-center bg-surface-container-low/30">
          <div>
            <h2 className="font-serif text-xl font-bold text-on-surface">
              Network Demand vs Stock Projections ({filteredForecasts.length} Facilities)
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Model: HistGradientBoosting Demand Estimator (R² = 0.763)</p>
          </div>
          <span className="text-xs font-mono text-on-surface-variant">Continuous ML Inference</span>
        </div>

        <div className="divide-y divide-outline-variant/10 text-xs">
          {filteredForecasts.map((fc) => (
            <div
              key={fc.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-low/40 transition-colors"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-md font-mono">
                    {fc.blood_group} {fc.component}
                  </span>
                  <span className="text-xs text-on-surface-variant font-mono">
                    {fc.distance_km.toFixed(1)} km from Chennai RGH
                  </span>
                  {fc.is_anchor && (
                    <span className="px-2 py-0.5 bg-secondary/15 text-secondary text-[10px] font-bold rounded-md uppercase">
                      Anchor Hub
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-on-surface truncate">{fc.bank_name}</h3>
                <p className="text-xs text-on-surface-variant">Forecast Horizon: {fc.forecast_date}</p>
              </div>

              {/* Stock vs Forecast Demand Comparison */}
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">Current Stock</span>
                  <span className="text-base font-bold text-on-surface font-mono">{fc.current_stock} Units</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">24h Forecast</span>
                  <span className="text-base font-bold text-primary font-mono">{fc.predicted_demand} Units</span>
                </div>

                <div>
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider block text-center ${
                      fc.balance_status === 'DEFICIT'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : fc.balance_status === 'SURPLUS'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-surface-variant text-on-surface-variant'
                    }`}
                  >
                    {fc.balance_status}
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
