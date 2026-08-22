import { useState } from 'react'
import { LanguageDropdown } from '../common/LanguageDropdown'
import { useLanguage } from '../../i18n/LanguageContext'

interface StitchTopHeaderProps {
  onRefresh?: () => Promise<void>
  onRunOptimization?: () => void
  onSwitchToCentre?: () => void
  lastSynced: string
  isScanning?: boolean
  hasError?: boolean
}

export function StitchTopHeader({
  onSwitchToCentre,
  lastSynced,
  hasError = false,
}: StitchTopHeaderProps) {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="flex justify-between items-center w-full px-6 md:px-10 h-20 bg-white border-b border-[#EFE9E5] select-none shadow-2xs sticky top-0 z-30">
      {/* Left: Search Bar */}
      <div className="flex items-center gap-3 bg-[#FAF7F5] px-4 py-2.5 rounded-full border border-[#E8E1DC] focus-within:border-[#7A1C28] focus-within:ring-1 focus-within:ring-[#7A1C28] transition-all w-64 sm:w-80">
        <span className="material-symbols-outlined text-[#7A7471] text-[18px]">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('common.searchPlaceholder')}
          className="bg-transparent border-none focus:outline-hidden text-xs font-sans text-[#1F1B19] w-full placeholder-[#8A8480]"
        />
      </div>

      {/* Right: Language Dropdown, Centre Workspace Switch, Dataset Ready Status, User Chip */}
      <div className="flex items-center gap-3.5">
        {/* Language Dropdown */}
        <LanguageDropdown />

        {/* Switch to Centre Workspace (200km) */}
        {onSwitchToCentre && (
          <button
            onClick={onSwitchToCentre}
            className="flex items-center gap-2 px-4 py-2 bg-[#FCECEE] hover:bg-[#F8DCE0] border border-[#F5D5D9] rounded-full text-xs font-sans font-bold text-[#7A1C28] transition-all cursor-pointer shadow-2xs"
            title="Switch to Chennai Centre Workspace (200 km)"
          >
            <span className="material-symbols-outlined text-[16px]">domain</span>
            <div className="text-left leading-none">
              <span className="block text-[11px] uppercase tracking-wider font-bold">{t('navigation.centreWorkspace')}</span>
              <span className="block text-[9px] font-semibold opacity-80">(200KM CHENNAI)</span>
            </div>
          </button>
        )}

        {/* Dataset Status Pill */}
        <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-[#FAF7F5] border border-[#E8E1DC] rounded-full text-xs font-sans">
          <span
            className={`w-2 h-2 rounded-full ${
              hasError ? 'bg-[#DC2626] animate-pulse' : 'bg-[#16A34A]'
            }`}
          />
          <div className="leading-tight">
            <span
              className={`text-[11px] font-bold tracking-wider uppercase block ${
                hasError ? 'text-[#DC2626]' : 'text-[#1F1B19]'
              }`}
            >
              {hasError ? t('common.error') : t('common.ready')}
            </span>
            <span className="text-[10px] text-[#7A7471] block">
              {t('common.synced')} {lastSynced || '15:53:43'}
            </span>
          </div>
        </div>

        {/* User Identity Chip */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#EFE9E5]">
          <div className="w-8 h-8 rounded-full bg-[#FCECEE] text-[#7A1C28] border border-[#F5D5D9] flex items-center justify-center font-bold text-xs shrink-0">
            PL
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <p className="text-[12px] font-bold text-[#1F1B19]">National Hub</p>
            <p className="text-[10px] text-[#7A7471] uppercase font-medium">Logistics Officer</p>
          </div>
        </div>
      </div>
    </header>
  )
}
