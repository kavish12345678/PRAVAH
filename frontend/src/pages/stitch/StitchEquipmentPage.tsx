export function StitchEquipmentPage() {
  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-12 select-none">
      {/* Page Header */}
      <header className="space-y-2">
        <p className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-widest">
          Hardware &amp; Incubation Health
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-on-surface">
          Equipment Intelligence &amp; Event Rescoring
        </h2>
        <p className="font-sans text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
          Isolation Forest anomaly detector tracking agitator motor RPM and chamber thermal envelopes across blood bank facilities.
        </p>
      </header>

      {/* Causal Chain Visualization Section */}
      <section className="bg-f5f1ee rounded-2xl p-8 md:p-10 border border-outline-variant/15 space-y-8 shadow-xs">
        <header className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
            <p className="font-sans text-xs font-bold text-primary uppercase tracking-widest">
              Event-Driven Rescore Case Study (Bank ID: 280695)
            </p>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-on-surface">
            Agitator Motor Stoppage &amp; Automated Risk Escalation
          </h3>
        </header>

        {/* 4-Step Causal Chain Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans">
          {/* Step 1: Source Event */}
          <div className="p-6 bg-white rounded-xl border border-outline-variant/15 space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">precision_manufacturing</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase">01 · Telemetry Alert</p>
              <h4 className="font-bold text-sm text-on-surface mt-0.5">Agitator Motor Stalled</h4>
              <p className="text-xs text-on-surface-variant mt-1">RPM dropped from 60 to 0 RPM. Continuous gentle agitation interrupted.</p>
            </div>
          </div>

          {/* Step 2: Affected Inventory */}
          <div className="p-6 bg-white rounded-xl border border-outline-variant/15 space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">vaccines</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase">02 · Unit Assessment</p>
              <h4 className="font-bold text-sm text-on-surface mt-0.5">18 RDP Units</h4>
              <p className="text-xs text-on-surface-variant mt-1">Platelet aggregates risk irreversible clumping without mechanical motion.</p>
            </div>
          </div>

          {/* Step 3: Automated Decision */}
          <div className="p-6 bg-white rounded-xl border border-outline-variant/15 space-y-3">
            <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-secondary uppercase">03 · GBDT Dynamic Rescore</p>
              <h4 className="font-bold text-sm text-on-surface mt-0.5">Risk: 0.12 ➔ 0.89</h4>
              <p className="text-xs text-on-surface-variant mt-1">Model rescored units immediately; prioritized emergency redistribution.</p>
            </div>
          </div>

          {/* Step 4: Resolution */}
          <div className="p-6 bg-white rounded-xl border border-outline-variant/15 space-y-3">
            <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-secondary uppercase">04 · Resolution</p>
              <h4 className="font-bold text-sm text-on-surface mt-0.5">Dispatched in 42m</h4>
              <p className="text-xs text-on-surface-variant mt-1">Units transfused at recipient ICU prior to clinical viability expiration.</p>
            </div>
          </div>
        </div>

        {/* Telemetry Sensor Specs */}
        <div className="p-6 bg-white rounded-xl border border-outline-variant/15 grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans text-xs">
          <div>
            <span className="text-on-surface-variant font-semibold">Isolation Forest ROC-AUC</span>
            <div className="text-2xl font-bold text-primary mt-1">0.9938 (Benchmark Validated)</div>
          </div>
          <div>
            <span className="text-on-surface-variant font-semibold">Excursion Recall Rate</span>
            <div className="text-base font-bold text-secondary mt-1">100.0% (Zero Missed Outliers)</div>
          </div>
          <div>
            <span className="text-on-surface-variant font-semibold">Total Benchmark Excursions</span>
            <div className="text-base font-bold text-on-surface mt-1">10,540 Monitored Events</div>
          </div>
        </div>
      </section>
    </div>
  )
}
