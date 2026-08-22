import type { PravahStep } from '../../types'
import { useLanguage } from '../../i18n/LanguageContext'

interface StitchWorkflowNavProps {
  currentStep: PravahStep
  onSelectStep: (step: PravahStep) => void
  onOpenWelcome: () => void
  bloodBankCount?: number
}

export function StitchWorkflowNav({
  currentStep,
  onSelectStep,
  onOpenWelcome,
  bloodBankCount = 4390,
}: StitchWorkflowNavProps) {
  const { t } = useLanguage()

  const workflowSteps: Array<{ id: PravahStep; label: string; icon: string }> = [
    { id: 'overview', label: t('navigation.flow'), icon: 'hub' },
    { id: 'inventory', label: t('navigation.inventory'), icon: 'inventory_2' },
    { id: 'forecast', label: t('navigation.forecast'), icon: 'analytics' },
    { id: 'risk', label: t('navigation.risk'), icon: 'warning' },
    { id: 'cold-chain', label: t('navigation.coldChain'), icon: 'ac_unit' },
    { id: 'pressure', label: t('navigation.pressure'), icon: 'balance' },
    { id: 'optimize', label: t('navigation.optimize'), icon: 'alt_route' },
    { id: 'transfers', label: t('navigation.transfers'), icon: 'local_shipping' },
    { id: 'approval', label: t('navigation.approval'), icon: 'check_circle' },
    { id: 'audit', label: t('navigation.audit'), icon: 'fact_check' },
  ]
  return (
    <aside className="hidden md:flex flex-col h-screen w-72 bg-surface-container-low border-r border-outline-variant/15 p-6 pt-8 fixed left-0 top-0 z-40 select-none overflow-y-auto">
      {/* Brand Header */}
      <div className="mb-6 cursor-pointer flex items-center gap-3" onClick={onOpenWelcome}>
        <img
          src="/pravah-logo.png"
          alt="PRAVAH Logo"
          className="w-11 h-11 object-contain shrink-0 drop-shadow-xs"
        />
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary tracking-tight leading-none">
            PRAVAH
          </h1>
          <p className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
            Clinical Decision Flow
          </p>
        </div>
      </div>

      {/* Dataset Status Pill */}
      <div className="flex items-center gap-2.5 mb-5 p-2.5 panel-bg rounded-lg">
        <span className="w-2 h-2 rounded-full bg-secondary" />
        <div>
          <p className="font-sans text-[11px] font-bold text-on-surface">PRAVAH Dataset</p>
          <p className="font-sans text-[10px] text-on-surface-variant">
            {t('common.facilitiesConnected', { count: bloodBankCount })}
          </p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5">
        {workflowSteps.map((step) => {
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
