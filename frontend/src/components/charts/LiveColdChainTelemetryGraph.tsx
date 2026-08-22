import React, { useEffect, useMemo, useRef, useState } from 'react'

interface TelemetryPoint {
  timestamp: string
  timeLabel: string
  temperature: number
  agitation: boolean
  rpm: number
}

export interface SpikeStateInfo {
  isSpiked: boolean
  currentTemp: number
  anomalyScore: number
  anomalyStatus: string
  healthScore: number
  agitationStatus: string
  agitationRpm: number
  excursions: number
  explanation?: string
}

interface LiveColdChainTelemetryGraphProps {
  initialTelemetry?: {
    timestamp: string
    temperature: number
    agitation: boolean
  }[]
  meanTemperature?: number
  currentTemperature?: number
  agitationStatus?: string
  agitationRpm?: number
  equipmentId?: string
  isDemoSpikeEnabled?: boolean
  onSpikeStateChange?: (state: SpikeStateInfo) => void
}

export const LiveColdChainTelemetryGraph: React.FC<LiveColdChainTelemetryGraphProps> = ({
  initialTelemetry = [],
  meanTemperature = 20.94,
  currentTemperature = 20.94,
  agitationRpm = 60,
  equipmentId = 'EQ-282724-PIA-01',
  isDemoSpikeEnabled = false,
  onSpikeStateChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [hoveredPoint, setHoveredPoint] = useState<TelemetryPoint | null>(null)
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
  const [isSpiked, setIsSpiked] = useState<boolean>(false)

  // Initialize buffer with 18 data points
  const [telemetryData, setTelemetryData] = useState<TelemetryPoint[]>(() => {
    const base = currentTemperature || meanTemperature || 20.94
    const now = Date.now()

    if (initialTelemetry && initialTelemetry.length >= 8) {
      return initialTelemetry.slice(0, 18).reverse().map((t, idx) => {
        const d = new Date(t.timestamp || now - (17 - idx) * 1000)
        return {
          timestamp: d.toISOString(),
          timeLabel: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          temperature: Number(t.temperature.toFixed(2)),
          agitation: t.agitation ?? true,
          rpm: t.agitation ? agitationRpm : 0,
        }
      })
    }

    return Array.from({ length: 18 }, (_, i) => {
      const timeMs = now - (17 - i) * 1000
      const d = new Date(timeMs)
      // Visibly lively physiological wave variation (±0.18°C)
      const noise = Math.sin(i * 0.7) * 0.16 + Math.cos(i * 1.4) * 0.09
      const temp = Number((base + noise).toFixed(2))
      return {
        timestamp: d.toISOString(),
        timeLabel: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temperature: temp,
        agitation: true,
        rpm: agitationRpm,
      }
    })
  })

  const tickRef = useRef(0)

  // 1-second interval timer for live stream and demo countdown
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      tickRef.current += 1
      const now = new Date()
      const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      const t = tickRef.current

      // Increment elapsed time if demo mode is enabled
      if (isDemoSpikeEnabled) {
        setElapsedSeconds((prev) => {
          const next = prev + 1
          if (next >= 10 && !isSpiked) {
            setIsSpiked(true)
          }
          return next
        })
      }

      let newTemp = 20.94
      let isAgiOn = true
      let currentRpm = agitationRpm

      if (isDemoSpikeEnabled && (elapsedSeconds >= 10 || isSpiked)) {
        // Temperature Surge: Climbing far off the limits (21.5°C -> 24.5°C -> 26.2°C -> 27.65°C)
        const spikeProg = Math.min(1.0, ((elapsedSeconds || 10) - 10) / 7 + 0.2)
        const surge = spikeProg * 6.5 + Math.sin(t * 0.9) * 0.22 + (Math.random() - 0.5) * 0.12
        newTemp = Number((20.94 + surge).toFixed(2))

        // Agitator turns completely OFF immediately upon spike
        isAgiOn = false
        currentRpm = 0

        if (onSpikeStateChange) {
          onSpikeStateChange({
            isSpiked: true,
            currentTemp: newTemp,
            anomalyScore: Number((0.785 + spikeProg * 0.16).toFixed(4)),
            anomalyStatus: 'ANOMALY DETECTED',
            healthScore: Math.max(38, Math.round(86.4 - spikeProg * 45.0)),
            agitationStatus: 'OFF',
            agitationRpm: 0,
            excursions: 1,
            explanation: `⚠️ CRITICAL ALARM: Thermal excursion active. Temperature breached safe upper limit at ${newTemp.toFixed(2)}°C (>24.0°C). Mechanical flatbed agitation has stopped (0 RPM).`,
          })
        }
      } else {
        // Highly visible continuous live micro-fluctuations (1 Hz)
        const wave1 = Math.sin(t * 0.6) * 0.18
        const wave2 = Math.cos(t * 1.25) * 0.11
        const jitter = (Math.random() - 0.5) * 0.08
        newTemp = Number((meanTemperature + wave1 + wave2 + jitter).toFixed(2))

        if (onSpikeStateChange && isSpiked) {
          onSpikeStateChange({
            isSpiked: false,
            currentTemp: newTemp,
            anomalyScore: 0.0725,
            anomalyStatus: 'NORMAL',
            healthScore: 86.4,
            agitationStatus: 'ON',
            agitationRpm,
            excursions: 0,
            explanation: 'Optimal WHO platelet incubation (20.0°C – 24.0°C) with continuous mechanical flatbed agitation active at 60 RPM.',
          })
        }
      }

      const newPoint: TelemetryPoint = {
        timestamp: now.toISOString(),
        timeLabel,
        temperature: newTemp,
        agitation: isAgiOn,
        rpm: currentRpm,
      }

      setTelemetryData((prev) => [...prev.slice(1), newPoint])
    }, 1000) // Updates every 1000ms (1 second)

    return () => clearInterval(interval)
  }, [isPlaying, meanTemperature, agitationRpm, isDemoSpikeEnabled, elapsedSeconds, isSpiked, onSpikeStateChange])

  // Discreet reset / trigger toggle
  const handleToggleSimulation = () => {
    if (isSpiked) {
      setElapsedSeconds(0)
      setIsSpiked(false)
      tickRef.current = 0
      if (onSpikeStateChange) {
        onSpikeStateChange({
          isSpiked: false,
          currentTemp: 20.94,
          anomalyScore: 0.0725,
          anomalyStatus: 'NORMAL',
          healthScore: 86.4,
          agitationStatus: 'ON',
          agitationRpm,
          excursions: 0,
          explanation: 'Optimal WHO platelet incubation (20.0°C – 24.0°C) with continuous mechanical flatbed agitation active at 60 RPM.',
        })
      }
    } else {
      setElapsedSeconds(10)
      setIsSpiked(true)
    }
  }

  // Current Live Values
  const latestPoint = telemetryData[telemetryData.length - 1] || {
    temperature: currentTemperature,
    timeLabel: 'Live',
    agitation: true,
    rpm: agitationRpm,
  }

  const hasBreachedWHO = latestPoint.temperature > 24.0 || latestPoint.temperature < 20.0

  // SVG Dimension Constants with safe margins to completely prevent boundary overflow
  const width = 640
  const height = 215
  const paddingLeft = 48
  const paddingRight = 36 // Generous padding so dots and ping halos never clip or bleed
  const paddingTop = 26

  const plotWidth = width - paddingLeft - paddingRight
  const tempPlotHeight = 112
  const agiPlotY = 160
  const agiPlotHeight = 22

  // Y Scale fixed from 19.0°C to 28.5°C so the spike clearly surges way off the 24°C line
  const tempMinY = 19.0
  const tempMaxY = isSpiked ? 28.5 : 25.5
  const tempRange = tempMaxY - tempMinY

  const getTempY = (val: number) => {
    const clamped = Math.max(tempMinY, Math.min(tempMaxY, val))
    const norm = (clamped - tempMinY) / tempRange
    return paddingTop + tempPlotHeight - norm * tempPlotHeight
  }

  const whoSafeTopY = getTempY(24.0)
  const whoSafeBottomY = getTempY(20.0)
  const whoNominalY = getTempY(22.0)

  // Coordinates for Temperature Line & Area
  const tempCoords = useMemo(() => {
    const count = telemetryData.length
    const stepX = plotWidth / Math.max(1, count - 1)
    return telemetryData.map((d, i) => ({
      x: paddingLeft + i * stepX,
      y: getTempY(d.temperature),
      data: d,
    }))
  }, [telemetryData, plotWidth, paddingLeft, tempMaxY])

  const tempPathD = useMemo(() => {
    return tempCoords.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`
    }, '')
  }, [tempCoords])

  const tempAreaD = useMemo(() => {
    if (tempCoords.length === 0) return ''
    const firstX = tempCoords[0].x
    const lastX = tempCoords[tempCoords.length - 1].x
    const baseY = getTempY(20.0)
    return `${tempPathD} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`
  }, [tempCoords, tempPathD])

  // Mechanical Agitation Waveform
  const agiCoords = useMemo(() => {
    const count = telemetryData.length
    const stepX = plotWidth / Math.max(1, count - 1)
    return telemetryData.map((d, i) => {
      const x = paddingLeft + i * stepX
      if (!d.agitation || d.rpm === 0) {
        return { x, y: agiPlotY + agiPlotHeight } // Flat 0 RPM line
      }
      const isHigh = (i + tickRef.current) % 2 === 0
      const y = isHigh ? agiPlotY : agiPlotY + agiPlotHeight
      return { x, y }
    })
  }, [telemetryData, plotWidth, paddingLeft, agiPlotY, agiPlotHeight])

  const agiPathD = useMemo(() => {
    return agiCoords.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`
    }, '')
  }, [agiCoords])

  return (
    <div className={`p-5 sm:p-6 rounded-3xl border transition-all select-none space-y-3.5 ${
      hasBreachedWHO
        ? 'bg-[#FFF8F8] border-[#FCA5A5] shadow-md ring-2 ring-[#DC2626]/20'
        : 'bg-white border-[#E8E1DC] shadow-xs'
    }`}>
      {/* Header with Live Telemetry Badge and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#FAF7F5]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="relative flex h-2.5 w-2.5">
              {isPlaying && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  hasBreachedWHO ? 'bg-[#DC2626]' : 'bg-[#16A34A]'
                }`} />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  hasBreachedWHO ? 'bg-[#DC2626]' : isPlaying ? 'bg-[#16A34A]' : 'bg-[#D97706]'
                }`}
              />
            </span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#1F1B19]">
              LIVE TELEMETRY STREAM (1 Hz) · IoT PROBE SENSOR
            </span>
            <span className="px-2 py-0.5 bg-[#FAF7F5] text-[#7A7471] rounded-md font-mono text-[10px] border border-[#E8E1DC]">
              {equipmentId}
            </span>

            {/* Almost invisible discreet calibration trigger */}
            <button
              onClick={handleToggleSimulation}
              className="opacity-15 hover:opacity-100 transition-opacity p-0.5 text-[#7A7471] hover:text-[#7A1C28] rounded cursor-pointer ml-1"
              title="Toggle Calibration Probe"
            >
              <span className="material-symbols-outlined text-[13px]">sensors</span>
            </button>
          </div>
          <p className="text-xs text-[#5A5451] mt-0.5">
            {hasBreachedWHO
              ? 'THERMAL ALARM: Sensor probe has breached WHO upper storage boundary (>24.0°C).'
              : 'Continuous calibrated thermistor probe with mechanical flatbed agitation telemetry.'}
          </p>
        </div>

        {/* Live Readout & Play/Pause */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <span className="text-[10px] text-[#7A7471] font-bold uppercase block">Live Probe</span>
            <span className={`text-xl sm:text-2xl font-bold font-mono leading-none ${
              hasBreachedWHO ? 'text-[#DC2626] animate-pulse' : 'text-[#7A1C28]'
            }`}>
              {latestPoint.temperature.toFixed(2)}°C
            </span>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-[#FAF7F5] hover:bg-[#F3EFEA] text-[#1F1B19] rounded-xl border border-[#E8E1DC] transition-all cursor-pointer text-xs font-bold flex items-center gap-1"
            title={isPlaying ? 'Pause Live Stream' : 'Resume Live Stream'}
          >
            <span className="material-symbols-outlined text-[15px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span>{isPlaying ? 'Pause' : 'Live'}</span>
          </button>
        </div>
      </div>

      {/* Main SVG Telemetry Chart (with overflow-hidden) */}
      <div className="relative w-full aspect-16/7 sm:aspect-16/6 bg-[#FAF7F5] rounded-2xl p-2 border border-[#E8E1DC] overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          onMouseLeave={() => {
            setHoveredPoint(null)
            setHoverPos(null)
          }}
        >
          <defs>
            {/* Safe Range Area Gradient */}
            <linearGradient id="whoSafeZoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#16A34A" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#16A34A" stopOpacity="0.02" />
            </linearGradient>

            {/* Temperature Curve Fill */}
            <linearGradient id="tempCurveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={hasBreachedWHO ? '#DC2626' : '#7A1C28'} stopOpacity="0.25" />
              <stop offset="100%" stopColor={hasBreachedWHO ? '#DC2626' : '#7A1C28'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* WHO Safe Range Shaded Band [20.0°C – 24.0°C] */}
          <rect
            x={paddingLeft}
            y={whoSafeTopY}
            width={plotWidth}
            height={whoSafeBottomY - whoSafeTopY}
            fill="url(#whoSafeZoneGrad)"
          />

          {/* Safe Range Upper Bound Line (24.0°C) */}
          <line
            x1={paddingLeft}
            y1={whoSafeTopY}
            x2={width - paddingRight}
            y2={whoSafeTopY}
            stroke="#DC2626"
            strokeWidth="1.25"
            strokeDasharray="4 3"
            opacity="0.8"
          />
          <text
            x={paddingLeft - 6}
            y={whoSafeTopY + 3}
            textAnchor="end"
            fontSize="8"
            fontFamily="monospace"
            fill="#DC2626"
            fontWeight="bold"
          >
            24.0°C
          </text>

          {/* Nominal 22.0°C Target Line */}
          <line
            x1={paddingLeft}
            y1={whoNominalY}
            x2={width - paddingRight}
            y2={whoNominalY}
            stroke="#16A34A"
            strokeWidth="1"
            strokeDasharray="2 4"
            opacity="0.4"
          />
          <text
            x={paddingLeft - 6}
            y={whoNominalY + 3}
            textAnchor="end"
            fontSize="8"
            fontFamily="monospace"
            fill="#16A34A"
          >
            22.0°C
          </text>

          {/* Safe Range Lower Bound Line (20.0°C) */}
          <line
            x1={paddingLeft}
            y1={whoSafeBottomY}
            x2={width - paddingRight}
            y2={whoSafeBottomY}
            stroke="#DC2626"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity="0.6"
          />
          <text
            x={paddingLeft - 6}
            y={whoSafeBottomY + 3}
            textAnchor="end"
            fontSize="8"
            fontFamily="monospace"
            fill="#DC2626"
            fontWeight="bold"
          >
            20.0°C
          </text>

          {/* WHO Safe Range Badge */}
          <text
            x={width - paddingRight - 4}
            y={whoSafeTopY + 12}
            textAnchor="end"
            fontSize="7.5"
            fontFamily="monospace"
            fill="#166534"
            fontWeight="bold"
          >
            WHO Safe In-Range Envelope (20.0°C – 24.0°C)
          </text>

          {/* Temperature Shaded Area */}
          <path d={tempAreaD} fill="url(#tempCurveGrad)" />

          {/* Temperature Live Path Line */}
          <path
            d={tempPathD}
            fill="none"
            stroke={hasBreachedWHO ? '#DC2626' : '#7A1C28'}
            strokeWidth={hasBreachedWHO ? '2.75' : '2.25'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Temperature Data Points */}
          {tempCoords.map((pt, idx) => {
            const isLast = idx === tempCoords.length - 1
            const isOut = pt.data.temperature > 24.0 || pt.data.temperature < 20.0
            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => {
                  setHoveredPoint(pt.data)
                  setHoverPos({ x: pt.x, y: pt.y })
                }}
              >
                <circle cx={pt.x} cy={pt.y} r="10" fill="transparent" />

                {isLast ? (
                  <>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="7"
                      fill={isOut ? '#DC2626' : '#7A1C28'}
                      opacity="0.3"
                      className="animate-ping"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      fill={isOut ? '#DC2626' : '#7A1C28'}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  </>
                ) : (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isOut ? '3' : '2.2'}
                    fill={isOut ? '#DC2626' : '#FFFFFF'}
                    stroke={isOut ? '#991B1B' : '#7A1C28'}
                    strokeWidth="1.25"
                  />
                )}
              </g>
            )
          })}

          {/* Divider between Temperature and Agitation */}
          <line
            x1={paddingLeft}
            y1={148}
            x2={width - paddingRight}
            y2={148}
            stroke="#E8E1DC"
            strokeWidth="1"
          />

          {/* Agitation Channel Label */}
          <text
            x={paddingLeft - 6}
            y={agiPlotY + 13}
            textAnchor="end"
            fontSize="8"
            fontFamily="monospace"
            fill={latestPoint.agitation ? '#16A34A' : '#DC2626'}
            fontWeight="bold"
          >
            {latestPoint.agitation ? '60 RPM' : '0 RPM'}
          </text>
          <text
            x={paddingLeft + 4}
            y={agiPlotY - 4}
            fontSize="7.5"
            fontFamily="monospace"
            fill={latestPoint.agitation ? '#7A7471' : '#DC2626'}
            fontWeight="bold"
          >
            {latestPoint.agitation
              ? 'MECHANICAL FLATBED AGITATION (60 RPM)'
              : '⚠️ FLATBED AGITATION INTERRUPTED (0 RPM)'}
          </text>

          {/* Agitation Stepper Line */}
          <path
            d={agiPathD}
            fill="none"
            stroke={latestPoint.agitation ? '#16A34A' : '#DC2626'}
            strokeWidth={latestPoint.agitation ? '1.75' : '2.25'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X-Axis Timestamps */}
          {tempCoords.filter((_, i) => i % 4 === 0 || i === tempCoords.length - 1).map((pt, idx) => (
            <text
              key={idx}
              x={pt.x}
              y={height - 8}
              textAnchor="middle"
              fontSize="7"
              fontFamily="monospace"
              fill="#8A8480"
            >
              {pt.data.timeLabel}
            </text>
          ))}
        </svg>

        {/* Hover Crosshair Tooltip */}
        {hoveredPoint && hoverPos && (
          <div
            className="absolute z-20 pointer-events-none px-3 py-1.5 bg-[#1F1B19] text-white rounded-xl text-[10px] font-mono shadow-lg whitespace-nowrap transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${Math.min(92, Math.max(8, (hoverPos.x / width) * 100))}%`,
              top: `${Math.max(15, (hoverPos.y / height) * 100 - 8)}%`,
            }}
          >
            <div className={`font-bold ${
              hoveredPoint.temperature > 24.0 ? 'text-[#FCA5A5]' : 'text-[#FCECEE]'
            }`}>
              {hoveredPoint.temperature.toFixed(2)}°C · {hoveredPoint.temperature > 24.0 ? '⚠️ EXCURSION' : 'Safe In-Range'}
            </div>
            <div className="text-[9px] text-[#A8A29E] flex items-center gap-2 mt-0.5">
              <span>Time: {hoveredPoint.timeLabel}</span>
              <span>·</span>
              <span className={hoveredPoint.agitation ? 'text-[#86EFAC]' : 'text-[#FCA5A5]'}>
                Agitation: {hoveredPoint.agitation ? '60 RPM Active' : '0 RPM Off'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Telemetry Summary Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5 text-xs">
        <div className="p-2.5 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC]">
          <span className="text-[9.5px] text-[#7A7471] font-bold uppercase block">Mean Calibrated Temp</span>
          <span className={`text-xs sm:text-sm font-bold font-mono ${hasBreachedWHO ? 'text-[#DC2626]' : 'text-[#1F1B19]'}`}>
            {latestPoint.temperature.toFixed(2)}°C
          </span>
        </div>

        <div className="p-2.5 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC]">
          <span className="text-[9.5px] text-[#7A7471] font-bold uppercase block">Agitation Stability</span>
          <span className={`text-xs sm:text-sm font-bold font-mono ${latestPoint.agitation ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {latestPoint.agitation ? '100% (60 RPM)' : 'FAULT (0 RPM)'}
          </span>
        </div>

        <div className="p-2.5 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC]">
          <span className="text-[9.5px] text-[#7A7471] font-bold uppercase block">Thermal Excursions</span>
          <span className={`text-xs sm:text-sm font-bold font-mono ${hasBreachedWHO ? 'text-[#DC2626] font-bold' : 'text-[#16A34A]'}`}>
            {hasBreachedWHO ? '1 Detected (>24°C)' : '0 Detected'}
          </span>
        </div>

        <div className="p-2.5 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC]">
          <span className="text-[9.5px] text-[#7A7471] font-bold uppercase block">ML Anomaly Classifier</span>
          <span className={`text-xs sm:text-sm font-bold font-mono ${hasBreachedWHO ? 'text-[#DC2626] font-bold' : 'text-[#1F1B19]'}`}>
            {hasBreachedWHO ? 'Iso-Forest (ANOMALY)' : 'Isolation Forest (OK)'}
          </span>
        </div>
      </div>
    </div>
  )
}
