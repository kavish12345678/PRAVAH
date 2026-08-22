import type { PravahStep } from '../../types'

interface StitchWorkflowNavProps {
  currentStep: PravahStep
  onSelectStep: (step: PravahStep) => void
  onOpenWelcome: () => void
  bloodBankCount?: number
}

const WORKFLOW_STEPS: Array<{ id: PravahStep; number: string; label: string; icon: string }> = [
  { id: 'overview', number: '01', label: 'FLOW', icon: 'hub' },
  { id: 'inventory', number: '02', label: 'INVENTORY', icon: 'inventory_2' },
  { id: 'forecast', number: '03', label: 'FORECAST', icon: 'analytics' },
  { id: 'risk', number: '04', label: 'RISK', icon: 'warning' },
  { id: 'cold-chain', number: '05', label: 'COLD CHAIN', icon: 'ac_unit' },
  { id: 'pressure', number: '06', label: 'PRESSURE', icon: 'balance' },
  { id: 'optimize', number: '07', label: 'OPTIMIZE', icon: 'alt_route' },
  { id: 'transfers', number: '08', label: 'TRANSFERS', icon: 'local_shipping' },
  { id: 'approval', number: '09', label: 'APPROVAL', icon: 'check_circle' },
  { id: 'audit', number: '10', label: 'AUDIT', icon: 'fact_check' },
]

export function StitchWorkflowNav({
  currentStep,
  onSelectStep,
  onOpenWelcome,
  bloodBankCount = 4390,
}: StitchWorkflowNavProps) {
  return (
    <aside className="hidden md:flex flex-col h-screen w-72 bg-surface-container-low border-r border-outline-variant/15 p-6 pt-8 fixed left-0 top-0 z-40 select-none overflow-y-auto">
      {/* Brand Header */}
      <div className="mb-6 cursor-pointer" onClick={onOpenWelcome}>
        <h1 className="font-serif text-2xl font-bold text-primary tracking-tight">
          PRAVAH
        </h1>
        <p className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">
          Clinical Decision Flow
        </p>
      </div>

      {/* Dataset Status Pill */}
      <div className="flex items-center gap-2.5 mb-5 p-2.5 panel-bg rounded-lg">
        <span className="w-2 h-2 rounded-full bg-secondary" />
        <div>
          <p className="font-sans text-[11px] font-bold text-on-surface">PRAVAH Dataset</p>
          <p className="font-sans text-[10px] text-on-surface-variant">
            {bloodBankCount.toLocaleString()} Facilities Active
          </p>
        </div>
      </div>

      {/* Numbered Operational Workflow List */}
      <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-2 mb-2">
        Operational Journey
      </div>

      <nav className="flex-1 flex flex-col gap-0.5">
        {WORKFLOW_STEPS.map((step) => {
          const isActive = currentStep === step.id

          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-primary-container/10 text-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className={`text-[11px] font-mono font-bold ${isActive ? 'text-primary' : 'text-on-surface-variant/60'}`}>
                {step.number}
              </span>
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isActive ? 'fill text-primary' : 'text-on-surface-variant'
                }`}
              >
                {step.icon}
              </span>
              <span className="font-sans text-[12px]">{step.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Secondary: Inside PRAVAH (Model Lab) & Welcome */}
      <div className="mt-auto pt-4 border-t border-outline-variant/20 space-y-1">
        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-2 mb-1">
          Technical Layer
        </div>

        <button
          onClick={() => onSelectStep('models')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer text-left ${
            currentStep === 'models'
              ? 'bg-primary-container/10 text-primary font-bold'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">psychology</span>
          <span className="font-sans text-[12px]">INSIDE PRAVAH</span>
        </button>

        <button
          onClick={onOpenWelcome}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-left"
        >
          <span className="material-symbols-outlined text-[18px]">public</span>
          <span className="font-sans text-[12px]">Welcome Flow</span>
        </button>
      </div>
    </aside>
  )
}
