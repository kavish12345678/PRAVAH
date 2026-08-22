import { useState } from 'react'
import { LanguageDropdown } from '../common/LanguageDropdown'
import { useLanguage } from '../../i18n/LanguageContext'

interface CentreTopHeaderProps {
  onRefresh: () => Promise<void>
  onRunOptimization: () => void
  onSwitchMode: () => void
  lastSynced: string
  isOptimizing: boolean
  facilityCount?: number
  hasError?: boolean
}

export function CentreTopHeader({
  onRefresh,
  onRunOptimization,
  lastSynced,
  isOptimizing,
}: CentreTopHeaderProps) {
  const { t } = useLanguage()
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
        <div className="w-9 h-9 rounded-full bg-[#FCECEE] text-[#7A1C28] flex items-center justify-center font-bold text-xs shrink-0 border border-[#F5D5D9]">
          <span className="material-symbols-outlined text-[19px] text-[#7A1C28]">
            domain
          </span>
        </div>
        <div>
          <h2 className="text-[13px] font-bold text-[#1F1B19] leading-tight">
            Chennai Rajiv Gandhi Hospital
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-[#7A7471]">
              {t('common.primaryHub')} · CHN-RGH-001
            </span>
            <span className="px-1.5 py-0.2 bg-[#FCECEE] text-[#7A1C28] text-[9px] font-bold rounded-sm uppercase tracking-wider font-mono">
              {t('common.active')}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Sync Status, Language Dropdown, Solve 200km CTA & User Chip */}
      <div className="flex items-center gap-3">
        {/* Sync Status Button */}
        <button
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF7F5] hover:bg-[#F2ECE8] rounded-full border border-[#E8E1DC] shadow-2xs text-left cursor-pointer transition-colors"
          title="Click to sync data"
        >
          <span
            className={`material-symbols-outlined text-[16px] text-[#5A5451] ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            sync
          </span>
          <div className="leading-tight flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#1F1B19]">
              {isRefreshing ? t('common.syncing') : t('common.synced')}
            </span>
            <span className="text-[9.5px] text-[#7A7471] font-mono">
              {lastSynced || '15:46:02'}
            </span>
          </div>
        </button>

        {/* Multilingual Language Selector */}
        <LanguageDropdown />

        {/* Primary Action: SOLVE 200KM NETWORK */}
        <button
          onClick={onRunOptimization}
          disabled={isOptimizing}
          className="bg-[#7A1C28] hover:bg-[#63141F] text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isOptimizing ? 'sync' : 'tune'}
          </span>
          <div className="text-left leading-tight">
            <span className="block font-mono">{isOptimizing ? t('common.loading') : t('centre.solve200km')}</span>
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
