import { useState } from 'react'

interface StitchTopHeaderProps {
  onRefresh: () => Promise<void>
  onRunOptimization: () => void
  lastSynced: string
  isScanning: boolean
  hasError?: boolean
}

export function StitchTopHeader({
  onRefresh,
  onRunOptimization,
  lastSynced,
  isScanning,
  hasError = false,
}: StitchTopHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
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
    <header className="flex justify-between items-center w-full px-6 md:px-12 h-20 bg-surface/90 backdrop-blur-md sticky top-0 z-30 border-b border-outline-variant/15 select-none">
      {/* Left: Search input */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facilities, units, routes..."
            className="bg-transparent border-none focus:outline-hidden text-xs font-sans text-on-surface w-44 sm:w-64 placeholder-on-surface-variant/60"
          />
        </div>
      </div>

      {/* Right: Data status indicator, Last Synced, Refresh, Optimization Run, Avatar */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Dataset Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-full text-xs font-sans">
          <span
            className={`w-2 h-2 rounded-full ${
              hasError ? 'bg-error animate-pulse' : 'bg-secondary'
            }`}
          />
          <span
            className={`text-[11px] font-bold tracking-wider uppercase ${
              hasError ? 'text-error' : 'text-on-surface'
            }`}
          >
            {hasError ? 'Data Service Unavailable' : 'Dataset Ready'}
          </span>
          <span className="text-[10px] text-on-surface-variant hidden md:inline">
            · Synced {lastSynced}
          </span>
        </div>

        {/* Refresh Data Button */}
        <button
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 border border-outline-variant/40 rounded-full text-xs font-sans font-bold uppercase tracking-wider text-on-surface-variant hover:border-primary hover:text-primary transition-all cursor-pointer disabled:opacity-50"
          title="Fetch latest operational dataset values"
        >
          <span
            className={`material-symbols-outlined text-[16px] ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            refresh
          </span>
          <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
        </button>

        {/* Action: Run Optimization Pipeline */}
        <button
          onClick={onRunOptimization}
          disabled={isScanning}
          className="bg-primary hover:bg-primary-container text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-colors cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isScanning ? 'sync' : 'auto_fix_high'}
          </span>
          <span>{isScanning ? 'Running Simplex...' : 'Solve LP Network'}</span>
        </button>

        {/* User Identity Chip */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-outline-variant/30">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
            PL
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-on-surface leading-tight">National Hub</p>
            <p className="text-[10px] text-on-surface-variant uppercase font-medium">Logistics Officer</p>
          </div>
        </div>
      </div>
    </header>
  )
}
