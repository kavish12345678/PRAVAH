import { useCallback, useEffect, useState } from 'react'
import * as api from '../services/api'
import type {
  AuditItem,
  CentreColdChainData,
  CentreHealthData,
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
  coldChain: CentreColdChainData | null
  health: CentreHealthData | null
  network: CentreNetworkFacility[]
  inventory: (InventoryItem & { distance_km: number; city: string; is_anchor: boolean })[]
  forecasts: ForecastItem[]
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
    coldChain: null,
    health: null,
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
      const results = await Promise.allSettled([
        api.fetchCentreProfile(centreId),
        api.fetchCentreSummary(centreId, 200),
        api.fetchCentreColdChain(centreId),
        api.fetchCentreHealth(centreId),
        api.fetchCentreNetwork(centreId, 200),
        api.fetchCentreInventory({ centre_id: centreId, radius_km: 200, limit: 200 }),
        api.fetchCentreForecast(centreId, 200),
        api.fetchCentreRisk({ centre_id: centreId, radius_km: 200, limit: 100 }),
        api.fetchCentrePressure(centreId, 200),
        api.fetchCentreTransfers(centreId, 200),
        api.fetchCentreAudit(centreId),
      ])

      const profile = results[0].status === 'fulfilled' ? results[0].value : null
      const summary = results[1].status === 'fulfilled' ? results[1].value : null
      const coldChain = results[2].status === 'fulfilled' ? results[2].value : null
      const health = results[3].status === 'fulfilled' ? results[3].value : null
      const network = results[4].status === 'fulfilled' ? results[4].value : []
      const inventory = results[5].status === 'fulfilled' ? results[5].value : []
      const forecasts = results[6].status === 'fulfilled' ? results[6].value : []
      const risks = results[7].status === 'fulfilled' ? results[7].value : []
      const pressure = results[8].status === 'fulfilled' ? results[8].value : null
      const transfers = results[9].status === 'fulfilled' ? results[9].value : []
      const auditLogs = results[10].status === 'fulfilled' ? results[10].value : []

      setData({
        profile,
        summary,
        coldChain,
        health,
        network,
        inventory,
        forecasts,
        risks,
        pressure,
        transfers,
        auditLogs,
      })
      setLastSynced(new Date().toLocaleTimeString())

      const failedCount = results.filter((r) => r.status === 'rejected').length
      if (failedCount === results.length) {
        const firstErr = (results[0] as PromiseRejectedResult).reason
        setError(firstErr instanceof Error ? firstErr.message : 'Data service unavailable')
      }
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
    async (filters: { blood_group?: string; component?: string; status?: string; anchor_only?: boolean }) => {
      try {
        const inv = await api.fetchCentreInventory({
          centre_id: centreId,
          radius_km: 200,
          ...filters,
        })
        setData((prev) => ({ ...prev, inventory: inv }))
      } catch (err) {
        console.error('Inventory filtering error:', err)
      }
    },
    [centreId],
  )

  const filterRisks = useCallback(
    async (level?: string) => {
      try {
        const r = await api.fetchCentreRisk({
          centre_id: centreId,
          radius_km: 200,
          level,
        })
        setData((prev) => ({ ...prev, risks: r }))
      } catch (err) {
        console.error('Risk filtering error:', err)
      }
    },
    [centreId],
  )

  return {
    data,
    ...data,
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
