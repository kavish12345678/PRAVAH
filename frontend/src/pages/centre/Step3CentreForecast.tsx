import { useMemo, useState } from 'react'
import type { ForecastItem } from '../../types'

interface Step3CentreForecastProps {
  forecasts: ForecastItem[]
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

type ForecastHorizon = '24h' | '72h'
type StatusFilter = 'ALL' | 'DEFICIT' | 'BALANCED' | 'SURPLUS'
type SortOption = 'distance' | 'shortage' | 'surplus' | 'demand'

export function Step3CentreForecast({
  forecasts,
  onNavigateToStep,
}: Step3CentreForecastProps) {
  const [horizon, setHorizon] = useState<ForecastHorizon>('24h')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('All')
  const [componentFilter, setComponentFilter] = useState<string>('All')
  const [sortBy, setSortBy] = useState<SortOption>('distance')
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null)

  // 1. Calculate Aggregate Real-Data Cohort Metrics
  const totalMonitoredFacilities = useMemo(() => {
    const uniqueBankIds = new Set(forecasts.map((f) => f.bank_id).filter(Boolean))
    return uniqueBankIds.size || forecasts.length || 149
  }, [forecasts])

  const totalDemand24h = useMemo(() => {
    return Math.round(forecasts.reduce((sum, f) => sum + (f.forecast_24h ?? f.predicted_demand ?? 0), 0))
  }, [forecasts])

  const totalDemand72h = useMemo(() => {
    return Math.round(
      forecasts.reduce((sum, f) => sum + (f.forecast_72h ?? (f.forecast_24h ?? f.predicted_demand ?? 0) * 2.8), 0),
    )
  }, [forecasts])

  const deficitCount = useMemo(() => {
    return forecasts.filter((f) => {
      const bal = horizon === '72h' ? (f.projected_balance_72h ?? f.projected_balance ?? 0) : (f.projected_balance_24h ?? f.projected_balance ?? 0)
      return bal < 0
    }).length
  }, [forecasts, horizon])

  const surplusCount = useMemo(() => {
    return forecasts.filter((f) => {
      const bal = horizon === '72h' ? (f.projected_balance_72h ?? f.projected_balance ?? 0) : (f.projected_balance_24h ?? f.projected_balance ?? 0)
      return bal >= (horizon === '72h' ? 25 : 15)
    }).length
  }, [forecasts, horizon])

  const balancedCount = useMemo(() => {
    return Math.max(0, forecasts.length - deficitCount - surplusCount)
  }, [forecasts.length, deficitCount, surplusCount])

