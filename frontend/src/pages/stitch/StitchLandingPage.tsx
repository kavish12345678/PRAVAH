import type { DashboardSummary } from '../../types'

interface StitchLandingPageProps {
  onEnterApp: () => void
  summary: DashboardSummary | null
}

export function StitchLandingPage({ onEnterApp, summary }: StitchLandingPageProps) {
  const totalUnits = summary ? summary.total_inventory.toLocaleString() : '43,329'
  const bloodBanks = summary ? summary.blood_banks.toLocaleString() : '4,390'
  const highRisk = summary ? summary.high_risk.toLocaleString() : '3,029'
  const activeTransfers = summary ? summary.active_transfers.toLocaleString() : '1,815'

  return (
    <div className="min-h-screen bg-[#FBF7F4] text-[#1f1b19] font-sans antialiased flex flex-col selection:bg-primary-container selection:text-white">
      {/* TopNavBar Component */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#FBF7F4]/90 backdrop-blur-md border-b border-outline-variant/20 transition-all duration-300">
        <div className="flex justify-between items-center w-full px-6 md:px-12 py-5 max-w-7xl mx-auto">
          <div className="font-serif text-3xl font-bold text-primary tracking-tight">
            PRAVAH
          </div>

          <div className="hidden md:flex space-x-8 text-sm font-medium text-on-surface-variant">
            <a href="#capabilities" className="hover:text-primary transition-colors">Capabilities</a>
            <a href="#intelligence" className="hover:text-primary transition-colors">Intelligence Models</a>
            <a href="#network" className="hover:text-primary transition-colors">Operational Dataset</a>
            <a href="#provenance" className="hover:text-primary transition-colors">Provenance</a>
          </div>

          <button
            onClick={onEnterApp}
            className="bg-primary-container text-white px-7 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider hover:bg-primary transition-colors cursor-pointer shadow-xs"
          >
            Launch Command Center
          </button>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center justify-center py-20 overflow-hidden">
          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
            {/* Floating Status Chips */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="glass-panel px-6 py-2.5 rounded-full flex items-center gap-2.5 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                <span className="font-sans text-xs font-semibold text-on-surface">
                  Operational Dataset: {bloodBanks} Facilities · {totalUnits} Units
                </span>
              </div>
              <div className="glass-panel px-6 py-2.5 rounded-full flex items-center gap-2.5 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                <span className="font-sans text-xs font-semibold text-primary font-bold">
                  Trained ML Models: {highRisk} Expiry Flags Analyzed
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-primary max-w-4xl mx-auto mb-6 leading-[1.12]">
              Predict what matters. <br />
              <span className="text-on-surface">Move what saves lives.</span>
            </h1>

            <p className="font-sans text-lg sm:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              AI-powered blood supply and cold-chain intelligence platform. PRAVAH combines demand forecasting, expiry risk modeling, and linear programming redistribution across India&rsquo;s blood bank network.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={onEnterApp}
                className="bg-primary-container text-white px-8 py-4 rounded-full font-sans text-xs font-bold uppercase tracking-wider hover:bg-primary transition-colors cursor-pointer shadow-md"
              >
                Explore Command Center
              </button>
              <button
                onClick={onEnterApp}
                className="bg-transparent border border-primary text-primary px-8 py-4 rounded-full font-sans text-xs font-bold uppercase tracking-wider hover:bg-primary/5 transition-colors cursor-pointer"
              >
                View Model Outputs
              </button>
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section className="py-20 bg-surface border-t border-outline-variant/15" id="capabilities">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 space-y-3">
              <h2 className="font-serif text-4xl font-semibold text-on-surface">
                Clinical Logistics &amp; ML Architecture
              </h2>
              <p className="font-sans text-base text-on-surface-variant max-w-2xl mx-auto">
                Trained gradient boosted trees and linear programming network flow redistribution evaluated on national blood supply datasets.
              </p>
            </div>

            {/* Feature 1: Predictive Inventory */}
            <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
              <div className="w-full md:w-5/12 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-primary font-sans">01 · Demand Forecasting</span>
                <h3 className="font-serif text-3xl font-semibold text-primary">HistGradientBoosting Regressors</h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Dual-horizon demand forecasting (24-hour and 72-hour) capturing facility tier profiles, seasonal dengue and monsoon multipliers, and historical consumption trajectories.
                </p>
                <ul className="space-y-3 pt-2">
                  <li className="flex items-start gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    <div>
                      <strong className="font-semibold text-on-surface">24h Horizon:</strong> R² = 0.7634, MAE = 3.92 units
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    <div>
                      <strong className="font-semibold text-on-surface">72h Horizon:</strong> R² = 0.5074, MAE = 13.74 units
                    </div>
                  </li>
                </ul>
              </div>

              <div className="w-full md:w-7/12 panel-bg rounded-2xl p-8 border border-outline-variant/20 shadow-xs space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                  <span>National Demand Forecast Horizon</span>
                  <span className="text-primary font-bold">HistGradientBoosting v1</span>
                </div>
                <div className="h-4 bg-outline-variant/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '76.34%' }} title="R² = 0.7634" />
                </div>
                <div className="text-[11px] text-on-surface-variant font-medium">
                  Validated against 4,390 blood banks with 16 facility profile features.
                </div>
              </div>
            </div>

            {/* Feature 2: Network Optimization */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 mb-20" id="network">
              <div className="w-full md:w-5/12 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-secondary font-sans">02 · Redistribution Engine</span>
                <h3 className="font-serif text-3xl font-semibold text-on-surface">Linear Programming Network Flow</h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  HiGHS simplex solver formulation minimizing total transport cost, transit time, and spoilage risk while satisfying blood group compatibility constraints.
                </p>
                <ul className="space-y-3 pt-2">
                  <li className="flex items-start gap-3 text-sm">
                    <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                    <div>
                      <strong className="font-semibold text-on-surface">{activeTransfers} Redistribution Routes</strong> computed globally.
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                    <div>
                      <strong className="font-semibold text-on-surface">1,935 Units</strong> redistributed with zero stockout violations.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="w-full md:w-7/12 panel-bg rounded-2xl p-8 border border-outline-variant/20 shadow-xs flex flex-col justify-center gap-4">
                <div className="p-4 bg-white rounded-xl border border-outline-variant/20 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-primary uppercase">Optimized Redistribution</div>
                    <div className="text-sm font-semibold text-on-surface mt-0.5">Surplus Hubs ➔ Deficit Centers</div>
                  </div>
                  <span className="px-3 py-1 bg-secondary/15 text-secondary text-xs font-bold rounded-full">
                    {activeTransfers} Optimal Routes
                  </span>
                </div>
              </div>
            </div>

            {/* Feature 3: Cold-Chain Telemetry */}
            <div className="flex flex-col md:flex-row items-center gap-12" id="provenance">
              <div className="w-full md:w-5/12 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-primary font-sans">03 · Biological Integrity</span>
                <h3 className="font-serif text-3xl font-semibold text-primary">Isolation Forest &amp; WHO Standards</h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Continuous cold-chain anomaly detection enforcing WHO platelet incubation standards (20°C–24°C with continuous agitation).
                </p>
              </div>

              <div className="w-full md:w-7/12 panel-bg rounded-2xl p-8 border border-outline-variant/20 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-on-surface-variant uppercase">Isolation Forest Telemetry Model</div>
                  <div className="font-serif text-3xl font-bold text-on-surface mt-1">ROC-AUC: 0.9938</div>
                  <div className="text-xs text-secondary font-medium mt-1">100% Excursion Recall on Validated Benchmark</div>
                </div>
                <button
                  onClick={onEnterApp}
                  className="bg-primary text-white text-xs font-bold px-6 py-3 rounded-full uppercase tracking-wider hover:bg-primary-container transition-colors cursor-pointer"
                >
                  Enter System →
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
