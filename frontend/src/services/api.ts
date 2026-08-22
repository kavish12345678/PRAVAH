import type {
  AuditItem,
  DashboardSummary,
  ForecastItem,
  IntelligenceRunResult,
  IntelligenceStatus,
  InventoryItem,
  ModelMetricsResponse,
  ProvenanceResponse,
  RiskItem,
  TransferItem,
  TransferStatusUpdate,
} from '../types'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const urlsToTry = [
    `${API_BASE}${path}`,
    `http://127.0.0.1:8000${path}`,
    `http://localhost:8000${path}`,
  ]

  let lastError: Error | null = null

  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined,
      })
      if (response.ok) {
        return (await response.json()) as T
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

export function fetchRisk(params?: {
  level?: string
  limit?: number
}): Promise<RiskItem[]> {
  const search = new URLSearchParams()
  if (params?.level && params.level !== 'All') search.set('level', params.level)
  if (params?.limit != null) search.set('limit', String(params.limit))
  const query = search.toString()

  return request<RiskItem[]>(`/api/risk${query ? `?${query}` : ''}`)
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
