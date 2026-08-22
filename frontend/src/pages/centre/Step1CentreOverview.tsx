import { useState } from 'react'
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

export function Step1CentreOverview({
  summary,
  coldChain,
  health,
  network,
  onNavigateToStep,
}: Step1CentreOverviewProps) {
  const [activeRadiusFilter, setActiveRadiusFilter] = useState<number>(200)

  const anchorFacility = network.find((f) => f.is_anchor) || {
    id: 282724,
    name: 'Government Rajiv Gandhi Medical College Hospital',
    city: 'Chennai, Tamil Nadu',
    latitude: 13.0813,
    longitude: 80.2768,
    distance_km: 0,
    is_anchor: true,
    capacity: 5000,
    total_inventory_units: summary?.local_inventory?.total_units ?? 0,
    critical_risk_units: summary?.local_inventory?.critical_risk ?? 0,
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
              PRIMARY ANCHOR CENTRE OPERATIONS
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#7A1C28] leading-tight tracking-tight">
            Chennai Rajiv Gandhi Hospital
          </h1>

          <p className="text-xs sm:text-sm text-[#5A5451] leading-relaxed max-w-[650px]">
            Real-time clinical blood logistics, demand pressure, and redistribution intelligence across the <strong className="text-[#1F1B19] font-bold">200 km regional operational network</strong>.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => onNavigateToStep('inventory')}
          className="bg-[#7A1C28] hover:bg-[#63141F] text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-2 self-start lg:self-auto shrink-0"
        >
          <span>EXPLORE LOCAL INVENTORY</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </section>

      {/* 2. PRAVAH DECISION & HEALTH SUMMARY BANNER */}
      {health && (
        <section className="p-5 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-3">
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

      {/* 3. 6 Dynamic KPI Blocks Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Facilities in Network */}
        <div className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#5A5451]">
            <span className="material-symbols-outlined text-[20px]">groups</span>
            <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
              Facilities in Network
            </span>
          </div>
          <div className="text-3xl font-bold text-[#1F1B19] font-sans leading-none pt-1">
            {summary?.facilities_in_network !== undefined
              ? summary.facilities_in_network
              : network.length > 0
              ? network.length
              : 'Data unavailable'}
          </div>
          <p className="text-[10px] text-[#7A1C28] font-bold">≤ 200 km radius</p>
        </div>

        {/* KPI 2: Total Inventory */}
        <div className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#5A5451]">
            <span className="material-symbols-outlined text-[20px]">water_drop</span>
            <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
              Total Inventory
            </span>
          </div>
          <div className="text-3xl font-bold text-[#1F1B19] font-sans leading-none pt-1">
            {summary?.total_inventory !== undefined
              ? summary.total_inventory.toLocaleString()
              : 'Data unavailable'}
          </div>
          <p className="text-[10px] text-[#7A7471]">
            Regional units
          </p>
        </div>

        {/* KPI 3: Low Stock Batches */}
        <div className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#D97706]">
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
              Low Stock Batches
            </span>
          </div>
          <div className="text-3xl font-bold text-[#D97706] font-sans leading-none pt-1">
            {summary?.low_stock_batches !== undefined
              ? summary.low_stock_batches.toLocaleString()
              : 'Data unavailable'}
          </div>
          <p className="text-[10px] text-[#D97706] font-bold">≤ 5 units stock</p>
        </div>

        {/* KPI 4: Near Expiry */}
        <div className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#DC2626]">
            <span className="material-symbols-outlined text-[20px]">schedule</span>
            <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
              Near Expiry
            </span>
          </div>
          <div className="text-3xl font-bold text-[#DC2626] font-sans leading-none pt-1">
            {summary?.near_expiry_units !== undefined
              ? summary.near_expiry_units.toLocaleString()
              : 'Data unavailable'}
          </div>
          <p className="text-[10px] text-[#DC2626] font-bold">≤ 48 hours remaining</p>
        </div>

        {/* KPI 5: Critical Risk */}
        <div className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#7A1C28]">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
              Critical Risk
            </span>
          </div>
          <div className="text-3xl font-bold text-[#7A1C28] font-sans leading-none pt-1">
            {summary?.high_risk_units !== undefined
              ? summary.high_risk_units.toLocaleString()
              : 'Data unavailable'}
          </div>
          <p className="text-[10px] text-[#7A1C28] font-bold">GBDT Score &gt; 0.70</p>
        </div>

        {/* KPI 6: Potential Transfers */}
        <div className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#16A34A]">
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
              Potential Transfers
            </span>
          </div>
          <div className="text-3xl font-bold text-[#16A34A] font-sans leading-none pt-1">
            {summary?.potential_transfers !== undefined
              ? summary.potential_transfers.toLocaleString()
              : 'Data unavailable'}
          </div>
          <p className="text-[10px] text-[#16A34A] font-bold">HiGHS LP Solved</p>
        </div>
      </section>

      {/* 4. Bottom 2-Column Section: Map (Left) & Anchor Details (Right) */}
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
                  {coldChain ? `${coldChain.current_temperature.toFixed(1)}°C · Agitation ${coldChain.agitation_status}` : '20.9°C · Agitation ON'}
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
