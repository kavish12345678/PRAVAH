import { useState } from 'react'
import type { CentreNetworkFacility, CentreSummary } from '../../types'

interface Step1CentreOverviewProps {
  summary: CentreSummary | null
  network: CentreNetworkFacility[]
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step1CentreOverview({
  summary,
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
    capacity: 2500,
    total_inventory_units: 42,
    critical_risk_units: 0,
    network_state: 'HEALTHY' as const,
  }

  const [selectedFacility, setSelectedFacility] = useState<CentreNetworkFacility>(anchorFacility)

  // Facilities filtered by active radius
  const filteredFacilities = network.filter((f) => f.distance_km <= activeRadiusFilter)

  // Map coordinates mapping
  const mapCenter = { x: 380, y: 260 }
  const maxRadiusPx = 220

  const getCoordinates = (fac: CentreNetworkFacility) => {
    if (fac.is_anchor || fac.distance_km === 0) return mapCenter

    const dLat = fac.latitude - anchorFacility.latitude
    const dLon = (fac.longitude - anchorFacility.longitude) * Math.cos((anchorFacility.latitude * Math.PI) / 180)

    const angle = Math.atan2(dLon, dLat)
    const rPx = (fac.distance_km / 200.0) * maxRadiusPx

    const x = mapCenter.x + rPx * Math.sin(angle)
    const y = mapCenter.y - rPx * Math.cos(angle)

    return { x: Math.max(40, Math.min(560, x)), y: Math.max(30, Math.min(470, y)) }
  }

  return (
    <div className="p-6 md:p-8 max-w-[1500px] mx-auto w-full space-y-8 select-none font-sans bg-[#FAF7F5]">
      {/* 1. Hero Section */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div className="space-y-1.5 max-w-[750px]">
          <span className="text-[11px] font-bold text-[#7A1C28] uppercase tracking-wider block font-mono">
            STEP 01 OF 10
          </span>

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

      {/* 2. Exactly 6 KPI Cards Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1 */}
        <div className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#5A5451]">
            <span className="material-symbols-outlined text-[20px]">groups</span>
            <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
              Facilities in Network
            </span>
          </div>
          <div className="text-3xl font-bold text-[#1F1B19] font-sans leading-none pt-1">
            {summary?.facilities_in_network ?? network.length}
          </div>
          <p className="text-[10px] text-[#7A1C28] font-bold">≤ 200 km radius</p>
        </div>

        {/* KPI 2 */}
        <div className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#5A5451]">
            <span className="material-symbols-outlined text-[20px]">water_drop</span>
            <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
              Total Inventory
            </span>
          </div>
          <div className="text-3xl font-bold text-[#1F1B19] font-sans leading-none pt-1">
            {summary?.total_inventory.toLocaleString() ?? '843'}
          </div>
          <p className="text-[10px] text-[#7A7471]">Available units</p>
        </div>

        {/* KPI 3 */}
        <div className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#D97706]">
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
              Low Stock Batches
            </span>
          </div>
          <div className="text-3xl font-bold text-[#D97706] font-sans leading-none pt-1">
            {summary?.low_stock_batches ?? '189'}
          </div>
          <p className="text-[10px] text-[#D97706] font-bold">≤ 5 units stock</p>
        </div>

        {/* KPI 4 */}
        <div className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#DC2626]">
            <span className="material-symbols-outlined text-[20px]">schedule</span>
            <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
              Near Expiry
            </span>
          </div>
          <div className="text-3xl font-bold text-[#DC2626] font-sans leading-none pt-1">
            {summary?.near_expiry_units ?? '11'}
          </div>
          <p className="text-[10px] text-[#DC2626] font-bold">≤ 48 hours remaining</p>
        </div>

        {/* KPI 5 */}
        <div className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#7A1C28]">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
              Critical Risk
            </span>
          </div>
          <div className="text-3xl font-bold text-[#7A1C28] font-sans leading-none pt-1">
            {summary?.high_risk_units ?? '3'}
          </div>
          <p className="text-[10px] text-[#7A1C28] font-bold">GBDT Score &gt; 0.70</p>
        </div>

        {/* KPI 6 */}
        <div className="p-4 bg-white rounded-2xl border border-[#E8E1DC] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#16A34A]">
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            <span className="text-[11px] font-bold text-[#1F1B19] leading-tight">
              Potential Transfers
            </span>
          </div>
          <div className="text-3xl font-bold text-[#16A34A] font-sans leading-none pt-1">
            {summary?.potential_transfers ?? '62'}
          </div>
          <p className="text-[10px] text-[#16A34A] font-bold">Highs LP Solved</p>
        </div>
      </section>

      {/* 3. Bottom 2-Column Section: Map (Left) & Anchor Details (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: ~68% MAP */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1B19]">
                200 KM Regional Network Map
              </h2>
              <p className="text-xs text-[#7A7471] mt-0.5">
                Anchor facility at center with real geographic distance to all 149 regional blood centres.
              </p>
            </div>

            {/* Radius Toggle */}
            <div className="flex items-center gap-1 bg-[#FAF7F5] p-1 rounded-xl border border-[#E8E1DC] text-xs font-bold shrink-0">
              {[50, 100, 150, 200].map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRadiusFilter(r)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
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

          {/* Map Graphic Canvas */}
          <div className="relative w-full aspect-16/10 rounded-2xl border border-[#D5E5F0] overflow-hidden bg-[#DCEBF5]">
            <svg viewBox="0 0 600 380" className="w-full h-full">
              {/* Landmass background (Tamil Nadu / Andhra coastal shape) */}
              <path
                d="M 0 0 L 380 0 Q 385 100, 390 200 Q 400 280, 420 380 L 0 380 Z"
                fill="#EDF4EE"
                stroke="#CCE0D0"
                strokeWidth="1.5"
              />

              {/* Bay of Bengal Sea area label */}
              <text x="470" y="80" fill="#9ABFD4" fontSize="13" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">
                BAY OF BENGAL
              </text>

              {/* Concentric Range Rings from Chennai (center: 380, 200) */}
              {[
                { r: 50, label: '≤ 50 km' },
                { r: 100, label: '≤ 100 km' },
                { r: 150, label: '≤ 150 km' },
                { r: 200, label: '≤ 200 km' },
              ].map((ring, idx) => (
                <g key={idx}>
                  <circle
                    cx="380"
                    cy="200"
                    r={ring.r}
                    fill="none"
                    stroke="#B4D0E2"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                </g>
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

              {/* Radiating transit lines from Chennai Anchor */}
              {filteredFacilities.slice(0, 35).map((fac, idx) => {
                if (fac.is_anchor) return null
                const coords = getCoordinates(fac)
                return (
                  <line
                    key={idx}
                    x1="380"
                    y1="200"
                    x2={coords.x}
                    y2={coords.y}
                    stroke="#CBD5E1"
                    strokeWidth="0.75"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                )
              })}

              {/* Facility Dots */}
              {filteredFacilities.slice(0, 45).map((fac) => {
                if (fac.is_anchor) return null
                const coords = getCoordinates(fac)
                const isSelected = selectedFacility?.id === fac.id
                const dotColor =
                  fac.network_state === 'CRITICAL'
                    ? '#DC2626'
                    : fac.network_state === 'MODERATE'
                    ? '#D97706'
                    : '#16A34A'

                return (
                  <g
                    key={fac.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedFacility(fac)}
                  >
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={isSelected ? 6.5 : 4}
                      fill={dotColor}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 2 : 1}
                    />
                  </g>
                )
              })}

              {/* Anchor Location: Chennai */}
              <g className="cursor-pointer" onClick={() => setSelectedFacility(anchorFacility)}>
                <circle cx="380" cy="200" r="14" fill="#7A1C28" opacity="0.2" className="animate-ping" />
                {/* Red Pin Icon */}
                <path
                  d="M 380 182 C 373 182 368 187 368 194 C 368 202 380 216 380 216 C 380 216 392 202 392 194 C 392 187 387 182 380 182 Z"
                  fill="#7A1C28"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
                <circle cx="380" cy="193" r="3.5" fill="#FFFFFF" />
                <text x="396" y="210" fill="#7A1C28" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                  Chennai
                </text>
              </g>
            </svg>

            {/* Floating Legend Box (Top/Bottom Right) */}
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-[#D5E5F0] text-[10px] space-y-1.5 shadow-sm font-sans">
              <span className="font-bold text-[#1F1B19] uppercase tracking-wider block text-[9px]">
                LEGEND
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7A1C28]" />
                <span className="text-[#1F1B19]">Anchor Centre</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                <span className="text-[#1F1B19]">Surplus / Healthy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                <span className="text-[#1F1B19]">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                <span className="text-[#1F1B19]">Shortage / Critical</span>
              </div>
              <div className="pt-1 border-t border-[#E8E1DC] text-[9px] text-[#7A7471] space-y-0.5 font-mono">
                <div>--- ≤ 50 km</div>
                <div>--- ≤ 100 km</div>
                <div>--- ≤ 150 km</div>
                <div>--- ≤ 200 km</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ~32% PRIMARY ANCHOR CENTRE METADATA */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#7A1C28] uppercase tracking-wider block font-mono">
                {selectedFacility.is_anchor ? 'PRIMARY ANCHOR CENTRE' : 'REGIONAL NETWORK CENTRE'}
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1F1B19] leading-snug">
                {selectedFacility.name}
              </h3>
              <p className="text-xs text-[#7A7471]">
                {selectedFacility.city}
              </p>
            </div>

            {/* Metadata Rows with Icons */}
            <div className="space-y-4 pt-2 text-xs">
              {/* Row 1: Distance */}
              <div className="flex items-center justify-between gap-2 border-b border-[#FAF7F5] pb-2">
                <div className="flex items-center gap-2 text-[#5A5451]">
                  <span className="material-symbols-outlined text-[18px] text-[#7A1C28]">
                    location_on
                  </span>
                  <span>Distance from Anchor</span>
                </div>
                <span className="font-bold text-[#1F1B19] font-mono">
                  {selectedFacility.distance_km.toFixed(1)} km
                </span>
              </div>

              {/* Row 2: Facility Type */}
              <div className="flex items-center justify-between gap-2 border-b border-[#FAF7F5] pb-2">
                <div className="flex items-center gap-2 text-[#5A5451]">
                  <span className="material-symbols-outlined text-[18px] text-[#7A1C28]">
                    domain
                  </span>
                  <span>Facility Type</span>
                </div>
                <span className="font-semibold text-[#1F1B19] text-right">
                  {selectedFacility.is_anchor ? 'Government Hospital' : 'Blood Bank'}
                </span>
              </div>

              {/* Row 3: Blood Components */}
              <div className="flex items-center justify-between gap-2 border-b border-[#FAF7F5] pb-2">
                <div className="flex items-center gap-2 text-[#5A5451]">
                  <span className="material-symbols-outlined text-[18px] text-[#7A1C28]">
                    water_drop
                  </span>
                  <span>Blood Components</span>
                </div>
                <span className="font-semibold text-[#1F1B19] font-mono text-[11px] text-right">
                  WB, PRBC, SDP, RDP, PLT
                </span>
              </div>

              {/* Row 4: Network Role */}
              <div className="flex items-center justify-between gap-2 border-b border-[#FAF7F5] pb-2">
                <div className="flex items-center gap-2 text-[#5A5451]">
                  <span className="material-symbols-outlined text-[18px] text-[#7A1C28]">
                    hub
                  </span>
                  <span>Network Role</span>
                </div>
                <span className="font-semibold text-[#1F1B19] text-right">
                  {selectedFacility.is_anchor ? 'Primary Hub' : 'Regional Node'}
                </span>
              </div>

              {/* Row 5: Operational Since */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#5A5451]">
                  <span className="material-symbols-outlined text-[18px] text-[#7A1C28]">
                    schedule
                  </span>
                  <span>Operational Since</span>
                </div>
                <span className="font-bold text-[#16A34A] text-right">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <button
            onClick={() => onNavigateToStep('inventory', { bank_name: selectedFacility.name })}
            className="w-full py-3.5 bg-[#FAF7F5] hover:bg-[#F2ECE8] border border-[#E8E1DC] text-[#7A1C28] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <span>View Facility Inventory</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  )
}
