import type { PravahStep } from '../../types'
import { triggerFlash } from '../effects/FullScreenFlash'
import { useLanguage } from '../../i18n/LanguageContext'

interface CentreWorkflowNavProps {
  currentStep: PravahStep
  onSelectStep: (step: PravahStep) => void
  onSwitchToNational: () => void
  onOpenDonorMobilisation: () => void
  facilityCount: number
}

interface StepItem {
  id: PravahStep
  stepNum: string
  label: string
  subtitle: string
  icon: string
}

export function CentreWorkflowNav({
  currentStep,
  onSelectStep,
  onSwitchToNational,
  onOpenDonorMobilisation,
  facilityCount,
}: CentreWorkflowNavProps) {
  const { t } = useLanguage()

  const centreSteps: StepItem[] = [
    { id: 'overview', stepNum: '01', label: t('navigation.centreOverview'), subtitle: t('centre.radiusService'), icon: 'target' },
    { id: 'inventory', stepNum: '02', label: t('navigation.localInventory'), subtitle: t('inventory.subtitle'), icon: 'inventory_2' },
    { id: 'forecast', stepNum: '03', label: t('navigation.demandForecast'), subtitle: '24h/72h GBDT', icon: 'trending_up' },
    { id: 'risk', stepNum: '04', label: t('navigation.expiryRisk'), subtitle: t('risk.mlScoring'), icon: 'warning' },
    { id: 'cold-chain', stepNum: '05', label: t('navigation.coldChain'), subtitle: t('coldChain.storageIntegrity'), icon: 'thermostat' },
    { id: 'pressure', stepNum: '06', label: t('navigation.regionalPressure'), subtitle: t('pressure.title'), icon: 'compress' },
    { id: 'optimize', stepNum: '07', label: t('navigation.routeOptimizationModel'), subtitle: 'HiGHS Min-Cost LP', icon: 'hub' },
    { id: 'transfers', stepNum: '08', label: t('navigation.redistribution'), subtitle: t('transfers.transferCorridors'), icon: 'local_shipping' },
    { id: 'approval', stepNum: '09', label: t('navigation.authorization'), subtitle: t('approval.officerSignOff'), icon: 'person_check' },
    { id: 'audit', stepNum: '10', label: t('navigation.auditTrail'), subtitle: t('audit.verifiableAuditLedger'), icon: 'verified_user' },
  ]
  const handleNavClick = (step: StepItem) => {
    triggerFlash()
    onSelectStep(step.id)
  }
  return (
    <aside className="w-[280px] bg-[#FFFFFF] border-r border-[#EFE9E5] flex flex-col justify-between fixed top-0 bottom-0 left-0 z-40 hidden md:flex select-none font-sans overflow-y-auto">
      {/* Top Section */}
      <div className="p-4 space-y-3">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <img
            src="/pravah-logo.png"
            alt="PRAVAH Logo"
            className="w-10 h-10 object-contain shrink-0 drop-shadow-xs"
          />
          <div>
            <h1 className="text-base font-bold tracking-tight text-[#1F1B19] leading-none">
              PRAVAH
            </h1>
            <p className="text-[10px] text-[#7A1C28] font-bold tracking-wide mt-1">
              The Lifeline in Motion
            </p>
          </div>
        </div>

        {/* Location / Anchor Identity Box */}
        <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC] space-y-1">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#7A1C28] shrink-0 mt-0.5">
              location_on
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[12px] font-bold text-[#1F1B19] leading-tight">
                Chennai Rajiv Gandhi Hospital
              </h2>
              <div className="flex items-center justify-between text-[9.5px] text-[#7A7471] mt-1">
                <span>Anchor ID: CHN-RGH-001</span>
                <span className="font-bold text-[#1F1B19] font-mono">{facilityCount > 0 ? facilityCount : 149} Hubs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Step Navigation */}
        <nav className="space-y-1">
          {centreSteps.map((step) => {
            const isActive = currentStep === step.id

            return (
              <button
                key={step.id}
                onClick={() => handleNavClick(step)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer text-left group ${
                  isActive
                    ? 'bg-[#7A1C28] text-white shadow-xs font-bold'
                    : 'text-[#5A5451] hover:bg-[#FAF7F5] hover:text-[#1F1B19]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Step Number Badge */}
                  <span
                    className={`text-[10px] font-mono font-bold w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#F2ECE8] text-[#7A7471] group-hover:bg-[#E8E1DC]'
                    }`}
                  >
                    {step.stepNum}
                  </span>

                  {/* Labels */}
                  <div className="min-w-0">
                    <p
                      className={`text-[11.5px] font-bold leading-snug truncate transition-colors ${
                        isActive ? 'text-white' : 'text-[#1F1B19]'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-[9.5px] truncate transition-colors ${
                        isActive ? 'text-white/80' : 'text-[#8A8480] group-hover:text-[#5A5451]'
                      }`}
                    >
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Icon with Subtle Hover Glow */}
                <span
                  className={`material-symbols-outlined text-[17px] shrink-0 transition-all duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-[#8A8480] group-hover:text-[#7A1C28] group-hover:scale-110'
                  }`}
                >
                  {step.icon === 'target'
                    ? 'adjust'
                    : step.icon === 'person_check'
                    ? 'how_to_reg'
                    : step.icon}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Switch to National Mode & Donor Mobilisation (Bottom Box) */}
      <div className="p-4 border-t border-[#EFE9E5] bg-[#FFFFFF] space-y-2.5">
        {/* Special Feature: Donor Mobilisation Mode Button */}
        <button
          onClick={onOpenDonorMobilisation}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-[#7A1C28] to-[#9E2A38] text-white hover:from-[#63141F] hover:to-[#7A1C28] transition-all cursor-pointer shadow-md group border border-[#F5D5D9]/20"
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[15px] text-white animate-pulse">
                volunteer_activism
              </span>
            </span>
            <div className="text-left leading-tight">
              <span className="block text-[10.5px] font-bold tracking-wider uppercase font-mono">
                {t('navigation.donorMobilisation')}
              </span>
              <span className="block text-[8.5px] text-white/80 font-medium">
                {t('navigation.donorMobilisationSub')}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[15px] text-white/80 group-hover:translate-x-0.5 transition-transform">
            send
          </span>
        </button>

        {/* Switch to National Mode */}
        <button
          onClick={onSwitchToNational}
          className="w-full py-2 px-3 bg-[#FFFFFF] hover:bg-[#FAF7F5] border border-[#E8E1DC] rounded-xl text-[10.5px] font-bold text-[#1F1B19] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
        >
          <div className="w-4 h-4 rounded-full bg-[#7A1C28]/10 text-[#7A1C28] flex items-center justify-center">
            <span className="material-symbols-outlined text-[12px]">public</span>
          </div>
          <span>{t('navigation.switchToNational')}</span>
        </button>
      </div>
    </aside>
  )
}