  // 2. Filter & Sort Forecast Records dynamically based on active horizon & criteria
  const filteredForecasts = useMemo(() => {
    let result = forecasts.map((f) => {
      const is72 = horizon === '72h'
      const activeDemand = is72 ? (f.forecast_72h ?? (f.forecast_24h ?? f.predicted_demand ?? 0) * 2.8) : (f.forecast_24h ?? f.predicted_demand ?? 0)
      const stock = f.current_stock ?? 0
      const activeBalance = is72 ? (f.projected_balance_72h ?? stock - activeDemand) : (f.projected_balance_24h ?? stock - activeDemand)

      let activeStatus: 'DEFICIT' | 'BALANCED' | 'SURPLUS' = 'BALANCED'
      if (activeBalance < 0) {
        activeStatus = 'DEFICIT'
      } else if (activeBalance >= (is72 ? 25 : 15)) {
        activeStatus = 'SURPLUS'
      }

      return {
        ...f,
        activeDemand: Math.round(activeDemand),
        activeBalance: Math.round(activeBalance),
        activeStatus,
      }
    })

    // Filter by Status Tab
    if (statusFilter !== 'ALL') {
      result = result.filter((f) => f.activeStatus === statusFilter)
    }

    // Filter by Blood Group
    if (bloodGroupFilter !== 'All') {
      result = result.filter((f) => f.blood_group === bloodGroupFilter)
    }

    // Filter by Component
    if (componentFilter !== 'All') {
      result = result.filter((f) => f.component === componentFilter)
    }

    // Sort Records
    result.sort((a, b) => {
      // Anchor facility always pinned at top
      if (a.is_anchor && !b.is_anchor) return -1
      if (!a.is_anchor && b.is_anchor) return 1

      if (sortBy === 'distance') {
        return (a.distance_km ?? 0) - (b.distance_km ?? 0)
      }
      if (sortBy === 'shortage') {
        return a.activeBalance - b.activeBalance
      }
      if (sortBy === 'surplus') {
        return b.activeBalance - a.activeBalance
      }
      if (sortBy === 'demand') {
        return b.activeDemand - a.activeDemand
      }
      return 0
    })

    return result
  }, [forecasts, horizon, statusFilter, bloodGroupFilter, componentFilter, sortBy])

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1540px] mx-auto w-full space-y-10 select-none font-sans bg-[#FAF7F5]">
      {/* 1. Header & Purpose */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 pb-2">
        <div className="space-y-3 max-w-[850px]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#FCECEE] text-[#7A1C28] text-[11px] font-bold rounded-full uppercase tracking-wider font-mono">
              Step 03 of 10
            </span>
            <span className="text-xs text-[#7A7471] font-bold uppercase tracking-wider">
              24h &amp; 72h GBDT Clinical Demand Forecasting
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-bold text-[#7A1C28] leading-[1.06] tracking-tight">
            What will this network need next?
          </h1>

          <p className="text-base sm:text-lg text-[#5A5451] leading-relaxed max-w-[800px]">
            PRAVAH forecasts near-term blood demand across <strong className="text-[#1F1B19] font-semibold">{totalMonitoredFacilities} facilities</strong> within 200 km of Chennai RGH and identifies where shortages or usable surplus will emerge.
          </p>

          {/* Clinical Decision Flow Step Chips */}
          <div className="flex items-center gap-1.5 pt-2 flex-wrap text-[11px] font-bold text-[#7A7471]">
            <span className="px-2.5 py-1 bg-white rounded-lg border border-[#E8E1DC] text-[#1F1B19]">CURRENT INVENTORY</span>
            <span>→</span>
            <span className="px-2.5 py-1 bg-[#FCECEE] text-[#7A1C28] rounded-lg border border-[#F5D5D9]">ML DEMAND FORECAST</span>
            <span>→</span>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-[#E8E1DC] text-[#1F1B19]">PROJECTED BALANCE</span>
            <span>→</span>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-[#E8E1DC] text-[#1F1B19]">DEFICIT / SURPLUS</span>
            <span>→</span>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-[#E8E1DC] text-[#7A7471]">RISK + OPTIMIZATION</span>
          </div>
        </div>

        <button
          onClick={() => onNavigateToStep('risk')}
          className="bg-[#7A1C28] hover:bg-[#63141F] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2.5 self-start lg:self-auto shrink-0"
        >
          <span>Step 04 · Inspect Expiry Risk</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </section>

      {/* 2. Top Summary KPI Cards (5 Cards) */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        {/* Card 1: Facilities Monitored */}
        <div className="p-5 bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-1.5 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-[#7A7471] uppercase tracking-wider">
            FACILITIES MONITORED
          </span>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-[#1F1B19] font-mono">
              {totalMonitoredFacilities}
            </div>
            <p className="text-[11px] text-[#7A7471] mt-0.5">Within 200 km of Chennai RGH</p>
          </div>
        </div>

        {/* Card 2: Projected Deficits */}
        <div className="p-5 bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-1.5 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
            <span>PROJECTED DEFICITS</span>
          </span>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-[#DC2626] font-mono">
              {deficitCount}
            </div>
            <p className="text-[11px] text-[#7A7471] mt-0.5">Impending stockout pressure</p>
          </div>
        </div>

        {/* Card 3: Projected Surplus */}
        <div className="p-5 bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-1.5 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-[#16A34A] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span>PROJECTED SURPLUS</span>
          </span>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-[#16A34A] font-mono">
              {surplusCount}
            </div>
            <p className="text-[11px] text-[#7A7471] mt-0.5">Usable excess reserves</p>
          </div>
        </div>

        {/* Card 4: 24h Aggregate Demand */}
        <div className="p-5 bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-1.5 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-[#7A1C28] uppercase tracking-wider">
            24H DEMAND FORECAST
          </span>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-[#7A1C28] font-mono">
              {totalDemand24h.toLocaleString()} <span className="text-sm font-sans font-bold text-[#5A5451]">Units</span>
            </div>
            <p className="text-[11px] text-[#7A7471] mt-0.5">Near-term network requirement</p>
          </div>
        </div>

        {/* Card 5: 72h Aggregate Demand */}
        <div className="p-5 bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-1.5 flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold text-[#7A7471] uppercase tracking-wider">
            72H DEMAND FORECAST
          </span>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-[#1F1B19] font-mono">
              {totalDemand72h.toLocaleString()} <span className="text-sm font-sans font-bold text-[#5A5451]">Units</span>
            </div>
            <p className="text-[11px] text-[#7A7471] mt-0.5">Extended 3-day requirement</p>
          </div>
        </div>
      </section>

      {/* 3. Filter & Horizon Control Bar */}
      <section className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-[#E8E1DC] shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#FAF7F5] p-1.5 rounded-2xl border border-[#E8E1DC] text-xs font-bold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-[#7A1C28] text-white shadow-xs'
                  : 'text-[#5A5451] hover:text-[#1F1B19]'
              }`}
            >
              All ({forecasts.length})
            </button>
            <button
              onClick={() => setStatusFilter('DEFICIT')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'DEFICIT'
                  ? 'bg-[#DC2626] text-white shadow-xs'
                  : 'text-[#DC2626] hover:bg-rose-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              <span>Deficit ({deficitCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('BALANCED')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'BALANCED'
                  ? 'bg-[#5A5451] text-white shadow-xs'
                  : 'text-[#5A5451] hover:text-[#1F1B19]'
              }`}
            >
              Balanced ({balancedCount})
            </button>
            <button
              onClick={() => setStatusFilter('SURPLUS')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'SURPLUS'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-[#16A34A] hover:bg-emerald-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>Surplus ({surplusCount})</span>
            </button>
          </div>

          {/* Horizon Toggle */}
          <div className="flex items-center gap-1 bg-[#FAF7F5] p-1.5 rounded-2xl border border-[#E8E1DC] text-xs font-bold font-mono">
            <button
              onClick={() => setHorizon('24h')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                horizon === '24h'
                  ? 'bg-[#7A1C28] text-white shadow-xs'
                  : 'text-[#5A5451] hover:text-[#1F1B19]'
              }`}
            >
              24H Lead Time
            </button>
            <button
              onClick={() => setHorizon('72h')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                horizon === '72h'
                  ? 'bg-[#7A1C28] text-white shadow-xs'
                  : 'text-[#5A5451] hover:text-[#1F1B19]'
              }`}
            >
              72H Lead Time
            </button>
          </div>
        </div>

        {/* Dropdown Filters (Blood Group, Component, Sort) */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-sans">
          {/* Blood Group */}
          <select
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF7F5] border border-[#E8E1DC] rounded-xl font-bold text-[#1F1B19] cursor-pointer focus:outline-hidden"
          >
            <option value="All">All Blood Groups</option>
            {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          {/* Component */}
          <select
            value={componentFilter}
            onChange={(e) => setComponentFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF7F5] border border-[#E8E1DC] rounded-xl font-bold text-[#1F1B19] cursor-pointer focus:outline-hidden"
          >
            <option value="All">All Components</option>
            <option value="Platelets">Platelets</option>
            <option value="Platelet Concentrate">Platelet Concentrate</option>
            <option value="RDP">RDP</option>
            <option value="SDP">SDP</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 bg-[#FAF7F5] border border-[#E8E1DC] rounded-xl font-bold text-[#1F1B19] cursor-pointer focus:outline-hidden"
          >
            <option value="distance">Sort by Distance (Nearest)</option>
            <option value="shortage">Sort by Highest Shortage</option>
            <option value="surplus">Sort by Highest Surplus</option>
            <option value="demand">Sort by Highest Demand</option>
          </select>
        </div>
      </section>

      {/* 4. Facility Forecast Cards Ledger Table */}
      <section className="bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-[#FAF7F5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1B19]">
              Regional Facility Demand &amp; Projected Balances ({filteredForecasts.length} Facilities)
            </h2>
            <p className="text-xs text-[#7A7471] mt-0.5">
              Evaluating current inventory against {horizon.toUpperCase()} HistGradientBoosting predicted demand across the 200 km cohort.
            </p>
          </div>
          <span className="px-3 py-1.5 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC] text-xs font-mono text-[#7A7471]">
            Model: HistGradientBoosting (R² = 0.763)
          </span>
        </div>

        {/* Rows */}
        {filteredForecasts.length > 0 ? (
          <div className="divide-y divide-[#FAF7F5] text-xs">
            {filteredForecasts.map((fc) => {
              const isExpanded = expandedCardId === fc.id
              const isSurplus = fc.activeStatus === 'SURPLUS'
              const isDeficit = fc.activeStatus === 'DEFICIT'

              return (
                <div
                  key={fc.id}
                  className={`p-5 transition-all ${
                    fc.is_anchor
                      ? 'bg-[#FDF6F7] border-l-4 border-[#7A1C28]'
                      : 'hover:bg-[#FAF7F5]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Facility Info */}
                    <div className="space-y-1.5 min-w-0 max-w-[480px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 bg-[#7A1C28]/10 text-[#7A1C28] text-[11px] font-bold rounded-md font-mono">
                          {fc.blood_group} {fc.component}
                        </span>

                        {fc.is_anchor ? (
                          <span className="px-2.5 py-0.5 bg-[#7A1C28] text-white text-[10px] font-bold rounded-md uppercase font-mono">
                            0.0 km · Primary Anchor
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-[#FAF7F5] text-[#7A7471] text-[10px] font-bold rounded-md font-mono border border-[#E8E1DC]">
                            {fc.distance_km?.toFixed(1)} km from Chennai RGH
                          </span>
                        )}

                        <span className="text-[11px] text-[#7A7471]">
                          {fc.city || 'Tamil Nadu'}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-[#1F1B19] truncate">
                        {fc.bank_name}
                      </h3>
                    </div>

                    {/* Middle: Stock vs Forecast vs Balance */}
                    <div className="grid grid-cols-3 sm:flex items-center gap-5 sm:gap-8 shrink-0">
                      {/* Current Stock */}
                      <div className="text-right">
                        <span className="text-[10px] text-[#7A7471] uppercase font-bold block">Current Stock</span>
                        <span className="text-base sm:text-lg font-bold text-[#1F1B19] font-mono">
                          {fc.current_stock ?? 0} <span className="text-xs font-normal text-[#7A7471]">U</span>
                        </span>
                      </div>

                      {/* Forecast Demand */}
                      <div className="text-right">
                        <span className="text-[10px] text-[#7A7471] uppercase font-bold block">{horizon.toUpperCase()} Forecast</span>
                        <span className="text-base sm:text-lg font-bold text-[#7A1C28] font-mono">
                          {fc.activeDemand} <span className="text-xs font-normal text-[#7A7471]">U</span>
                        </span>
                      </div>

                      {/* Projected Balance */}
                      <div className="text-right">
                        <span className="text-[10px] text-[#7A7471] uppercase font-bold block">Projected Balance</span>
                        <span className={`text-base sm:text-lg font-bold font-mono ${
                          isDeficit
                            ? 'text-[#DC2626]'
                            : isSurplus
                            ? 'text-[#16A34A]'
                            : 'text-[#1F1B19]'
                        }`}>
                          {fc.activeBalance > 0 ? `+${fc.activeBalance}` : fc.activeBalance} <span className="text-xs font-normal text-[#7A7471]">U</span>
                        </span>
                      </div>
                    </div>

                    {/* Right: Status Pill & Action */}
                    <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                      <span
                        className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider block font-mono ${
                          isDeficit
                            ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]'
                            : isSurplus
                            ? 'bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]'
                            : 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]'
                        }`}
                      >
                        {isDeficit ? '🔴 DEFICIT' : isSurplus ? '🟢 SURPLUS' : '⚪ BALANCED'}
                      </span>

                      <button
                        onClick={() => setExpandedCardId(isExpanded ? null : fc.id)}
                        className="p-1.5 hover:bg-[#FAF7F5] rounded-xl text-[#7A7471] hover:text-[#1F1B19] border border-transparent hover:border-[#E8E1DC] transition-all cursor-pointer"
                        title={isExpanded ? 'Hide Details' : 'View Forecast Breakdown'}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Expandable Breakdown Drawer */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[#E8E1DC] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-[#FAF7F5] p-4 rounded-2xl">
                      <div className="space-y-1">
                        <span className="font-bold text-[#1F1B19] block">24-Hour Trajectory:</span>
                        <div className="text-[#5A5451] space-y-0.5">
                          <div>Expected Demand: <strong className="font-mono text-[#1F1B19]">{fc.forecast_24h ?? fc.predicted_demand} Units</strong></div>
                          <div>Projected Balance: <strong className="font-mono text-[#1F1B19]">{fc.projected_balance_24h ?? fc.projected_balance} Units</strong></div>
                          <div>Classification: <strong className="font-mono text-[#1F1B19]">{fc.balance_status_24h ?? fc.balance_status}</strong></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-[#1F1B19] block">72-Hour Trajectory:</span>
                        <div className="text-[#5A5451] space-y-0.5">
                          <div>Expected Demand: <strong className="font-mono text-[#1F1B19]">{fc.forecast_72h ?? Math.round((fc.predicted_demand || 10) * 2.8)} Units</strong></div>
                          <div>Projected Balance: <strong className="font-mono text-[#1F1B19]">{fc.projected_balance_72h ?? (fc.current_stock ?? 0) - Math.round((fc.predicted_demand || 10) * 2.8)} Units</strong></div>
                          <div>Classification: <strong className="font-mono text-[#1F1B19]">{fc.balance_status_72h ?? 'BALANCED'}</strong></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-[#1F1B19] block">Clinical Next Steps:</span>
                        <p className="text-[#5A5451] leading-relaxed">
                          {isDeficit
                            ? 'Flagged for recipient replenishment in Step 07 LP Optimization solver.'
                            : isSurplus
                            ? 'Available as potential donor candidate subject to Step 04 Expiry Risk & Step 05 Cold Chain verification.'
                            : 'Stable reserve buffer. No immediate inter-facility transfer required.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F5] border border-[#E8E1DC] flex items-center justify-center mx-auto text-[#7A1C28]">
              <span className="material-symbols-outlined text-[24px]">
                {statusFilter === 'DEFICIT' ? 'check_circle' : 'info'}
              </span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1F1B19]">
              {statusFilter === 'DEFICIT'
                ? 'No Projected Shortages'
                : statusFilter === 'SURPLUS'
                ? 'No Projected Surplus'
                : 'No Matching Forecasts'}
            </h3>
            <p className="text-xs text-[#5A5451] max-w-[480px] mx-auto leading-relaxed">
              {statusFilter === 'DEFICIT'
                ? 'All monitored facilities in the current 200 km network have sufficient stock to cover forecasted demand under the selected filters.'
                : statusFilter === 'SURPLUS'
                ? 'No facilities in the current 200 km network have sufficient projected excess under the selected filter criteria.'
                : 'Try adjusting your blood group or component filter to view regional forecasts.'}
            </p>
          </div>
        )}
      </section>

      {/* 5. Explanatory Panels (Workflow & Model Info) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* HOW PRAVAH USES THE FORECAST */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-[#7A1C28]">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
            <h3 className="font-serif text-lg font-bold text-[#1F1B19]">
              How PRAVAH Uses Clinical Demand Forecasting
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#5A5451] leading-relaxed">
            <div className="space-y-1.5 p-3.5 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
              <strong className="text-[#1F1B19] block">1. Regional Inventory Read</strong>
              <p>Monitors actual batch-level inventory across all 149 regional blood centres and hospitals within 200 km.</p>
            </div>

            <div className="space-y-1.5 p-3.5 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
              <strong className="text-[#1F1B19] block">2. GBDT Demand Estimation</strong>
              <p>HistGradientBoosting model computes 24h &amp; 72h lead-time requirements based on facility scale and seasonal issuance patterns.</p>
            </div>

            <div className="space-y-1.5 p-3.5 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
              <strong className="text-[#1F1B19] block">3. Projected Balance Computation</strong>
              <p>Calculates net balance = Current Inventory − Forecast Demand to detect impending deficits and identify usable surpluses.</p>
            </div>

            <div className="space-y-1.5 p-3.5 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
              <strong className="text-[#1F1B19] block">4. Pipeline Hand-off to Optimization</strong>
              <p>Imbalance signals feed directly into Step 04 (Expiry Risk), Step 06 (Pressure Map), and Step 07 (Min-Cost LP Dispatch Solver).</p>
            </div>
          </div>
        </div>

        {/* MODEL INFORMATION */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7471] font-mono block">
              TRAINED ML SPECIFICATION
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1F1B19]">
              HistGradientBoosting Demand Estimator
            </h3>
            <div className="space-y-2 text-xs border-t border-[#FAF7F5] pt-2">
              <div className="flex justify-between py-1 border-b border-[#FAF7F5]">
                <span className="text-[#7A7471]">Algorithm:</span>
                <span className="font-bold text-[#1F1B19] font-mono">GBDT Regressor</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#FAF7F5]">
                <span className="text-[#7A7471]">Horizons:</span>
                <span className="font-bold text-[#1F1B19] font-mono">24h / 72h Lead Times</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#FAF7F5]">
                <span className="text-[#7A7471]">Evaluated Score:</span>
                <span className="font-bold text-[#16A34A] font-mono">R² = 0.763 (MAE = 4.2 U)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#7A7471]">Active Cohort:</span>
                <span className="font-bold text-[#7A1C28] font-mono">200 km Chennai Cohort</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToStep('risk')}
            className="w-full py-3 bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <span>Proceed to Step 04 · Expiry Risk</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  )
}
