export function StitchColdChainPage() {
  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-12 select-none">
      {/* Page Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            Project Telemetry Dataset
          </span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-on-surface">
          Cold-Chain Telemetry &amp; Incubation Integrity
        </h2>
        <p className="font-sans text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
          Storage temperature and agitation monitoring across blood banking facilities, calibrated against WHO 20°C–24°C guidelines and AIIMS incubator specifications.
        </p>
      </header>

      {/* Asymmetric Layout: Chart (Left 65%) + Status/Insights (Right 35%) */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Dominant Chart Panel (Approx 65%) */}
        <div className="lg:w-2/3 bg-f5f1ee rounded-2xl p-8 md:p-10 border border-outline-variant/15 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-on-surface">
                Chamber Telemetry Stream
              </h3>
              <p className="font-sans text-xs font-semibold text-on-surface-variant mt-1 uppercase tracking-wider">
                WHO Platelet Storage Standard: 20.0°C – 24.0°C
              </p>
            </div>
            <div className="text-left sm:text-right pl-0 sm:pl-6 hairline-l">
              <div className="font-sans text-3xl font-bold text-on-surface">22.1°C</div>
              <div className="font-sans text-xs text-secondary font-semibold">Nominal Incubation Target</div>
            </div>
          </div>

          {/* SVG Telemetry Curve */}
          <div className="w-full h-64 bg-white rounded-xl p-4 border border-outline-variant/15 flex items-center justify-center">
            <svg viewBox="0 0 600 200" className="w-full h-full">
              {/* WHO Safe Range Corridor */}
              <rect x="40" y="50" width="520" height="90" fill="rgba(68, 102, 75, 0.08)" />
              <line x1="40" y1="50" x2="560" y2="50" stroke="#ba1a1a" strokeWidth="1" strokeDasharray="3 3" />
              <text x="565" y="54" fill="#ba1a1a" fontSize="9" fontFamily="sans-serif">24.0°C MAX</text>
              <line x1="40" y1="95" x2="560" y2="95" stroke="#44664b" strokeWidth="1" strokeDasharray="2 2" />
              <text x="565" y="99" fill="#44664b" fontSize="9" fontFamily="sans-serif">22.0°C NOMINAL</text>
              <line x1="40" y1="140" x2="560" y2="140" stroke="#ba1a1a" strokeWidth="1" strokeDasharray="3 3" />
              <text x="565" y="144" fill="#ba1a1a" fontSize="9" fontFamily="sans-serif">20.0°C MIN</text>

              {/* Continuous Temperature Stream with Spike */}
              <path
                d="M 40 95 Q 150 90 240 100 T 360 30 T 460 95 T 560 98"
                fill="none"
                stroke="#a31e33"
                strokeWidth="2.5"
              />
              <circle cx="360" cy="30" r="5" fill="#ba1a1a" />
              <text x="360" y="18" textAnchor="middle" fill="#ba1a1a" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                Excursion (26.8°C!)
              </text>
            </svg>
          </div>
        </div>

        {/* Status & Insights Panel (Approx 35%) */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          {/* Typographic Status */}
          <div className="bg-f5f1ee rounded-2xl p-8 border border-outline-variant/15 flex flex-col justify-center items-center text-center">
            <p className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Anomaly Status
            </p>
            <h3 className="font-serif text-5xl font-bold text-primary">Isolation Forest</h3>
            <p className="font-sans text-xs text-on-surface-variant mt-3">
              Hybrid Rule Engine &amp; ML Model flagged 10,540 total benchmark excursions across 4,390 facilities.
            </p>
          </div>

          {/* Recent Alerts Feed */}
          <div className="bg-f5f1ee rounded-2xl p-8 border border-outline-variant/15 flex-1 space-y-4">
            <h4 className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">
              Dataset Telemetry Logs
            </h4>

            <div className="space-y-4 text-xs font-sans">
              <div className="flex gap-3 hairline-b pb-4">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">warning</span>
                <div>
                  <p className="font-bold text-on-surface">Temperature Spike Logged</p>
                  <p className="text-on-surface-variant mt-0.5">Freezer B-12 recorded 26.8°C for 4 minutes.</p>
                  <p className="text-[10px] text-on-surface-variant mt-1 font-semibold">Bank ID: 280695 · RDP Units</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">check_circle</span>
                <div>
                  <p className="font-bold text-on-surface">Agitator Continuous Status</p>
                  <p className="text-on-surface-variant mt-0.5">60 RPM continuous gentle agitation nominal.</p>
                  <p className="text-[10px] text-on-surface-variant mt-1 font-semibold">Compliant WHO Profile</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment List Section */}
      <section className="space-y-6">
        <h3 className="font-serif text-2xl font-semibold text-on-surface">Monitored Cold Storage Units</h3>

        <div className="bg-white rounded-2xl border border-outline-variant/15 overflow-hidden">
          <div className="flex justify-between font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-wider p-4 hairline-b bg-surface-container-low">
            <div className="w-1/3">Equipment ID</div>
            <div className="w-1/3">Operating Temperature</div>
            <div className="w-1/3 text-right">Telemetry Status</div>
          </div>

          <div className="divide-y divide-outline-variant/10 font-sans text-xs">
            <div className="flex items-center justify-between p-4 hover:bg-f5f1ee transition-colors">
              <div className="w-1/3 flex items-center gap-3 font-semibold text-on-surface">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">kitchen</span>
                <span>Platelet Incubator B-12 (Bank #280695)</span>
              </div>
              <div className="w-1/3 font-bold text-primary text-sm">26.8°C</div>
              <div className="w-1/3 flex justify-end items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[11px] font-bold text-primary uppercase">Excursion Flag</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-f5f1ee transition-colors">
              <div className="w-1/3 flex items-center gap-3 font-semibold text-on-surface">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">kitchen</span>
                <span>AIIMS Central Chamber A-04</span>
              </div>
              <div className="w-1/3 font-bold text-on-surface text-sm">22.1°C</div>
              <div className="w-1/3 flex justify-end items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-[11px] font-bold text-secondary uppercase">Nominal (WHO)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-f5f1ee transition-colors">
              <div className="w-1/3 flex items-center gap-3 font-semibold text-on-surface">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">local_shipping</span>
                <span>Refrigerated Transport Van TR-04</span>
              </div>
              <div className="w-1/3 font-bold text-on-surface text-sm">22.0°C</div>
              <div className="w-1/3 flex justify-end items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-[11px] font-bold text-secondary uppercase">In Transit</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
