import type { DashboardSummary } from '../../types'

interface NetworkStatusRailProps {
  summary: DashboardSummary | null
  activeTransfersCount: number
  highRiskCount: number
}

export function NetworkStatusRail({
  summary,
  activeTransfersCount,
  highRiskCount,
}: NetworkStatusRailProps) {
  let statusText = 'NETWORK STABLE'
  let statusColor = 'border-emerald-500/30'
  let textColor = 'text-emerald-400'
  let dotColor = 'bg-emerald-500'

  if (highRiskCount > 0 || (summary && (summary.equipment_warnings ?? 0) > 0)) {
    statusText = 'ACTION REQUIRED'
    statusColor = 'border-rose-500/40'
    textColor = 'text-rose-400'
    dotColor = 'bg-rose-500'
  } else if (activeTransfersCount > 0 || (summary && summary.low_stock > 0)) {
    statusText = 'NETWORK UNDER PRESSURE'
    statusColor = 'border-amber-500/40'
    textColor = 'text-amber-400'
    dotColor = 'bg-amber-500'
  }

  return (
    <>
      {/* Perimeter Monitor Frame Lines */}
      <div className={`fixed top-0 left-0 right-0 h-0.5 pointer-events-none z-50 transition-colors duration-700 ${statusColor} bg-gradient-to-r from-transparent via-current to-transparent opacity-60`} />
      <div className={`fixed bottom-0 left-0 right-0 h-0.5 pointer-events-none z-50 transition-colors duration-700 ${statusColor} bg-gradient-to-r from-transparent via-current to-transparent opacity-60`} />

      {/* Unobtrusive Bottom-Left Telemetry Pill */}
      <div className="fixed bottom-3 left-4 z-40 flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-[#06090e]/80 backdrop-blur-md text-[10px] font-mono tracking-widest uppercase text-slate-400 pointer-events-none">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor} animate-pulse`} />
        <span className={`font-semibold ${textColor}`}>{statusText}</span>
        <span className="text-slate-600">·</span>
        <span>5 HUBS ACTIVE</span>
      </div>
    </>
  )
}
