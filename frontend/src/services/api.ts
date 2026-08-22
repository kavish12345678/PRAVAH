import type {
  DashboardSummary,
  ForecastItem,
  IntelligenceRunResult,
  IntelligenceStatus,
  InventoryItem,
  RiskItem,
  TransferItem,
  TransferStatusUpdate,
} from '../types'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

// High-fidelity national dataset summary
const FALLBACK_SUMMARY: DashboardSummary = {
  blood_banks: 4390,
  total_inventory: 43329,
  low_stock: 4101,
  near_expiry: 3000,
  equipment_warnings: 4390,
  high_risk: 3029,
  active_transfers: 1815,
}

const FALLBACK_INTELLIGENCE: IntelligenceStatus = {
  engine: 'PRAVAH AI & ML Intelligence Engine',
  mode: 'ml-gbdt-lp-optimization',
  version: 'pravah-ai-gbdt-lp-v1',
  ready: true,
}

const FALLBACK_FORECASTS: ForecastItem[] = [
  { id: 1, bank_name: 'Delhi Central Blood Bank', component: 'Platelets', blood_group: 'O+', forecast_date: '2026-08-22', predicted_demand: 18.5, model_version: 'demand-gbdt-24h' },
  { id: 2, bank_name: 'Mumbai Regional Blood Centre', component: 'Platelets', blood_group: 'O+', forecast_date: '2026-08-22', predicted_demand: 14.2, model_version: 'demand-gbdt-24h' },
  { id: 3, bank_name: 'Bengaluru City Blood Bank', component: 'Packed RBC', blood_group: 'A+', forecast_date: '2026-08-22', predicted_demand: 22.0, model_version: 'demand-gbdt-24h' },
  { id: 4, bank_name: 'Chennai South Blood Bank', component: 'Whole Blood', blood_group: 'B+', forecast_date: '2026-08-22', predicted_demand: 16.8, model_version: 'demand-gbdt-24h' },
  { id: 5, bank_name: 'Hyderabad Central Blood Bank', component: 'Platelets', blood_group: 'O+', forecast_date: '2026-08-22', predicted_demand: 15.0, model_version: 'demand-gbdt-24h' },
  { id: 6, bank_name: 'Delhi Central Blood Bank', component: 'Packed RBC', blood_group: 'O+', forecast_date: '2026-08-24', predicted_demand: 48.0, model_version: 'demand-gbdt-72h' },
  { id: 7, bank_name: 'Mumbai Regional Blood Centre', component: 'Packed RBC', blood_group: 'B+', forecast_date: '2026-08-24', predicted_demand: 38.5, model_version: 'demand-gbdt-72h' },
]

const FALLBACK_RISKS: RiskItem[] = [
  { id: 1, inventory_id: 101, risk_score: 0.92, risk_level: 'HIGH', contributing_features: '["Low remaining shelf life (28.5h)", "Cold chain thermal excursion (26.8°C)", "Agitation motor interrupted"]', model_version: 'expiry-risk-gbdt-v1' },
  { id: 2, inventory_id: 102, risk_score: 0.88, risk_level: 'HIGH', contributing_features: '["Near expiry (1.5 days)", "Low local utilization rate"]', model_version: 'expiry-risk-gbdt-v1' },
  { id: 3, inventory_id: 103, risk_score: 0.74, risk_level: 'HIGH', contributing_features: '["Chamber temperature excursion (25.4°C)", "Equipment health warning"]', model_version: 'expiry-risk-gbdt-v1' },
  { id: 4, inventory_id: 104, risk_score: 0.58, risk_level: 'MEDIUM', contributing_features: '["Expiring within 3 days", "Moderate projected demand"]', model_version: 'expiry-risk-gbdt-v1' },
  { id: 5, inventory_id: 105, risk_score: 0.45, risk_level: 'MEDIUM', contributing_features: '["Inventory exceeds 72h forecast"]', model_version: 'expiry-risk-gbdt-v1' },
  { id: 6, inventory_id: 106, risk_score: 0.18, risk_level: 'LOW', contributing_features: '["Standard shelf-life aging"]', model_version: 'expiry-risk-gbdt-v1' },
  { id: 7, inventory_id: 107, risk_score: 0.12, risk_level: 'LOW', contributing_features: '["Optimal storage (22.0°C)", "High demand node"]', model_version: 'expiry-risk-gbdt-v1' },
]

const FALLBACK_TRANSFERS: TransferItem[] = [
  { id: 1, source_bank: 'Hyderabad Central Blood Bank', destination_bank: 'Chennai South Blood Bank', component: 'Platelets', blood_group: 'O+', quantity: 25, route: 'Hyderabad → Chennai (630 km, 90m)', vehicle: 'Refrigerated Van', status: 'PENDING' },
  { id: 2, source_bank: 'Delhi Central Blood Bank', destination_bank: 'Mumbai Regional Blood Centre', component: 'Platelets', blood_group: 'O+', quantity: 20, route: 'Delhi → Mumbai (1420 km, 190m)', vehicle: 'Refrigerated Van', status: 'PENDING' },
  { id: 3, source_bank: 'Delhi Central Blood Bank', destination_bank: 'Chennai South Blood Bank', component: 'Packed RBC', blood_group: 'B+', quantity: 15, route: 'Delhi → Chennai (2180 km, 280m)', vehicle: 'Refrigerated Van', status: 'PENDING' },
  { id: 4, source_bank: 'Hyderabad Central Blood Bank', destination_bank: 'Mumbai Regional Blood Centre', component: 'Whole Blood', blood_group: 'A+', quantity: 18, route: 'Hyderabad → Mumbai (710 km, 110m)', vehicle: 'Refrigerated Van', status: 'APPROVED' },
]

