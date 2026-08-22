import { useState } from 'react'
import { LiveColdChainTelemetryGraph, type SpikeStateInfo } from '../../components/charts/LiveColdChainTelemetryGraph'
import type { CentreColdChainData } from '../../types'

interface Step5CentreColdChainProps {
  coldChain?: CentreColdChainData | null
  isFromExpiryRisk?: boolean
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step5CentreColdChain({
  coldChain,
  isFromExpiryRisk = false,
  onNavigateToStep,
}: Step5CentreColdChainProps) {
  const [spikeState, setSpikeState] = useState<SpikeStateInfo | null>(null)

  const isSpiked = spikeState?.isSpiked ?? false

  const currentTemp = isSpiked
    ? `${spikeState?.currentTemp.toFixed(2)}°C`
    : coldChain
    ? `${coldChain.current_temperature.toFixed(2)}°C`
    : '20.94°C'

  const minTemp = coldChain ? `${coldChain.min_temperature.toFixed(2)}°C` : '20.72°C'
  const maxTemp = isSpiked
    ? `${spikeState?.currentTemp.toFixed(2)}°C`
    : coldChain
    ? `${coldChain.max_temperature.toFixed(2)}°C`
    : '21.22°C'
  const meanTemp = isSpiked
    ? `${((coldChain?.mean_temperature ?? 20.94) + 1.2).toFixed(2)}°C`
    : coldChain
    ? `${coldChain.mean_temperature.toFixed(2)}°C`
    : '20.94°C'

  const agitationStatus = isSpiked
    ? spikeState?.agitationStatus ?? 'OFF'
    : coldChain?.agitation_status ?? 'ON'

  const agitationRpm = isSpiked
    ? spikeState?.agitationRpm ?? 0
    : coldChain?.agitation_rpm ?? 60

  const excursions = isSpiked
    ? spikeState?.excursions ?? 1
    : coldChain?.excursions_count ?? 0

  const anomalyScore = isSpiked
    ? (spikeState?.anomalyScore ?? 0.785).toFixed(4)
    : coldChain
    ? coldChain.anomaly_score.toFixed(4)
    : '0.0725'

  const anomalyStatus = isSpiked
    ? 'ANOMALY DETECTED'
    : coldChain?.anomaly_status ?? 'NORMAL'

  const healthScore = isSpiked
    ? spikeState?.healthScore ?? 42
    : coldChain?.equipment?.health_score ?? 86.4

  const eq = coldChain?.equipment

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-[1540px] mx-auto w-full space-y-8 select-none font-sans bg-[#FAF7F5]">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pt-1 pb-1">
        <div className="space-y-2.5 max-w-[850px]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#FCECEE] text-[#7A1C28] text-[11px] font-bold rounded-full uppercase tracking-wider font-mono">
              Step 05 of 10
            </span>
            <span className="text-xs text-[#7A7471] font-bold uppercase tracking-wider">
              WHO Cold Chain &amp; Agitation Telemetry
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#7A1C28] leading-tight tracking-tight">
            Is the cold chain secure at Chennai RGH?
          </h1>

          <p className="text-sm sm:text-base text-[#5A5451] leading-relaxed max-w-[780px]">
            Isolation Forest anomaly detection monitoring real storage temperatures (20.0°C – 24.0°C bounds) and platelet flatbed agitations across the <strong className="text-[#1F1B19] font-semibold">200 km regional network</strong>.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('pressure')}
          className="bg-[#7A1C28] hover:bg-[#63141F] text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center gap-2 self-start lg:self-auto shrink-0"
        >
          <span>View Regional Pressure</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </section>

      {/* Primary Telemetry Metrics (Proportional Font Formatting) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className={`p-5 rounded-3xl border transition-all space-y-1.5 ${
          isSpiked
            ? 'bg-[#FFF8F8] border-[#FCA5A5] shadow-sm ring-2 ring-[#DC2626]/20'
            : 'bg-white border-[#E8E1DC] shadow-2xs'
        }`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isSpiked ? 'text-[#DC2626]' : 'text-[#7A7471]'}`}>
            Current Storage Temperature
          </span>
          <div className={`text-2xl sm:text-3xl font-bold font-mono ${isSpiked ? 'text-[#DC2626]' : 'text-[#1F1B19]'}`}>
            {currentTemp}
          </div>
          <p className="text-[11px] text-[#7A7471]">
            Min: {minTemp} · Max: {maxTemp} · Mean: {meanTemp}
          </p>
        </div>

        <div className={`p-5 rounded-3xl border transition-all space-y-1.5 ${
          isSpiked
            ? 'bg-[#FFF8F8] border-[#FCA5A5] shadow-sm ring-2 ring-[#DC2626]/20'
            : 'bg-white border-[#E8E1DC] shadow-2xs'
        }`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isSpiked ? 'text-[#DC2626]' : 'text-[#7A7471]'}`}>
            Agitation Telemetry
          </span>
          <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${isSpiked ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
            {agitationStatus === 'ON' ? `${agitationRpm} RPM NOMINAL` : 'AGITATION OFF (0 RPM)'}
          </div>
          <p className="text-[11px] text-[#7A7471]">
            {isSpiked ? '⚠️ Mechanical flatbed agitation interrupted' : 'Continuous mechanical flatbed agitation active'}
          </p>
        </div>

        <div className={`p-5 rounded-3xl border transition-all space-y-1.5 ${
          isSpiked
            ? 'bg-[#FFF8F8] border-[#FCA5A5] shadow-sm ring-2 ring-[#DC2626]/20'
            : 'bg-white border-[#E8E1DC] shadow-2xs'
        }`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isSpiked ? 'text-[#DC2626]' : 'text-[#7A7471]'}`}>
            Isolation Forest ML Anomaly
          </span>
          <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${isSpiked ? 'text-[#DC2626]' : 'text-[#7A1C28]'}`}>
            {isSpiked ? `${excursions} EXCURSION DETECTED` : `${excursions} EXCURSIONS`}
          </div>
          <p className="text-[11px] text-[#7A7471]">
            Model Score: <strong className={isSpiked ? 'text-[#DC2626]' : 'text-[#1F1B19]'}>{anomalyScore}</strong> ({anomalyStatus})
          </p>
        </div>
      </section>

      {/* Clinical Explanation & Live Simulated Telemetry Stream */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Live Simulated Telemetry Graph Channel */}
        <div className="lg:col-span-8 space-y-5">
          {/* Clinical Assessment Description */}
          <div className={`p-5 rounded-3xl border transition-all space-y-1.5 ${
            isSpiked
              ? 'bg-[#FFF8F8] border-[#FCA5A5] shadow-2xs'
              : 'bg-white border-[#E8E1DC] shadow-2xs'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1B19]">
                Cold Chain Monitoring Model
              </h2>
              {isSpiked && (
                <span className="px-2.5 py-0.5 bg-[#FEE2E2] text-[#991B1B] rounded-md font-mono text-[9.5px] font-bold border border-[#FCA5A5] animate-pulse">
                  CRITICAL EXCURSION ALERT
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#5A5451] leading-relaxed">
              {isSpiked
                ? (spikeState?.explanation || '⚠️ CRITICAL ALARM: Thermal excursion active. Temperature breached safe upper limit at 27.65°C (>24.0°C). Mechanical flatbed agitation has stopped (0 RPM).')
                : (coldChain?.clinical_explanation || 'Optimal WHO platelet incubation (20.0°C – 24.0°C) with continuous mechanical flatbed agitation active at 60 RPM.')}
            </p>
          </div>

          {/* Live Simulated Waveform Telemetry Graph */}
          <LiveColdChainTelemetryGraph
            initialTelemetry={coldChain?.telemetry_recent}
            meanTemperature={coldChain?.mean_temperature ?? 20.94}
            currentTemperature={coldChain?.current_temperature ?? 20.94}
            agitationStatus={coldChain?.agitation_status}
            agitationRpm={coldChain?.agitation_rpm ?? 60}
            equipmentId={eq?.id || 'EQ-282724-PIA-01'}
            isDemoSpikeEnabled={isFromExpiryRisk}
            onSpikeStateChange={setSpikeState}
          />
        </div>

        {/* Right: Equipment Specifications */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1C28] font-mono">
              Incubator Telemetry Unit
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1F1B19]">
              {eq?.id || 'EQ-282724-PIA-01'}
            </h3>
            <p className="text-xs text-[#7A7471]">{eq?.type || 'Platelet incubator with agitator'}</p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className={`p-3.5 rounded-2xl space-y-1 ${
              isSpiked ? 'bg-[#FFF5F5] border border-[#FECACA]' : 'bg-[#FAF7F5]'
            }`}>
              <span className="text-[#7A7471] text-[11px]">Device Health Score</span>
              <div className={`text-2xl font-bold font-mono ${isSpiked ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                {healthScore}%
              </div>
              <p className="text-[10px] text-[#7A7471]">
                {isSpiked
                  ? '⚠️ Excursion stress detected; thermistor drift flagged'
                  : 'Mechanical vibration & thermistor calibration valid'}
              </p>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#FAF7F5]">
              <span className="text-[#7A7471]">Equipment Status:</span>
              <span className={`font-bold font-mono ${isSpiked ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                {isSpiked ? 'ATTENTION REQUIRED' : eq?.status || 'OK'}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#FAF7F5]">
              <span className="text-[#7A7471]">ML Anomaly Model:</span>
              <span className="font-bold text-[#1F1B19] font-mono">{coldChain?.model_version || 'iso-forest-v1.2'}</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-[#7A7471]">Monitoring Status:</span>
              <span className={`font-bold font-mono ${isSpiked ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                {isSpiked ? 'Alarm Active (IoT Broadcast)' : 'Active (24/7 IoT)'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
