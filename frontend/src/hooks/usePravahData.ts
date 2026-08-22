import { useCallback, useEffect, useState } from 'react'

import type {
  DashboardSummary,
  ForecastItem,
  IntelligenceStatus,
  InventoryItem,
  RiskItem,
  TransferItem,
  TransferStatusUpdate,
} from '../types'
import * as api from '../services/api'

export interface PravahData {
  summary: DashboardSummary | null
  inventory: InventoryItem[]
  forecasts: ForecastItem[]
  risks: RiskItem[]
  transfers: TransferItem[]
  intelligence: IntelligenceStatus | null
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
    transfers: [],
    intelligence: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanStep, setScanStep] = useState(0)
  const [lastRunMessage, setLastRunMessage] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const [summary, inventory, forecasts, risks, transfers, intelligence] =
        await Promise.all([
          api.fetchDashboardSummary(),
          api.fetchInventory(),
          api.fetchForecasts(),
          api.fetchRisk(),
          api.fetchTransfers(),
          api.fetchIntelligenceStatus(),
        ])

      setData({ summary, inventory, forecasts, risks, transfers, intelligence })
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
      await new Promise((resolve) => setTimeout(resolve, 650))
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
    refresh,
    runIntelligence,
    updateTransferStatus,
    loadInventory,
  }
}
