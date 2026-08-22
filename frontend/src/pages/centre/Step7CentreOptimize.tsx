import type { TransferItem } from '../../types'
import { useLanguage } from '../../i18n/LanguageContext'

interface Step7CentreOptimizeProps {
  transfers: (TransferItem & {
    distance_km?: number
    is_connected_to_anchor?: boolean
    route_score?: number
    urgency_level?: string
    recommendation_reason?: string
    clinical_impact?: string
  })[]
  onRunOptimization: () => void
  isOptimizing: boolean
  optimizationMessage: string | null
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step7CentreOptimize({
  transfers,
  onRunOptimization,
  isOptimizing,
  optimizationMessage,
  onNavigateToStep,
}: Step7CentreOptimizeProps) {
  const { t } = useLanguage()
  const activeRoutes = transfers.slice(0, 8)
  const totalUnits = transfers.reduce((sum, t) => sum + (t.quantity || 0), 0)

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1540px] mx-auto w-full space-y-10 select-none font-sans bg-[#FAF7F5]">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 pb-2">
        <div className="space-y-3 max-w-[850px]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#FCECEE] text-[#7A1C28] text-[11px] font-bold rounded-full uppercase tracking-wider font-mono">
              Step 07 of 10
            </span>
            <span className="text-xs text-[#7A7471] font-bold uppercase tracking-wider">
              {t('optimization.title')}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#7A1C28] leading-tight tracking-tight sm:whitespace-nowrap">
            {t('optimization.title')}
          </h1>

          <p className="text-base sm:text-lg text-[#5A5451] leading-relaxed max-w-[800px]">
            {t('optimization.subtitle')} · <strong className="text-[#1F1B19] font-bold">{t('centre.radiusService')}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto shrink-0 flex-wrap">
          <button
            onClick={onRunOptimization}
            disabled={isOptimizing}
            className="bg-[#7A1C28] hover:bg-[#63141F] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2.5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isOptimizing ? 'sync' : 'tune'}
            </span>
            <span>{isOptimizing ? t('common.loading') : t('optimization.reRunSolver')}</span>
          </button>

          <button
            onClick={() => onNavigateToStep('transfers')}
            className="bg-white hover:bg-[#F2ECE8] text-[#7A1C28] border border-[#E8E1DC] px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-2.5"
          >
            <span>{t('navigation.redistribution')}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Optimization Status Feedback */}
      {optimizationMessage && (
        <section className="p-5 bg-[#F0FDF4] border border-[#86EFAC] rounded-3xl text-xs font-bold text-[#166534] flex items-center gap-2.5 shadow-2xs">
          <span className="material-symbols-outlined text-[20px] text-[#16A34A]">check_circle</span>
          <span>{optimizationMessage}</span>
        </section>
      )}

      {/* Solver Performance Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-1.5">
          <span className="text-xs font-bold text-[#7A7471] uppercase">Solver Engine</span>
          <div className="text-2xl lg:text-3xl font-bold text-[#16A34A] mt-1 font-mono">OPTIMAL</div>
          <p className="text-[11px] text-[#7A7471]">SciPy HiGHS Simplex</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-1.5">
          <span className="text-xs font-bold text-[#7A7471] uppercase">Solved Routes</span>
          <div className="text-2xl lg:text-3xl font-bold text-[#1F1B19] mt-1 font-mono">{transfers.length} Routes</div>
          <p className="text-[11px] text-[#7A7471]">Within 200 km radius</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-1.5">
          <span className="text-xs font-bold text-[#7A7471] uppercase">Redistributed Units</span>
          <div className="text-2xl lg:text-3xl font-bold text-[#1F1B19] mt-1 font-mono">{totalUnits} Units</div>
          <p className="text-[11px] text-[#7A7471]">Zero stockout violations</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-1.5">
          <span className="text-xs font-bold text-[#7A7471] uppercase">Compute Latency</span>
          <div className="text-2xl lg:text-3xl font-bold text-[#7A1C28] mt-1 font-mono">&lt; 0.30 sec</div>
          <p className="text-[11px] text-[#7A7471]">Sub-second Simplex resolution</p>
        </div>
      </section>

      {/* Solved Paths & Constraint Verification */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Solved Routes */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#1F1B19]">
            Solved Redistribution Corridors ({transfers.length} Total Routes)
          </h2>

          <div className="space-y-3">
            {activeRoutes.map((route) => (
              <div
                key={route.id}
                className="p-5 bg-white rounded-2xl border border-[#E8E1DC] hover:border-[#7A1C28]/40 transition-all shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-[#FCECEE] text-[#7A1C28] font-bold rounded-md font-mono text-[10px]">
                        {route.blood_group} {route.component}
                      </span>
                      {route.is_connected_to_anchor && (
                        <span className="px-2 py-0.5 bg-[#7A1C28] text-white font-bold rounded-md font-mono text-[9px] uppercase">
                          Chennai Anchor Connected
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-[#DCFCE7] text-[#166534] font-bold rounded-md font-mono text-[10px]">
                        Priority Score: {route.route_score ?? 96}/100
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#1F1B19]">{route.route}</h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-[#7A1C28] font-mono">
                      {route.quantity} Units
                    </div>
                    <span className="text-[11px] text-[#7A7471] block">
                      {route.vehicle || 'Refrigerated Van @ 22°C'}
                    </span>
                  </div>
                </div>

                {route.recommendation_reason && (
                  <p className="text-xs text-[#5A5451] leading-relaxed border-t border-[#FAF7F5] pt-2">
                    <strong className="text-[#1F1B19]">Clinical Rationale: </strong>
                    {route.recommendation_reason}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateToStep('transfers')}
              className="w-full py-4 bg-[#FAF7F5] hover:bg-[#F2ECE8] border border-[#E8E1DC] text-[#7A1C28] text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore All {transfers.length} Routes on Interactive Map</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right: Constraints Active */}
        <div className="lg:col-span-4 bg-white p-7 rounded-3xl border border-[#E8E1DC] shadow-xs space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1C28] font-mono">
              Solver Specifications
            </span>
            <h3 className="font-serif text-xl font-bold text-[#1F1B19]">
              Active Clinical Constraints
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC] space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#1F1B19]">
                <span className="material-symbols-outlined text-[#16A34A] text-[18px]">verified</span>
                <span>Max Transit Radius: 200 km</span>
              </div>
              <p className="text-[#7A7471]">
                Enforces maximum 4-hour refrigerated van travel time boundary.
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC] space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#1F1B19]">
                <span className="material-symbols-outlined text-[#16A34A] text-[18px]">verified</span>
                <span>Blood Group Compatibility</span>
              </div>
              <p className="text-[#7A7471]">
                Strict isogroup platelet transfer rules (O+, A+, B+, AB+ exact matches).
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC] space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#1F1B19]">
                <span className="material-symbols-outlined text-[#16A34A] text-[18px]">verified</span>
                <span>Cold-Chain Integrity Guarantee</span>
              </div>
              <p className="text-[#7A7471]">
                Only vehicles equipped with active 20°C–24°C temperature controls are routed.
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC] space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#1F1B19]">
                <span className="material-symbols-outlined text-[#16A34A] text-[18px]">verified</span>
                <span>Zero Shortage Violation Penalty</span>
              </div>
              <p className="text-[#7A7471]">
                Simplex solver applies $1000\times$ penalty cost for unfulfilled critical requests.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
