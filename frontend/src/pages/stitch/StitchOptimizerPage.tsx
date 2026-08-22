import { useState } from 'react'

export function StitchOptimizerPage() {
  const [isApproved, setIsApproved] = useState(false)

  return (
    <div className="p-6 md:p-12 max-w-[1920px] mx-auto w-full space-y-10 select-none">
      {/* Header Zone */}
      <header className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">
              HiGHS LP Simplex Network Flow
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-on-surface leading-tight mt-1">
              Global Minimum-Cost Surplus Redistribution — <br />
              <span className="text-on-surface-variant font-normal">Surplus Blood Banks</span> ➔{' '}
              <span className="text-primary-container font-bold">Deficit Trauma Centers</span>
            </h2>
          </div>

          <button
            onClick={() => setIsApproved(!isApproved)}
            className={`px-8 py-3.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 whitespace-nowrap shrink-0 shadow-md cursor-pointer ${
              isApproved
                ? 'bg-secondary text-white shadow-secondary/30'
                : 'bg-primary-container text-white hover:bg-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <span>{isApproved ? 'Redistribution Batch Dispatched ✓' : 'Approve Recommended Transfers'}</span>
          </button>
        </div>

        {/* Stat Row with Hairlines */}
        <div className="flex flex-wrap gap-10 items-baseline pt-4 border-t border-outline-variant/15 font-sans">
          <div className="flex flex-col relative pl-4 border-l border-outline-variant/50">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
              LP Solved Routes
            </span>
            <span className="text-3xl font-bold text-on-surface">745</span>
          </div>

          <div className="flex flex-col relative pl-4 border-l border-outline-variant/50">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
              Units Redistributed
            </span>
            <span className="text-3xl font-bold text-on-surface">1,935</span>
          </div>

          <div className="flex flex-col relative pl-4 border-l border-outline-variant/50">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
              Greedy Baseline
            </span>
            <span className="text-3xl font-bold text-on-surface">739 <span className="text-sm font-normal text-on-surface-variant">routes</span></span>
          </div>

          <div className="flex flex-col relative pl-4 border-l border-outline-variant/50">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
              Solver Status
            </span>
            <span className="text-3xl font-bold text-secondary">OPTIMAL</span>
          </div>
        </div>
      </header>

      {/* Asymmetric Map & Details Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Context Panel (1/3 width) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-f5f1ee p-8 rounded-2xl border border-outline-variant/15 space-y-6">
            <h3 className="font-serif text-xl font-semibold text-on-surface border-b border-outline-variant/20 pb-3">
              Optimization Mathematical Formulation
            </h3>

            <div className="space-y-4 font-sans text-xs leading-relaxed">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary-container text-[20px] shrink-0 mt-0.5">
                  trending_down
                </span>
                <div>
                  <p className="font-bold text-on-surface text-sm">Objective Function</p>
                  <p className="text-on-surface-variant mt-1">
                    Minimizes total network transfer costs where each route cost balances distance in km, transit hours, spoilage risk, and urgent deficit penalties.
                  </p>
                </div>
              </div>

              <div className="hairline-b w-full" />

              <div className="flex gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                  balance
                </span>
                <div>
                  <p className="font-bold text-on-surface text-sm">Conservation of Flow</p>
                  <p className="text-on-surface-variant mt-1">
                    Every node respects supply bounds: outflow \(\le\) surplus, and deficit centers receive inflow \(\le\) projected demand.
                  </p>
                </div>
              </div>

              <div className="hairline-b w-full" />

              <div className="flex gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0 mt-0.5">
                  alt_route
                </span>
                <div>
                  <p className="font-bold text-on-surface text-sm">Blood Compatibility Matrix</p>
                  <p className="text-on-surface-variant mt-1">
                    Enforces universal donor rules (O- satisfies all, AB+ receives all, iso-group preferences prioritize identical matches).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-f5f1ee p-8 rounded-2xl border border-outline-variant/15 space-y-3 font-sans">
            <h3 className="font-serif text-xl font-semibold text-on-surface">Solver Performance</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Engine:</span>
                <span className="font-bold text-on-surface">SciPy HiGHS LP Solver</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Execution Time:</span>
                <span className="font-bold text-secondary">0.42 seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Zero Wastage Target:</span>
                <span className="font-bold text-secondary">Achieved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Topology / Network Canvas (2/3 width) */}
        <div className="w-full lg:w-2/3 bg-f5f1ee p-8 md:p-10 rounded-2xl border border-outline-variant/15 flex flex-col justify-between min-h-[440px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-2xl font-semibold text-on-surface">
              Network Flow Topology &amp; Redistribution Corridors
            </h3>
            <span className="text-xs text-on-surface-variant font-sans font-semibold uppercase tracking-wider">
              745 Active LP Paths
            </span>
          </div>

          <div className="w-full h-80 bg-white rounded-xl p-4 border border-outline-variant/15 relative flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 600 240" className="w-full h-full">
              {/* Route Splines */}
              <path
                d="M 100 70 Q 280 120 480 180"
                fill="none"
                stroke="#44664b"
                strokeWidth="2.5"
                strokeDasharray="6 6"
              />
              <path
                d="M 120 190 Q 300 140 480 80"
                fill="none"
                stroke="#80001f"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Source Hub Node */}
              <circle cx="100" cy="70" r="18" fill="#fff8f6" stroke="#80001f" strokeWidth="2.5" />
              <text x="100" y="74" textAnchor="middle" fill="#80001f" fontSize="10" fontWeight="bold" fontFamily="sans-serif">DEL</text>
              <text x="100" y="105" textAnchor="middle" fill="#1f1b19" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Delhi Central (+18u Surplus)</text>

              {/* Transit Van Node */}
              <circle cx="280" cy="120" r="8" fill="#44664b" />
              <text x="280" y="142" textAnchor="middle" fill="#44664b" fontSize="10" fontWeight="bold" fontFamily="sans-serif">12 Units (42m ETA)</text>

              {/* Destination Deficit Node */}
              <circle cx="480" cy="180" r="18" fill="#fff8f6" stroke="#80001f" strokeWidth="2.5" />
              <text x="480" y="184" textAnchor="middle" fill="#80001f" fontSize="10" fontWeight="bold" fontFamily="sans-serif">BLR</text>
              <text x="480" y="215" textAnchor="middle" fill="#1f1b19" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Bengaluru Victoria (-12u Deficit)</text>

              {/* Second Destination */}
              <circle cx="480" cy="80" r="16" fill="#fff8f6" stroke="#80001f" strokeWidth="2" />
              <text x="480" y="84" textAnchor="middle" fill="#80001f" fontSize="9" fontWeight="bold" fontFamily="sans-serif">HYD</text>
              <text x="480" y="60" textAnchor="middle" fill="#1f1b19" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Hyderabad Trauma</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
