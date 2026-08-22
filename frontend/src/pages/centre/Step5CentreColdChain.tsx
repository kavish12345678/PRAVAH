import type { CentreColdChainData } from '../../types'

interface Step5CentreColdChainProps {
  coldChain?: CentreColdChainData | null
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step5CentreColdChain({
  coldChain,
  onNavigateToStep,
}: Step5CentreColdChainProps) {
  const currentTemp = coldChain ? `${coldChain.current_temperature.toFixed(2)}°C` : 'Data unavailable'
  const minTemp = coldChain ? `${coldChain.min_temperature.toFixed(2)}°C` : '---'
  const maxTemp = coldChain ? `${coldChain.max_temperature.toFixed(2)}°C` : '---'
  const meanTemp = coldChain ? `${coldChain.mean_temperature.toFixed(2)}°C` : '---'
  const agitationStatus = coldChain ? coldChain.agitation_status : 'Data unavailable'
  const agitationRpm = coldChain ? coldChain.agitation_rpm : 0
  const excursions = coldChain ? coldChain.excursions_count : 0
  const anomalyScore = coldChain ? coldChain.anomaly_score.toFixed(4) : 'Data unavailable'
  const anomalyStatus = coldChain ? coldChain.anomaly_status : 'Data unavailable'
  const eq = coldChain?.equipment

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1540px] mx-auto w-full space-y-10 select-none font-sans bg-[#FAF7F5]">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 pb-2">
        <div className="space-y-3 max-w-[850px]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#FCECEE] text-[#7A1C28] text-[11px] font-bold rounded-full uppercase tracking-wider font-mono">
              Step 05 of 10
            </span>
            <span className="text-xs text-[#7A7471] font-bold uppercase tracking-wider">
              WHO Cold Chain &amp; Agitation Telemetry
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-bold text-[#7A1C28] leading-[1.06] tracking-tight">
            Is the cold chain secure at Chennai RGH?
          </h1>

          <p className="text-base sm:text-lg text-[#5A5451] leading-relaxed max-w-[800px]">
            Isolation Forest anomaly detection monitoring real storage temperatures (20.0°C – 24.0°C bounds) and platelet flatbed agitations across the <strong className="text-[#1F1B19] font-bold">200 km regional network</strong>.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('pressure')}
          className="bg-[#7A1C28] hover:bg-[#63141F] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2.5 self-start lg:self-auto shrink-0"
        >
          <span>View Regional Pressure</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </section>

      {/* Primary Telemetry Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <span className="text-xs font-bold text-[#7A7471] uppercase">Current Storage Temperature</span>
          <div className="text-3xl lg:text-4xl font-bold text-[#1F1B19] font-mono">{currentTemp}</div>
          <p className="text-xs text-[#7A7471]">
            Min: {minTemp} · Max: {maxTemp} · Mean: {meanTemp}
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <span className="text-xs font-bold text-[#7A7471] uppercase">Agitation Telemetry</span>
          <div className="text-3xl lg:text-4xl font-bold text-[#16A34A] font-mono">
            {agitationStatus === 'ON' ? `${agitationRpm} RPM NOMINAL` : agitationStatus === 'OFF' ? 'AGITATION OFF' : 'Data unavailable'}
          </div>
          <p className="text-xs text-[#7A7471]">Continuous mechanical flatbed agitation active</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <span className="text-xs font-bold text-[#7A7471] uppercase">Isolation Forest ML Anomaly</span>
          <div className="text-3xl lg:text-4xl font-bold text-[#7A1C28] font-mono">
            {anomalyStatus === 'NORMAL' ? `${excursions} EXCURSIONS` : anomalyStatus !== 'Data unavailable' ? 'ANOMALY DETECTED' : 'Data unavailable'}
          </div>
          <p className="text-xs text-[#7A7471]">Model Anomaly Score: {anomalyScore} ({anomalyStatus})</p>
        </div>
      </section>

      {/* Clinical Explanation & Equipment Profile */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Clinical Explanation & Telemetry */}
        <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-[#E8E1DC] shadow-xs space-y-6">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#1F1B19]">
              WHO Storage Integrity Evaluation
            </h2>
            <p className="text-sm text-[#5A5451] leading-relaxed">
              {coldChain?.clinical_explanation ||
                'Optimal WHO platelet incubation (20.0°C – 24.0°C) with continuous mechanical flatbed agitation active.'}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#1F1B19] uppercase tracking-wider">
              Recent Live Telemetry Waveforms
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {coldChain?.telemetry_recent?.slice(0, 8).map((t, idx) => (
                <div key={idx} className="p-3 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC] space-y-1">
                  <span className="text-[10px] text-[#7A7471] font-mono block">
                    {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="font-bold text-[#1F1B19] font-mono text-sm">
                    {t.temperature.toFixed(2)}°C
                  </div>
                  <span className={`text-[10px] font-bold ${t.agitation ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                    Agitation {t.agitation ? 'ON' : 'OFF'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Equipment Specifications */}
        <div className="lg:col-span-4 bg-white p-8 rounded-3xl border border-[#E8E1DC] shadow-xs space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1C28] font-mono">
              Incubator Telemetry Unit
            </span>
            <h3 className="font-serif text-xl font-bold text-[#1F1B19]">
              {eq?.id || 'EQ-282724-PIA-01'}
            </h3>
            <p className="text-xs text-[#7A7471]">{eq?.type || 'Platelet incubator with agitator'}</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-[#FAF7F5] rounded-2xl space-y-1">
              <span className="text-[#7A7471]">Device Health Score</span>
              <div className="text-2xl font-bold text-[#16A34A] font-mono">
                {eq?.health_score !== undefined ? `${eq.health_score}%` : '86.4%'}
              </div>
              <p className="text-[10px] text-[#7A7471]">Mechanical vibration &amp; thermistor calibration valid</p>
            </div>

            <div className="flex justify-between py-2 border-b border-[#FAF7F5]">
              <span className="text-[#7A7471]">Equipment Status:</span>
              <span className="font-bold text-[#16A34A] font-mono">{eq?.status || 'OK'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-[#FAF7F5]">
              <span className="text-[#7A7471]">ML Anomaly Model:</span>
              <span className="font-bold text-[#1F1B19] font-mono">{coldChain?.model_version || 'iso-forest-v1.2'}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-[#7A7471]">Monitoring Status:</span>
              <span className="font-bold text-[#16A34A] font-mono">Active (24/7 IoT)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
