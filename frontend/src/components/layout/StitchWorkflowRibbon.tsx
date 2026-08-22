import type { PravahStep } from '../../types'
import { triggerFlash } from '../effects/FullScreenFlash'
import { useLanguage } from '../../i18n/LanguageContext'

interface StitchWorkflowRibbonProps {
  currentStep: PravahStep
  onSelectStep: (step: PravahStep) => void
}

export function StitchWorkflowRibbon({
  currentStep,
  onSelectStep,
}: StitchWorkflowRibbonProps) {
  const { t } = useLanguage()

  if (currentStep === 'welcome' || currentStep === 'models') {
    return null
  }

  const orderedSteps: Array<{ id: PravahStep; label: string }> = [
    { id: 'overview', label: t('navigation.flow') },
    { id: 'inventory', label: t('navigation.inventory') },
    { id: 'forecast', label: t('navigation.forecast') },
    { id: 'risk', label: t('navigation.risk') },
    { id: 'cold-chain', label: t('navigation.coldChain') },
    { id: 'pressure', label: t('navigation.pressure') },
    { id: 'optimize', label: t('navigation.optimize') },
    { id: 'transfers', label: t('navigation.transfers') },
    { id: 'approval', label: t('navigation.approval') },
    { id: 'audit', label: t('navigation.audit') },
  ]

  const handleStepClick = (stepId: PravahStep) => {
    triggerFlash()
    onSelectStep(stepId)
  }

  return (
    <div className="w-full bg-[#FFFFFF] border-b border-[#EFE9E5] px-4 md:px-6 py-2 select-none shadow-2xs">
      <div className="flex items-center justify-between w-full max-w-full">
        {orderedSteps.map((step, idx) => {
          const isCurrent = step.id === currentStep

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => handleStepClick(step.id)}
                className={`group relative flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] md:text-[11px] font-sans font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-[#7A1C28] text-white shadow-xs font-bold'
                    : 'text-[#6E6764] hover:text-[#1F1B19] hover:bg-[#FAF7F5]'
                }`}
              >
                {/* Active Indicator Dot */}
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white mr-0.5 shrink-0 shadow-xs" />
                )}

                <span className="leading-none">{step.label}</span>
              </button>

              {idx < orderedSteps.length - 1 && (
                <span className="material-symbols-outlined text-[13px] text-[#D5CBC5] select-none mx-0.5 sm:mx-1 shrink-0">
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
