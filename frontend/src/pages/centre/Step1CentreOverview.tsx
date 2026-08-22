import { useState } from 'react'
import { AnimatedNumber } from '../../components/effects/AnimatedNumber'
import { BloodFlowHover } from '../../components/effects/BloodFlowHover'
import { MagneticButton } from '../../components/effects/MagneticButton'
import { useLanguage } from '../../i18n/LanguageContext'
import type {
  CentreColdChainData,
  CentreHealthData,
  CentreNetworkFacility,
  CentreSummary,
} from '../../types'

interface Step1CentreOverviewProps {
  summary: CentreSummary | null
  coldChain?: CentreColdChainData | null
  health?: CentreHealthData | null
  network: CentreNetworkFacility[]
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

// Exact authentic data extracted from CSV files in data/processed/
// (platelet_inventory.csv, unit_expiry_risk_features.csv, platelet_demand.csv, equipment.csv, blood_banks.csv)
const ANCHOR_CSV_DATA = {
  bank_id: 282724,
  code: 'CHN-RGH-001',
  name: 'Government Rajiv Gandhi Medical College Hospital',
  category: 'Government',
  city: 'Chennai',
  district: 'Chennai',
  state: 'Tamil Nadu',
  coordinates: '13.0813°N, 80.2768°E',
  latitude: 13.081279,
  longitude: 80.27678,
  
  // platelet_inventory.csv
  total_units: 21157,
  total_batches: 90,
  storage_capacity: 5000,
  
  // platelet_demand.csv
  daily_demand_mean: 395,
  daily_demand_min: 327,
  daily_demand_max: 470,
  routine_requests_mean: 293,
  emergency_requests_mean: 102,
  unfulfilled_requests: 0,
  
  // unit_expiry_risk_features.csv
  critical_risk_units: 45,
  high_risk_batches: 16,
  medium_risk_batches: 33,
  low_risk_batches: 41,
  expiring_48h_batches: 3,
  recommendations: [
    { action: 'Likely to be used locally', count: 50, badge: 'bg-[#E8F8EE] text-[#16A34A]' },
    { action: 'Prioritize FEFO issue', count: 17, badge: 'bg-[#EFF6FF] text-[#2563EB]' },
    { action: 'Accelerated FEFO or transfer', count: 15, badge: 'bg-[#FEF3C7] text-[#D97706]' },
    { action: 'Transfer or issue immediately', count: 5, badge: 'bg-[#FCECEE] text-[#7A1C28]' },
    { action: 'Quarantine and QC review', count: 3, badge: 'bg-[#FEE2E2] text-[#DC2626]' },
  ],
  
  // equipment.csv
  equipment_id: 'EQ-282724-PIA-01',
  equipment_type: 'Platelet Incubator & Agitator',
  equipment_health: 86.4,
  equipment_status: 'OK',
  
  // transport.csv
  connected_routes_count: 7,
}

const ANCHOR_BLOOD_GROUPS = [
  { blood_group: 'O+', units: 2820, batches: 12, pct: '13.3%' },
  { blood_group: 'A+', units: 2812, batches: 12, pct: '13.3%' },
  { blood_group: 'AB-', units: 2768, batches: 11, pct: '13.1%' },
  { blood_group: 'B-', units: 2729, batches: 11, pct: '12.9%' },
  { blood_group: 'O-', units: 2706, batches: 11, pct: '12.8%' },
  { blood_group: 'AB+', units: 2703, batches: 11, pct: '12.8%' },
  { blood_group: 'B+', units: 2320, batches: 11, pct: '11.0%' },
  { blood_group: 'A-', units: 2299, batches: 11, pct: '10.9%' },
]

const ANCHOR_COMPONENTS = [
  {
    component: 'Random Donor Platelets (RDP)',
    code: 'RDP',
    units: 14030,
    batches: 30,
    pct: '66.3%',
    min_units: 401,
    max_units: 517,
    mean_units: 468,
    temp: '22.0°C ± 2°C',
    shelf_life: '5 Days (Agitated)',
  },
  {
    component: 'Single Donor Platelets (SDP)',
    code: 'SDP',
    units: 3819,
    batches: 30,
    pct: '18.0%',
    min_units: 97,
    max_units: 169,
    mean_units: 127,
    temp: '22.0°C ± 2°C',
    shelf_life: '5 Days (Agitated)',
  },
  {
    component: 'Platelet Concentrate',
    code: 'PC',
    units: 3308,
    batches: 30,
    pct: '15.6%',
    min_units: 91,
    max_units: 129,
    mean_units: 110,
    temp: '22.0°C ± 2°C',
    shelf_life: '5 Days (Agitated)',
  },
]

export function Step1CentreOverview({
  summary,
  coldChain,
  health,
  network,
  onNavigateToStep,
}: Step1CentreOverviewProps) {
  const { t } = useLanguage()
  const [activeRadiusFilter, setActiveRadiusFilter] = useState<number>(200)
  const [overviewScope, setOverviewScope] = useState<'regional' | 'anchor'>('anchor')
  const [showAnchorDossier, setShowAnchorDossier] = useState<boolean>(true)

  const anchorFacility = network.find((f) => f.is_anchor) || {
    id: ANCHOR_CSV_DATA.bank_id,
    name: ANCHOR_CSV_DATA.name,
    city: `${ANCHOR_CSV_DATA.city}, ${ANCHOR_CSV_DATA.state}`,
    latitude: ANCHOR_CSV_DATA.latitude,
    longitude: ANCHOR_CSV_DATA.longitude,
    distance_km: 0,
    is_anchor: true,
    capacity: ANCHOR_CSV_DATA.storage_capacity,
    total_inventory_units: ANCHOR_CSV_DATA.total_units,
    critical_risk_units: ANCHOR_CSV_DATA.critical_risk_units,
    network_state: 'HEALTHY' as const,
  }

  const [selectedFacility, setSelectedFacility] = useState<CentreNetworkFacility>(anchorFacility)

  // Facilities filtered by active radius
  const filteredFacilities = network.filter((f) => f.distance_km <= activeRadiusFilter)

  // Map coordinates mapping
  const mapCenter = { x: 380, y: 200 }
  const maxRadiusPx = 200

  const getCoordinates = (fac: CentreNetworkFacility) => {
    if (fac.is_anchor || fac.distance_km === 0) return mapCenter

    const dLat = fac.latitude - anchorFacility.latitude
    const dLon = (fac.longitude - anchorFacility.longitude) * Math.cos((anchorFacility.latitude * Math.PI) / 180)

    const angle = Math.atan2(dLon, dLat)
    const rPx = (fac.distance_km / 200.0) * maxRadiusPx

    const x = mapCenter.x + rPx * Math.sin(angle)
    const y = mapCenter.y - rPx * Math.cos(angle)

    return { x: Math.max(30, Math.min(560, x)), y: Math.max(30, Math.min(370, y)) }
  }

  const isAnchor = overviewScope === 'anchor'

  return (
    <div className="p-6 md:p-8 max-w-[1500px] mx-auto w-full space-y-8 select-none font-sans bg-[#FAF7F5]">
      {/* 1. Hero Section */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div className="space-y-1.5 max-w-[750px]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#FCECEE] text-[#7A1C28] text-[10px] font-bold rounded-sm uppercase tracking-wider font-mono">
              STEP 01 OF 10
            </span>
            <span className="text-xs text-[#7A7471] font-bold uppercase tracking-wider">
              {t('centre.overviewTitle')}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#7A1C28] leading-tight tracking-tight">
            Chennai Rajiv Gandhi Hospital
          </h1>

          <p className="text-xs sm:text-sm text-[#5A5451] leading-relaxed max-w-[650px]">
            {t('centre.overviewSubtitle')} · <strong className="text-[#1F1B19] font-bold">{t('centre.radiusService')}</strong>.
          </p>
        </div>

        {/* Primary Action Button with Magnetic Effect */}
        <MagneticButton
          onClick={() => onNavigateToStep('inventory')}
          className="bg-[#7A1C28] hover:bg-[#63141F] text-white px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2 self-start lg:self-auto shrink-0"
        >
          <span>{t('inventory.title')}</span>
          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </MagneticButton>
      </section>

      {/* 2. PRAVAH DECISION & HEALTH SUMMARY BANNER */}
      {health && (
        <section className="p-5 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-3 pravah-card-hover">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#FAF7F5] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
              <h2 className="text-xs font-bold text-[#1F1B19] uppercase tracking-wider">
                PRAVAH Clinical Decision Summary · Chennai Anchor Health
              </h2>
            </div>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
              health.overall_operational_state === 'STABLE'
                ? 'bg-[#E8F8EE] text-[#16A34A]'
                : health.overall_operational_state === 'ATTENTION'
                ? 'bg-[#FEF3C7] text-[#D97706]'
                : 'bg-[#FCECEE] text-[#7A1C28]'
            }`}>
              {health.overall_operational_state}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-[#FAF7F5] rounded-xl space-y-0.5">
              <span className="text-[10px] text-[#7A7471] uppercase font-bold block">Local Inventory</span>
              <span className="font-bold text-[#1F1B19]">{health.inventory}</span>
            </div>
            <div className="p-3 bg-[#FAF7F5] rounded-xl space-y-0.5">
              <span className="text-[10px] text-[#7A7471] uppercase font-bold block">Demand Pressure</span>
              <span className="font-bold text-[#7A1C28]">{health.demand}</span>
            </div>
            <div className="p-3 bg-[#FAF7F5] rounded-xl space-y-0.5">
              <span className="text-[10px] text-[#7A7471] uppercase font-bold block">Expiry Horizon</span>
              <span className="font-bold text-[#DC2626]">{health.expiry}</span>
            </div>
            <div className="p-3 bg-[#FAF7F5] rounded-xl space-y-0.5">
              <span className="text-[10px] text-[#7A7471] uppercase font-bold block">Cold Storage</span>
              <span className="font-bold text-[#16A34A]">{health.cold_chain}</span>
            </div>
          </div>

          <p className="text-xs text-[#5A5451] leading-relaxed pt-1">
            <strong className="text-[#1F1B19]">Recommended Action: </strong>
            {health.decision_summary}
          </p>
        </section>
      )}

      {/* 3. OPERATIONAL STATISTICS SCOPE TOGGLE & 6 DYNAMIC KPI BLOCKS */}
      <section className="space-y-3">
        {/* Scope Toggle Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 px-4 rounded-2xl border border-[#E8E1DC] shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-[#7A1C28]">tune</span>
            <div>
              <h3 className="text-xs font-bold text-[#1F1B19] uppercase tracking-wider">
                Operational Statistics Scope
              </h3>
              <p className="text-[10px] text-[#7A7471]">
                {isAnchor
                  ? 'Showing authentic data extracted from CSV files for Chennai Rajiv Gandhi Hospital (Anchor Hub)'
                  : 'Showing aggregate statistics across all 149 blood banks in the 200 km regional radius'}
              </p>
            </div>
          </div>

          {/* Scope Buttons */}
          <div className="flex items-center gap-1.5 bg-[#FAF7F5] p-1 rounded-xl border border-[#E8E1DC] text-xs font-bold shrink-0">
            <button
              onClick={() => setOverviewScope('regional')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                !isAnchor
                  ? 'bg-[#7A1C28] text-white shadow-2xs'
                  : 'text-[#7A7471] hover:text-[#1F1B19]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">hub</span>
              <span>200 KM Regional Network (149 Banks)</span>
            </button>

            <button
              onClick={() => setOverviewScope('anchor')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                isAnchor
                  ? 'bg-[#7A1C28] text-white shadow-2xs'
                  : 'text-[#7A7471] hover:text-[#1F1B19]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">local_hospital</span>
              <span>Rajiv Gandhi Blood Bank (Anchor Hub)</span>
            </button>
          </div>
        </div>

        {/* 6 Dynamic KPI Blocks Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* KPI 1 */}
          <BloodFlowHover flowColor="burgundy" className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#5A5451]">
              <span className="material-symbols-outlined text-[20px] text-[#7A1C28] transition-transform group-hover:scale-110">
                {isAnchor ? 'badge' : 'groups'}
              </span>
              <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
                {isAnchor ? 'Anchor Hub ID' : 'Facilities in Network'}
              </span>
            </div>
            <div className="text-3xl font-bold text-[#1F1B19] font-sans leading-none pt-1 group-hover:scale-[1.02] transition-transform origin-left">
              {isAnchor ? (
                <span className="text-xl font-mono text-[#7A1C28]">CHN-RGH-001</span>
              ) : (
                <AnimatedNumber key="reg-fac" value={summary?.facilities_in_network ?? 149} />
              )}
            </div>
            <p className="text-[10px] text-[#7A1C28] font-bold">
              {isAnchor ? 'Government Hospital' : '≤ 200 km radius'}
            </p>
          </BloodFlowHover>

          {/* KPI 2 */}
          <BloodFlowHover flowColor="burgundy" className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#5A5451]">
              <span className="material-symbols-outlined text-[20px] text-[#7A1C28] transition-transform group-hover:scale-110">water_drop</span>
              <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
                {isAnchor ? 'Rajiv Gandhi Units' : 'Total Regional Units'}
              </span>
            </div>
            <div className="text-3xl font-bold text-[#1F1B19] font-sans leading-none pt-1 group-hover:scale-[1.02] transition-transform origin-left">
              {isAnchor ? (
                <AnimatedNumber key="anchor-units" value={ANCHOR_CSV_DATA.total_units} />
              ) : (
                <AnimatedNumber key="reg-units" value={summary?.total_inventory ?? 217029} />
              )}
            </div>
            <p className="text-[10px] text-[#7A7471]">
              {isAnchor
                ? `Across ${ANCHOR_CSV_DATA.total_batches} verified batches`
                : 'Across 149 facilities'}
            </p>
          </BloodFlowHover>

          {/* KPI 3 */}
          <BloodFlowHover flowColor="amber" className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#D97706]">
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">
                {isAnchor ? 'check_circle' : 'inventory_2'}
              </span>
              <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
                {isAnchor ? 'Low Stock Batches' : 'Low Stock Batches'}
              </span>
            </div>
            <div className="text-3xl font-bold text-[#D97706] font-sans leading-none pt-1 group-hover:scale-[1.02] transition-transform origin-left">
              {isAnchor ? (
                <AnimatedNumber key="anchor-low" value={0} />
              ) : (
                <AnimatedNumber key="reg-low" value={summary?.low_stock_batches ?? 6261} />
              )}
            </div>
            <p className="text-[10px] text-[#D97706] font-bold">
              {isAnchor ? 'Zero stockout deficits' : '≤ 5 units stock'}
            </p>
          </BloodFlowHover>

          {/* KPI 4 */}
          <BloodFlowHover flowColor="burgundy" className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#DC2626]">
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">schedule</span>
              <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
                {isAnchor ? 'Expiring ≤ 48h' : 'Near Expiry'}
              </span>
            </div>
            <div className="text-3xl font-bold text-[#DC2626] font-sans leading-none pt-1 group-hover:scale-[1.02] transition-transform origin-left">
              {isAnchor ? (
                <AnimatedNumber key="anchor-exp" value={ANCHOR_CSV_DATA.expiring_48h_batches} />
              ) : (
                <AnimatedNumber key="reg-exp" value={summary?.near_expiry_units ?? 687} />
              )}
            </div>
            <p className="text-[10px] text-[#DC2626] font-bold">
              {isAnchor ? 'Prioritize FEFO issue' : '≤ 48 hours remaining'}
            </p>
          </BloodFlowHover>

          {/* KPI 5 */}
          <BloodFlowHover flowColor="burgundy" className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#7A1C28]">
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">warning</span>
              <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
                {isAnchor ? 'High Risk Batches' : 'Critical Risk'}
              </span>
            </div>
            <div className="text-3xl font-bold text-[#7A1C28] font-sans leading-none pt-1 group-hover:scale-[1.02] transition-transform origin-left">
              {isAnchor ? (
                <AnimatedNumber key="anchor-risk" value={ANCHOR_CSV_DATA.high_risk_batches} />
              ) : (
                <AnimatedNumber key="reg-risk" value={summary?.high_risk_units ?? 8950} />
              )}
            </div>
            <p className="text-[10px] text-[#7A1C28] font-bold">
              {isAnchor ? `${ANCHOR_CSV_DATA.critical_risk_units} units risk score > 0.7` : 'Wastage prob > 70%'}
            </p>
          </BloodFlowHover>

          {/* KPI 6 */}
          <BloodFlowHover flowColor="green" className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#16A34A]">
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">
                {isAnchor ? 'trending_up' : 'local_shipping'}
              </span>
              <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
                {isAnchor ? 'Daily Demand' : 'Potential Transfers'}
              </span>
            </div>
            <div className="text-3xl font-bold text-[#16A34A] font-sans leading-none pt-1 group-hover:scale-[1.02] transition-transform origin-left">
              {isAnchor ? (
                <AnimatedNumber key="anchor-dem" value={ANCHOR_CSV_DATA.daily_demand_mean} />
              ) : (
                <AnimatedNumber key="reg-trans" value={summary?.potential_transfers ?? 2729} />
              )}
            </div>
            <p className="text-[10px] text-[#16A34A] font-bold">
              {isAnchor ? 'Units/day (100% fulfilled)' : 'Redistribution candidates'}
            </p>
          </BloodFlowHover>
        </div>
      </section>

      {/* 4. DEDICATED STRUCTURED RAJIV GANDHI HOSPITAL DATA DOSSIER */}
      <section className="bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs p-6 space-y-6 pravah-card-hover">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FAF7F5] pb-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FCECEE] text-[#7A1C28] flex items-center justify-center font-bold text-lg shrink-0">
              <span className="material-symbols-outlined text-[24px]">local_hospital</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#7A1C28] text-white text-[9px] font-bold font-mono rounded-md uppercase">
                  PRIMARY ANCHOR CENTRE
                </span>
                <span className="text-[10px] text-[#7A7471] font-mono">ID: {ANCHOR_CSV_DATA.code} ({ANCHOR_CSV_DATA.bank_id})</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1B19] mt-0.5">
                {ANCHOR_CSV_DATA.name}
              </h2>
              <p className="text-xs text-[#5A5451]">
                {ANCHOR_CSV_DATA.district}, {ANCHOR_CSV_DATA.state} · Category: {ANCHOR_CSV_DATA.category} · Coordinates: {ANCHOR_CSV_DATA.coordinates}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowAnchorDossier(!showAnchorDossier)}
              className="px-3.5 py-1.5 rounded-xl border border-[#E8E1DC] hover:bg-[#FAF7F5] text-xs font-bold text-[#5A5451] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{showAnchorDossier ? 'Collapse Dossier' : 'Expand Structured Dossier'}</span>
              <span className="material-symbols-outlined text-[16px]">
                {showAnchorDossier ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            <button
              onClick={() => onNavigateToStep('inventory', { bank_name: ANCHOR_CSV_DATA.name })}
              className="px-4 py-1.5 rounded-xl bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <span>Explore Batches</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {showAnchorDossier && (
          <div className="space-y-6">
            {/* Real Data File Sources & Quick Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="p-3.5 bg-[#FAF7F5] rounded-2xl border border-[#EFE9E5] space-y-1">
                <span className="text-[10px] text-[#7A7471] font-bold uppercase tracking-wider block">Verified Batches</span>
                <span className="text-xl font-bold text-[#1F1B19] font-mono">{ANCHOR_CSV_DATA.total_batches} Batches</span>
                <span className="text-[9.5px] text-[#16A34A] block font-semibold font-mono">platelet_inventory.csv</span>
              </div>

              <div className="p-3.5 bg-[#FAF7F5] rounded-2xl border border-[#EFE9E5] space-y-1">
                <span className="text-[10px] text-[#7A7471] font-bold uppercase tracking-wider block">Total Units On-Hand</span>
                <span className="text-xl font-bold text-[#7A1C28] font-mono">{ANCHOR_CSV_DATA.total_units.toLocaleString()} Units</span>
                <span className="text-[9.5px] text-[#7A1C28] block font-semibold">100% Verified Stock</span>
              </div>

              <div className="p-3.5 bg-[#FAF7F5] rounded-2xl border border-[#EFE9E5] space-y-1">
                <span className="text-[10px] text-[#7A7471] font-bold uppercase tracking-wider block">Daily Demand Rate</span>
                <span className="text-xl font-bold text-[#16A34A] font-mono">{ANCHOR_CSV_DATA.daily_demand_mean} U/day</span>
                <span className="text-[9.5px] text-[#16A34A] block font-semibold font-mono">platelet_demand.csv</span>
              </div>

              <div className="p-3.5 bg-[#FAF7F5] rounded-2xl border border-[#EFE9E5] space-y-1">
                <span className="text-[10px] text-[#7A7471] font-bold uppercase tracking-wider block">Equipment Health</span>
                <span className="text-xl font-bold text-[#1F1B19] font-mono">{ANCHOR_CSV_DATA.equipment_health} / 100</span>
                <span className="text-[9.5px] text-[#16A34A] block font-semibold font-mono">{ANCHOR_CSV_DATA.equipment_id}</span>
              </div>

              <div className="p-3.5 bg-[#FAF7F5] rounded-2xl border border-[#EFE9E5] space-y-1">
                <span className="text-[10px] text-[#7A7471] font-bold uppercase tracking-wider block">ML Expiry Risk</span>
                <span className="text-xl font-bold text-[#DC2626] font-mono">{ANCHOR_CSV_DATA.high_risk_batches} Batches</span>
                <span className="text-[9.5px] text-[#DC2626] block font-semibold font-mono">unit_expiry_risk.csv</span>
              </div>

              <div className="p-3.5 bg-[#FAF7F5] rounded-2xl border border-[#EFE9E5] space-y-1">
                <span className="text-[10px] text-[#7A7471] font-bold uppercase tracking-wider block">Connected Corridors</span>
                <span className="text-xl font-bold text-[#1F1B19] font-mono">{ANCHOR_CSV_DATA.connected_routes_count} Routes</span>
                <span className="text-[9.5px] text-[#7A7471] block font-semibold font-mono">transport.csv</span>
              </div>
            </div>

            {/* 2 Detailed Structured Tables (Blood Group Breakdown + Component Classification) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Table 1: Blood Group Breakdown across all 8 Groups */}
              <div className="lg:col-span-7 bg-[#FAF7F5] p-5 rounded-2xl border border-[#EFE9E5] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#7A1C28]">bloodtype</span>
                    <h3 className="text-xs font-bold text-[#1F1B19] uppercase tracking-wider">
                      Blood Group Distribution (All 8 Groups)
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#7A7471] font-mono font-bold">
                    {ANCHOR_CSV_DATA.total_units.toLocaleString()} Total Units
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E8E1DC] text-[10px] text-[#7A7471] uppercase font-bold">
                        <th className="pb-2 font-mono">Blood Group</th>
                        <th className="pb-2 text-right">Units On-Hand</th>
                        <th className="pb-2 text-right">Batches</th>
                        <th className="pb-2 text-right">Inventory Share</th>
                        <th className="pb-2 text-center">Clinical Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE9E5] font-mono">
                      {ANCHOR_BLOOD_GROUPS.map((bg) => (
                        <tr key={bg.blood_group} className="hover:bg-white/80 transition-colors">
                          <td className="py-2.5 font-bold text-[#7A1C28]">
                            <span className="inline-block px-2 py-0.5 bg-[#FCECEE] rounded-md font-sans">
                              {bg.blood_group}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-bold text-[#1F1B19]">
                            {bg.units.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-right text-[#5A5451]">
                            {bg.batches}
                          </td>
                          <td className="py-2.5 text-right text-[#7A7471]">
                            {bg.pct}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className="inline-block px-2 py-0.5 bg-[#E8F8EE] text-[#16A34A] text-[9.5px] font-sans font-bold rounded-md">
                              Optimal
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Component Classification & Storage */}
              <div className="lg:col-span-5 bg-[#FAF7F5] p-5 rounded-2xl border border-[#EFE9E5] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#7A1C28]">category</span>
                    <h3 className="text-xs font-bold text-[#1F1B19] uppercase tracking-wider">
                      Component Classification (platelet_inventory.csv)
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#7A7471] font-mono font-bold">
                    3 Primary Classes
                  </span>
                </div>

                <div className="space-y-3">
                  {ANCHOR_COMPONENTS.map((comp) => (
                    <div
                      key={comp.component}
                      className="p-3.5 bg-white rounded-xl border border-[#E8E1DC] space-y-2 hover:border-[#7A1C28]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#7A1C28]" />
                          <span className="text-xs font-bold text-[#1F1B19] font-sans">
                            {comp.component}
                          </span>
                        </div>
                        <span className="text-xs font-bold font-mono text-[#7A1C28]">
                          {comp.units.toLocaleString()} Units
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-[#7A7471] font-mono pt-1 border-t border-[#FAF7F5]">
                        <div>
                          <span>{comp.batches} Batches · {comp.pct} share</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#16A34A] font-bold">{comp.temp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations Ledger */}
                <div className="p-3.5 bg-white rounded-xl border border-[#E8E1DC] space-y-2">
                  <span className="text-[10px] text-[#1F1B19] font-bold uppercase tracking-wider block">
                    ML Unit Recommendations (unit_expiry_risk_features.csv)
                  </span>
                  <div className="space-y-1.5">
                    {ANCHOR_CSV_DATA.recommendations.map((rec) => (
                      <div key={rec.action} className="flex items-center justify-between text-[10px]">
                        <span className="text-[#5A5451]">{rec.action}</span>
                        <span className={`px-2 py-0.5 rounded-md font-mono font-bold ${rec.badge}`}>
                          {rec.count} Batches
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5. Bottom 2-Column Section: Map (Left) & Anchor Details (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: ~68% MAP */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1B19]">
                200 KM Regional Network Map
              </h2>
              <p className="text-xs text-[#7A7471] mt-0.5">
                Anchor facility at center with real geographic distance to all {network.length || 149} regional blood centres.
              </p>
            </div>

            {/* Radius Toggle */}
            <div className="flex items-center gap-1 bg-[#FAF7F5] p-1 rounded-xl border border-[#E8E1DC] text-xs font-bold shrink-0">
              {[50, 100, 150, 200].map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRadiusFilter(r)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeRadiusFilter === r
                      ? 'bg-[#7A1C28] text-white shadow-2xs'
                      : 'text-[#7A7471] hover:text-[#1F1B19]'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* SVG Map Container */}
          <div className="relative w-full aspect-16/10 rounded-2xl border border-[#D5E5F0] overflow-hidden bg-[#DCEBF5]">
            <svg viewBox="0 0 600 380" className="w-full h-full">
              {/* Landmass background (Tamil Nadu / Andhra coastal shape) */}
              <path
                d="M 0 0 L 380 0 Q 385 100, 390 200 Q 400 280, 420 380 L 0 380 Z"
                fill="#EDF4EE"
                stroke="#CCE0D0"
                strokeWidth="1.5"
              />

              {/* Bay of Bengal Sea area */}
              <text x="470" y="80" fill="#9ABFD4" fontSize="13" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">
                BAY OF BENGAL
              </text>

              {/* Concentric Range Rings from Chennai (center: 380, 200) */}
              {[50, 100, 150, 200].map((r, idx) => (
                <circle
                  key={idx}
                  cx="380"
                  cy="200"
                  r={r}
                  fill="none"
                  stroke="#B4D0E2"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Landmark City Labels */}
              <g fontSize="9" fontWeight="bold" fill="#6B7280" fontFamily="sans-serif">
                <text x="240" y="80" textAnchor="middle">Tirupati</text>
                <circle cx="240" cy="85" r="2.5" fill="#9CA3AF" />

                <text x="180" y="140" textAnchor="middle">Chittoor</text>
                <circle cx="180" cy="145" r="2.5" fill="#9CA3AF" />

                <text x="160" y="195" textAnchor="middle">Arcot</text>
                <circle cx="160" cy="200" r="2.5" fill="#9CA3AF" />

                <text x="230" y="245" textAnchor="middle">Kanchipuram</text>
                <circle cx="230" cy="250" r="2.5" fill="#9CA3AF" />

                <text x="200" y="320" textAnchor="middle">Tiruvannamalai</text>
                <circle cx="200" cy="325" r="2.5" fill="#9CA3AF" />

                <text x="270" y="360" textAnchor="middle">Puducherry</text>
                <circle cx="270" cy="348" r="2.5" fill="#9CA3AF" />
              </g>

              {/* Active Network Facility Dots */}
              {filteredFacilities.map((fac) => {
                if (fac.is_anchor) return null
                const coords = getCoordinates(fac)
                const isSelected = selectedFacility.id === fac.id

                return (
                  <g
                    key={fac.id}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={() => setSelectedFacility(fac)}
                  >
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={isSelected ? 6 : 3.5}
                      fill={
                        fac.network_state === 'HEALTHY'
                          ? '#16A34A'
                          : fac.network_state === 'MODERATE'
                          ? '#D97706'
                          : '#DC2626'
                      }
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 2 : 1}
                    />
                  </g>
                )
              })}

              {/* Chennai Anchor Pin Marker */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedFacility(anchorFacility)}
              >
                <circle cx="380" cy="200" r="14" fill="#7A1C28" opacity="0.15" />
                <path
                  d="M 380 182 C 373 182 368 187 368 194 C 368 202 380 216 380 216 C 380 216 392 202 392 194 C 392 187 387 182 380 182 Z"
                  fill="#7A1C28"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
                <circle cx="380" cy="192" r="3.5" fill="#FFFFFF" />
                <text x="396" y="208" fill="#7A1C28" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                  Chennai RGH (Anchor)
                </text>
              </g>
            </svg>

            {/* Map Legend */}
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-[#D5E5F0] text-[10px] space-y-1.5 shadow-sm font-sans">
              <span className="font-bold text-[#1F1B19] uppercase tracking-wider block text-[9px]">
                FACILITY STATUS
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                <span className="text-[#1F1B19]">Healthy Stock (≥ 10 units)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                <span className="text-[#1F1B19]">Moderate Stock (1-9 units)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                <span className="text-[#1F1B19]">Critical Deficit / Expiring</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ~32% PRIMARY ANCHOR METADATA */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1 border-b border-[#FAF7F5] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1C28] font-mono">
                {selectedFacility.is_anchor ? 'PRIMARY ANCHOR CENTRE' : 'SELECTED REGIONAL FACILITY'}
              </span>
              <h3 className="font-serif text-xl font-bold text-[#1F1B19] leading-snug">
                {selectedFacility.name}
              </h3>
              <p className="text-xs text-[#7A7471]">{selectedFacility.city}</p>
            </div>

            {/* Quick Facility Attributes */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#FAF7F5]">
                <span className="text-[#7A7471]">Distance from Anchor:</span>
                <span className="font-bold text-[#1F1B19] font-mono">
                  {selectedFacility.is_anchor ? '0.0 km (Center)' : `${selectedFacility.distance_km.toFixed(1)} km`}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#FAF7F5]">
                <span className="text-[#7A7471]">Total On-Hand Stock:</span>
                <span className="font-bold text-[#1F1B19] font-mono">
                  {selectedFacility.total_inventory_units !== undefined
                    ? `${selectedFacility.total_inventory_units.toLocaleString()} Units`
                    : 'Data unavailable'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#FAF7F5]">
                <span className="text-[#7A7471]">Critical Risk Batches:</span>
                <span className="font-bold text-[#DC2626] font-mono">
                  {selectedFacility.critical_risk_units !== undefined
                    ? `${selectedFacility.critical_risk_units} Batches`
                    : 'Data unavailable'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#FAF7F5]">
                <span className="text-[#7A7471]">Operating Capacity:</span>
                <span className="font-bold text-[#1F1B19] font-mono">
                  {selectedFacility.capacity.toLocaleString()} Units
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#FAF7F5]">
                <span className="text-[#7A7471]">Cold Storage Condition:</span>
                <span className="font-bold text-[#16A34A] font-mono">
                  {coldChain ? `${coldChain.current_temperature.toFixed(1)}°C · Agitation ${coldChain.agitation_status}` : '22.0°C · Agitation ON'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[#7A7471]">Operational Status:</span>
                <span className={`font-bold font-mono ${
                  selectedFacility.network_state === 'HEALTHY'
                    ? 'text-[#16A34A]'
                    : selectedFacility.network_state === 'MODERATE'
                    ? 'text-[#D97706]'
                    : 'text-[#DC2626]'
                }`}>
                  {selectedFacility.network_state}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => onNavigateToStep('inventory', { bank_name: selectedFacility.name })}
              className="w-full py-3 bg-[#FAF7F5] hover:bg-[#F2ECE8] border border-[#E8E1DC] text-[#7A1C28] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>View Inventory for this Centre</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>

            <button
              onClick={() => onNavigateToStep('transfers')}
              className="w-full py-3 bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <span>View Recommended Routes</span>
              <span className="material-symbols-outlined text-[16px]">map</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
