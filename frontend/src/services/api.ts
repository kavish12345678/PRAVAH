import type {
  AuditItem,
  CentreColdChainData,
  CentreHealthData,
  CentreNetworkFacility,
  CentrePressureData,
  CentreProfile,
  CentreSummary,
  DashboardSummary,
  ForecastItem,
  IntelligenceRunResult,
  IntelligenceStatus,
  InventoryItem,
  ModelMetricsResponse,
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

export interface RoadRouteResponse {
  status: string
  provider: string
  source: { latitude: number; longitude: number }
  destination: { latitude: number; longitude: number }
  distance_km: number
  duration_minutes: number
  geometry: {
    type: string
    coordinates: [number, number][]
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

export function fetchRoadRoute(
  sourceLat: number,
  sourceLng: number,
  destLat: number,
  destLng: number,
  alternatives: boolean = true,
): Promise<RoadRouteResponse> {
  return request<RoadRouteResponse>(
    `/api/routes/road?source_lat=${sourceLat}&source_lng=${sourceLng}&destination_lat=${destLat}&destination_lng=${destLng}&alternatives=${alternatives}`,
  )
}

