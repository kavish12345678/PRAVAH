import { useState, useEffect } from 'react'
import type { IntelligenceStatus } from '../../types'

interface TopHeaderProps {
  intelligence: IntelligenceStatus | null
  scanning: boolean
  onRunScan: () => void
  onReplayIntro: () => void
}

export function TopHeader({
  intelligence,
  scanning,
  onRunScan,
  onReplayIntro,
}: TopHeaderProps) {
  const [timeStr, setTimeStr] = useState<string>('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="flex items-center justify-between py-4 border-b border-[#e8e6df] text-slate-900">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
          PRAVAH
        </span>
        <span className="hidden sm:inline-block text-slate-300">/</span>
        <span className="hidden sm:inline-block text-xs uppercase font-mono tracking-wider text-slate-500">
          Blood Supply Flow & Cold-Chain
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs">
        {/* Status indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-[11px] font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          <span>{intelligence ? intelligence.engine.replace('PRAVAH ', '') : 'Operational'}</span>
        </div>

        {/* Timestamp */}
        <div className="hidden md:block text-slate-500 font-mono text-[11px]">
          {timeStr ? `Updated ${timeStr}` : 'Live'}
        </div>

        {/* Intro Replay */}
        <button
          onClick={onReplayIntro}
          className="text-slate-500 hover:text-slate-900 transition font-mono text-xs cursor-pointer"
        >
          Intro ↺
        </button>

        {/* Intelligence Sync Button */}
        <button
          disabled={scanning}
          onClick={onRunScan}
          className="px-3.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium transition cursor-pointer disabled:opacity-50"
        >
          {scanning ? 'Updating...' : 'Sync Intelligence'}
        </button>
      </div>
    </header>
  )
}
