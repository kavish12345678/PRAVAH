export type NavPage =
  | 'overview'
  | 'inventory'
  | 'predictions'
  | 'risk'
  | 'transfers'
  | 'model_lab'

interface NavigationProps {
  activePage: NavPage
  onSelectPage: (page: NavPage) => void
  transferCount?: number
  highRiskCount?: number
}

const NAV_ITEMS: Array<{ id: NavPage; label: string; badgeKey?: 'transfers' | 'risk' }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'predictions', label: 'Predictions' },
  { id: 'risk', label: 'Risk', badgeKey: 'risk' },
  { id: 'transfers', label: 'Transfers', badgeKey: 'transfers' },
  { id: 'model_lab', label: 'Model Lab' },
]

export function Navigation({
  activePage,
  onSelectPage,
  transferCount = 0,
  highRiskCount = 0,
}: NavigationProps) {
  return (
    <nav aria-label="Main Navigation" className="flex items-center gap-1 sm:gap-2 py-2 overflow-x-auto border-b border-[#e8e6df]">
      {NAV_ITEMS.map((item) => {
        const isActive = activePage === item.id
        let badgeCount = 0
        if (item.badgeKey === 'transfers') badgeCount = transferCount
        if (item.badgeKey === 'risk') badgeCount = highRiskCount

        return (
          <button
            key={item.id}
            onClick={() => onSelectPage(item.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              isActive
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{item.label}</span>
            {badgeCount > 0 && (
              <span
                className={`px-1.5 py-0.2 text-[10px] font-mono rounded-full ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : item.badgeKey === 'risk'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {badgeCount}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