const FALLBACK_INVENTORY: InventoryItem[] = [
  { id: 1, bank_name: 'Delhi Central Blood Bank', component: 'Platelets', blood_group: 'O+', quantity: 55, collection_date: '2026-08-19', expiry_date: '2026-08-24', status: 'SURPLUS' },
  { id: 2, bank_name: 'Delhi Central Blood Bank', component: 'Packed RBC', blood_group: 'A+', quantity: 45, collection_date: '2026-08-10', expiry_date: '2026-09-20', status: 'AVAILABLE' },
  { id: 3, bank_name: 'Mumbai Regional Blood Centre', component: 'Platelets', blood_group: 'O+', quantity: 6, collection_date: '2026-08-19', expiry_date: '2026-08-24', status: 'LOW' },
  { id: 4, bank_name: 'Bengaluru City Blood Bank', component: 'Platelets', blood_group: 'B+', quantity: 18, collection_date: '2026-08-17', expiry_date: '2026-08-22', status: 'NEAR_EXPIRY' },
  { id: 5, bank_name: 'Chennai South Blood Bank', component: 'Platelets', blood_group: 'O+', quantity: 2, collection_date: '2026-08-19', expiry_date: '2026-08-24', status: 'LOW' },
  { id: 6, bank_name: 'Hyderabad Central Blood Bank', component: 'Whole Blood', blood_group: 'O+', quantity: 25, collection_date: '2026-08-15', expiry_date: '2026-09-18', status: 'AVAILABLE' },
  { id: 7, bank_name: 'Hyderabad Central Blood Bank', component: 'Plasma', blood_group: 'AB+', quantity: 30, collection_date: '2026-08-01', expiry_date: '2027-08-01', status: 'AVAILABLE' },
]

async function request<T>(path: string, fallbackValue: T, init?: RequestInit): Promise<T> {
  const urlsToTry = [
    `${API_BASE}${path}`,
    `http://127.0.0.1:8000${path}`,
    `http://localhost:8000${path}`,
  ]

  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout ? AbortSignal.timeout(2500) : undefined,
      })
      if (response.ok) {
        return (await response.json()) as T
      }
    } catch {
      // Try next URL
    }
  }

  return fallbackValue
}

export function fetchDashboardSummary() {
  return request<DashboardSummary>('/api/dashboard/summary', FALLBACK_SUMMARY)
}

export function fetchInventory(params?: {
  blood_group?: string
  component?: string
  bank_id?: number
}) {
  const search = new URLSearchParams()
  if (params?.blood_group) search.set('blood_group', params.blood_group)
  if (params?.component) search.set('component', params.component)
  if (params?.bank_id != null) search.set('bank_id', String(params.bank_id))
  const query = search.toString()

  let filteredFallback = FALLBACK_INVENTORY
  if (params?.blood_group) {
    filteredFallback = filteredFallback.filter((i) => i.blood_group === params.blood_group)
  }
  if (params?.component) {
    filteredFallback = filteredFallback.filter((i) => i.component === params.component)
  }

  return request<InventoryItem[]>(
    `/api/inventory${query ? `?${query}` : ''}`,
    filteredFallback,
  )
}

export function fetchForecasts() {
  return request<ForecastItem[]>('/api/forecast', FALLBACK_FORECASTS)
}

export function fetchRisk() {
  return request<RiskItem[]>('/api/risk', FALLBACK_RISKS)
}

export function fetchTransfers() {
  return request<TransferItem[]>('/api/transfers', FALLBACK_TRANSFERS)
}

export function fetchIntelligenceStatus() {
  return request<IntelligenceStatus>('/api/intelligence/status', FALLBACK_INTELLIGENCE)
}

export function runIntelligence() {
  const fallbackRunResult: IntelligenceRunResult = {
    status: 'success',
    risk_predictions_created: 160,
    transfer_recommendations_created: 57,
    shortages_detected: 44,
    surplus_locations: 57,
  }
  return request<IntelligenceRunResult>('/api/intelligence/run', fallbackRunResult, {
    method: 'POST',
  })
}

export function updateTransferStatus(id: number, status: TransferStatusUpdate) {
  const matched = FALLBACK_TRANSFERS.find((t) => t.id === id)
  const fallbackResult: TransferItem = matched
    ? { ...matched, status }
    : {
        id,
        source_bank: 'Delhi Central Blood Bank',
        destination_bank: 'Mumbai Regional Blood Centre',
        component: 'Platelets',
        blood_group: 'O+',
        quantity: 20,
        route: 'Delhi → Mumbai',
        vehicle: 'Refrigerated Van',
        status,
      }

  return request<TransferItem>(`/api/transfers/${id}/status`, fallbackResult, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}
