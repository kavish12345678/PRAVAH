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

export interface RiskItem {
  id: number
  inventory_id: number
  bank_name?: string
  blood_group?: string
  component?: string
  quantity?: number
  expiry_date?: string
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

export interface AuditItem {
  id: number
  timestamp: string
  action: string
  user: string
  recommendation_id?: number
  source_bank: string
  destination_bank: string
  quantity?: number
  approval_status?: string
}

export interface IntelligenceStatus {
  engine: string
  mode: string
  version: string
  dataset_name?: string
  dataset_status?: string
  models?: Record<string, string>
  ready: boolean
}

export interface IntelligenceRunResult {
  status: string
  risk_predictions_created: number
  transfer_recommendations_created: number
  shortages_detected: number
  surplus_locations: number
}

export interface FeatureImportanceItem {
  feature: string
  importance_mean: number
  importance_std: number
}

export interface ModelMetricsResponse {
  metrics: {
    execution_timestamp?: string
    total_runtime_seconds?: number
    model_1_demand_forecasting?: {
      horizon_24h?: {
        model: string
        MAE: number
        RMSE: number
        R2: number
        MAPE_pct: number
      }
      horizon_72h?: {
        model: string
        MAE: number
        RMSE: number
        R2: number
        MAPE_pct: number
      }
    }
    model_2_expiry_risk?: {
      expiry_prob_MAE: number
      expiry_prob_RMSE: number
      Brier_Score: number
      Binary_ROC_AUC: number
      Binary_PR_AUC: number
      Binary_F1_Score: number
      Binary_Precision: number
      Binary_Recall: number
    }
    model_3_cold_chain_anomaly?: {
      ML_Anomaly_ROC_AUC: number
      Hybrid_Precision: number
      Hybrid_Recall: number
      Hybrid_F1: number
      Total_Excursions_Detected: number
      Ground_Truth_Excursions: number
    }
    optimization?: {
      greedy_routes_count: number
      lp_routes_count: number
      lp_total_units_redistributed: number
    }
  }
  feature_importance: FeatureImportanceItem[]
}

export interface ProvenanceResponse {
  sources?: {
    blood_bank_network?: string[]
    constraints?: string[]
    equipment?: string[]
    calibration?: string[]
  }
  description?: string
}

export type TransferStatusUpdate = 'PENDING' | 'APPROVED' | 'REJECTED'

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
