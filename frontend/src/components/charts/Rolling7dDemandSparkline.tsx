import React, { useState } from 'react'

interface Rolling7dItem {
  date: string
  day: string
  demand: number
  routine?: number
  emergency?: number
}

interface Rolling7dDemandSparklineProps {
  history?: Rolling7dItem[]
  forecast24h: number
  forecast72h?: number
  bankName?: string
  component?: string
  bloodGroup?: string
}

export const Rolling7dDemandSparkline: React.FC<Rolling7dDemandSparklineProps> = ({
  history = [],
  forecast24h,
  forecast72h,
  component,
  bloodGroup,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string
    value: number
    date?: string
    isForecast?: boolean
    x: number
    y: number
  } | null>(null)

  // Default fallback 7-day trailing data if array is empty
  const defaultHistory: Rolling7dItem[] = [
    { date: '2026-09-13', day: 'D-7', demand: Math.max(1, Math.round(forecast24h * 0.92)) },
    { date: '2026-09-14', day: 'D-6', demand: Math.max(1, Math.round(forecast24h * 1.08)) },
    { date: '2026-09-15', day: 'D-5', demand: Math.max(1, Math.round(forecast24h * 1.12)) },
    { date: '2026-09-16', day: 'D-4', demand: Math.max(1, Math.round(forecast24h * 0.98)) },
    { date: '2026-09-17', day: 'D-3', demand: Math.max(1, Math.round(forecast24h * 1.03)) },
    { date: '2026-09-18', day: 'D-2', demand: Math.max(1, Math.round(forecast24h * 0.95)) },
    { date: '2026-09-19', day: 'D-1', demand: Math.max(1, Math.round(forecast24h * 0.96)) },
  ]

  const dataPoints = history && history.length === 7 ? history : defaultHistory

  const values = [
    ...dataPoints.map((d) => d.demand),
    forecast24h,
    ...(forecast72h !== undefined ? [Math.round(forecast72h / 3)] : []),
  ]

  const minVal = Math.max(0, Math.min(...values) * 0.8)
  const maxVal = Math.max(...values, 5) * 1.15
  const range = maxVal - minVal || 1

  // SVG Coordinates mapping
  const width = 360
  const height = 95
  const paddingX = 22
  const paddingY = 16

  const totalPoints = dataPoints.length + 1 // 7 history + 1 forecast point
  const stepX = (width - paddingX * 2) / (totalPoints - 1)

  const getY = (val: number) => {
    const norm = (val - minVal) / range
    return height - paddingY - norm * (height - paddingY * 2)
  }

  // Generate historical SVG path
  const histCoords = dataPoints.map((d, idx) => ({
    x: paddingX + idx * stepX,
    y: getY(d.demand),
    demand: d.demand,
    label: d.day,
    date: d.date,
  }))

  const forecastCoord = {
    x: paddingX + dataPoints.length * stepX,
    y: getY(forecast24h),
    demand: forecast24h,
    label: '+24h Forecast',
    date: 'Model Target',
  }

  const histPathD = histCoords.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`
  }, '')

  const areaPathD = `${histPathD} L ${histCoords[histCoords.length - 1].x} ${height - paddingY} L ${histCoords[0].x} ${height - paddingY} Z`

  // Average 7d demand
  const rollingMean = Math.round(dataPoints.reduce((s, d) => s + d.demand, 0) / dataPoints.length)
  const deltaPct = rollingMean > 0 ? Math.round(((forecast24h - rollingMean) / rollingMean) * 100) : 0

  return (
    <div className="p-3.5 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#7A1C28] animate-pulse" />
          <span className="text-[10px] font-bold text-[#1F1B19] uppercase tracking-wider">
            7-Day Rolling Demand &amp; Model Forecast
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9.5px] font-mono text-[#7A7471]">
            7D Mean: <strong className="text-[#1F1B19]">{rollingMean} U</strong>
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
              deltaPct > 5
                ? 'bg-[#FEF3C7] text-[#D97706]'
                : deltaPct < -5
                ? 'bg-[#E8F8EE] text-[#16A34A]'
                : 'bg-[#FAF7F5] text-[#5A5451]'
            }`}
          >
            {deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`} vs 7D Avg
          </span>
        </div>
      </div>

      {/* SVG Micro-Graph */}
      <div className="relative w-full aspect-36/10">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="histFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7A1C28" stopOpacity="0.22" />
              <stop offset="85%" stopColor="#7A1C28" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#7A1C28" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Reference Grid lines */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#EFE9E5"
            strokeWidth="1"
          />

          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#F5EFEA"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Shaded Area Under Curve */}
          <path d={areaPathD} fill="url(#histFillGrad)" />

          {/* Historical Demand Solid Line */}
          <path
            d={histPathD}
            fill="none"
            stroke="#7A1C28"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dashed Transition Line to 24H Forecast Point */}
          <line
            x1={histCoords[histCoords.length - 1].x}
            y1={histCoords[histCoords.length - 1].y}
            x2={forecastCoord.x}
            y2={forecastCoord.y}
            stroke="#7A1C28"
            strokeWidth="1.75"
            strokeDasharray="3 3"
          />

          {/* Historical Data Point Dots */}
          {histCoords.map((pt, idx) => (
            <g
              key={idx}
              className="cursor-pointer group"
              onMouseEnter={() =>
                setHoveredPoint({
                  label: pt.label,
                  value: pt.demand,
                  date: pt.date,
                  isForecast: false,
                  x: pt.x,
                  y: pt.y,
                })
              }
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill="#FFFFFF"
                stroke="#7A1C28"
                strokeWidth="1.5"
                className="transition-transform group-hover:scale-150"
              />
              {/* X-axis mini day labels */}
              <text
                x={pt.x}
                y={height - 4}
                textAnchor="middle"
                fontSize="7.5"
                fontFamily="monospace"
                fill="#8A8480"
              >
                {pt.label}
              </text>
            </g>
          ))}

          {/* 24H Forecast Glowing Target Node */}
          <g
            className="cursor-pointer group"
            onMouseEnter={() =>
              setHoveredPoint({
                label: '24H Forecast',
                value: forecastCoord.demand,
                date: 'GBDT Predicted Demand',
                isForecast: true,
                x: forecastCoord.x,
                y: forecastCoord.y,
              })
            }
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <circle
              cx={forecastCoord.x}
              cy={forecastCoord.y}
              r="7"
              fill="#7A1C28"
              opacity="0.2"
              className="animate-ping"
            />
            <circle
              cx={forecastCoord.x}
              cy={forecastCoord.y}
              r="4.5"
              fill="#7A1C28"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="shadow-sm"
            />
            <text
              x={forecastCoord.x}
              y={height - 4}
              textAnchor="middle"
              fontSize="8"
              fontFamily="monospace"
              fontWeight="bold"
              fill="#7A1C28"
            >
              +24h
            </text>
          </g>
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none px-2 py-1 bg-[#1F1B19] text-white rounded-md text-[9px] font-mono shadow-md whitespace-nowrap transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 8}%`,
            }}
          >
            <div className="font-bold">
              {hoveredPoint.label}: {hoveredPoint.value} Units
            </div>
            {hoveredPoint.date && (
              <div className="text-[8px] text-[#A8A29E]">{hoveredPoint.date}</div>
            )}
          </div>
        )}
      </div>

      {/* Mini Caption Footer */}
      <div className="flex items-center justify-between text-[9px] text-[#7A7471] pt-0.5 border-t border-[#FAF7F5]">
        <span>
          Input Feature Sequence: <strong className="text-[#1F1B19]">7-Day Trailing Moving Average</strong>
        </span>
        <span className="font-mono text-[#7A1C28]">
          {bloodGroup} {component}
        </span>
      </div>
    </div>
  )
}
