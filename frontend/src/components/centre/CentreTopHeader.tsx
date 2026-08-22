import { useState } from 'react'

interface CentreTopHeaderProps {
  onRefresh: () => Promise<void>
  onRunOptimization: () => void
  onSwitchMode: () => void
  lastSynced: string
  isOptimizing: boolean
  facilityCount: number
  hasError?: boolean
}

export function CentreTopHeader({
  onRefresh,
  onRunOptimization,
  lastSynced,
  isOptimizing,
  facilityCount,
}: CentreTopHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshClick = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <header className="flex justify-between items-center w-full px-6 md:px-8 py-3.5 bg-white border-b border-[#EFE9E5] select-none shadow-2xs">
      {/* Left: Centre Context */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#FCECEE] text-[#7A1C28] flex items-center justify-center font-bold text-xs shrink-0 border border-[#F5D5D9]">
          CR
        </div>
        <div>
          <h2 className="text-[13px] font-bold text-[#1F1B19] leading-tight">
            Chennai Rajiv Gandhi Hospital
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-[#7A7471]">
              Anchor Centre ID: CHN-RGH-001
            </span>
            <span className="px-1.5 py-0.2 bg-[#FCECEE] text-[#7A1C28] text-[9px] font-bold rounded-sm uppercase tracking-wider">
              Primary Hub
            </span>
          </div>
        </div>
      </div>

      {/* Middle: 3 Status Pill Cards */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Pill 1: Facilities */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-white rounded-xl border border-[#E8E1DC] shadow-2xs">
          <span className="material-symbols-outlined text-[18px] text-[#5A5451]">
            domain
          </span>
          <div className="leading-tight">
            <span className="text-[13px] font-bold text-[#1F1B19] block">
              {facilityCount > 0 ? facilityCount : 149}
            </span>
            <span className="text-[9px] text-[#7A7471] block">Facilities Connected</span>
          </div>
        </div>

        {/* Pill 2: Service Radius */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-white rounded-xl border border-[#E8E1DC] shadow-2xs">
          <span className="material-symbols-outlined text-[18px] text-[#5A5451]">
            location_on
          </span>
          <div className="leading-tight">
            <span className="text-[13px] font-bold text-[#1F1B19] block">200 km</span>
            <span className="text-[9px] text-[#7A7471] block">Service Radius</span>
          </div>
        </div>

        {/* Pill 3: Sync Status */}
        <button
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="flex items-center gap-2.5 px-3.5 py-2 bg-white hover:bg-[#FAF7F5] rounded-xl border border-[#E8E1DC] shadow-2xs text-left cursor-pointer transition-colors"
          title="Click to sync data"
        >
          <span
            className={`material-symbols-outlined text-[18px] text-[#5A5451] ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            sync
          </span>
          <div className="leading-tight">
            <span className="text-[13px] font-bold text-[#1F1B19] block">
              {isRefreshing ? 'Syncing...' : 'Synced'}
            </span>
            <span className="text-[9px] text-[#7A7471] block">
              {lastSynced || '15:46:02'}
            </span>
          </div>
        </button>
      </div>

      {/* Right: Solve 200km Network CTA & User Chip */}
      <div className="flex items-center gap-4">
        {/* Primary Action: SOLVE 200KM NETWORK */}
        <button
          onClick={onRunOptimization}
          disabled={isOptimizing}
          className="bg-[#7A1C28] hover:bg-[#63141F] text-white text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isOptimizing ? 'sync' : 'tune'}
          </span>
          <div className="text-left leading-tight">
            <span className="block">{isOptimizing ? 'SOLVING...' : 'SOLVE 200KM'}</span>
            <span className="block text-[9px] opacity-90">NETWORK</span>
          </div>
        </button>

        {/* User Chip */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#E3F2E9] text-[#1B6F3E] flex items-center justify-center font-bold text-xs shrink-0">
            LO
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <p className="text-[12px] font-bold text-[#1F1B19]">Chennai Hub</p>
            <p className="text-[10px] text-[#7A7471]">Logistics Officer</p>
          </div>
        </div>
      </div>
    </header>
  )
}
