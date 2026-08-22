import { useCallback, useEffect, useState } from 'react'

import type {
  AuditItem,
  DashboardSummary,
  ForecastItem,
  IntelligenceStatus,
  InventoryItem,
  ModelMetricsResponse,
  ProvenanceResponse,
  RiskItem,
  RiskSummary,
  TransferItem,
  TransferStatusUpdate,
} from '../types'
import * as api from '../services/api'

export interface PravahData {
  summary: DashboardSummary | null
  inventory: InventoryItem[]
  forecasts: ForecastItem[]
  risks: RiskItem[]
  riskSummary: RiskSummary | null
  transfers: TransferItem[]
  auditLogs: AuditItem[]
  intelligence: IntelligenceStatus | null
  metrics: ModelMetricsResponse | null
  provenance: ProvenanceResponse | null
}

const SCAN_STEPS = [
  'SCANNING INVENTORY',
  'ANALYZING DEMAND',
  'CHECKING EXPIRY',
  'ANALYZING COLD CHAIN',
  'MATCHING SURPLUS',
  'GENERATING TRANSFERS',
] as const

export function usePravahData() {
  const [data, setData] = useState<PravahData>({
    summary: null,
    inventory: [],
    forecasts: [],
    risks: [],
    riskSummary: null,
    transfers: [],
    auditLogs: [],
    intelligence: null,
    metrics: null,
    provenance: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanStep, setScanStep] = useState(0)
  const [lastRunMessage, setLastRunMessage] = useState<string | null>(null)
  const [lastSynced, setLastSynced] = useState<string>(() => new Date().toLocaleTimeString())

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const [
        summary,
        inventory,
        forecasts,
        risks,
        riskSummary,
        transfers,
        auditLogs,
        intelligence,
        metrics,
        provenance,
      ] = await Promise.all([
        api.fetchDashboardSummary(),
        api.fetchInventory(),
        api.fetchForecasts(),
        api.fetchRisk(),
        api.fetchRiskSummary(),
        api.fetchTransfers(),
        api.fetchAuditLogs(),
        api.fetchIntelligenceStatus(),
        api.fetchModelMetrics(),
        api.fetchProvenance(),
      ])

      setData({
        summary,
        inventory,
        forecasts,
        risks,
        riskSummary,
        transfers,
        auditLogs,
        intelligence,
        metrics,
        provenance,
      })
      setLastSynced(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const runIntelligence = useCallback(async () => {
    setScanning(true)
    setScanStep(0)
    setLastRunMessage(null)

    for (let i = 0; i < SCAN_STEPS.length; i++) {
      setScanStep(i)
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    try {
      const result = await api.runIntelligence()
      await refresh()
      setLastRunMessage(
        `Pipeline complete — ${result.risk_predictions_created} risks, ${result.transfer_recommendations_created} transfers`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Intelligence run failed')
    } finally {
      setScanning(false)
    }
  }, [refresh])

  const updateTransferStatus = useCallback(
    async (id: number, status: TransferStatusUpdate) => {
      await api.updateTransferStatus(id, status)
      await refresh()
    },
    [refresh],
  )

  const loadInventory = useCallback(
    async (filters: { blood_group?: string; component?: string; bank_id?: number }) => {
      const inventory = await api.fetchInventory(filters)
      setData((prev) => ({ ...prev, inventory }))
    },
    [],
  )

  return {
    data,
    loading,
    error,
    scanning,
    scanStep,
    scanSteps: SCAN_STEPS,
    lastRunMessage,
    lastSynced,
    refresh,
    runIntelligence,
    updateTransferStatus,
    loadInventory,
  }
}
