import type { PravahStep } from '../../types'

interface CentreWorkflowNavProps {
  currentStep: PravahStep
  onSelectStep: (step: PravahStep) => void
  onSwitchToNational: () => void
  facilityCount: number
}

interface StepItem {
  id: PravahStep
  stepNum: string
  label: string
  subtitle: string
  icon: string
}

const CENTRE_STEPS: StepItem[] = [
  { id: 'overview', stepNum: '01', label: 'Centre Overview', subtitle: '200 km Network Map', icon: 'target' },
  { id: 'inventory', stepNum: '02', label: 'Local Inventory', subtitle: 'Units in 200 km Radius', icon: 'inventory_2' },
  { id: 'forecast', stepNum: '03', label: 'Demand Forecast', subtitle: '24h/72h GBDT Model', icon: 'trending_up' },
  { id: 'risk', stepNum: '04', label: 'Expiry Risk', subtitle: 'Continuous ML Scoring', icon: 'warning' },
  { id: 'cold-chain', stepNum: '05', label: 'Cold Chain', subtitle: 'Storage Integrity', icon: 'thermostat' },
  { id: 'pressure', stepNum: '06', label: 'Regional Pressure', subtitle: 'Surplus vs Deficit', icon: 'compress' },
  { id: 'optimize', stepNum: '07', label: 'LP Optimization', subtitle: 'Min-Cost Simplex Flow', icon: 'hub' },
  { id: 'transfers', stepNum: '08', label: 'Redistribution', subtitle: 'Generated Corridors', icon: 'local_shipping' },
  { id: 'approval', stepNum: '09', label: 'Authorization', subtitle: 'Officer Sign-Off', icon: 'person_check' },
]

export function CentreWorkflowNav({
  currentStep,
  onSelectStep,
  onSwitchToNational,
  facilityCount,
}: CentreWorkflowNavProps) {
  return (
    <aside className="w-[280px] bg-[#FFFFFF] border-r border-[#EFE9E5] flex flex-col justify-between fixed top-0 bottom-0 left-0 z-40 hidden md:flex select-none font-sans">
      {/* Top Section */}
      <div className="p-5 space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7A1C28] flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0">
            P
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[#1F1B19] leading-none">
              PRAVAH
            </h1>
            <p className="text-[11px] text-[#7A1C28] font-bold uppercase tracking-wider mt-1">
              CENTRE WORKSPACE
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
              <div className="flex justify-between items-center text-[10px] text-[#7A7471] mt-0.5">
                <span>Anchor Centre ID: CHN-RGH-001</span>
                <span className="font-bold text-[#1F1B19]">200 km</span>
              </div>
              <p className="text-[10px] text-[#7A7471] mt-0.5">
                {facilityCount > 0 ? facilityCount : 149} Facilities Monitored
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items (01 to 09) */}
        <nav className="space-y-1.5 pt-1">
          {CENTRE_STEPS.map((step) => {
            const isActive = currentStep === step.id
            return (
              <button
                key={step.id}
                onClick={() => onSelectStep(step.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#7A1C28] text-white shadow-xs'
                    : 'text-[#4A4543] hover:bg-[#FAF7F5] border border-transparent hover:border-[#EFE9E5]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Number Badge */}
                  <span
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      isActive
                        ? 'bg-white text-[#7A1C28]'
                        : 'bg-[#F2ECE8] text-[#5A5451]'
                    }`}
                  >
                    {step.stepNum}
                  </span>

                  {/* Labels */}
                  <div className="min-w-0">
                    <p
                      className={`text-[12px] font-bold leading-snug truncate ${
                        isActive ? 'text-white' : 'text-[#1F1B19]'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-[10px] truncate ${
                        isActive ? 'text-white/80' : 'text-[#8A8480]'
                      }`}
                    >
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Icon */}
                <span
                  className={`material-symbols-outlined text-[18px] shrink-0 ${
                    isActive ? 'text-white' : 'text-[#8A8480]'
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

      {/* Switch to National Mode (Bottom Box) */}
      <div className="p-4 border-t border-[#EFE9E5] bg-[#FFFFFF]">
        <button
          onClick={onSwitchToNational}
          className="w-full py-2.5 px-3 bg-[#FFFFFF] hover:bg-[#FAF7F5] border border-[#E8E1DC] rounded-xl text-[11px] font-bold text-[#1F1B19] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
        >
          <div className="w-5 h-5 rounded-full bg-[#7A1C28]/10 text-[#7A1C28] flex items-center justify-center">
            <span className="material-symbols-outlined text-[13px]">public</span>
          </div>
          <span>Switch to National Mode</span>
        </button>
      </div>
    </aside>
  )
}
