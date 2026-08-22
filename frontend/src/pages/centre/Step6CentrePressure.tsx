import type { CentrePressureData } from '../../types'

interface Step6CentrePressureProps {
  pressure: CentrePressureData | null
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step6CentrePressure({
  pressure,
  onNavigateToStep,
}: Step6CentrePressureProps) {
  const surplusList = pressure?.surplus_facilities || []
  const deficitList = pressure?.deficit_facilities || []

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1540px] mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 pb-2">
        <div className="space-y-3 max-w-[850px]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full uppercase tracking-wider">
              Step 06 of 10
            </span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Regional Supply Imbalance Analysis
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-bold text-primary leading-[1.06] tracking-tight">
            Where is blood surplus vs needed?
          </h1>

          <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-[800px]">
            Real network pressure mapping surplus donor facilities and acute deficit recipient hospitals within the <strong className="text-on-surface font-semibold">200 km operational network</strong>.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('optimize')}
          className="bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2.5 self-start lg:self-auto shrink-0"
        >
          <span>Step 07 · Solve LP Optimization</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </section>

      {/* Overview Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-outline-variant/15 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Surplus Donor Centres</span>
          <div className="text-3xl lg:text-4xl font-bold text-emerald-700 font-mono">
            {pressure?.surplus_count ?? surplusList.length} Facilities
          </div>
          <p className="text-xs text-on-surface-variant">Available blood units ready for redistribution</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-outline-variant/15 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Deficit Recipient Hospitals</span>
          <div className="text-3xl lg:text-4xl font-bold text-rose-700 font-mono">
            {pressure?.deficit_count ?? deficitList.length} Facilities
          </div>
          <p className="text-xs text-on-surface-variant">Impending stockout demand within 24h/72h</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-outline-variant/15 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Service Radius</span>
          <div className="text-3xl lg:text-4xl font-bold text-primary font-mono">
            {pressure?.operational_radius_km ?? 200} km
          </div>
          <p className="text-xs text-on-surface-variant">Max feasible refrigerated transit corridor</p>
        </div>
      </section>

      {/* Surplus vs Deficit Dual Columns */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Surplus Donors */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-outline-variant/15 shadow-xs space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-outline-variant/15">
            <h2 className="font-serif text-xl font-bold text-emerald-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">arrow_upward</span>
              <span>Surplus Source Facilities</span>
            </h2>
            <span className="text-xs font-bold text-on-surface-variant">
              {surplusList.length} Potential Donors
            </span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {surplusList.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex justify-between items-center text-xs hover:border-emerald-300 transition-colors"
              >
                <div className="space-y-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-emerald-200/70 text-emerald-900 font-bold rounded-md font-mono text-[10px]">
                      {item.blood_group} {item.component}
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      {item.distance_from_anchor_km.toFixed(1)} km from Chennai RGH
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-on-surface truncate">{item.bank_name}</h3>
                  <p className="text-[11px] text-on-surface-variant">{item.city}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-bold text-emerald-800 font-mono block">
                    +{item.surplus_units} Surplus
                  </span>
                  <span className="text-[10px] text-on-surface-variant">Stock: {item.current_stock} / Dem: {item.demand}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Deficit Recipients */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-outline-variant/15 shadow-xs space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-outline-variant/15">
            <h2 className="font-serif text-xl font-bold text-rose-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600">arrow_downward</span>
              <span>Deficit Recipient Facilities</span>
            </h2>
            <span className="text-xs font-bold text-on-surface-variant">
              {deficitList.length} Needing Blood
            </span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {deficitList.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 flex justify-between items-center text-xs hover:border-rose-300 transition-colors"
              >
                <div className="space-y-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-rose-200/70 text-rose-900 font-bold rounded-md font-mono text-[10px]">
                      {item.blood_group} {item.component}
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      {item.distance_from_anchor_km.toFixed(1)} km from Chennai RGH
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-on-surface truncate">{item.bank_name}</h3>
                  <p className="text-[11px] text-on-surface-variant">{item.city}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-bold text-rose-800 font-mono block">
                    -{item.deficit_units} Deficit
                  </span>
                  <span className="text-[10px] text-on-surface-variant">Stock: {item.current_stock} / Dem: {item.demand}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
