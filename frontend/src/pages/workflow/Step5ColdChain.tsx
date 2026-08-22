interface Step5ColdChainProps {
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step5ColdChain({ onNavigateToStep }: Step5ColdChainProps) {
  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
              Step 05 of 10
            </span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Cold-Chain Health
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight mt-1">
            Is the blood being stored safely?
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl">
            Continuous storage telemetry monitoring adherence to WHO 20°C–24°C platelet incubation envelopes across 4,390 facilities.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('pressure')}
          className="bg-primary text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-colors cursor-pointer shadow-md flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <span>Analyze Network Pressure</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </header>

      {/* Telemetry Stream & Alert Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Temperature Stream */}
        <div className="lg:col-span-7 bg-f5f1ee rounded-2xl p-8 border border-outline-variant/15 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-on-surface">
                Chamber Telemetry Stream
              </h3>
              <p className="text-xs text-on-surface-variant">WHO Bounds: 20.0°C – 24.0°C (Continuous Agitation)</p>
            </div>
            <div className="text-right pl-4 hairline-l">
              <span className="text-2xl font-bold text-on-surface">22.1°C</span>
              <span className="text-[10px] text-secondary block font-semibold">Dataset Mean</span>
            </div>
          </div>

          {/* SVG Telemetry Curve */}
          <div className="w-full h-56 bg-white rounded-xl p-4 border border-outline-variant/15 flex items-center justify-center">
            <svg viewBox="0 0 600 180" className="w-full h-full">
              <rect x="40" y="40" width="520" height="80" fill="rgba(68, 102, 75, 0.08)" />
              <line x1="40" y1="40" x2="560" y2="40" stroke="#ba1a1a" strokeWidth="1" strokeDasharray="3 3" />
              <text x="565" y="44" fill="#ba1a1a" fontSize="9" fontFamily="sans-serif">24°C MAX</text>
              <line x1="40" y1="80" x2="560" y2="80" stroke="#44664b" strokeWidth="1" strokeDasharray="2 2" />
              <text x="565" y="84" fill="#44664b" fontSize="9" fontFamily="sans-serif">22°C TARGET</text>
              <line x1="40" y1="120" x2="560" y2="120" stroke="#ba1a1a" strokeWidth="1" strokeDasharray="3 3" />
              <text x="565" y="124" fill="#ba1a1a" fontSize="9" fontFamily="sans-serif">20°C MIN</text>

              <path
                d="M 40 80 Q 140 76 220 85 T 340 22 T 440 80 T 560 82"
                fill="none"
                stroke="#a31e33"
                strokeWidth="2.5"
              />
              <circle cx="340" cy="22" r="5" fill="#ba1a1a" />
              <text x="340" y="14" textAnchor="middle" fill="#ba1a1a" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                Excursion Alert (25.2°C)
              </text>
            </svg>
          </div>
        </div>

        {/* Right (5 cols): Active Equipment Health */}
        <div className="lg:col-span-5 bg-f5f1ee rounded-2xl p-8 border border-outline-variant/15 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-semibold text-on-surface">
              Hardware &amp; Excursion Log
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-white rounded-xl border border-primary/30 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-on-surface">AL-000002 · Thermal Excursion</h4>
                  <p className="text-on-surface-variant mt-0.5">Bank ID: 10131 · 25.16°C (21m duration)</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-primary block">25.2°C</span>
                  <span className="text-[10px] text-error font-bold uppercase">High Alert</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-outline-variant/15 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-on-surface">EQ-280695-PIA-01 · Agitator</h4>
                  <p className="text-on-surface-variant mt-0.5">Remi RPA-100 · Health Score: 88.7%</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-secondary block">22.0°C</span>
                  <span className="text-[10px] text-secondary font-bold uppercase">Nominal</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-outline-variant/20">
            <button
              onClick={() => onNavigateToStep('pressure')}
              className="w-full py-3.5 bg-primary text-white text-xs font-bold uppercase rounded-full hover:bg-primary-container transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <span>Step 06 · Analyze Network Pressure</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>

            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <button
                onClick={() => onNavigateToStep('risk')}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                ← Step 04 Risk
              </button>
              <button
                onClick={() => onNavigateToStep('optimize')}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Skip to Optimize →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
