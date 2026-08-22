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
  { id: 'approval', label: 'AUTHORIZATION' },
]

export function StitchWorkflowRibbon({
  currentStep,
  onSelectStep,
}: StitchWorkflowRibbonProps) {
  if (currentStep === 'welcome' || currentStep === 'models') {
    return null
  }

  return (
    <div className="w-full bg-[#FFFFFF] border-b border-[#EFE9E5] px-6 md:px-8 py-3 overflow-x-auto select-none">
      <div className="flex items-center gap-3 min-w-max">
        {ORDERED_STEPS.map((step, idx) => {
          const isCurrent = step.id === currentStep

          return (
            <div key={step.id} className="flex items-center gap-3">
              <button
                onClick={() => onSelectStep(step.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#7A1C28] text-white shadow-2xs'
                    : 'text-[#6E6764] hover:text-[#1F1B19]'
                }`}
              >
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white mr-0.5" />}
                <span>{step.label}</span>
              </button>

              {idx < ORDERED_STEPS.length - 1 && (
                <span className="material-symbols-outlined text-[14px] text-[#C2B9B3]">
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
