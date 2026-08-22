import { useCallback, useEffect, useState } from 'react'
import * as api from '../services/api'
import type {
  AuditItem,
  CentreNetworkFacility,
  CentrePressureData,
  CentreProfile,
  CentreSummary,
  ForecastItem,
  InventoryItem,
  RiskItem,
  TransferItem,
  TransferStatusUpdate,
} from '../types'

export interface CentreWorkspaceData {
  profile: CentreProfile | null
  summary: CentreSummary | null
  network: CentreNetworkFacility[]
  inventory: (InventoryItem & { distance_km: number; city: string; is_anchor: boolean })[]
  forecasts: (ForecastItem & {
    distance_km: number
    current_stock: number
    balance_status: string
    is_anchor: boolean
  })[]
  risks: (RiskItem & { distance_km: number; is_anchor: boolean })[]
  pressure: CentrePressureData | null
  transfers: (TransferItem & { distance_km: number; is_connected_to_anchor: boolean })[]
  auditLogs: AuditItem[]
}

const DEFAULT_CENTRE_ID = 282724 // Government Rajiv Gandhi Medical College Hospital, Chennai

export function useCentreData(centreId: number = DEFAULT_CENTRE_ID) {
  const [data, setData] = useState<CentreWorkspaceData>({
    profile: null,
    summary: null,
    network: [],
    inventory: [],
    forecasts: [],
    risks: [],
    pressure: null,
    transfers: [],
    auditLogs: [],
  })

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false)
  const [lastOptimizedMsg, setLastOptimizedMsg] = useState<string | null>(null)
  const [lastSynced, setLastSynced] = useState<string>('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [
        profile,
        summary,
        network,
        inventory,
        forecasts,
        risks,
        pressure,
        transfers,
        auditLogs,
      ] = await Promise.all([
        api.fetchCentreProfile(centreId),
        api.fetchCentreSummary(centreId, 200),
        api.fetchCentreNetwork(centreId, 200),
        api.fetchCentreInventory({ centre_id: centreId, radius_km: 200, limit: 200 }),
        api.fetchCentreForecast(centreId, 200),
        api.fetchCentreRisk({ centre_id: centreId, radius_km: 200, limit: 100 }),
        api.fetchCentrePressure(centreId, 200),
        api.fetchCentreTransfers(centreId, 200),
        api.fetchCentreAudit(centreId),
      ])

      setData({
        profile,
        summary,
        network,
        inventory,
        forecasts,
        risks,
        pressure,
        transfers,
        auditLogs,
      })
      setLastSynced(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load centre workspace data')
    } finally {
      setLoading(false)
    }
  }, [centreId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const optimize = useCallback(async () => {
    setIsOptimizing(true)
    setLastOptimizedMsg(null)
    try {
      const res = await api.runCentreOptimization(centreId, 200)
      await refresh()
      setLastOptimizedMsg(
        `Optimization complete (${res.solver}) — ${res.transfers_generated} routes generated within 200 km radius`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Optimization failed')
    } finally {
      setIsOptimizing(false)
    }
  }, [centreId, refresh])

  const updateTransferStatus = useCallback(
    async (id: number, status: TransferStatusUpdate) => {
      await api.updateCentreTransferStatus(id, status)
      await refresh()
    },
    [refresh],
  )

  const filterInventory = useCallback(
    async (filters: { blood_group?: string; component?: string; status?: string }) => {
      try {
        const inventory = await api.fetchCentreInventory({
          centre_id: centreId,
          radius_km: 200,
          ...filters,
        })
        setData((prev) => ({ ...prev, inventory }))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Filter failed')
      }
    },
    [centreId],
  )

  const filterRisks = useCallback(
    async (level?: string) => {
      try {
        const risks = await api.fetchCentreRisk({
          centre_id: centreId,
          radius_km: 200,
          level,
        })
        setData((prev) => ({ ...prev, risks }))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Risk query failed')
      }
    },
    [centreId],
  )

  return {
    data,
    loading,
    error,
    isOptimizing,
    lastOptimizedMsg,
    lastSynced,
    refresh,
    optimize,
    updateTransferStatus,
    filterInventory,
    filterRisks,
  }
}
