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
  bank_id?: number
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
  bank_id?: number
  bank_name: string
  component: string
  blood_group: string
  forecast_date: string
  predicted_demand: number
  model_version: string
}

export interface RiskBandInfo {
  code: string
  label: string
  range: string
  count: number
  percentage: number
  description: string
}

export interface RiskSummary {
  total_units_analyzed: number
  active_units_monitored: number
  bands: {
    CRITICAL: RiskBandInfo
    HIGH: RiskBandInfo
    MODERATE: RiskBandInfo
    LOW_MEDIUM: RiskBandInfo
    LOW: RiskBandInfo
  }
}

export interface RiskFeatures {
  age_hours: number
  remaining_shelf_life_hours: number
  current_stock: number
  expiring_48h: number
  demand_next_24h: number
  demand_next_72h: number
  stockout_risk_score: number
  wastage_risk_score: number
  max_temperature_exposure: number
  cumulative_excursion_minutes: number
  agitation_off_minutes: number
  health_score: number
  issue_probability: number
}

export interface RiskItem {
  id: number
  inventory_id: number
  unit_id?: string
  bank_name?: string
  bank_id?: number
  blood_group?: string
  component?: string
  quantity?: number
  expiry_date?: string
  risk_score: number
  risk_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW_MEDIUM' | 'LOW' | string
  features?: RiskFeatures
  contributing_features?: string[] | string
  explanation?: string
  recommended_action?: string
  model_version?: string
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

export interface AuditItem {
  id: number
  timestamp: string
  action: string
  user: string
  recommendation_id?: number
  source_bank: string
  destination_bank: string
  quantity?: number
  status?: string
  approval_status?: string
}

export interface ColdChainItem {
  id: number
  bank_name: string
  timestamp: string
  temperature: number
  agitation_status: boolean
}

export interface OptimizationResult {
  run_id: string
  timestamp: string
  recommendations_count: number
  total_units_optimized: number
  routes_generated: number
  feasibility_score: number
  status: 'OPTIMAL' | 'INFEASIBLE' | 'ERROR'
}

export interface IntelligenceStatus {
  last_run_timestamp?: string | null
  active_models?: number
  demand_forecast_model?: string
  expiry_risk_model?: string
  cold_chain_anomaly_model?: string
  optimizer_status?: string
  cache_status?: string
  engine?: string
  mode?: string
  version?: string
  ready?: boolean
}

export interface IntelligenceRunResult {
  success: boolean
  message: string
  run_id: string
  duration_ms: number
  demand_forecasts_created: number
  risk_predictions_created: number
  transfer_recommendations_created: number
  timestamp: string
}

export interface FeatureImportanceItem {
  feature: string
  importance?: number
  importance_mean?: number
  importance_std?: number
  description?: string
}

export interface ModelMetricsData {
  demand_forecasting?: {
    model_family: string
    r2_score: number
    mae: number
    rmse: number
    wape: number
    lead_time_coverage: string
  }
  unit_expiry_risk?: {
    model_family: string
    auc_roc: number
    brier_score: number
    precision_at_k: number
    f1_score: number
  }
  cold_chain_anomaly?: {
    model_family: string
    contamination_rate: number
    detection_latency: string
    false_alarm_rate: number
  }
  highs_optimization?: {
    solver: string
    objective: string
    avg_solve_time: string
    optimality_gap: string
    constraints_active: string[]
  }
  metrics?: any
}

export type ModelMetricsResponse = ModelMetricsData

export interface ProvenanceData {
  dataset_name?: string
  generated_timestamp?: string
  total_records?: number
  components_covered?: string[]
  regional_facilities_count?: number
  data_sources?: {
    name: string
    records: number
    description: string
  }[]
  feature_engineering_pipeline?: {
    step: string
    features_produced: number
  }[]
  sources?: any
}

export type ProvenanceResponse = ProvenanceData

export interface PravahDataset {
  summary: DashboardSummary | null
  inventory: InventoryItem[]
  forecasts: ForecastItem[]
  risks: RiskItem[]
  riskSummary: RiskSummary | null
  transfers: TransferItem[]
  auditLogs: AuditItem[]
  metrics: ModelMetricsData | null
  provenance: ProvenanceData | null
}

export type PravahStep =
  | 'welcome'
  | 'overview'
  | 'inventory'
  | 'forecast'
  | 'risk'
  | 'cold-chain'
  | 'pressure'
  | 'optimize'
  | 'transfers'
  | 'approval'
  | 'audit'
  | 'models'

export type TransferStatusUpdate = 'APPROVED' | 'REJECTED'
