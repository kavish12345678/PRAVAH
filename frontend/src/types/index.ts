export interface DashboardSummary {
  blood_banks: number
  total_inventory: number
  critical_shortages?: number
  low_stock: number
  near_expiry: number
  equipment_warnings?: number
  high_risk: number
  active_transfers: number
  temperature_anomalies?: number
  last_updated?: string
}

export interface InventoryItem {
  id: number
  bank_id?: number
  bank_name: string
  blood_group: string
  component: string
  quantity: number
  collection_date: string
  expiry_date: string
  status: 'AVAILABLE' | 'LOW' | 'NEAR_EXPIRY' | 'SURPLUS' | string
}

export interface ForecastItem {
  id: number
  bank_id?: number
  bank_name: string
  city?: string
  latitude?: number
  longitude?: number
  distance_km?: number
  is_anchor?: boolean
  blood_group: string
  component: string
  forecast_date: string
  current_stock?: number
  predicted_demand: number
  forecast_24h?: number
  forecast_72h?: number
  projected_balance?: number
  projected_balance_24h?: number
  projected_balance_72h?: number
  balance_status?: 'DEFICIT' | 'BALANCED' | 'SURPLUS' | string
  balance_status_24h?: 'DEFICIT' | 'BALANCED' | 'SURPLUS' | string
  balance_status_72h?: 'DEFICIT' | 'BALANCED' | 'SURPLUS' | string
  confidence_lower?: number
  confidence_upper?: number
  historical_avg?: number
  model_version?: string
}

export interface RiskFeatures {
  age_hours?: number
  remaining_shelf_life_hours?: number
  current_stock?: number
  expiring_48h?: number
  demand_next_24h?: number
  demand_next_72h?: number
  stockout_risk_score?: number
  wastage_risk_score?: number
  max_temperature_exposure?: number
  cumulative_excursion_minutes?: number
  agitation_off_minutes?: number
  health_score?: number
  issue_probability?: number
}

export interface RiskBandInfo {
  code: string
  label: string
  range: string
  count: number
  percentage: number
  description: string
}

export interface RiskDistribution {
  critical: number
  high: number
  moderate: number
  low_medium: number
  low: number
  total_scored: number
}

export interface RiskSummary {
  total_units_analyzed?: number
  active_units_monitored?: number
  distribution?: RiskDistribution
  mean_risk_score?: number
  critical_wastage_count?: number
  model_name?: string
  features_analyzed?: number
  bands?: {
    CRITICAL: RiskBandInfo
    HIGH: RiskBandInfo
    MODERATE: RiskBandInfo
    LOW_MEDIUM: RiskBandInfo
    LOW: RiskBandInfo
  }
}

export interface FeatureImportanceItem {
  feature: string
  importance?: number
  importance_mean?: number
  importance_std?: number
  description?: string
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
  source_bank_id?: number
  destination_bank_id?: number
  source_bank: string
  source_city?: string
  source_lat?: number
  source_lon?: number
  destination_bank: string
  destination_city?: string
  destination_lat?: number
  destination_lon?: number
  component: string
  blood_group: string
  quantity: number
  route: string | null
  vehicle: string | null
  distance_km?: number
  travel_time_min?: number
  is_connected_to_anchor?: boolean
  route_score?: number
  urgency_level?: 'CRITICAL' | 'HIGH' | 'MODERATE' | string
  recommendation_reason?: string
  clinical_impact?: string
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
  optimization_engine?: string
  optimizer_status?: string
  cache_status?: string
  engine?: string
  mode?: string
  version?: string
  ready?: boolean
  status?: 'IDLE' | 'TRAINING' | 'INFERENCE' | 'ERROR'
}

export interface IntelligenceRunResult {
  status?: string
  success?: boolean
  message?: string
  run_id?: string
  duration_ms?: number
  demand_forecasts_created?: number
  risk_predictions_created?: number
  transfer_recommendations_created?: number
  demand_forecasts_updated?: number
  risk_predictions_updated?: number
  transfers_recommended?: number
  anomalies_detected?: number
  timestamp?: string
  run_timestamp?: string
}

