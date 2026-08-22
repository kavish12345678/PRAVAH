import type {
  AuditItem,
  CentreColdChainData,
  CentreConsolidationData,
  CentreHealthData,
  CentreNetworkFacility,
  CentrePressureData,
  CentreProfile,
  CentreSummary,
  DashboardSummary,
  DonorBroadcastPayload,
  DonorBroadcastResponse,
  DonorMobilisationConfig,
  ForecastItem,
  IntelligenceRunResult,
  IntelligenceStatus,
  InventoryItem,
  ModelMetricsResponse,
  NationalColdChainResponse,
  NationalFacilitiesResponse,
  NationalSummary,
  ProvenanceResponse,
  RiskItem,
  RiskSummary,
  TransferItem,
  TransferStatusUpdate,
} from '../types'

const getApiBase = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8000'
    }
  }
  return import.meta.env.VITE_API_BASE_URL || ''
}

const PRIMARY_API_BASE = getApiBase()
const FALLBACK_API_BASE = 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const tryFetch = async (baseUrl: string) => {
    const res = await fetch(`${baseUrl}${path}`, options)
    if (!res.ok) {
      const errorBody = await res.text()
      let errorDetail = `HTTP ${res.status}: ${res.statusText}`
      try {
        const parsed = JSON.parse(errorBody)
        if (parsed.detail) {
          errorDetail = parsed.detail
        }
      } catch {
        // not json
      }
      throw new Error(errorDetail)
    }
    return res.json() as Promise<T>
  }

  try {
    return await tryFetch(PRIMARY_API_BASE)
  } catch (primaryErr) {
    if (PRIMARY_API_BASE !== FALLBACK_API_BASE) {
      try {
        return await tryFetch(FALLBACK_API_BASE)
      } catch {
        // rethrow primary error if both fail
      }
    }
    throw primaryErr
  }
}

// ----------------------------------------------------
// NATIONAL DASHBOARD APIs
// ----------------------------------------------------

export function fetchSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>('/api/dashboard/summary')
}
export const fetchDashboardSummary = fetchSummary

export function fetchNationalSummary(): Promise<NationalSummary> {
  return request<NationalSummary>('/api/national/summary')
}

export function fetchNationalFacilities(params?: {
  search?: string
  region?: string
  state?: string
  status?: string
  page?: number
  page_size?: number
}): Promise<NationalFacilitiesResponse> {
  const search = new URLSearchParams()
  if (params?.search) search.set('search', params.search)
  if (params?.region) search.set('region', params.region)
  if (params?.state) search.set('state', params.state)
  if (params?.status) search.set('status', params.status)
  if (params?.page) search.set('page', String(params.page))
  if (params?.page_size) search.set('page_size', String(params.page_size))
  const qs = search.toString()
  return request<NationalFacilitiesResponse>(`/api/national/facilities${qs ? `?${qs}` : ''}`)
}

export function fetchNationalColdChain(params?: {
  search?: string
  filter_type?: string
  page?: number
  page_size?: number
}): Promise<NationalColdChainResponse> {
  const search = new URLSearchParams()
  if (params?.search) search.set('search', params.search)
  if (params?.filter_type) search.set('filter_type', params.filter_type)
  if (params?.page) search.set('page', String(params.page))
  if (params?.page_size) search.set('page_size', String(params.page_size))
  const qs = search.toString()
  return request<NationalColdChainResponse>(`/api/national/cold-chain${qs ? `?${qs}` : ''}`)
}

export function fetchInventory(params?: {
  bank_name?: string
  blood_group?: string
  component?: string
  status?: string
}): Promise<InventoryItem[]> {
  const search = new URLSearchParams()
  if (params?.bank_name) search.set('bank_name', params.bank_name)
  if (params?.blood_group) search.set('blood_group', params.blood_group)
  if (params?.component) search.set('component', params.component)
  if (params?.status) search.set('status', params.status)
  const qs = search.toString()
  return request<InventoryItem[]>(`/api/inventory${qs ? `?${qs}` : ''}`)
}

export function fetchForecast(params?: {
  bank_name?: string
  component?: string
  horizon?: string
  limit?: number
}): Promise<ForecastItem[]> {
  const search = new URLSearchParams()
  if (params?.bank_name) search.set('bank_name', params.bank_name)
  if (params?.component) search.set('component', params.component)
  if (params?.horizon) search.set('horizon', params.horizon)
  if (params?.limit) search.set('limit', String(params.limit))
  const qs = search.toString()
  return request<ForecastItem[]>(`/api/forecast${qs ? `?${qs}` : ''}`)
}
export const fetchForecasts = fetchForecast

