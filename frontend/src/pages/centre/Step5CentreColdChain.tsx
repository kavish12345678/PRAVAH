interface Step5CentreColdChainProps {
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step5CentreColdChain({ onNavigateToStep }: Step5CentreColdChainProps) {
  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1540px] mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 pb-2">
        <div className="space-y-3 max-w-[850px]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full uppercase tracking-wider">
              Step 05 of 10
            </span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              WHO Cold Chain &amp; Agitation Telemetry
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-bold text-primary leading-[1.06] tracking-tight">
            Is the cold chain secure around this centre?
          </h1>

          <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-[800px]">
            Isolation Forest anomaly detection monitoring real storage temperatures (20.0°C – 24.0°C bounds) and platelet flatbed agitations across the <strong className="text-on-surface font-semibold">200 km regional network</strong>.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('pressure')}
          className="bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2.5 self-start lg:self-auto shrink-0"
        >
          <span>View Regional Pressure</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-outline-variant/15 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Clinical Temperature Window</span>
          <div className="text-3xl lg:text-4xl font-bold text-secondary font-mono">22.1°C</div>
          <p className="text-xs text-on-surface-variant">Optimal WHO platelet incubation (20.0°C – 24.0°C)</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-outline-variant/15 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Agitation Status</span>
          <div className="text-3xl lg:text-4xl font-bold text-emerald-600 font-mono">60 RPM NOMINAL</div>
          <p className="text-xs text-on-surface-variant">Continuous mechanical agitation active</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-outline-variant/15 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Anomaly Detection</span>
          <div className="text-3xl lg:text-4xl font-bold text-primary font-mono">0 EXCURSIONS</div>
          <p className="text-xs text-on-surface-variant">Isolation Forest anomaly score = 0.04</p>
        </div>
      </section>

      {/* Equipment Profile */}
      <section className="bg-white p-8 rounded-3xl border border-outline-variant/15 shadow-xs space-y-6">
        <h2 className="font-serif text-2xl font-bold text-on-surface">
          Chennai RGH Primary Cold-Storage Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-5 bg-surface-container-low rounded-2xl space-y-1">
            <span className="text-on-surface-variant font-semibold">Primary Incubator:</span>
            <p className="font-bold text-on-surface text-sm">Helmer PC1200i Platelet Incubator</p>
          </div>
          <div className="p-5 bg-surface-container-low rounded-2xl space-y-1">
            <span className="text-on-surface-variant font-semibold">Agitator Model:</span>
            <p className="font-bold text-on-surface text-sm">PF48i Flatbed Agitator</p>
          </div>
          <div className="p-5 bg-surface-container-low rounded-2xl space-y-1">
            <span className="text-on-surface-variant font-semibold">Power Redundancy:</span>
            <p className="font-bold text-emerald-700 text-sm">Dual Grid + Diesel Backup</p>
          </div>
          <div className="p-5 bg-surface-container-low rounded-2xl space-y-1">
            <span className="text-on-surface-variant font-semibold">Telemetry Cadence:</span>
            <p className="font-bold text-on-surface text-sm">Real-time IoT streaming (30s)</p>
          </div>
        </div>
      </section>
    </div>
  )
}