export interface ModelMetricsData {
  demand_forecasting?: {
    model_name?: string
    model_family?: string
    r2_score: number
    mae: number
    rmse: number
    wape?: number
    lead_time_coverage?: string
    features_count?: number
    training_samples?: number
  }
  expiry_risk?: {
    model_name?: string
    model_family?: string
    auc_roc: number
    brier_score?: number
    precision_at_k?: number
    precision?: number
    recall?: number
    f1_score?: number
    distribution?: {
      critical_pct: number
      high_pct: number
      moderate_pct: number
      low_medium_pct: number
      low_pct: number
    }
  }
  cold_chain_anomaly?: {
    model_name?: string
    model_family?: string
    contamination_rate: number
    detection_latency?: string
    false_alarm_rate?: number
    precision?: number
    recall?: number
    anomalies_detected?: number
  }
  highs_optimization?: {
    solver: string
    objective?: string
    avg_solve_time?: string
    optimality_gap?: string
    constraints_active?: string[]
  }
  optimization?: {
    solver: string
    average_solve_time_ms: number
    wastage_reduction_pct: number
    stockout_reduction_pct: number
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

export type TransferStatusUpdate = 'APPROVED' | 'REJECTED' | 'DISPATCHED' | 'COMPLETED'

export type PravahMode = 'national' | 'centre'

export interface CentreProfile {
  id: number
  code: string
  name: string
  city: string
  latitude: number
  longitude: number
  capacity: number
  status?: string
  operational_radius_km: number
  role?: string
}

export interface CentreSummary {
  centre_id: number
  centre_name: string
  centre_city: string
  operational_radius_km: number
  facilities_in_network: number
  total_inventory: number
  low_stock_batches: number
  near_expiry_units: number
  high_risk_units: number
  potential_transfers: number
  local_inventory?: {
    total_units: number
    batches_count: number
    low_stock: number
    near_expiry: number
    critical_risk: number
  }
}

export interface CentreColdChainData {
  centre_id: number
  centre_name: string
  current_temperature: number
  min_temperature: number
  max_temperature: number
  mean_temperature: number
  agitation_status: string
  agitation_rpm: number
  agitation_off_minutes: number
  excursions_count: number
  cumulative_excursion_minutes: number
  equipment: {
    id: string
    type: string
    health_score: number
    status: string
  }
  anomaly_score: number
  anomaly_status: string
  clinical_explanation: string
  model_version: string
  telemetry_recent?: {
    timestamp: string
    temperature: number
    agitation: boolean
  }[]
}

export interface CentreHealthData {
  centre_id: number
  centre_name: string
  inventory: 'NORMAL' | 'LOW' | 'CRITICAL' | string
  demand: 'BALANCED' | 'PRESSURE' | 'SHORTAGE' | string
  expiry: 'NORMAL' | 'WATCH' | 'CRITICAL' | string
  cold_chain: 'SAFE' | 'ATTENTION' | 'CRITICAL' | string
  overall_operational_state: 'STABLE' | 'ATTENTION' | 'ACTION REQUIRED' | string
  decision_summary: string
}

export interface CentreNetworkFacility {
  id: number
  name: string
  city: string
  latitude: number
  longitude: number
  distance_km: number
  is_anchor: boolean
  capacity: number
  total_inventory_units: number
  critical_risk_units: number
  network_state: 'HEALTHY' | 'MODERATE' | 'CRITICAL'
}

export interface CentrePressureFacility {
  bank_id: number
  bank_name: string
  city: string
  distance_from_anchor_km: number
  component: string
  blood_group: string
  current_stock: number
  demand: number
  surplus_units?: number
  deficit_units?: number
  is_anchor?: boolean
}

export interface CentrePressureData {
  anchor_centre: string
  operational_radius_km: number
  surplus_count: number
  deficit_count: number
  surplus_facilities: CentrePressureFacility[]
  deficit_facilities: CentrePressureFacility[]
}
