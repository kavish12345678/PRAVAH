import { motion } from 'framer-motion'

export type FlowPage =
  | 'flow'
  | 'stock'
  | 'forecast'
  | 'risk'
  | 'cold'
  | 'move'
  | 'optimize'
  | 'lab'

interface FloatingFlowNavProps {
  activePage: FlowPage
  onSelectPage: (page: FlowPage) => void
  onReplayIntro: () => void
  pendingMoveCount?: number
  highRiskCount?: number
}

const FLOW_NAV_ITEMS: Array<{ id: FlowPage; label: string; badge?: 'move' | 'risk' }> = [
  { id: 'flow', label: 'FLOW' },
  { id: 'stock', label: 'STOCK' },
  { id: 'forecast', label: 'FORECAST' },
  { id: 'risk', label: 'RISK', badge: 'risk' },
  { id: 'cold', label: 'COLD' },
  { id: 'move', label: 'MOVE', badge: 'move' },
  { id: 'optimize', label: 'OPTIMIZE' },
  { id: 'lab', label: 'LAB' },
]

export function FloatingFlowNav({
  activePage,
  onSelectPage,
  onReplayIntro,
  pendingMoveCount = 0,
  highRiskCount = 0,
}: FloatingFlowNavProps) {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-[#06090e]/85 backdrop-blur-xl shadow-2xl shadow-black/80 text-xs font-mono select-none">
      {/* Brand Monogram */}
      <div className="flex items-center gap-2 pr-2 border-r border-white/10">
        <span className="h-2 w-2 rounded-full bg-rose-600 animate-heartbeat" />
        <span className="font-bold tracking-widest text-white text-xs font-sans">
          PRAVAH
        </span>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {FLOW_NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id
          let badgeVal = 0
          if (item.badge === 'move') badgeVal = pendingMoveCount
          if (item.badge === 'risk') badgeVal = highRiskCount

          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`relative px-2.5 py-1 text-[11px] font-semibold tracking-wider transition-colors cursor-pointer rounded-full flex items-center gap-1 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{item.label}</span>

              {badgeVal > 0 && (
                <span
                  className={`px-1 py-0.1 text-[9px] font-bold rounded-full ${
                    item.badge === 'risk'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {badgeVal}
                </span>
              )}

              {/* Moving Crimson Underline Indicator */}
              {isActive && (
                <motion.div
                  layoutId="flow-nav-indicator"
                  className="absolute -bottom-1 left-2 right-2 h-0.5 bg-rose-600 rounded-full shadow-sm shadow-rose-600/50"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Intro replay */}
      <button
        onClick={onReplayIntro}
        title="Replay Network Walkthrough"
        className="pl-2 border-l border-white/10 text-[10px] text-slate-500 hover:text-slate-300 transition cursor-pointer"
      >
        ↺
      </button>
    </nav>
  )
}
