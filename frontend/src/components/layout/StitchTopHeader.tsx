import { useState } from 'react'

interface StitchTopHeaderProps {
  onRefresh: () => Promise<void>
  onRunOptimization: () => void
  lastSynced: string
  isScanning: boolean
}

export function StitchTopHeader({
  onRefresh,
  onRunOptimization,
  lastSynced,
  isScanning,
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
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span className="text-[11px] font-bold text-on-surface tracking-wider uppercase">
            Dataset Ready
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
          <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>
            refresh
          </span>
          <span className="hidden md:inline">Refresh Data</span>
        </button>

        {/* Run Optimization Pipeline Action */}
        <button
          onClick={onRunOptimization}
          disabled={isScanning}
          className="bg-primary-container text-white text-xs font-sans font-bold px-4 sm:px-5 py-2 rounded-full hover:bg-primary transition-colors cursor-pointer shadow-xs uppercase tracking-wider whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isScanning ? 'sync' : 'bolt'}
          </span>
          <span>{isScanning ? 'Running Models...' : 'Run Pipeline'}</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => alert('Cold-chain telemetry & inventory synchronization active across 4,390 facilities.')}
          className="relative text-on-surface-variant hover:text-primary transition-colors p-1.5 cursor-pointer"
          title="System Notifications"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-container rounded-full border border-surface" />
        </button>

        {/* User Profile Avatar */}
        <div
          onClick={() => alert('Logged in as: National Logistics Director · PRAVAH Blood Supply Intelligence')}
          className="w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden cursor-pointer flex items-center justify-center"
          title="National Logistics Director"
        >
          <span className="font-serif font-bold text-xs text-primary">NL</span>
        </div>
      </div>
    </header>
  )
}