export function fetchRisk(params?: {
  bank_name?: string
  level?: string
  limit?: number
}): Promise<RiskItem[]> {
  const search = new URLSearchParams()
  if (params?.bank_name) search.set('bank_name', params.bank_name)
  if (params?.level) search.set('level', params.level)
  if (params?.limit) search.set('limit', String(params.limit))
  const qs = search.toString()
  return request<RiskItem[]>(`/api/risk${qs ? `?${qs}` : ''}`)
}
export const fetchRisks = fetchRisk

export function fetchRiskDetail(batchId: string | number): Promise<RiskItem> {
  return request<RiskItem>(`/api/risk/${batchId}`)
}

export function fetchTransfers(params?: {
  status?: string
  limit?: number
}): Promise<TransferItem[]> {
  const search = new URLSearchParams()
  if (params?.status) search.set('status', params.status)
  if (params?.limit != null) search.set('limit', String(params.limit))
  const qs = search.toString()
  return request<TransferItem[]>(`/api/transfers${qs ? `?${qs}` : ''}`)
}

export function fetchAuditLogs(params?: { limit?: number } | number): Promise<AuditItem[]> {
  const lim = typeof params === 'number' ? params : (params?.limit ?? 50)
  return request<AuditItem[]>(`/api/transfers/audit?limit=${lim}`)
}

export function runOptimization(): Promise<{
  solver_type: string
  transfers_generated: number
  total_units: number
  cost_reduction_percent: number
  message: string
}> {
  return request('/api/transfers/optimize', { method: 'POST' })
}

