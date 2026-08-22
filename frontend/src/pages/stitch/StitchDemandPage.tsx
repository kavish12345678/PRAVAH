import type { ForecastItem } from '../../types'

interface StitchDemandPageProps {
  forecasts: ForecastItem[]
  onNavigateToTransfers: () => void
}

export function StitchDemandPage({
  forecasts,
  onNavigateToTransfers,
}: StitchDemandPageProps) {
  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-12 select-none">
      {/* Header Section */}
      <header className="space-y-1">
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-tight">
          Demand Intelligence
        </h1>
        <p className="font-serif text-xl sm:text-2xl text-on-surface-variant font-medium opacity-80">
          HistGradientBoosting Demand Forecast Models (24h &amp; 72h)
        </p>
      </header>

      {/* Model Benchmark Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans">
        <div className="p-6 bg-f5f1ee rounded-2xl border border-outline-variant/15">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">24-Hour Model (R²)</span>
          <div className="text-3xl font-bold text-primary mt-1">0.7634</div>
          <p className="text-[11px] text-on-surface-variant mt-1">MAE: 3.92 units · MAPE: 45.74%</p>
        </div>
        <div className="p-6 bg-f5f1ee rounded-2xl border border-outline-variant/15">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">72-Hour Model (R²)</span>
          <div className="text-3xl font-bold text-on-surface mt-1">0.5074</div>
          <p className="text-[11px] text-on-surface-variant mt-1">MAE: 13.74 units · 3-day projection</p>
        </div>
        <div className="p-6 bg-f5f1ee rounded-2xl border border-outline-variant/15">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Baseline Model (R²)</span>
          <div className="text-3xl font-bold text-on-surface-variant mt-1">0.7458</div>
          <p className="text-[11px] text-on-surface-variant mt-1">GBDT outperforms moving baseline</p>
        </div>
      </div>

      {/* Demand Forecast Chart Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 hairline-b pb-4">
          <h2 className="font-serif text-2xl font-semibold text-on-surface">
            Demand Forecast (7-Day Projection Waveform)
          </h2>
          <div className="flex gap-6 text-xs font-sans font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-outline-variant" />
              <span className="text-on-surface-variant uppercase tracking-wider">Historical Usage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary-container" />
              <span className="text-primary uppercase tracking-wider">Predicted Demand</span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative w-full h-[380px] panel-bg rounded-2xl overflow-hidden chart-grid p-6 border border-outline-variant/15">
          {/* Y-Axis Labels */}
          <div className="absolute left-6 top-6 bottom-8 flex flex-col justify-between text-on-surface-variant font-sans text-[11px] font-semibold z-10">
            <span>800U</span>
            <span>600U</span>
            <span>400U</span>
            <span>200U</span>
            <span>0U</span>
          </div>

          {/* X-Axis Labels */}
          <div className="absolute left-20 right-6 bottom-3 flex justify-between text-on-surface-variant font-sans text-[11px] font-semibold z-10">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Chart Area */}
          <div className="absolute inset-0 left-20 bottom-10 right-6 top-6">
            <div className="absolute inset-0 area-historical" />
            <div className="absolute inset-0 line-historical" />
            <div className="absolute inset-0 area-predicted" />
            <div className="absolute inset-0 line-predicted" />
          </div>
        </div>
      </section>

      {/* Actual Demand Forecasts List from API */}
      <section className="space-y-6 pb-12">
        <div className="hairline-b pb-4 flex justify-between items-end">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-on-surface">
              Facility Demand Projections
            </h2>
            <p className="font-sans text-xs text-on-surface-variant mt-1">
              Model outputs generated across facility tiers in the PRAVAH dataset.
            </p>
          </div>
          <button
            onClick={onNavigateToTransfers}
            className="text-primary font-sans text-xs font-bold uppercase tracking-wider hover:underline cursor-pointer"
          >
            Dispatch Transfers →
          </button>
        </div>

        <div className="divide-y divide-outline-variant/15">
          {forecasts.map((f) => (
            <div
              key={f.id}
              className="py-6 flex flex-col md:flex-row gap-6 items-start hover:bg-surface-variant/20 transition-colors p-4 -mx-4 rounded-xl font-sans"
            >
              <div className="w-full md:w-1/3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {f.model_version}
                </span>
                <h3 className="font-serif text-xl font-semibold text-on-surface">{f.bank_name}</h3>
                <p className="text-xs text-on-surface-variant">
                  {f.blood_group} {f.component} · Horizon: {f.forecast_date}
                </p>
              </div>

              <div className="w-full md:w-2/3 flex flex-col justify-center gap-3 hairline-l md:pl-10 pl-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-end text-xs font-semibold">
                    <span className="text-on-surface-variant uppercase">Predicted Demand</span>
                    <span className="text-lg font-bold text-primary">{Math.round(f.predicted_demand)} Units</span>
                  </div>
                  <div className="w-full h-2.5 bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-container rounded-full"
                      style={{ width: `${Math.min(100, Math.max(15, f.predicted_demand * 2))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
