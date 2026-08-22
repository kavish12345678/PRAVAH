import type {
  AuditItem,
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

const API_BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const urlsToTry = API_BASE
    ? [`${API_BASE}${path}`, path, `http://127.0.0.1:8000${path}`]
    : [path, `http://127.0.0.1:8000${path}`, `http://localhost:8000${path}`]

  let lastError: Error | null = null

  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          Accept: 'application/json',
          ...init?.headers,
        },
        signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined,
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          return (await response.json()) as T
        }
        // If non-JSON returned, throw error so next fallback URL can be attempted
        throw new Error(`Expected JSON but received ${contentType || 'text'}`)
      } else {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastError || new Error('PRAVAH backend service unavailable.')
}

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>('/api/dashboard/summary')
}

export function fetchInventory(params?: {
  blood_group?: string
  component?: string
  bank_id?: number
  status?: string
  limit?: number
}): Promise<InventoryItem[]> {
  const search = new URLSearchParams()
  if (params?.blood_group && params.blood_group !== 'All') {
    search.set('blood_group', params.blood_group)
  }
  if (params?.component && params.component !== 'All') {
    search.set('component', params.component)
  }
  if (params?.status && params.status !== 'All') {
    search.set('status', params.status)
  }
  if (params?.bank_id != null) {
    search.set('bank_id', String(params.bank_id))
  }
  if (params?.limit != null) {
    search.set('limit', String(params.limit))
  }
  const query = search.toString()

  return request<InventoryItem[]>(`/api/inventory${query ? `?${query}` : ''}`)
}

export function fetchForecasts(params?: {
  bank_id?: number
  component?: string
  blood_group?: string
  limit?: number
}): Promise<ForecastItem[]> {
  const search = new URLSearchParams()
  if (params?.bank_id != null) search.set('bank_id', String(params.bank_id))
  if (params?.component && params.component !== 'All') search.set('component', params.component)
  if (params?.blood_group && params.blood_group !== 'All') search.set('blood_group', params.blood_group)
  if (params?.limit != null) search.set('limit', String(params.limit))
  const query = search.toString()

  return request<ForecastItem[]>(`/api/forecast${query ? `?${query}` : ''}`)
}

export function fetchRiskSummary(): Promise<RiskSummary> {
  return request<RiskSummary>('/api/risk/summary')
}

export function fetchRisk(params?: {
  level?: string
  bank_id?: number
  limit?: number
}): Promise<RiskItem[]> {
  const search = new URLSearchParams()
  if (params?.level && params.level !== 'All') search.set('level', params.level)
  if (params?.bank_id != null) search.set('bank_id', String(params.bank_id))
  if (params?.limit != null) search.set('limit', String(params.limit))
  const query = search.toString()

  return request<RiskItem[]>(`/api/risk${query ? `?${query}` : ''}`)
}

export function fetchRiskDetail(batchId: number): Promise<RiskItem> {
  return request<RiskItem>(`/api/risk/${batchId}`)
}

export function fetchTransfers(params?: {
  limit?: number
}): Promise<TransferItem[]> {
  const search = new URLSearchParams()
  if (params?.limit != null) search.set('limit', String(params.limit))
  const query = search.toString()

  return request<TransferItem[]>(`/api/transfers${query ? `?${query}` : ''}`)
}

export function fetchAuditLogs(params?: {
  limit?: number
}): Promise<AuditItem[]> {
  const search = new URLSearchParams()
  if (params?.limit != null) search.set('limit', String(params.limit))
  const query = search.toString()

  return request<AuditItem[]>(`/api/transfers/audit${query ? `?${query}` : ''}`)
}

export function fetchIntelligenceStatus(): Promise<IntelligenceStatus> {
  return request<IntelligenceStatus>('/api/intelligence/status')
}

export function fetchModelMetrics(): Promise<ModelMetricsResponse> {
  return request<ModelMetricsResponse>('/api/intelligence/metrics')
}

export function fetchProvenance(): Promise<ProvenanceResponse> {
  return request<ProvenanceResponse>('/api/intelligence/provenance')
}

export function runIntelligence(): Promise<IntelligenceRunResult> {
  return request<IntelligenceRunResult>('/api/intelligence/run', {
    method: 'POST',
  })
}

export function updateTransferStatus(
  id: number,
  status: TransferStatusUpdate,
): Promise<TransferItem> {
  return request<TransferItem>(`/api/transfers/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
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

// ==========================================
// CENTRE WORKSPACE ENDPOINTS (200 KM RADIUS)
// ==========================================

export function loginCentre(centre_id: string, password: string): Promise<{
  status: string
  token: string
  centre: CentreProfile
}> {
  return request('/api/centre/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ centre_id, password }),
  })
}

export function fetchCentreProfile(centreId: number = 282724): Promise<CentreProfile> {
  return request<CentreProfile>(`/api/centre/profile?centre_id=${centreId}`)
}

export function fetchCentreSummary(centreId: number = 282724, radiusKm: number = 200): Promise<CentreSummary> {
  return request<CentreSummary>(`/api/centre/summary?centre_id=${centreId}&radius_km=${radiusKm}`)
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
  limit?: number
}): Promise<(InventoryItem & { distance_km: number; city: string; is_anchor: boolean })[]> {
  const search = new URLSearchParams()
  search.set('centre_id', String(params?.centre_id ?? 282724))
  search.set('radius_km', String(params?.radius_km ?? 200))
  if (params?.blood_group && params.blood_group !== 'All') search.set('blood_group', params.blood_group)
  if (params?.component && params.component !== 'All') search.set('component', params.component)
  if (params?.status && params.status !== 'All') search.set('status', params.status)
  if (params?.limit) search.set('limit', String(params.limit))
  return request(`/api/centre/inventory?${search.toString()}`)
}

export function fetchCentreForecast(centreId: number = 282724, radiusKm: number = 200): Promise<(ForecastItem & { distance_km: number; current_stock: number; balance_status: string; is_anchor: boolean })[]> {
  return request(`/api/centre/forecast?centre_id=${centreId}&radius_km=${radiusKm}`)
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

export function fetchCentreTransfers(centreId: number = 282724, radiusKm: number = 200): Promise<(TransferItem & { distance_km: number; is_connected_to_anchor: boolean })[]> {
  return request(`/api/centre/transfers?centre_id=${centreId}&radius_km=${radiusKm}`)
}

export function updateCentreTransferStatus(
  id: number,
  status: TransferStatusUpdate,
): Promise<{ id: number; status: string; source_bank: string; destination_bank: string }> {
  return request(`/api/centre/transfers/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

export function fetchCentreAudit(centreId: number = 282724): Promise<AuditItem[]> {
  return request<AuditItem[]>(`/api/centre/audit?centre_id=${centreId}`)
}
