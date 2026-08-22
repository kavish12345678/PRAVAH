import { useState, useEffect } from 'react'
import type { ForecastItem, InventoryItem } from '../../types'

interface Step3ForecastProps {
  forecasts: ForecastItem[]
  inventory: InventoryItem[]
  selectedBank: string | null
  onSelectBank: (bank: string) => void
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step3Forecast({
  forecasts,
  inventory,
  selectedBank,
  onSelectBank,
  onNavigateToStep,
}: Step3ForecastProps) {
  const [selectedForecast, setSelectedForecast] = useState<ForecastItem | null>(() => forecasts[0] || null)

  useEffect(() => {
    if (!selectedForecast && forecasts.length > 0) {
      // Find matching forecast for selectedBank if available
      const matched = selectedBank ? forecasts.find((f) => f.bank_name === selectedBank) : null
      setSelectedForecast(matched || forecasts[0])
    }
  }, [forecasts, selectedBank, selectedForecast])

  // Find corresponding current stock for the selected forecast in actual inventory records
  const currentStock = selectedForecast
    ? inventory
        .filter(
          (i) =>
            i.bank_name === selectedForecast.bank_name ||
            (i.component === selectedForecast.component && i.blood_group === selectedForecast.blood_group),
        )
        .reduce((sum, item) => sum + item.quantity, 0)
    : 0

  const predictedUnits = selectedForecast ? Math.round(selectedForecast.predicted_demand) : 0
  const deficit = currentStock - predictedUnits

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
              Step 03 of 10
            </span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Demand Forecast
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight mt-1">
            What blood will be needed?
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl">
            HistGradientBoosting 24h &amp; 72h models forecasting clinical demand envelopes from the PRAVAH operational dataset.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('risk')}
          className="bg-primary text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-colors cursor-pointer shadow-md flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <span>Investigate Risk</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </header>

      {/* Main Grid: Forecast List (Left 60%) + Current vs Forecast Comparison (Right 40%) */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Forecast List */}
        <div className="w-full lg:w-3/5 space-y-3">
          <h3 className="font-serif text-xl font-semibold text-on-surface">
            Model Demand Predictions ({forecasts.length} Active)
          </h3>

          {forecasts.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant text-xs bg-white rounded-2xl border border-outline-variant/15">
              No demand forecasts currently loaded.
            </div>
          ) : (
            <div className="space-y-3">
              {forecasts.slice(0, 7).map((f) => {
                const isSelected = selectedForecast?.id === f.id

                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      setSelectedForecast(f)
                      onSelectBank(f.bank_name)
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                      isSelected
                        ? 'bg-f5f1ee border-primary ring-1 ring-primary/20 shadow-xs'
                        : 'bg-white border-outline-variant/15 hover:bg-f5f1ee/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-primary">
                        {f.model_version}
                      </span>
                      <h4 className="font-bold text-sm text-on-surface">{f.bank_name}</h4>
                      <p className="text-xs text-on-surface-variant">
                        {f.blood_group} {f.component} · Horizon: {f.forecast_date}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary block">
                        {Math.round(f.predicted_demand)} u
                      </span>
                      <span className="text-[10px] text-on-surface-variant uppercase">Predicted Demand</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Comparison & Projected Shortage Calculation */}
        <div className="w-full lg:w-2/5 bg-f5f1ee p-8 rounded-2xl border border-outline-variant/15 flex flex-col justify-between space-y-6">
          {selectedForecast ? (
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">
                Stock vs Demand Assessment
              </span>
              <h3 className="font-serif text-2xl font-semibold text-on-surface leading-snug">
                {selectedForecast.bank_name}
              </h3>

              <div className="p-4 bg-white rounded-xl border border-outline-variant/15 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-semibold">Available Stock:</span>
                  <span className="font-bold text-on-surface text-sm">{currentStock} Units</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-semibold">Predicted Demand ({selectedForecast.forecast_date}):</span>
                  <span className="font-bold text-primary text-sm">{predictedUnits} Units</span>
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-center">
                  <span className="text-xs font-bold text-on-surface uppercase">
                    {deficit < 0 ? 'Projected Shortage:' : 'Net Buffer:'}
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      deficit < 0 ? 'text-error' : 'text-secondary'
                    }`}
                  >
                    {deficit < 0 ? `${Math.abs(deficit)} Units Deficit` : `${deficit} Units Surplus`}
                  </span>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                {deficit < 0
                  ? `Imminent shortage calculated for ${selectedForecast.blood_group} ${selectedForecast.component}. PRAVAH flags this facility for redistribution.`
                  : 'Facility holds sufficient inventory to fulfill forecasted consumption requirements.'}
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-on-surface-variant text-xs">
              Select a forecast record to inspect.
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-outline-variant/20">
            <button
              onClick={() => onNavigateToStep('risk')}
              className="w-full py-3.5 bg-primary text-white text-xs font-bold uppercase rounded-full hover:bg-primary-container transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <span>Step 04 · Investigate Risk</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>

            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <button
                onClick={() => onNavigateToStep('inventory')}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                ← Step 02 Inventory
              </button>
              <button
                onClick={() => onNavigateToStep('pressure')}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Skip to Pressure →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
