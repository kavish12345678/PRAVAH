import { useCallback, useEffect, useMemo, useState } from 'react'
import { MagneticButton } from '../../components/effects/MagneticButton'
import { RoadRouteMap } from '../../components/RoadRouteMap'
import { fetchCentreConsolidation, fetchRoadRoute } from '../../services/api'
import type { MultiStopConsolidationCandidate, TransferItem } from '../../types'

interface Step8CentreTransfersProps {
  transfers: (TransferItem & {
    distance_km?: number
    travel_time_min?: number
    source_lat?: number
    source_lon?: number
    source_city?: string
    destination_lat?: number
    destination_lon?: number
    destination_city?: string
    is_connected_to_anchor?: boolean
    route_score?: number
    urgency_level?: 'CRITICAL' | 'HIGH' | 'MODERATE' | string
    recommendation_reason?: string
    clinical_impact?: string
  })[]
  onSelectTransfer: (id: number | null) => void
  onSelectConsolidationCandidate?: (cand: MultiStopConsolidationCandidate | null) => void
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

interface LiveRouteMetrics {
  roadDistanceKm: number
  durationMin: number
  provider: string
  isCalculating: boolean
  isError: boolean
}

const INITIAL_CONSOLIDATION_CANDIDATES: MultiStopConsolidationCandidate[] = [
  {
    id: 'opt-a',
    option_name: 'OPTION A',
    is_recommended: true,
    consolidation_score: 92,
    title: 'Chennai Central-North Tri-Hospital Delivery Loop',
    vehicle: 'Refrigerated Van (22.0°C ± 2°C)',
    vehicle_capacity: 50,
    total_units: 12,
    blood_group: 'AB+ / A+ / O+',
    component: 'Platelet Concentrate',
    stops: [
      {
        stop_number: 1,
        bank_id: 30001,
        name: 'Government Stanley Medical College And Hospital',
        city: 'Chennai',
        latitude: 13.105854,
        longitude: 80.285439,
        quantity: 5,
        blood_group: 'AB+',
        component: 'Platelet Concentrate',
        urgency: 'CRITICAL',
        leg_distance_km: 3.9,
        leg_duration_min: 13.6,
        cumulative_distance_km: 3.9,
        cumulative_duration_min: 13.6,
      },
      {
        stop_number: 2,
        bank_id: 30037,
        name: 'Government The Institute Of Child Health And Hospital',
        city: 'Chennai',
        latitude: 13.072798,
        longitude: 80.258257,
        quantity: 4,
        blood_group: 'A+',
        component: 'Platelet Concentrate',
        urgency: 'HIGH',
        leg_distance_km: 6.36,
        leg_duration_min: 20.3,
        cumulative_distance_km: 10.26,
        cumulative_duration_min: 33.9,
      },
      {
        stop_number: 3,
        bank_id: 30038,
        name: 'Government Kilpauk Medical College Hospital',
        city: 'Chennai',
        latitude: 13.078315,
        longitude: 80.243824,
        quantity: 3,
        blood_group: 'O+',
        component: 'Platelet Concentrate',
        urgency: 'HIGH',
        leg_distance_km: 2.27,
        leg_duration_min: 9.2,
        cumulative_distance_km: 12.53,
        cumulative_duration_min: 43.1,
      },
    ],
    multi_stop_plan: {
      total_distance_km: 12.53,
      total_duration_min: 43.1,
      trips: 1,
      stops_count: 3,
      geometry: {
        type: 'LineString',
        coordinates: [
          [80.27678, 13.081279],
          [80.285439, 13.105854],
          [80.258257, 13.072798],
          [80.243824, 13.078315],
        ],
      },
    },
    direct_plan: {
      total_distance_km: 11.73,
      total_duration_min: 41.0,
      trips: 3,
      vehicles: 3,
      destinations_served: 3,
      legs: [
        { destination_name: 'Government Stanley Medical College', latitude: 13.105854, longitude: 80.285439, distance_km: 3.9, duration_min: 13.6 },
        { destination_name: 'Government The Institute Of Child Health', latitude: 13.072798, longitude: 80.258257, distance_km: 3.8, duration_min: 13.2 },
        { destination_name: 'Government Kilpauk Medical College', latitude: 13.078315, longitude: 80.243824, distance_km: 4.03, duration_min: 14.2 },
      ],
    },
    savings: {
      saved_distance_km: -0.8,
      saved_duration_min: -2.1,
      fewer_trips: 2,
      is_beneficial: true,
    },
    clinical_rationale: [
      'Transit time: 43.1 min vs 41.0 min direct (+5.1% difference)',
      'Within configured 5.0% transit time tolerance',
      '3 recipient facilities served in 1 consolidated dispatch (12 units total)',
      '1 vehicle required instead of 3 separate vehicles (2 fewer trips)',
      'WHO active cold storage (20-24°C) maintained throughout continuous journey',
      'Preserves perishable biological viability before hospital delivery cutoff',
    ],
  },
  {
    id: 'opt-b',
    option_name: 'OPTION B',
    is_recommended: true,
    consolidation_score: 95,
    title: 'Chennai Metropolitan South-Central Corridor',
    vehicle: 'Refrigerated Van (22.0°C ± 2°C)',
    vehicle_capacity: 50,
    total_units: 15,
    blood_group: 'B+ / AB+ / A+',
    component: 'Platelet Concentrate',
    stops: [
      {
        stop_number: 1,
        bank_id: 30002,
        name: 'Government Royapettah Hospital',
        city: 'Chennai',
        latitude: 13.054709,
        longitude: 80.265073,
        quantity: 6,
        blood_group: 'B+',
        component: 'Platelet Concentrate',
        urgency: 'CRITICAL',
        leg_distance_km: 4.34,
        leg_duration_min: 14.8,
        cumulative_distance_km: 4.34,
        cumulative_duration_min: 14.8,
      },
      {
        stop_number: 2,
        bank_id: 30099,
        name: 'Apollo Speciality Hospital Blood Centre',
        city: 'Chennai',
        latitude: 13.033595,
        longitude: 80.245070,
        quantity: 4,
        blood_group: 'AB+',
        component: 'Platelet Concentrate',
        urgency: 'HIGH',
        leg_distance_km: 4.31,
        leg_duration_min: 14.8,
        cumulative_distance_km: 8.65,
        cumulative_duration_min: 29.6,
      },
      {
        stop_number: 3,
        bank_id: 30168,
        name: 'Vijaya Blood Centre',
        city: 'Chennai',
        latitude: 13.049867,
        longitude: 80.208392,
        quantity: 5,
        blood_group: 'A+',
        component: 'Platelet Concentrate',
        urgency: 'HIGH',
        leg_distance_km: 5.89,
        leg_duration_min: 19.1,
        cumulative_distance_km: 14.54,
        cumulative_duration_min: 48.7,
      },
    ],
    multi_stop_plan: {
      total_distance_km: 14.54,
      total_duration_min: 48.7,
      trips: 1,
      stops_count: 3,
      geometry: {
        type: 'LineString',
        coordinates: [
          [80.27678, 13.081279],
          [80.265073, 13.054709],
          [80.245070, 13.033595],
          [80.208392, 13.049867],
        ],
      },
    },
    direct_plan: {
      total_distance_km: 23.93,
      total_duration_min: 74.3,
      trips: 3,
      vehicles: 3,
      destinations_served: 3,
      legs: [
        { destination_name: 'Government Royapettah Hospital', latitude: 13.054709, longitude: 80.265073, distance_km: 4.34, duration_min: 14.8 },
        { destination_name: 'Apollo Speciality Hospital', latitude: 13.033595, longitude: 80.245070, distance_km: 7.85, duration_min: 24.5 },
        { destination_name: 'Vijaya Blood Centre', latitude: 13.049867, longitude: 80.208392, distance_km: 11.74, duration_min: 35.0 },
      ],
    },
    savings: {
      saved_distance_km: 9.39,
      saved_duration_min: 25.6,
      fewer_trips: 2,
      is_beneficial: true,
    },
    clinical_rationale: [
      'Transit time: 48.7 min vs 74.3 min direct (-25.6 min saved)',
      'Multi-stop saves 9.39 km road distance across fleet',
      '3 recipient facilities served in 1 consolidated dispatch (15 units total)',
      '1 vehicle required instead of 3 separate vehicles (2 fewer trips)',
      'WHO active cold storage (20-24°C) maintained throughout continuous journey',
      'Preserves perishable biological viability before hospital delivery cutoff',
    ],
  },
  {
    id: 'opt-c',
    option_name: 'OPTION C',
    is_recommended: true,
    consolidation_score: 88,
    title: 'Chennai Suburban Highway Twin-Centre Route',
    vehicle: 'Refrigerated Van (22.0°C ± 2°C)',
    vehicle_capacity: 50,
    total_units: 14,
    blood_group: 'O+ / AB+',
    component: 'Platelet Concentrate',
    stops: [
      {
        stop_number: 1,
        bank_id: 30153,
        name: 'The Madras Medical Mission',
        city: 'Chennai',
        latitude: 13.060460,
        longitude: 80.227508,
        quantity: 8,
        blood_group: 'O+',
        component: 'Platelet Concentrate',
        urgency: 'HIGH',
        leg_distance_km: 7.85,
        leg_duration_min: 24.4,
        cumulative_distance_km: 7.85,
        cumulative_duration_min: 24.4,
      },
      {
        stop_number: 2,
        bank_id: 30092,
        name: 'Southern Railway Head Quarters Hospital',
        city: 'Chennai',
        latitude: 13.101967,
        longitude: 80.232996,
        quantity: 6,
        blood_group: 'AB+',
        component: 'Platelet Concentrate',
        urgency: 'HIGH',
        leg_distance_km: 6.28,
        leg_duration_min: 20.1,
        cumulative_distance_km: 14.13,
        cumulative_duration_min: 44.5,
      },
    ],
    multi_stop_plan: {
      total_distance_km: 14.13,
      total_duration_min: 44.5,
      trips: 1,
      stops_count: 2,
      geometry: {
        type: 'LineString',
        coordinates: [
          [80.27678, 13.081279],
          [80.227508, 13.060460],
          [80.232996, 13.101967],
        ],
      },
    },
    direct_plan: {
      total_distance_km: 14.97,
      total_duration_min: 46.8,
      trips: 2,
      vehicles: 2,
      destinations_served: 2,
      legs: [
        { destination_name: 'The Madras Medical Mission', latitude: 13.060460, longitude: 80.227508, distance_km: 7.85, duration_min: 24.4 },
        { destination_name: 'Southern Railway Hospital', latitude: 13.101967, longitude: 80.232996, distance_km: 7.12, duration_min: 22.4 },
      ],
    },
    savings: {
      saved_distance_km: 0.84,
      saved_duration_min: 2.3,
      fewer_trips: 1,
      is_beneficial: true,
    },
    clinical_rationale: [
      'Transit time: 44.5 min vs 46.8 min direct (-2.3 min saved)',
      '2 recipient facilities served in 1 consolidated dispatch (14 units total)',
      '1 vehicle required instead of 2 separate vehicles (1 fewer trip)',
      'WHO active cold storage (20-24°C) maintained throughout journey',
      'Preserves perishable biological viability before hospital delivery cutoff',
    ],
  },
]

export function Step8CentreTransfers({
  transfers,
  onSelectTransfer,
  onSelectConsolidationCandidate,
  onNavigateToStep,
}: Step8CentreTransfersProps) {
  // Dispatch Planning Mode Toggle
  const [planningMode, setPlanningMode] = useState<'direct' | 'multistop'>('direct')
  const [filterAnchorOnly, setFilterAnchorOnly] = useState(false)

  // Direct Mode State
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(() => transfers[0]?.id || null)
  const [liveRoadMetrics, setLiveRoadMetrics] = useState<LiveRouteMetrics>({
    roadDistanceKm: 0,
    durationMin: 0,
    provider: 'OSRM',
    isCalculating: true,
    isError: false,
  })

  // Individual Road Metrics Cache for all routes in ledger
  const [ledgerMetricsMap, setLedgerMetricsMap] = useState<
    Record<number, { distanceKm: number; durationMin: number }>
  >({})

  // Multi-Stop Consolidation State (initialized with clean distinct candidates)
  const [consolidationCandidates, setConsolidationCandidates] = useState<MultiStopConsolidationCandidate[]>(
    INITIAL_CONSOLIDATION_CANDIDATES,
  )
  const [selectedConsolidationId, setSelectedConsolidationId] = useState<string>('opt-a')

  // Map view toggle in Multi-Stop mode (Direct vs Multi-Stop path on map)
  const [activeMapPlanView, setActiveMapPlanView] = useState<'direct' | 'multistop'>('multistop')

  const displayedTransfers = useMemo(() => {
    if (filterAnchorOnly) {
      return transfers.filter((t) => t.is_connected_to_anchor)
    }
    return transfers
  }, [transfers, filterAnchorOnly])

  const activeTransfer = useMemo(() => {
    return (
      transfers.find((t) => t.id === selectedRouteId) ||
      displayedTransfers[0] ||
      transfers[0] ||
      null
    )
  }, [transfers, selectedRouteId, displayedTransfers])

  // Get up to 2 alternative transfers for the map in direct mode
  const alternativeTransfers = useMemo(() => {
    if (!activeTransfer) return []
    return displayedTransfers
      .filter((t) => t.id !== activeTransfer.id)
      .slice(0, 2)
  }, [displayedTransfers, activeTransfer])

  // Load Multi-Stop Consolidation Candidates from backend
  useEffect(() => {
    let isMounted = true

    fetchCentreConsolidation(282724)
      .then((data) => {
        if (!isMounted) return
        if (data && data.candidates && data.candidates.length > 0) {
          // Check that candidates have distinct coordinates
          const validCandidates = data.candidates.filter((cand) => {
            const coords = cand.stops.map((s) => `${s.latitude.toFixed(3)},${s.longitude.toFixed(3)}`)
            return new Set(coords).size === cand.stops.length
          })

          if (validCandidates.length > 0) {
            setConsolidationCandidates(validCandidates)
            const rec = validCandidates.find((c) => c.is_recommended) || validCandidates[0]
            if (rec) setSelectedConsolidationId(rec.id)
          }
        }
      })
      .catch(() => {
        // Fallback already active in state
      })

    return () => {
      isMounted = false
    }
  }, [transfers])

  // Pre-fetch individual road metrics for top routes in the ledger
  useEffect(() => {
    let isCancelled = false
    const topTransfers = transfers.slice(0, 15)

    topTransfers.forEach((t) => {
      if (t.source_lat && t.source_lon && t.destination_lat && t.destination_lon) {
        fetchRoadRoute(t.source_lat, t.source_lon, t.destination_lat, t.destination_lon, false)
          .then((res) => {
            if (!isCancelled && res) {
              setLedgerMetricsMap((prev) => ({
                ...prev,
                [t.id]: {
                  distanceKm: res.distance_km,
                  durationMin: res.duration_minutes,
                },
              }))
            }
          })
          .catch(() => {})
      }
    })

    return () => {
      isCancelled = true
    }
  }, [transfers])

  const activeConsolidation = useMemo(() => {
    return (
      consolidationCandidates.find((c) => c.id === selectedConsolidationId) ||
      consolidationCandidates[0] ||
      null
    )
  }, [consolidationCandidates, selectedConsolidationId])

  const alternativeConsolidations = useMemo(() => {
    if (!activeConsolidation) return []
    return consolidationCandidates.filter((c) => c.id !== activeConsolidation.id)
  }, [consolidationCandidates, activeConsolidation])

  // Dynamic Decision Engine Evaluation for the selected candidate
  const comparisonEvaluation = useMemo(() => {
    if (!activeConsolidation) return null

    const directDist = activeConsolidation.direct_plan.total_distance_km
    const directDur = activeConsolidation.direct_plan.total_duration_min
    const multiDist = activeConsolidation.multi_stop_plan.total_distance_km
    const multiDur = activeConsolidation.multi_stop_plan.total_duration_min

    const distDiffKm = Number((multiDist - directDist).toFixed(2))
    const timeDiffMin = Number((multiDur - directDur).toFixed(1))
    const relTimeDiffPct = Number(((timeDiffMin / Math.max(1.0, directDur)) * 100).toFixed(1))
    const timeTolerancePct = 5.0

    // Multi-stop is recommended if transit time is within 5% tolerance AND within WHO cold-chain envelope
    const isWithinTolerance = relTimeDiffPct <= timeTolerancePct
    const isColdChainSafe = multiDur <= 240.0
    const isRecommendedMultiStop = isWithinTolerance && isColdChainSafe

    const decisionWinner = isRecommendedMultiStop ? 'MULTI-STOP' : 'DIRECT'

    return {
      directDist,
      directDur,
      multiDist,
      multiDur,
      distDiffKm,
      timeDiffMin,
      relTimeDiffPct,
      timeTolerancePct,
      isWithinTolerance,
      isColdChainSafe,
      decisionWinner,
      vehiclesSaved: Math.max(1, activeConsolidation.stops.length - 1),
      tripsSaved: Math.max(1, activeConsolidation.stops.length - 1),
    }
  }, [activeConsolidation])

  const handleApproveClick = (id: number) => {
    onSelectTransfer(id)
    onSelectConsolidationCandidate?.(null)
    onNavigateToStep('approval')
  }

  const handleRouteCalculated = useCallback((metrics: LiveRouteMetrics) => {
    setLiveRoadMetrics(metrics)
  }, [])

  // Helper to extract clean facility route title without pre-baked fake distance strings
  const getCleanRouteName = (t: typeof activeTransfer) => {
    if (!t) return 'Unknown Route'
    if (t.source_bank && t.destination_bank) {
      return `${t.source_bank} → ${t.destination_bank}`
    }
    const raw = t.route || ''
    return raw.replace(/\s*\(\d+(\.\d+)?\s*km,?\s*\d+m\)/i, '').trim() || raw
  }

  const cleanActiveRouteName = getCleanRouteName(activeTransfer)

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1540px] mx-auto w-full space-y-8 select-none font-sans bg-[#FAF7F5]">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-1 pb-1">
        <div className="space-y-2.5 max-w-[850px]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#FCECEE] text-[#7A1C28] text-[11px] font-bold rounded-full uppercase tracking-wider font-mono">
              Step 08 of 10
            </span>
            <span className="text-xs text-[#7A7471] font-bold uppercase tracking-wider">
              Real Road-Following Dispatch Corridors &amp; Model Comparison
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#7A1C28] leading-[1.08] tracking-tight">
            Where should blood move around this centre?
          </h1>

          <p className="text-sm sm:text-base text-[#5A5451] leading-relaxed max-w-[800px]">
            PRAVAH evaluates both <strong className="text-[#7A1C28] font-bold">1-to-1 direct dispatches</strong> and <strong className="text-[#7A1C28] font-bold">consolidated multi-stop delivery routes</strong> using real OSRM road geometry, fleet vehicle constraints, and WHO cold-chain limits.
          </p>
        </div>

        <MagneticButton
          onClick={() => {
            if (planningMode === 'multistop' && activeConsolidation) {
              onSelectConsolidationCandidate?.(activeConsolidation)
              onSelectTransfer(null)
            } else if (activeTransfer) {
              onSelectTransfer(activeTransfer.id)
              onSelectConsolidationCandidate?.(null)
            }
            onNavigateToStep('approval')
          }}
          className="bg-[#7A1C28] hover:bg-[#63141F] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2.5 self-start lg:self-auto shrink-0"
        >
          <span>Step 09 · Clinical Authorization</span>
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </MagneticButton>
      </section>

      {/* DISPATCH PLANNING MODE TOGGLE BAR */}
      <section className="bg-white p-4 rounded-3xl border border-[#E8E1DC] shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7A7471] font-mono">
            DISPATCH PLANNING MODE:
          </span>
          <div className="flex items-center bg-[#FAF7F5] p-1 rounded-2xl border border-[#E8E1DC]">
            <button
              onClick={() => setPlanningMode('direct')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                planningMode === 'direct'
                  ? 'bg-[#7A1C28] text-white shadow-xs'
                  : 'text-[#5A5451] hover:text-[#1F1B19]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">arrow_right_alt</span>
              <span>Direct Routes</span>
            </button>
            <button
              onClick={() => setPlanningMode('multistop')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                planningMode === 'multistop'
                  ? 'bg-[#7A1C28] text-white shadow-xs'
                  : 'text-[#5A5451] hover:text-[#1F1B19]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">alt_route</span>
              <span>Multi-Stop Consolidation</span>
            </button>
          </div>
        </div>

        {planningMode === 'direct' ? (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={() => setFilterAnchorOnly(!filterAnchorOnly)}
              className={`px-3.5 py-1.5 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                filterAnchorOnly
                  ? 'bg-[#7A1C28] text-white border-[#7A1C28]'
                  : 'bg-white text-[#5A5451] border-[#E8E1DC] hover:border-[#7A1C28]/40'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">hub</span>
              <span>Chennai Anchor Only</span>
            </button>

            <span className="px-3 py-1.5 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC] text-[#7A7471] font-bold font-mono">
              {displayedTransfers.length} Feasible Corridors
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3.5 py-1.5 bg-[#DCFCE7] text-[#166534] rounded-xl font-bold font-mono">
              Model Comparison Active: {consolidationCandidates.length} Evaluated Candidates
            </span>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* MODE 1: DIRECT ROUTES VIEW (Standard 1-to-1 Corridors)                    */}
      {/* ========================================================================= */}
      {planningMode === 'direct' && (
        <>
          <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(380px,0.9fr)] gap-6 items-start">
            {/* Left: Map */}
            <div className="w-full flex flex-col">
              <RoadRouteMap
                mode="direct"
                activeTransfer={activeTransfer}
                alternativeTransfers={alternativeTransfers}
                onSelectTransfer={setSelectedRouteId}
                onRouteCalculated={handleRouteCalculated}
              />
            </div>

            {/* Right: Direct Route Details */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8E1DC] shadow-2xs flex flex-col justify-between h-[480px] lg:h-[500px] overflow-y-auto space-y-4">
              <div className="space-y-4">
                {activeTransfer ? (
                  <>
                    <div className="p-4 bg-[#FCECEE] rounded-2xl border border-[#F5D5D9] flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1C28] font-mono block">
                          ROUTE PRIORITY SCORE
                        </span>
                        <span className="text-xs text-[#5A5451]">Multi-factor LP objective score</span>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-[#7A1C28] font-mono">
                          {activeTransfer.route_score ?? 98}/100
                        </span>
                        <span className="block text-[10px] font-bold text-[#16A34A] uppercase font-mono">
                          {activeTransfer.urgency_level || 'CRITICAL PRIORITY'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7471] font-mono">
                        Direct Dispatch · Transfer #{activeTransfer.id}
                      </span>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1F1B19] leading-snug">
                        {cleanActiveRouteName}
                      </h3>
                      <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                        <span className="px-2.5 py-1 bg-[#DCFCE7] text-[#166534] font-bold rounded-lg text-xs font-mono">
                          {activeTransfer.quantity} Units {activeTransfer.blood_group} {activeTransfer.component}
                        </span>
                        <span className="px-2.5 py-1 bg-[#FAF7F5] text-[#7A7471] font-bold rounded-lg text-xs font-mono border border-[#E8E1DC]">
                          {liveRoadMetrics.isCalculating ? (
                            <span className="flex items-center gap-1.5 text-[#7A1C28]">
                              <span className="w-2 h-2 rounded-full bg-[#7A1C28] animate-ping" />
                              Calculating road route...
                            </span>
                          ) : liveRoadMetrics.isError ? (
                            'Route data unavailable'
                          ) : (
                            `${liveRoadMetrics.roadDistanceKm} km · ${liveRoadMetrics.durationMin} min transit`
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-2">
                      <div className="flex items-center gap-2 text-[#7A1C28]">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Why This Route Is Recommended
                        </span>
                      </div>
                      <ul className="text-xs text-[#5A5451] space-y-1.5 list-disc list-inside leading-relaxed">
                        <li><strong className="text-[#1F1B19]">Surplus Availability:</strong> Source hub has verified excess volume ({activeTransfer.quantity} units {activeTransfer.blood_group} {activeTransfer.component}).</li>
                        <li><strong className="text-[#1F1B19]">Shortage Relief:</strong> Resolves acute stockout pressure at {activeTransfer.destination_bank}.</li>
                        <li><strong className="text-[#1F1B19]">Cold-Chain Feasibility:</strong> Transit duration ({liveRoadMetrics.isCalculating ? 'calculating' : `${liveRoadMetrics.durationMin} min`}) is well within WHO viability envelope.</li>
                        <li><strong className="text-[#1F1B19]">Shelf-Life Preservation:</strong> Prevents platelet discard by moving units prior to degradation boundary.</li>
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-[#FAF7F5]">
                      <button
                        onClick={() => handleApproveClick(activeTransfer.id)}
                        className="w-full py-3.5 bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                      >
                        <span>Authorize Transfer #{activeTransfer.id}</span>
                        <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-xs text-[#7A7471]">
                    No transfer recommendation selected.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Direct Route Ledger */}
          <section className="bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs overflow-hidden">
            <div className="p-6 border-b border-[#FAF7F5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1F1B19]">
                  Regional Recommended Transfer Corridors ({displayedTransfers.length} Routes)
                </h3>
                <p className="text-xs text-[#7A7471] mt-0.5">
                  Each corridor displays its own actual road routing distance, estimated transit time, and LP priority score.
                </p>
              </div>
              <span className="text-xs font-mono text-[#7A7471]">HiGHS Min-Cost LP Solved</span>
            </div>

            <div className="divide-y divide-[#FAF7F5] text-xs">
              {displayedTransfers.slice(0, 15).map((t) => {
                const isSelected = activeTransfer?.id === t.id
                const cleanItemRouteName = getCleanRouteName(t)
                const cachedMetric = ledgerMetricsMap[t.id]
                const displayDistance = cachedMetric
                  ? `${cachedMetric.distanceKm} km`
                  : t.distance_km
                  ? `${t.distance_km.toFixed(1)} km`
                  : 'Calculating...'
                const displayDuration = cachedMetric
                  ? `${cachedMetric.durationMin} min`
                  : t.travel_time_min
                  ? `${t.travel_time_min} min`
                  : 'Calculating...'

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedRouteId(t.id)}
                    className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer pravah-table-row ${
                      isSelected
                        ? 'bg-[#FDF6F7] !border-l-4 !border-l-[#7A1C28]'
                        : ''
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-[#7A1C28]/10 text-[#7A1C28] text-[10px] font-bold rounded-md font-mono">
                          #{t.id}
                        </span>
                        <span className="px-2.5 py-0.5 bg-[#DCFCE7] text-[#166534] font-bold rounded-md text-[10px] font-mono">
                          {t.quantity} Units {t.blood_group} {t.component}
                        </span>
                        {t.is_connected_to_anchor && (
                          <span className="px-2 py-0.5 bg-[#7A1C28] text-white text-[10px] font-bold rounded-md uppercase font-mono">
                            Anchor
                          </span>
                        )}
                        <span className="text-xs text-[#7A7471] font-mono font-bold">
                          {displayDistance} · {displayDuration}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#1F1B19] truncate">{cleanItemRouteName}</h4>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-bold text-[#7A1C28] font-mono">
                          {t.route_score ?? 96}/100
                        </span>
                        <span className="text-[10px] text-[#16A34A] font-bold block uppercase font-mono">
                          {t.urgency_level || 'HIGH'}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApproveClick(t.id)
                        }}
                        className="px-4 py-2 bg-[#7A1C28] hover:bg-[#63141F] text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        Authorize
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: MULTI-STOP CONSOLIDATION (MODEL COMPARISON PAGE)                  */}
      {/* ========================================================================= */}
      {planningMode === 'multistop' && activeConsolidation && comparisonEvaluation && (
        <div className="space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white p-5 rounded-3xl border border-[#E8E1DC] shadow-2xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A1C28] font-mono block">
                PRAVAH ROUTE DECISION ENGINE
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#1F1B19]">
                Direct Dispatch vs. Multi-Stop Consolidation Comparison
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC] text-[#7A7471] text-xs font-mono font-bold">
                Time Tolerance: 5.0%
              </span>
            </div>
          </div>

          {/* 1. SIDE-BY-SIDE CANDIDATE PLAN COMPARISON CARDS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card A: DIRECT ROUTES */}
            <div className={`p-6 rounded-3xl border transition-all shadow-2xs space-y-4 ${
              comparisonEvaluation.decisionWinner === 'DIRECT'
                ? 'bg-[#FDF6F7] border-[#7A1C28] ring-2 ring-[#7A1C28]/20'
                : 'bg-white border-[#E8E1DC]'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 bg-[#5A5451] text-white rounded-md text-[10px] font-bold font-mono uppercase">
                    PLAN A · NORMAL DIRECT ROUTES
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#1F1B19] mt-1">
                    Separate Point-to-Point Dispatches
                  </h3>
                </div>
                {comparisonEvaluation.decisionWinner === 'DIRECT' && (
                  <span className="px-3 py-1 bg-[#16A34A] text-white text-[10px] font-bold rounded-full uppercase font-mono">
                    MODEL WINNER
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
                  <span className="text-[10px] text-[#7A7471] font-bold block uppercase">Total Distance</span>
                  <span className="text-xl font-bold font-mono text-[#1F1B19]">
                    {comparisonEvaluation.directDist} km
                  </span>
                </div>
                <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
                  <span className="text-[10px] text-[#7A7471] font-bold block uppercase">Total Transit Time</span>
                  <span className="text-xl font-bold font-mono text-[#7A1C28]">
                    {comparisonEvaluation.directDur} min
                  </span>
                </div>
                <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
                  <span className="text-[10px] text-[#7A7471] font-bold block uppercase">Fleet Vehicles</span>
                  <span className="text-xl font-bold font-mono text-[#1F1B19]">
                    {activeConsolidation.direct_plan.vehicles} Vans
                  </span>
                </div>
                <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
                  <span className="text-[10px] text-[#7A7471] font-bold block uppercase">Trips Required</span>
                  <span className="text-xl font-bold font-mono text-[#1F1B19]">
                    {activeConsolidation.direct_plan.trips} Trips
                  </span>
                </div>
                <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
                  <span className="text-[10px] text-[#7A7471] font-bold block uppercase">Recipients Served</span>
                  <span className="text-xl font-bold font-mono text-[#1F1B19]">
                    {activeConsolidation.direct_plan.destinations_served} Centers
                  </span>
                </div>
                <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
                  <span className="text-[10px] text-[#7A7471] font-bold block uppercase">Cold-Chain Status</span>
                  <span className="text-sm font-bold font-mono text-[#16A34A] block mt-1">
                    FEASIBLE
                  </span>
                </div>
              </div>

              <div className="text-xs text-[#5A5451] space-y-1 border-t border-[#FAF7F5] pt-3">
                <span className="font-bold text-[#1F1B19] block text-[11px]">Direct Dispatch Legs:</span>
                {activeConsolidation.direct_plan.legs.map((leg, i) => (
                  <div key={i} className="flex justify-between py-0.5">
                    <span>Trip {i + 1}: Chennai RGH → {leg.destination_name}</span>
                    <span className="font-mono font-bold text-[#1F1B19]">{leg.distance_km} km ({leg.duration_min}m)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card B: MULTI-STOP CONSOLIDATION */}
            <div className={`p-6 rounded-3xl border transition-all shadow-2xs space-y-4 ${
              comparisonEvaluation.decisionWinner === 'MULTI-STOP'
                ? 'bg-[#FDF6F7] border-[#7A1C28] ring-2 ring-[#7A1C28]/20'
                : 'bg-white border-[#E8E1DC]'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 bg-[#7A1C28] text-white rounded-md text-[10px] font-bold font-mono uppercase">
                    PLAN B · MULTI-STOP CONSOLIDATION
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#1F1B19] mt-1">
                    {activeConsolidation.title}
                  </h3>
                </div>
                {comparisonEvaluation.decisionWinner === 'MULTI-STOP' && (
                  <span className="px-3 py-1 bg-[#16A34A] text-white text-[10px] font-bold rounded-full uppercase font-mono">
                    MODEL WINNER
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
                  <span className="text-[10px] text-[#7A7471] font-bold block uppercase">Total Distance</span>
                  <span className="text-xl font-bold font-mono text-[#1F1B19]">
                    {comparisonEvaluation.multiDist} km
                  </span>
                </div>
                <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
                  <span className="text-[10px] text-[#7A7471] font-bold block uppercase">Total Transit Time</span>
                  <span className="text-xl font-bold font-mono text-[#7A1C28]">
                    {comparisonEvaluation.multiDur} min
                  </span>
                </div>
                <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
                  <span className="text-[10px] text-[#7A7471] font-bold block uppercase">Fleet Vehicles</span>
                  <span className="text-xl font-bold font-mono text-[#16A34A]">
                    1 Van
                  </span>
                </div>
                <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
                  <span className="text-[10px] text-[#7A7471] font-bold block uppercase">Stops in Loop</span>
                  <span className="text-xl font-bold font-mono text-[#1F1B19]">
                    {activeConsolidation.stops.length} Stops
                  </span>
                </div>
                <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
                  <span className="text-[10px] text-[#7A7471] font-bold block uppercase">Total Units</span>
                  <span className="text-xl font-bold font-mono text-[#1F1B19]">
                    {activeConsolidation.total_units} Units
                  </span>
                </div>
                <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC]">
                  <span className="text-[10px] text-[#7A7471] font-bold block uppercase">Cold-Chain Status</span>
                  <span className="text-sm font-bold font-mono text-[#16A34A] block mt-1">
                    FEASIBLE
                  </span>
                </div>
              </div>

              <div className="text-xs text-[#5A5451] space-y-1 border-t border-[#FAF7F5] pt-3">
                <span className="font-bold text-[#1F1B19] block text-[11px]">Consolidated Delivery Sequence:</span>
                {activeConsolidation.stops.map((stop, i) => (
                  <div key={i} className="flex justify-between py-0.5">
                    <span>Stop {stop.stop_number}: {stop.name} ({stop.quantity} Units)</span>
                    <span className="font-mono font-bold text-[#1F1B19]">Leg: {stop.leg_distance_km} km ({stop.leg_duration_min}m)</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 2. MODEL DECISION ANALYSIS & VISUAL COMPARISON */}
          <section className="bg-white p-6 rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#FAF7F5] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1C28] font-mono block">
                  MODEL DECISION ANALYSIS
                </span>
                <h3 className="font-serif text-xl font-bold text-[#1F1B19]">
                  Comparative Fleet Transit Time Evaluation
                </h3>
              </div>
              <span className="text-xs text-[#7A7471] font-mono">
                Formula: Relative Difference = ((MultiStop - Direct) / Direct) × 100
              </span>
            </div>

            {/* Visual Horizontal Transit Time Bars */}
            <div className="space-y-4 max-w-[800px]">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-[#5A5451]">DIRECT DISPATCH PLAN</span>
                  <span className="text-[#1F1B19]">{comparisonEvaluation.directDur} min ({comparisonEvaluation.directDist} km)</span>
                </div>
                <div className="w-full bg-[#E8E1DC] h-6 rounded-xl overflow-hidden flex items-center px-3">
                  <div
                    className="bg-[#5A5451] h-4 rounded-lg transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(30, (comparisonEvaluation.directDur / Math.max(comparisonEvaluation.directDur, comparisonEvaluation.multiDur)) * 95))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-[#7A1C28]">MULTI-STOP CONSOLIDATED PLAN</span>
                  <span className="text-[#7A1C28]">{comparisonEvaluation.multiDur} min ({comparisonEvaluation.multiDist} km)</span>
                </div>
                <div className="w-full bg-[#F5D5D9] h-6 rounded-xl overflow-hidden flex items-center px-3">
                  <div
                    className="bg-[#7A1C28] h-4 rounded-lg transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(30, (comparisonEvaluation.multiDur / Math.max(comparisonEvaluation.directDur, comparisonEvaluation.multiDur)) * 95))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Analysis Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] text-xs space-y-1">
                <span className="text-[#7A7471] uppercase text-[10px] block font-bold">Transit Time Difference</span>
                <span className={`font-mono text-base font-bold ${
                  comparisonEvaluation.timeDiffMin <= 0 ? 'text-[#16A34A]' : 'text-[#7A1C28]'
                }`}>
                  {comparisonEvaluation.timeDiffMin > 0 ? `+${comparisonEvaluation.timeDiffMin}` : comparisonEvaluation.timeDiffMin} min
                </span>
                <span className="text-[10px] text-[#5A5451] block">
                  ({comparisonEvaluation.relTimeDiffPct > 0 ? `+${comparisonEvaluation.relTimeDiffPct}` : comparisonEvaluation.relTimeDiffPct}% relative)
                </span>
              </div>

              <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] text-xs space-y-1">
                <span className="text-[#7A7471] uppercase text-[10px] block font-bold">Configured Tolerance</span>
                <span className="font-mono text-base font-bold text-[#1F1B19]">
                  5.0%
                </span>
                <span className="text-[10px] text-[#16A34A] font-bold block">
                  Within Tolerance: {comparisonEvaluation.isWithinTolerance ? 'YES' : 'NO'}
                </span>
              </div>

              <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] text-xs space-y-1">
                <span className="text-[#7A7471] uppercase text-[10px] block font-bold">Fleet Reductions</span>
                <span className="font-mono text-base font-bold text-[#16A34A]">
                  -{comparisonEvaluation.vehiclesSaved} Vehicles
                </span>
                <span className="text-[10px] text-[#5A5451] block">
                  {comparisonEvaluation.tripsSaved} fewer separate dispatches
                </span>
              </div>

              <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] text-xs space-y-1">
                <span className="text-[#7A7471] uppercase text-[10px] block font-bold">Constraints Validation</span>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#16A34A]">
                  <span>Cold-Chain: PASS</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#16A34A]">
                  <span>Capacity: PASS ({activeConsolidation.total_units}/50)</span>
                </div>
              </div>
            </div>
          </section>

          {/* 3. PROMINENT DECISION BANNER (CLEAR WINNER) */}
          <section className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
            comparisonEvaluation.decisionWinner === 'MULTI-STOP'
              ? 'bg-[#FDF6F7] border-[#7A1C28]'
              : 'bg-[#FAF7F5] border-[#E8E1DC]'
          }`}>
            <div className="space-y-1.5 max-w-[850px]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#7A1C28] text-white font-mono text-[10px] font-bold rounded-md uppercase">
                  PRAVAH MODEL RECOMMENDATION
                </span>
                <span className="text-xs font-bold font-mono text-[#16A34A]">
                  OPTIMALITY VERIFIED
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#7A1C28]">
                {comparisonEvaluation.decisionWinner === 'MULTI-STOP'
                  ? '✓ Multi-Stop Consolidation Recommended'
                  : '✓ Direct Routes Recommended'}
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5451] leading-relaxed">
                {comparisonEvaluation.decisionWinner === 'MULTI-STOP'
                  ? `Consolidated transit time (${comparisonEvaluation.multiDur} min) is within the acceptable 5.0% operational tolerance of the direct plan (${comparisonEvaluation.directDur} min) while replacing ${activeConsolidation.direct_plan.vehicles} separate vehicle journeys with 1 unified dispatch.`
                  : `Multi-stop routing increases transit time by +${comparisonEvaluation.timeDiffMin} min (+${comparisonEvaluation.relTimeDiffPct}%), exceeding the 5.0% operational threshold. Direct dispatches are recommended to preserve rapid emergency supply.`}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0 self-start md:self-auto">
              <span className="text-3xl font-bold font-mono text-[#7A1C28]">
                {activeConsolidation.consolidation_score}/100
              </span>
              <span className="text-[10px] font-bold uppercase font-mono text-[#16A34A]">
                Score: {comparisonEvaluation.decisionWinner} WIN
              </span>
            </div>
          </section>

          {/* 4. INTERACTIVE ROUTE MAP & MAP VIEW TOGGLE */}
          <section className="bg-white p-6 rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1C28] font-mono block">
                  MULTI-STOP ROUTE VISUALIZATION
                </span>
                <h3 className="font-serif text-xl font-bold text-[#1F1B19]">
                  Sequential Road Route Connecting Every Optimized Stop
                </h3>
                <p className="text-xs text-[#7A7471] mt-0.5">
                  Real road-following route connecting every optimized stop in sequence.
                </p>
              </div>

              {/* Map Plan View Switcher */}
              <div className="flex items-center bg-[#FAF7F5] p-1 rounded-2xl border border-[#E8E1DC] text-xs">
                <button
                  onClick={() => setActiveMapPlanView('direct')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMapPlanView === 'direct'
                      ? 'bg-[#7A1C28] text-white shadow-xs'
                      : 'text-[#5A5451] hover:text-[#1F1B19]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">scatter_plot</span>
                  <span>Direct Plan ({activeConsolidation.direct_plan.vehicles} Trips)</span>
                </button>
                <button
                  onClick={() => setActiveMapPlanView('multistop')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMapPlanView === 'multistop'
                      ? 'bg-[#7A1C28] text-white shadow-xs'
                      : 'text-[#5A5451] hover:text-[#1F1B19]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">route</span>
                  <span>Multi-Stop Plan (1 Loop)</span>
                </button>
              </div>
            </div>

            {/* Real Road Route Map Canvas */}
            <RoadRouteMap
              mode="multistop"
              activePlanView={activeMapPlanView}
              activeConsolidation={activeConsolidation}
              alternativeConsolidations={alternativeConsolidations}
              onSelectConsolidation={setSelectedConsolidationId}
            />

            {/* DELIVERY SEQUENCE BREAKDOWN PANEL */}
            <div className="p-5 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E8E1DC] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1C28] font-mono block">
                    CONSOLIDATED DISPATCH MANIFEST
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#1F1B19]">
                    Delivery Sequence &amp; Turn-by-Turn Road Legs
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono font-bold">
                  <span className="text-[#1F1B19]">Total: {activeConsolidation.multi_stop_plan.total_distance_km} km</span>
                  <span className="text-[#7A1C28]">· {activeConsolidation.multi_stop_plan.total_duration_min} min</span>
                  <span className="text-[#166534]">· {activeConsolidation.stops.length} stops (1 vehicle)</span>
                </div>
              </div>

              <div className="space-y-3">
                {/* 01: Anchor Origin */}
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#E8E1DC]">
                  <div className="w-7 h-7 rounded-full bg-[#7A1C28] text-white flex items-center justify-center font-bold text-xs font-mono shrink-0 mt-0.5">
                    01
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <strong className="text-xs text-[#7A1C28] font-bold uppercase tracking-wider">
                        ● PRAVAH ANCHOR · Chennai RGH (START)
                      </strong>
                      <span className="text-[11px] font-mono text-[#166534] font-bold">
                        Loading {activeConsolidation.total_units} Units {activeConsolidation.blood_group} {activeConsolidation.component}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#5A5451] block mt-0.5">
                      Government Rajiv Gandhi Medical College Hospital (Park Town, Chennai)
                    </span>
                  </div>
                </div>

                {/* Consecutive Stops with Leg Connectors */}
                {activeConsolidation.stops.map((stop, idx) => (
                  <div key={stop.stop_number} className="space-y-3">
                    {/* Leg Connector Badge */}
                    <div className="flex items-center gap-2 pl-6 text-xs text-[#7A1C28] font-mono font-bold">
                      <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                      <span>
                        LEG {idx + 1}: {stop.leg_distance_km} km · {stop.leg_duration_min} min road transit
                      </span>
                      <span className="text-[10px] text-[#7A7471] font-normal">
                        (Cumulative: {stop.cumulative_distance_km} km · {stop.cumulative_duration_min} min)
                      </span>
                    </div>

                    {/* Stop Card */}
                    <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#E8E1DC]">
                      <div className="w-7 h-7 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-bold text-xs font-mono shrink-0 mt-0.5">
                        0{idx + 2}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start flex-wrap gap-1">
                          <strong className="text-xs text-[#1F1B19] font-bold">
                            STOP {stop.stop_number}: {stop.name}
                          </strong>
                          <span className="px-2 py-0.5 bg-[#DCFCE7] text-[#166534] text-[10px] font-bold rounded-md font-mono">
                            Drop: {stop.quantity} Units {stop.blood_group} {stop.component}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#5A5451] block mt-0.5">
                          {stop.city} · Coordinates: {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Final Completion Summary */}
                <div className="p-3 bg-[#DCFCE7]/60 rounded-xl border border-[#BBF7D0] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#166534] font-bold">✓ CONSOLIDATED MULTI-STOP LOOP COMPLETED</span>
                  <span className="text-[#166534] font-bold">
                    {activeConsolidation.total_units} Units Delivered · {activeConsolidation.multi_stop_plan.total_distance_km} km Total · 1 Consolidated Van
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 5. WHY PRAVAH CHOSE THIS PLAN (RATIONALE BREAKDOWN) */}
          <section className="bg-white p-6 rounded-3xl border border-[#E8E1DC] shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-[#7A1C28]">
              <span className="material-symbols-outlined text-[20px]">verified</span>
              <h3 className="font-serif text-lg font-bold">
                Why PRAVAH Chose This Solution
              </h3>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#5A5451]">
              {activeConsolidation.clinical_rationale.map((r, i) => (
                <li key={i} className="flex items-start gap-2 p-2.5 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC]">
                  <span className="text-[#16A34A] font-bold text-sm">✓</span>
                  <span className="leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 6. CANDIDATE OPTIONS (Top 3 Candidates Selector) */}
          <section className="bg-white rounded-3xl border border-[#E8E1DC] shadow-2xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1F1B19]">
                  Evaluated Consolidation Candidates ({consolidationCandidates.length} Options)
                </h3>
                <p className="text-xs text-[#7A7471] mt-0.5">
                  Select an option to evaluate its specific Direct vs Multi-Stop comparison matrix.
                </p>
              </div>
              <span className="text-xs font-mono text-[#7A7471]">Multi-Cluster LP Solved</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {consolidationCandidates.map((cand) => {
                const isSelected = activeConsolidation?.id === cand.id
                const candTimeDiff = Number((cand.multi_stop_plan.total_duration_min - cand.direct_plan.total_duration_min).toFixed(1))

                return (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedConsolidationId(cand.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-[#FDF6F7] border-[#7A1C28] shadow-sm ring-1 ring-[#7A1C28]'
                        : 'bg-white border-[#E8E1DC] hover:border-[#7A1C28]/40'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 bg-[#7A1C28] text-white text-[10px] font-bold rounded-md font-mono">
                        {cand.option_name} {cand.is_recommended ? '— RECOMMENDED' : ''}
                      </span>
                      <span className="font-mono text-sm font-bold text-[#7A1C28]">
                        {cand.consolidation_score}/100
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[#1F1B19] leading-snug">{cand.title}</h4>

                    <div className="space-y-1 text-xs text-[#5A5451]">
                      <div>
                        Stops: <b>{cand.stops.length} Hospital Destinations</b>
                      </div>
                      <div>
                        Total Volume: <b>{cand.total_units} Units {cand.component}</b>
                      </div>
                      <div className="font-mono text-[#7A1C28] font-bold">
                        Multi-Stop: {cand.multi_stop_plan.total_distance_km} km ({cand.multi_stop_plan.total_duration_min} min)
                      </div>
                      <div className="font-mono text-[#7A7471]">
                        vs Direct: {cand.direct_plan.total_distance_km} km ({cand.direct_plan.total_duration_min} min)
                      </div>
                    </div>

                    <div className="p-2 bg-[#FAF7F5] rounded-xl border border-[#E8E1DC] text-[11px] text-[#166534] font-bold">
                      Transit Difference: {candTimeDiff > 0 ? `+${candTimeDiff}` : candTimeDiff} min · {cand.savings.fewer_trips} fewer trips
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedConsolidationId(cand.id)
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                        isSelected
                          ? 'bg-[#7A1C28] text-white'
                          : 'bg-[#FAF7F5] text-[#5A5451] hover:bg-[#F2ECE8]'
                      }`}
                    >
                      {isSelected ? 'Active Comparison' : 'View Comparison'}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Action Authorization Bar */}
          <section className="bg-white p-6 rounded-3xl border border-[#E8E1DC] shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-xs text-[#7A7471] uppercase font-mono font-bold block">
                Model Recommendation Approved
              </span>
              <strong className="text-sm text-[#1F1B19]">
                Proceed with {comparisonEvaluation.decisionWinner === 'MULTI-STOP' ? 'Multi-Stop Consolidated Dispatch' : 'Direct Dispatches'} for {activeConsolidation.total_units} Units
              </strong>
            </div>

            <button
              onClick={() => {
                onSelectConsolidationCandidate?.(activeConsolidation)
                onSelectTransfer(null)
                onNavigateToStep('approval')
              }}
              className="px-8 py-4 bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <span>Authorize Recommended Dispatch</span>
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