export function updateTransferStatus(id: number, status: TransferStatusUpdate): Promise<TransferItem> {
  return request<TransferItem>(`/api/transfers/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

export function fetchIntelligenceStatus(): Promise<IntelligenceStatus> {
  return request<IntelligenceStatus>('/api/intelligence/status')
}

export function runIntelligenceEngine(): Promise<IntelligenceRunResult> {
  return request<IntelligenceRunResult>('/api/intelligence/run', { method: 'POST' })
}
export const runIntelligence = runIntelligenceEngine

export function fetchRiskSummary(): Promise<RiskSummary> {
  return request<RiskSummary>('/api/intelligence/risk-summary')
}

export function fetchModelProvenance(): Promise<ProvenanceResponse> {
  return request<ProvenanceResponse>('/api/intelligence/provenance')
}
export const fetchProvenance = fetchModelProvenance

export function fetchModelMetrics(): Promise<ModelMetricsResponse> {
  return request<ModelMetricsResponse>('/api/ml/metrics')
}

export function fetchHealth(): Promise<{
  status: string
  database: string
  dataset: string
  blood_bank_records: number
  inventory_records: number
  demand_forecast_records: number
  risk_prediction_records: number
  transfer_recommendation_records: number
}> {
  return request('/api/health')
}

export function fetchDataStatus(): Promise<{
  status: string
  data_directory: string
  files: Record<string, { available: boolean; records: number; path?: string }>
}> {
  return request('/api/data-status')
}

// ----------------------------------------------------
// CENTRE-SPECIFIC OPERATIONAL WORKSPACE API (200km radius)
// ----------------------------------------------------

export function centreLogin(centreId: string = 'CHN-RGH-001', password: string = 'demo'): Promise<{
  status: string
  token: string
  centre: CentreProfile & { operational_radius_km: number; role: string }
}> {
  return request('/api/centre/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ centre_id: centreId, password }),
  })
}

export function fetchCentreProfile(centreId: number = 282724): Promise<CentreProfile> {
  return request<CentreProfile>(`/api/centre/profile?centre_id=${centreId}`)
}

export function fetchCentreSummary(centreId: number = 282724, radiusKm: number = 200): Promise<CentreSummary> {
  return request<CentreSummary>(`/api/centre/summary?centre_id=${centreId}&radius_km=${radiusKm}`)
}
export const fetchCentreOverview = fetchCentreSummary

export function fetchCentreColdChain(centreId: number = 282724): Promise<CentreColdChainData> {
  return request<CentreColdChainData>(`/api/centre/cold-chain?centre_id=${centreId}`)
}

export function fetchCentreHealth(centreId: number = 282724): Promise<CentreHealthData> {
  return request<CentreHealthData>(`/api/centre/health?centre_id=${centreId}`)
}

export function fetchCentreNetwork(centreId: number = 282724, radiusKm: number = 200): Promise<CentreNetworkFacility[]> {
  return request<CentreNetworkFacility[]>(`/api/centre/network?centre_id=${centreId}&radius_km=${radiusKm}`)
}

export function fetchCentreInventory(params?: {
  centre_id?: number
  radius_km?: number
  blood_group?: string
  component?: string
  status?: string
  anchor_only?: boolean
  limit?: number
}): Promise<(InventoryItem & { distance_km: number; city: string; is_anchor: boolean })[]> {
  const search = new URLSearchParams()
  search.set('centre_id', String(params?.centre_id ?? 282724))
  search.set('radius_km', String(params?.radius_km ?? 200))
  if (params?.blood_group && params.blood_group !== 'All') search.set('blood_group', params.blood_group)
  if (params?.component && params.component !== 'All') search.set('component', params.component)
  if (params?.status && params.status !== 'All') search.set('status', params.status)
  if (params?.anchor_only) search.set('anchor_only', 'true')
  if (params?.limit) search.set('limit', String(params.limit))
  return request(`/api/centre/inventory?${search.toString()}`)
}

export function fetchCentreForecast(
  centreIdOrParams: number | {
    centre_id?: number
    radius_km?: number
    horizon?: string
    blood_group?: string
    component?: string
    status?: string
    limit?: number
  } = 282724,
  radiusKm: number = 200,
): Promise<ForecastItem[]> {
  const search = new URLSearchParams()
  if (typeof centreIdOrParams === 'object') {
    search.set('centre_id', String(centreIdOrParams.centre_id ?? 282724))
    search.set('radius_km', String(centreIdOrParams.radius_km ?? 200))
    if (centreIdOrParams.horizon) search.set('horizon', centreIdOrParams.horizon)
    if (centreIdOrParams.blood_group && centreIdOrParams.blood_group !== 'All') search.set('blood_group', centreIdOrParams.blood_group)
    if (centreIdOrParams.component && centreIdOrParams.component !== 'All') search.set('component', centreIdOrParams.component)
    if (centreIdOrParams.status && centreIdOrParams.status !== 'All') search.set('status', centreIdOrParams.status)
    if (centreIdOrParams.limit) search.set('limit', String(centreIdOrParams.limit))
  } else {
    search.set('centre_id', String(centreIdOrParams))
    search.set('radius_km', String(radiusKm))
    search.set('limit', '200')
  }
  return request<ForecastItem[]>(`/api/centre/forecast?${search.toString()}`)
}

export function fetchCentreRisk(params?: {
  centre_id?: number
  radius_km?: number
  level?: string
  limit?: number
}): Promise<(RiskItem & { distance_km: number; is_anchor: boolean })[]> {
  const search = new URLSearchParams()
  search.set('centre_id', String(params?.centre_id ?? 282724))
  search.set('radius_km', String(params?.radius_km ?? 200))
  if (params?.level && params.level !== 'ALL') search.set('level', params.level)
  if (params?.limit) search.set('limit', String(params.limit))
  return request(`/api/centre/risk?${search.toString()}`)
}

export function fetchCentrePressure(centreId: number = 282724, radiusKm: number = 200): Promise<CentrePressureData> {
  return request<CentrePressureData>(`/api/centre/pressure?centre_id=${centreId}&radius_km=${radiusKm}`)
}

export function fetchCentreTransfers(centreId: number = 282724, radiusKm: number = 200): Promise<(TransferItem & { distance_km: number; is_connected_to_anchor: boolean })[]> {
  return request(`/api/centre/transfers?centre_id=${centreId}&radius_km=${radiusKm}&limit=150`)
}

export function runCentreOptimization(centreId: number = 282724, radiusKm: number = 200): Promise<{
  status: string
  solver: string
  operational_radius_km: number
  transfers_generated: number
  total_units_optimized: number
}> {
  return request(`/api/centre/optimize?centre_id=${centreId}&radius_km=${radiusKm}`, {
    method: 'POST',
  })
}

export function updateCentreTransferStatus(transferId: number, status: TransferStatusUpdate): Promise<TransferItem> {
  return request<TransferItem>(`/api/centre/transfers/${transferId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

export function fetchCentreAudit(centreId: number = 282724, limit: number = 50): Promise<AuditItem[]> {
  return request<AuditItem[]>(`/api/centre/audit?centre_id=${centreId}&limit=${limit}`)
}

export function fetchCentreConsolidation(centreId: number = 282724): Promise<CentreConsolidationData> {
  return request<CentreConsolidationData>(`/api/centre/consolidation?centre_id=${centreId}`)
}

export interface RoadRouteResponse {
  status: string
  provider: string
  source: { latitude: number; longitude: number }
  destination: { latitude: number; longitude: number }
  distance_km: number
  duration_minutes: number
  geometry: {
    type: string
    coordinates: [number, number][] // [lon, lat]
  }
  alternatives?: {
    distance_km: number
    duration_minutes: number
    geometry: {
      type: string
      coordinates: [number, number][]
    }
  }[]
}

const _CLIENT_ROUTE_CACHE = new Map<string, RoadRouteResponse>()

export async function fetchRoadRoute(
  sourceLat: number,
  sourceLng: number,
  destLat: number,
  destLng: number,
  alternatives: boolean = true,
): Promise<RoadRouteResponse> {
  // 1. Validate coordinates
  if (
    typeof sourceLat !== 'number' ||
    typeof sourceLng !== 'number' ||
    typeof destLat !== 'number' ||
    typeof destLng !== 'number' ||
    isNaN(sourceLat) ||
    isNaN(sourceLng) ||
    isNaN(destLat) ||
    isNaN(destLng) ||
    sourceLat < -90 || sourceLat > 90 ||
    destLat < -90 || destLat > 90 ||
    sourceLng < -180 || sourceLng > 180 ||
    destLng < -180 || destLng > 180 ||
    (sourceLat === 0 && sourceLng === 0) ||
    (destLat === 0 && destLng === 0)
  ) {
    throw new Error('Invalid geographic coordinates for road routing')
  }

  const cacheKey = `${sourceLat.toFixed(5)},${sourceLng.toFixed(5)}->${destLat.toFixed(5)},${destLng.toFixed(5)}?alt=${alternatives}`
  if (_CLIENT_ROUTE_CACHE.has(cacheKey)) {
    return _CLIENT_ROUTE_CACHE.get(cacheKey)!
  }

  // 2. Primary: Real OSRM driving route service (OSRM expects: longitude,latitude)
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${sourceLng.toFixed(6)},${sourceLat.toFixed(6)};${destLng.toFixed(6)},${destLat.toFixed(6)}?overview=full&geometries=geojson&steps=true&alternatives=${alternatives ? 'true' : 'false'}`

  try {
    const osrmRes = await fetch(osrmUrl, { method: 'GET' })
    if (osrmRes.ok) {
      const osrmData = await osrmRes.json()
      if (osrmData.code === 'Ok' && Array.isArray(osrmData.routes) && osrmData.routes.length > 0) {
        const primary = osrmData.routes[0]
        const distKm = Number((Number(primary.distance) / 1000.0).toFixed(2))
        const durMin = Number((Number(primary.duration) / 60.0).toFixed(1))

        const alts: RoadRouteResponse['alternatives'] = []
        if (Array.isArray(osrmData.routes) && osrmData.routes.length > 1) {
          for (const altRoute of osrmData.routes.slice(1, 3)) {
            alts.push({
              distance_km: Number((Number(altRoute.distance) / 1000.0).toFixed(2)),
              duration_minutes: Number((Number(altRoute.duration) / 60.0).toFixed(1)),
              geometry: altRoute.geometry,
            })
          }
        }

        const result: RoadRouteResponse = {
          status: 'OK',
          provider: 'OSRM (OpenStreetMap Road Network)',
          source: { latitude: sourceLat, longitude: sourceLng },
          destination: { latitude: destLat, longitude: destLng },
          distance_km: distKm,
          duration_minutes: durMin,
          geometry: primary.geometry,
          alternatives: alts,
        }

        if (import.meta.env.DEV) {
          console.log('[PRAVAH Road Routing (OSRM)]', {
            source: { lat: sourceLat, lng: sourceLng },
            destination: { lat: destLat, lng: destLng },
            distance_km: distKm,
            duration_minutes: durMin,
            geometryPoints: primary.geometry?.coordinates?.length ?? 0,
            alternativesCount: alts.length,
          })
        }

        _CLIENT_ROUTE_CACHE.set(cacheKey, result)
        return result
      }
    }
  } catch (osrmErr) {
    if (import.meta.env.DEV) {
      console.warn('[PRAVAH Routing] Direct OSRM request failed, falling back to backend route proxy:', osrmErr)
    }
  }

  // 3. Fallback: Backend Road Routing Proxy
  const backendResult = await request<RoadRouteResponse>(
    `/api/routes/road?source_lat=${sourceLat}&source_lng=${sourceLng}&destination_lat=${destLat}&destination_lng=${destLng}&alternatives=${alternatives}`,
  )

  _CLIENT_ROUTE_CACHE.set(cacheKey, backendResult)
  return backendResult
}

// ----------------------------------------------------
// DONOR MOBILISATION APIs
// ----------------------------------------------------

export function fetchDonorMobilisationConfig(): Promise<DonorMobilisationConfig> {
  return request<DonorMobilisationConfig>('/api/centre/donor-mobilisation/config')
}

export function dispatchDonorBroadcast(payload: DonorBroadcastPayload): Promise<DonorBroadcastResponse> {
  return request<DonorBroadcastResponse>('/api/centre/donor-mobilisation/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

