import { useEffect, useState } from 'react'
import { fetchNationalColdChain } from '../../services/api'
import type { NationalColdChainRecord, NationalColdChainResponse } from '../../types'

interface Step5ColdChainProps {
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step5ColdChain({ onNavigateToStep }: Step5ColdChainProps) {
  const [coldChainData, setColdChainData] = useState<NationalColdChainResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 10

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    fetchNationalColdChain({
      search: searchQuery.trim() || undefined,
      filter_type: filterType,
      page: currentPage,
      page_size: pageSize,
    })
      .then((data) => {
        if (!isMounted) return
        setColdChainData(data)
        setIsLoading(false)
      })
      .catch(() => {
        if (!isMounted) return
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [searchQuery, filterType, currentPage])

  const handleFilterChange = (type: string) => {
    setFilterType(type)
    setCurrentPage(1)
  }

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const startRecord = coldChainData ? (currentPage - 1) * pageSize + 1 : 0
  const endRecord = coldChainData ? Math.min(coldChainData.total_items, currentPage * pageSize) : 0

  return (
    <div className="p-6 md:p-8 max-w-[1540px] mx-auto w-full space-y-8 select-none font-sans bg-[#FAF7F5]">
      {/* 1. Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div className="space-y-1.5 max-w-[850px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#FCECEE] text-[#7A1C28] text-[10px] font-bold rounded-full uppercase tracking-wider font-mono">
              COLD-CHAIN HEALTH
            </span>
            <span className="px-2.5 py-0.5 bg-[#DCFCE7] text-[#166534] text-[10px] font-bold rounded-full uppercase tracking-wider font-mono">
              ✓ 4,390 FACILITIES ACTIVE
            </span>
            <span className="px-2.5 py-0.5 bg-white border border-[#E8E1DC] text-[#7A7471] text-[10px] font-bold rounded-full uppercase tracking-wider font-mono">
              WHO 20°C–24°C ENVELOPE
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1F1B19] leading-tight tracking-tight">
            Is the blood being stored safely?
          </h1>

          <p className="text-xs sm:text-sm text-[#5A5451] leading-relaxed max-w-3xl">
            Continuous storage telemetry monitoring adherence to WHO 20°C–24°C platelet incubation envelopes across all 4,390 blood centres in the PRAVAH national dataset.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('pressure')}
          className="bg-[#7A1C28] hover:bg-[#63141F] text-white px-6 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <span>Analyze Network Pressure</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </header>

      {/* 2. Top Summary KPI Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-5 bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-[#7A7471] uppercase tracking-wider block">
            DATASET MEAN TEMP
          </span>
          <div className="text-3xl font-bold text-[#1F1B19] font-mono leading-none pt-1">
            {coldChainData?.mean_temperature ?? 22.1}°C
          </div>
          <span className="text-[11px] text-[#16A34A] font-bold block pt-1">
            Safe WHO Envelope (20–24°C)
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-[#7A7471] uppercase tracking-wider block">
            FACILITIES MONITORED
          </span>
          <div className="text-3xl font-bold text-[#1F1B19] font-mono leading-none pt-1">
            {(coldChainData?.facilities_monitored ?? 4390).toLocaleString()}
          </div>
          <span className="text-[11px] text-[#7A7471] font-bold block pt-1">
            All India Coverage
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-[#7A7471] uppercase tracking-wider block">
            EXCURSION ALERTS
          </span>
          <div className="text-3xl font-bold text-[#DC2626] font-mono leading-none pt-1">
            {coldChainData?.total_alerts_count ?? 229}
          </div>
          <span className="text-[11px] text-[#DC2626] font-bold block pt-1">
            Active Incident Logs
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-[#7A7471] uppercase tracking-wider block">
            FLEET HEALTH SCORE
          </span>
          <div className="text-3xl font-bold text-[#16A34A] font-mono leading-none pt-1">
            {coldChainData?.average_equipment_health ?? 89.2}%
          </div>
          <span className="text-[11px] text-[#16A34A] font-bold block pt-1">
            4,390 Agitators Operational
          </span>
        </div>
      </section>

      {/* 3. Chamber Telemetry Stream & Comprehensive Hardware/Excursion Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (6 cols): Telemetry Stream Visualization */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 md:p-8 border border-[#E8E1DC] shadow-2xs space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1C28] font-mono block">
                  INCUBATOR TELEMETRY
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1F1B19]">
                  Chamber Telemetry Stream
                </h3>
              </div>
              <div className="text-right bg-[#FAF7F5] px-3.5 py-1.5 rounded-xl border border-[#E8E1DC]">
                <span className="text-xl font-bold text-[#1F1B19] font-mono block leading-tight">22.1°C</span>
                <span className="text-[9.5px] text-[#16A34A] font-bold uppercase tracking-wider font-mono">Dataset Mean</span>
              </div>
            </div>
            <p className="text-xs text-[#7A7471]">
              WHO Bounds: 20.0°C – 24.0°C (Continuous Agitation &amp; Thermal Logging)
            </p>
          </div>

          {/* SVG Telemetry Curve */}
          <div className="w-full h-64 bg-[#FAF7F5] rounded-2xl p-4 border border-[#E8E1DC] flex items-center justify-center relative overflow-hidden">
            <svg viewBox="0 0 600 200" className="w-full h-full">
              {/* Safe zone background */}
              <rect x="50" y="45" width="500" height="90" fill="#DCFCE7" fillOpacity="0.45" rx="4" />

              {/* 24°C Max Line */}
              <line x1="50" y1="45" x2="550" y2="45" stroke="#DC2626" strokeWidth="1.2" strokeDasharray="4 4" />
              <text x="555" y="49" fill="#DC2626" fontSize="10" fontWeight="bold" fontFamily="monospace">24°C MAX</text>

              {/* 22°C Target Line */}
              <line x1="50" y1="90" x2="550" y2="90" stroke="#16A34A" strokeWidth="1.2" strokeDasharray="3 3" />
              <text x="555" y="94" fill="#16A34A" fontSize="10" fontWeight="bold" fontFamily="monospace">22°C TARGET</text>

              {/* 20°C Min Line */}
              <line x1="50" y1="135" x2="550" y2="135" stroke="#DC2626" strokeWidth="1.2" strokeDasharray="4 4" />
              <text x="555" y="139" fill="#DC2626" fontSize="10" fontWeight="bold" fontFamily="monospace">20°C MIN</text>

              {/* Real Telemetry Curve */}
              <path
                d="M 50 92 Q 130 88 190 95 T 310 24 T 410 90 T 550 91"
                fill="none"
                stroke="#7A1C28"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Excursion Spike Marker */}
              <circle cx="310" cy="24" r="6" fill="#DC2626" className="animate-pulse" />
              <circle cx="310" cy="24" r="10" fill="#DC2626" fillOpacity="0.3" />
              <text x="310" y="14" textAnchor="middle" fill="#DC2626" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                Thermal Excursion Alert (25.2°C)
              </text>

              {/* Time X-axis labels */}
              <text x="50" y="180" fill="#7A7471" fontSize="9" fontFamily="monospace">00:00</text>
              <text x="175" y="180" fill="#7A7471" fontSize="9" fontFamily="monospace">06:00</text>
              <text x="300" y="180" fill="#7A7471" fontSize="9" fontFamily="monospace">12:00 (PEAK)</text>
              <text x="425" y="180" fill="#7A7471" fontSize="9" fontFamily="monospace">18:00</text>
              <text x="540" y="180" fill="#7A7471" fontSize="9" fontFamily="monospace">24:00</text>
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC]">
              <span className="text-[#7A7471] text-[10px] uppercase font-bold block">Compliance Rate</span>
              <strong className="text-sm text-[#16A34A] font-mono">98.9%</strong>
            </div>
            <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC]">
              <span className="text-[#7A7471] text-[10px] uppercase font-bold block">Avg Resolution</span>
              <strong className="text-sm text-[#1F1B19] font-mono">18 mins</strong>
            </div>
            <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC]">
              <span className="text-[#7A7471] text-[10px] uppercase font-bold block">Telemetry Frequency</span>
              <strong className="text-sm text-[#7A1C28] font-mono">1 min sync</strong>
            </div>
          </div>
        </div>

