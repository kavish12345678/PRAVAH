import type { PravahStep } from '../../types'

interface StitchWorkflowRibbonProps {
  currentStep: PravahStep
  onSelectStep: (step: PravahStep) => void
}

const ORDERED_STEPS: Array<{ id: PravahStep; label: string }> = [
  { id: 'overview', label: 'FLOW' },
  { id: 'inventory', label: 'INVENTORY' },
  { id: 'forecast', label: 'FORECAST' },
  { id: 'risk', label: 'RISK' },
  { id: 'cold-chain', label: 'COLD CHAIN' },
  { id: 'pressure', label: 'PRESSURE' },
  { id: 'optimize', label: 'OPTIMIZE' },
  { id: 'transfers', label: 'TRANSFER' },
  { id: 'approval', label: 'APPROVAL' },
  { id: 'audit', label: 'AUDIT' },
]

export function StitchWorkflowRibbon({
  currentStep,
  onSelectStep,
}: StitchWorkflowRibbonProps) {
  const currentIndex = ORDERED_STEPS.findIndex((s) => s.id === currentStep)

  if (currentStep === 'welcome' || currentStep === 'models') {
    return null
  }

  return (
    <div className="w-full bg-surface-container-low/80 backdrop-blur-xs border-b border-outline-variant/15 px-6 md:px-12 py-2.5 overflow-x-auto select-none">
      <div className="flex items-center gap-2 min-w-max">
        {ORDERED_STEPS.map((step, idx) => {
          const isCurrent = step.id === currentStep
          const isPassed = currentIndex !== -1 && idx < currentIndex

          return (
            <div key={step.id} className="flex items-center gap-2">
              <button
                onClick={() => onSelectStep(step.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-primary text-white shadow-xs'
                    : isPassed
                    ? 'bg-secondary/15 text-secondary hover:bg-secondary/25'
                    : 'text-on-surface-variant/60 hover:text-on-surface'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{step.label}</span>
              </button>

              {idx < ORDERED_STEPS.length - 1 && (
                <span className="material-symbols-outlined text-[14px] text-outline-variant/60">
                  chevron_right
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
