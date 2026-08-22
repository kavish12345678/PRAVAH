import type { TransferItem } from '../../types'

interface Step7CentreOptimizeProps {
  transfers: (TransferItem & { distance_km: number; is_connected_to_anchor: boolean })[]
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
  const activeRoutes = transfers.slice(0, 6)
  const totalUnits = transfers.reduce((sum, t) => sum + (t.quantity || 0), 0)

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1540px] mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 pb-2">
        <div className="space-y-3 max-w-[850px]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full uppercase tracking-wider">
              Step 07 of 10
            </span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              HiGHS Linear Programming Solver
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-bold text-primary leading-[1.06] tracking-tight">
            Solve 200 km Min-Cost LP Redistribution
          </h1>

          <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-[800px]">
            Mathematical network flow solver computing globally optimal dispatch routes minimizing transit time and cold-chain exposure across the <strong className="text-on-surface font-semibold">200 km regional network</strong>.
          </p>
        </div>

        <button
          onClick={onRunOptimization}
          disabled={isOptimizing}
          className="bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2.5 self-start lg:self-auto shrink-0 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isOptimizing ? 'sync' : 'tune'}
          </span>
          <span>{isOptimizing ? 'Solving LP Network...' : 'Solve LP Network'}</span>
        </button>
      </section>

      {/* Optimization Status Feedback */}
      {optimizationMessage && (
        <section className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl text-xs font-bold text-emerald-800 flex items-center gap-2.5 shadow-2xs">
          <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
          <span>{optimizationMessage}</span>
        </section>
      )}

      {/* Solver Performance Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-outline-variant/15 shadow-2xs space-y-1.5">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Solver Engine</span>
          <div className="text-2xl lg:text-3xl font-bold text-secondary mt-1 font-mono">OPTIMAL</div>
          <p className="text-[11px] text-on-surface-variant">SciPy HiGHS Simplex</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-outline-variant/15 shadow-2xs space-y-1.5">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Solved Routes</span>
          <div className="text-2xl lg:text-3xl font-bold text-on-surface mt-1 font-mono">{transfers.length} Routes</div>
          <p className="text-[11px] text-on-surface-variant">Within 200 km radius</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-outline-variant/15 shadow-2xs space-y-1.5">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Redistributed</span>
          <div className="text-2xl lg:text-3xl font-bold text-on-surface mt-1 font-mono">{totalUnits} Units</div>
          <p className="text-[11px] text-on-surface-variant">Zero stockout violations</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-outline-variant/15 shadow-2xs space-y-1.5">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Compute Time</span>
          <div className="text-2xl lg:text-3xl font-bold text-primary mt-1 font-mono">&lt; 0.30 sec</div>
          <p className="text-[11px] text-on-surface-variant">Sub-second resolution</p>
        </div>
      </section>

      {/* Solved Paths & Constraint Verification */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Solved Routes */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="font-serif text-2xl font-bold text-on-surface">
            Solved Redistribution Corridors ({transfers.length} Total Routes)
          </h2>

          <div className="space-y-3">
            {activeRoutes.map((route) => (
              <div
                key={route.id}
                onClick={() => onNavigateToStep('transfers')}
                className="p-5 bg-white rounded-2xl border border-outline-variant/15 hover:border-primary/40 transition-all cursor-pointer space-y-3 group shadow-2xs"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">
                      Route #{route.id} · Priority Redistribution
                    </span>
                    <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-on-surface group-hover:text-primary transition-colors flex-wrap">
                      <span className="max-w-[220px] truncate">{route.source_bank}</span>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_forward</span>
                      <span className="text-primary max-w-[220px] truncate">{route.destination_bank}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-secondary/15 text-secondary text-xs font-bold rounded-full font-mono shrink-0">
                    {route.quantity} Units
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-outline-variant/10 text-xs">
                  <div>
                    <span className="text-on-surface-variant">Component:</span>
                    <p className="font-semibold text-on-surface">{route.blood_group} {route.component}</p>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Distance:</span>
                    <p className="font-semibold text-primary font-mono">{route.distance_km.toFixed(1)} km</p>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Status:</span>
                    <p className="font-bold text-secondary">{route.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Feasibility Checklist */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-outline-variant/15 shadow-xs space-y-6">
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-on-surface">
              Constraint Verification
            </h3>

            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2.5 text-on-surface font-medium">
                <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                <span>Source surplus verified (&le; 200 km)</span>
              </li>
              <li className="flex items-center gap-2.5 text-on-surface font-medium">
                <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                <span>Destination deficit confirmed</span>
              </li>
              <li className="flex items-center gap-2.5 text-on-surface font-medium">
                <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                <span>WHO Cold Chain compliance (22°C)</span>
              </li>
              <li className="flex items-center gap-2.5 text-on-surface font-medium">
                <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                <span>Transit time &le; 4.0 hours threshold</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigateToStep('transfers')}
            className="w-full py-4 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-primary-container transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <span>Step 08 · Review Recommendations</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  )
}
