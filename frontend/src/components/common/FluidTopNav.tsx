import { motion } from 'framer-motion'

export type FluidNavPage =
  | 'flow'
  | 'inventory'
  | 'forecast'
  | 'risk'
  | 'cold'
  | 'move'
  | 'models'

interface FluidTopNavProps {
  activePage: FluidNavPage
  onSelectPage: (page: FluidNavPage) => void
  onReplayIntro: () => void
  pendingMoveCount?: number
  highRiskCount?: number
}

const NAV_ITEMS: Array<{ id: FluidNavPage; label: string; badge?: 'move' | 'risk' }> = [
  { id: 'flow', label: 'FLOW' },
  { id: 'inventory', label: 'INVENTORY' },
  { id: 'forecast', label: 'FORECAST' },
  { id: 'risk', label: 'RISK', badge: 'risk' },
  { id: 'cold', label: 'COLD' },
  { id: 'move', label: 'MOVE', badge: 'move' },
  { id: 'models', label: 'MODELS' },
]

export function FluidTopNav({
  activePage,
  onSelectPage,
  onReplayIntro,
  pendingMoveCount = 0,
  highRiskCount = 0,
}: FluidTopNavProps) {
  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 sm:gap-3 px-4 py-2 rounded-full border border-white/10 bg-[#111124]/60 backdrop-blur-2xl shadow-2xl text-xs font-mono select-none">
      {/* Brand Monogram */}
      <div className="flex items-center gap-2 pr-2 border-r border-white/10">
        <span className="h-2 w-2 rounded-full bg-[#E96B73] animate-node-breathe" />
        <span className="font-serif font-normal text-sm tracking-widest text-[#F4EFE7]">
          PRAVAH
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id
          let badgeVal = 0
          if (item.badge === 'move') badgeVal = pendingMoveCount
          if (item.badge === 'risk') badgeVal = highRiskCount

          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`relative px-3 py-1 text-[11px] font-medium tracking-wider transition-colors cursor-pointer rounded-full flex items-center gap-1.5 ${
                isActive
                  ? 'text-[#F4EFE7] font-semibold'
                  : 'text-[#9A8BC7]/80 hover:text-[#F4EFE7]'
              }`}
            >
              <span>{item.label}</span>

              {badgeVal > 0 && (
                <span
                  className={`px-1.5 py-0.1 text-[9px] font-bold rounded-full ${
                    item.badge === 'risk'
                      ? 'bg-[#E96B73] text-[#111124]'
                      : 'bg-[#9A8BC7]/30 text-[#F4EFE7]'
                  }`}
                >
                  {badgeVal}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="fluid-nav-indicator"
                  className="absolute -bottom-1 left-2 right-2 h-0.5 bg-[#E96B73] rounded-full shadow-sm shadow-[#E96B73]/60"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Replay Intro */}
      <button
        onClick={onReplayIntro}
        title="Replay Living Flow Introduction"
        className="pl-2 border-l border-white/10 text-[11px] text-[#9A8BC7]/60 hover:text-[#F4EFE7] transition cursor-pointer"
      >
        ↺
      </button>
    </header>
  )
}
