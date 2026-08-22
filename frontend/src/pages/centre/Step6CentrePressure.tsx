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
    <div className="p-6 md:p-10 lg:p-12 max-w-[1540px] mx-auto w-full space-y-10 select-none font-sans bg-[#FAF7F5]">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 pb-2">
        <div className="space-y-3 max-w-[850px]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#FCECEE] text-[#7A1C28] text-[11px] font-bold rounded-full uppercase tracking-wider font-mono">
              Step 06 of 10
            </span>
            <span className="text-xs text-[#7A7471] font-bold uppercase tracking-wider">
              Regional Supply Imbalance Analysis
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-bold text-[#7A1C28] leading-[1.06] tracking-tight">
            Where is blood surplus vs needed?
          </h1>

          <p className="text-base sm:text-lg text-[#5A5451] leading-relaxed max-w-[800px]">
            Real network pressure mapping surplus donor facilities and acute deficit recipient hospitals within the <strong className="text-[#1F1B19] font-bold">200 km operational network</strong> around Chennai Rajiv Gandhi Hospital.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('optimize')}
          className="bg-[#7A1C28] hover:bg-[#63141F] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2.5 self-start lg:self-auto shrink-0"
        >
          <span>Step 07 · Route Optimization Model</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </section>

      {/* Overview Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <span className="text-xs font-bold text-[#7A7471] uppercase">Surplus Donor Centres</span>
          <div className="text-3xl lg:text-4xl font-bold text-[#16A34A] font-mono">
            {pressure?.surplus_count ?? surplusList.length} Batches
          </div>
          <p className="text-xs text-[#7A7471]">Available blood units ready for regional redistribution</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <span className="text-xs font-bold text-[#7A7471] uppercase">Deficit Recipient Hospitals</span>
          <div className="text-3xl lg:text-4xl font-bold text-[#DC2626] font-mono">
            {pressure?.deficit_count ?? deficitList.length} Batches
          </div>
          <p className="text-xs text-[#7A7471]">Impending stockout demand within 24h / 72h horizons</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <span className="text-xs font-bold text-[#7A7471] uppercase">Service Radius</span>
          <div className="text-3xl lg:text-4xl font-bold text-[#1F1B19] font-mono">
            {pressure?.operational_radius_km ?? 200} km
          </div>
          <p className="text-xs text-[#7A7471]">Max feasible refrigerated transit corridor</p>
        </div>
      </section>

      {/* Surplus vs Deficit Dual Columns */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Surplus Donors */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1DC] shadow-xs space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-[#FAF7F5]">
            <h2 className="font-serif text-xl font-bold text-[#16A34A] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#16A34A]">arrow_upward</span>
              <span>Surplus Source Facilities</span>
            </h2>
            <span className="text-xs font-bold text-[#7A7471]">
              {surplusList.length} Top Batches
            </span>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {surplusList.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-colors ${
                  item.is_anchor
                    ? 'bg-[#F0FDF4] border-[#86EFAC]'
                    : 'bg-[#FAF7F5] border-[#E8E1DC] hover:border-[#16A34A]/40'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-[#DCFCE7] text-[#166534] font-bold rounded-md font-mono text-[10px]">
                        {item.blood_group} {item.component}
                      </span>
                      {item.is_anchor && (
                        <span className="px-2 py-0.5 bg-[#7A1C28] text-white font-bold rounded-md font-mono text-[9px] uppercase">
                          Anchor Facility
                        </span>
                      )}
                      <span className="text-[11px] text-[#7A7471] font-mono">
                        {item.distance_from_anchor_km.toFixed(1)} km from Chennai RGH
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#1F1B19] truncate">{item.bank_name}</h3>
                    <p className="text-[11px] text-[#7A7471]">{item.city}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-bold text-[#16A34A] font-mono">
                      +{item.surplus_units} units
                    </div>
                    <span className="text-[10px] text-[#7A7471]">
                      Stock: {item.current_stock} | Dem: {item.demand}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Deficit Recipients */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1DC] shadow-xs space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-[#FAF7F5]">
            <h2 className="font-serif text-xl font-bold text-[#DC2626] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#DC2626]">arrow_downward</span>
              <span>Deficit Recipient Facilities</span>
            </h2>
            <span className="text-xs font-bold text-[#7A7471]">
              {deficitList.length} Top Batches
            </span>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {deficitList.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-colors ${
                  item.is_anchor
                    ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                    : 'bg-[#FAF7F5] border-[#E8E1DC] hover:border-[#DC2626]/40'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-[#FEE2E2] text-[#991B1B] font-bold rounded-md font-mono text-[10px]">
                        {item.blood_group} {item.component}
                      </span>
                      {item.is_anchor && (
                        <span className="px-2 py-0.5 bg-[#7A1C28] text-white font-bold rounded-md font-mono text-[9px] uppercase">
                          Anchor Facility
                        </span>
                      )}
                      <span className="text-[11px] text-[#7A7471] font-mono">
                        {item.distance_from_anchor_km.toFixed(1)} km from Chennai RGH
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#1F1B19] truncate">{item.bank_name}</h3>
                    <p className="text-[11px] text-[#7A7471]">{item.city}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-bold text-[#DC2626] font-mono">
                      -{item.deficit_units} units
                    </div>
                    <span className="text-[10px] text-[#7A7471]">
                      Stock: {item.current_stock} | Dem: {item.demand}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
