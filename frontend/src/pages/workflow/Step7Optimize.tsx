import type { TransferItem } from '../../types'

interface Step7OptimizeProps {
  transfers: TransferItem[]
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step7Optimize({ transfers, onNavigateToStep }: Step7OptimizeProps) {
  const activeRoutes = transfers.slice(0, 4)

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
              Step 07 of 10
            </span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Mathematical Optimization
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight mt-1">
            What is the best feasible blood movement?
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl">
            HiGHS Linear Programming simplex solver computing global minimum-cost network flows subject to shelf-life and compatibility constraints.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('transfers')}
          className="bg-primary text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-colors cursor-pointer shadow-md flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <span>Review Transfers</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </header>

      {/* Solver Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-f5f1ee rounded-2xl border border-outline-variant/15">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Solver Status</span>
          <div className="text-2xl font-bold text-secondary mt-1">OPTIMAL</div>
          <p className="text-[10px] text-on-surface-variant mt-0.5">SciPy HiGHS LP Simplex</p>
        </div>
        <div className="p-5 bg-f5f1ee rounded-2xl border border-outline-variant/15">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Solved Routes</span>
          <div className="text-2xl font-bold text-on-surface mt-1">745 Routes</div>
          <p className="text-[10px] text-on-surface-variant mt-0.5">Min-cost paths</p>
        </div>
        <div className="p-5 bg-f5f1ee rounded-2xl border border-outline-variant/15">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Redistributed</span>
          <div className="text-2xl font-bold text-on-surface mt-1">1,935 Units</div>
          <p className="text-[10px] text-on-surface-variant mt-0.5">Zero stockout violations</p>
        </div>
        <div className="p-5 bg-f5f1ee rounded-2xl border border-outline-variant/15">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Compute Time</span>
          <div className="text-2xl font-bold text-primary mt-1">0.42 sec</div>
          <p className="text-[10px] text-on-surface-variant mt-0.5">Real-time resolution</p>
        </div>
      </div>

      {/* Feasible Optimal Paths & Constraints Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Solved Optimal Paths */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-serif text-2xl font-semibold text-on-surface">
            Solved Redistribution Corridors ({transfers.length} Total Routes)
          </h3>

          <div className="space-y-4">
            {activeRoutes.map((route) => (
              <div
                key={route.id}
                onClick={() => onNavigateToStep('transfers')}
                className="p-6 bg-white rounded-2xl border border-outline-variant/15 hover:border-primary/40 transition-all cursor-pointer space-y-4 group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Route #{route.id} · Priority Redistribution
                    </span>
                    <div className="flex items-center gap-2 text-base font-bold text-on-surface mt-1 group-hover:text-primary transition-colors">
                      <span className="max-w-[200px] truncate">{route.source_bank}</span>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_forward</span>
                      <span className="text-primary max-w-[200px] truncate">{route.destination_bank}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-secondary/15 text-secondary text-xs font-bold rounded-full">
                    {route.quantity} Units
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-outline-variant/10 text-xs">
                  <div>
                    <span className="text-on-surface-variant">Component:</span>
                    <p className="font-semibold text-on-surface">{route.blood_group} {route.component}</p>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Corridor &amp; Vehicle:</span>
                    <p className="font-semibold text-on-surface">{route.route || 'Refrigerated Cold Corridor'}</p>
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
        <div className="lg:col-span-4 bg-f5f1ee p-6 rounded-2xl border border-outline-variant/15 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h4 className="font-serif text-xl font-semibold text-on-surface">
              Constraint Verification
            </h4>

            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2 text-on-surface font-medium">
                <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                <span>Source surplus verified</span>
              </li>
              <li className="flex items-center gap-2 text-on-surface font-medium">
                <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                <span>Destination deficit confirmed</span>
              </li>
              <li className="flex items-center gap-2 text-on-surface font-medium">
                <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                <span>Remaining shelf-life acceptable</span>
              </li>
              <li className="flex items-center gap-2 text-on-surface font-medium">
                <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                <span>WHO Cold-Chain verified (22.0°C)</span>
              </li>
              <li className="flex items-center gap-2 text-on-surface font-medium">
                <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                <span>Transit time within safe threshold</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigateToStep('transfers')}
            className="w-full py-3.5 bg-primary text-white text-xs font-bold uppercase rounded-full hover:bg-primary-container transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <span>Step 08 · Review Recommendations</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}