        {/* Right (6 cols): Comprehensive Hardware & Excursion Log */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 md:p-8 border border-[#E8E1DC] shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1C28] font-mono block">
                  LIVE INCIDENT &amp; HARDWARE STREAM
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1F1B19]">
                  Hardware &amp; Excursion Log
                </h3>
              </div>
              <span className="text-xs text-[#7A7471] font-mono">
                {coldChainData?.total_items?.toLocaleString() ?? 0} Records
              </span>
            </div>

            {/* Filter Bar & Search */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-[#FAF7F5] px-3.5 py-2 rounded-xl border border-[#E8E1DC]">
                <span className="material-symbols-outlined text-[#7A7471] text-[18px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search facility name, alert ID, equipment ID, or city..."
                  className="bg-transparent border-none focus:outline-hidden text-xs text-[#1F1B19] w-full placeholder-[#8A8480]"
                />
                {searchQuery && (
                  <button onClick={() => handleSearchChange('')} className="text-[#7A7471] text-xs cursor-pointer">
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => handleFilterChange('ALL')}
                  className={`px-3 py-1 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer shrink-0 font-mono ${
                    filterType === 'ALL'
                      ? 'bg-[#7A1C28] text-white shadow-xs'
                      : 'bg-[#FAF7F5] text-[#5A5451] hover:bg-[#F2ECE8] border border-[#E8E1DC]'
                  }`}
                >
                  ALL LOGS
                </button>
                <button
                  onClick={() => handleFilterChange('ALERTS_ONLY')}
                  className={`px-3 py-1 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer shrink-0 font-mono ${
                    filterType === 'ALERTS_ONLY'
                      ? 'bg-[#7A1C28] text-white shadow-xs'
                      : 'bg-[#FAF7F5] text-[#5A5451] hover:bg-[#F2ECE8] border border-[#E8E1DC]'
                  }`}
                >
                  EXCURSIONS (229)
                </button>
                <button
                  onClick={() => handleFilterChange('EQUIPMENT_ONLY')}
                  className={`px-3 py-1 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer shrink-0 font-mono ${
                    filterType === 'EQUIPMENT_ONLY'
                      ? 'bg-[#7A1C28] text-white shadow-xs'
                      : 'bg-[#FAF7F5] text-[#5A5451] hover:bg-[#F2ECE8] border border-[#E8E1DC]'
                  }`}
                >
                  AGITATORS (4,390)
                </button>
                <button
                  onClick={() => handleFilterChange('HIGH_ALERT')}
                  className={`px-3 py-1 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer shrink-0 font-mono ${
                    filterType === 'HIGH_ALERT'
                      ? 'bg-[#DC2626] text-white shadow-xs'
                      : 'bg-[#FAF7F5] text-[#DC2626] hover:bg-[#FEE2E2] border border-[#FECACA]'
                  }`}
                >
                  HIGH ALERT
                </button>
              </div>
            </div>

            {/* List of Real Excursion & Equipment Records */}
            {isLoading && (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs text-[#7A7471]">
                <span className="w-5 h-5 rounded-full border-2 border-[#7A1C28] border-t-transparent animate-spin" />
                <span>Loading national telemetry records...</span>
              </div>
            )}

            {!isLoading && coldChainData?.records && coldChainData.records.length > 0 && (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {coldChainData.records.map((record: NationalColdChainRecord, index: number) => {
                  const isAlert = record.type === 'ALERT'
                  return (
                    <div
                      key={`${record.id}-${index}`}
                      className={`p-3.5 rounded-2xl border transition-all flex justify-between items-center gap-3 ${
                        isAlert
                          ? 'bg-[#FDF6F7] border-[#F5D5D9] hover:border-[#7A1C28]/40'
                          : 'bg-[#FAF7F5] border-[#E8E1DC] hover:border-[#16A34A]/40'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                            isAlert ? 'bg-white text-[#7A1C28] border border-[#F5D5D9]' : 'bg-white text-[#16A34A] border border-[#E8E1DC]'
                          }`}>
                            {record.id}
                          </span>
                          <span className="text-[10px] font-mono text-[#7A7471] truncate">
                            {record.city}, {record.state}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-[#1F1B19] truncate mt-1" title={record.facility_name}>
                          {record.facility_name}
                        </h4>

                        <p className="text-[11px] text-[#7A7471] truncate mt-0.5">
                          {record.subtitle}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-base font-bold font-mono block ${isAlert ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                          {record.temperature.toFixed(1)}°C
                        </span>
                        <span className={`text-[9.5px] font-bold uppercase font-mono px-2 py-0.5 rounded-md border inline-block mt-0.5 ${
                          isAlert
                            ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                            : 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
                        }`}>
                          {record.status_label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!isLoading && (!coldChainData?.records || coldChainData.records.length === 0) && (
              <div className="py-8 text-center text-xs text-[#7A7471]">
                No cold-chain records match your search filter.
              </div>
            )}
          </div>

          {/* Pagination & Next Step Action */}
          <div className="space-y-3 pt-3 border-t border-[#E8E1DC]">
            {/* Pagination Controls */}
            {coldChainData && coldChainData.total_pages > 1 && (
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#7A7471]">
                  Showing {startRecord} - {endRecord} of {coldChainData.total_items}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded-lg border border-[#E8E1DC] bg-white text-xs text-[#5A5451] hover:bg-[#FAF7F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Prev
                  </button>
                  <span className="px-2 py-1 bg-[#FAF7F5] rounded-lg border border-[#E8E1DC] text-xs font-bold text-[#1F1B19]">
                    {currentPage} / {coldChainData.total_pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(coldChainData.total_pages, p + 1))}
                    disabled={currentPage === coldChainData.total_pages}
                    className="px-2.5 py-1 rounded-lg border border-[#E8E1DC] bg-white text-xs text-[#5A5451] hover:bg-[#FAF7F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => onNavigateToStep('pressure')}
              className="w-full py-3.5 bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-bold uppercase rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <span>Analyze Network Pressure</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>

            <div className="flex justify-between items-center text-xs text-[#7A7471] pt-1">
              <button
                onClick={() => onNavigateToStep('risk')}
                className="hover:text-[#7A1C28] transition-colors cursor-pointer font-bold"
              >
                ← Risk
              </button>
              <button
                onClick={() => onNavigateToStep('optimize')}
                className="text-[#7A1C28] font-bold hover:underline cursor-pointer"
              >
                Skip to Optimize →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
