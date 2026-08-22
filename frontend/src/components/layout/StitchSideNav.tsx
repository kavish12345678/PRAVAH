export type StitchNavTab =
  | 'dashboard'
  | 'inventory'
  | 'demand'
  | 'risk'
  | 'cold-chain'
  | 'transfers'
  | 'optimizer'
  | 'equipment'
  | 'approvals'
  | 'models'

interface StitchSideNavProps {
  activeTab: StitchNavTab
  onSelectTab: (tab: StitchNavTab) => void
  onOpenLanding: () => void
  bloodBankCount?: number
}

const NAV_ITEMS: Array<{ id: StitchNavTab; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Overview', icon: 'dashboard' },
  { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
  { id: 'demand', label: 'Demand Forecast', icon: 'analytics' },
  { id: 'risk', label: 'Risk Intelligence', icon: 'warning' },
  { id: 'cold-chain', label: 'Cold-Chain', icon: 'ac_unit' },
  { id: 'transfers', label: 'Transfer Center', icon: 'hub' },
  { id: 'optimizer', label: 'Network Optimizer', icon: 'alt_route' },
  { id: 'equipment', label: 'Equipment Health', icon: 'medical_services' },
  { id: 'approvals', label: 'Human Review', icon: 'check_circle' },
  { id: 'models', label: 'Model Intelligence', icon: 'psychology' },
]

export function StitchSideNav({
  activeTab,
  onSelectTab,
  onOpenLanding,
  bloodBankCount = 4390,
}: StitchSideNavProps) {
  return (
    <aside className="hidden md:flex flex-col h-screen w-72 bg-surface-container-low border-r border-outline-variant/15 p-6 pt-10 fixed left-0 top-0 z-40 select-none overflow-y-auto">
      {/* Brand Header */}
      <div className="mb-8 cursor-pointer" onClick={onOpenLanding}>
        <h1 className="font-serif text-3xl font-semibold text-primary tracking-tight">
          PRAVAH
        </h1>
        <p className="font-sans text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mt-1">
          Blood Intelligence
        </p>
      </div>

      {/* Dataset Status Pill */}
      <div className="flex items-center gap-3 mb-6 p-3 panel-bg rounded-lg">
        <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
        <div>
          <p className="font-sans text-xs font-bold text-on-surface">PRAVAH Dataset</p>
          <p className="font-sans text-[11px] text-on-surface-variant">
            {bloodBankCount.toLocaleString()} Facilities Active
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-primary-container/10 text-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isActive ? 'fill text-primary' : 'text-on-surface-variant'
                }`}
              >
                {item.icon}
              </span>
              <span className="font-sans text-[13px]">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer Links & Landing Page Action */}
      <div className="mt-auto pt-6 border-t border-outline-variant/20 space-y-2">
        <button
          onClick={onOpenLanding}
          className="w-full py-2.5 px-4 bg-primary text-white font-sans text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:bg-primary-container transition-colors cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">public</span>
          <span>Public Overview</span>
        </button>

        <div className="pt-2 flex flex-col gap-1 text-[11px] text-on-surface-variant font-sans">
          <a
            href="#support"
            onClick={(e) => {
              e.preventDefault()
              alert('PRAVAH National Blood Intelligence Platform · Operational Dataset')
            }}
            className="flex items-center gap-2 py-1.5 px-2 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">help_outline</span>
            <span>Support</span>
          </a>
          <a
            href="#models"
            onClick={(e) => {
              e.preventDefault()
              onSelectTab('models')
            }}
            className="flex items-center gap-2 py-1.5 px-2 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>Model Provenance</span>
          </a>
        </div>
      </div>
    </aside>
  )
}
