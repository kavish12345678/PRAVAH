export interface DashboardSummary {
  blood_banks: number
  total_inventory: number
  low_stock: number
  near_expiry: number
  equipment_warnings: number
  high_risk: number
  active_transfers: number
}

export interface InventoryItem {
  id: number
  bank_name: string
  component: string
  blood_group: string
  quantity: number
  collection_date: string
  expiry_date: string
  status: string
}

export interface ForecastItem {
  id: number
  bank_name: string
  component: string
  blood_group: string
  forecast_date: string
  predicted_demand: number
  model_version: string
}

export interface RiskItem {
  id: number
  inventory_id: number
  risk_score: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | string
  contributing_features: string
  model_version: string
  created_at?: string
}

export interface TransferItem {
  id: number
  source_bank: string
  destination_bank: string
  component: string
  blood_group: string
  quantity: number
  route: string | null
  vehicle: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string
  created_at?: string
}

export interface IntelligenceStatus {
  engine: string
  mode: string
  version: string
  ready: boolean
}

export interface IntelligenceRunResult {
  status: string
  risk_predictions_created: number
  transfer_recommendations_created: number
  shortages_detected: number
  surplus_locations: number
}

export type TransferStatusUpdate = 'PENDING' | 'APPROVED' | 'REJECTED'

export type ViewId = 'overview' | 'inventory' | 'risk' | 'forecast' | 'transfers'
