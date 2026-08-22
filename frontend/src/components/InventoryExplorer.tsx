import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import type { InventoryItem } from '../types'
import { GlassPanel } from './GlassPanel'

interface InventoryExplorerProps {
  inventory: InventoryItem[]
  onFilterChange: (filters: {
    blood_group?: string
    component?: string
    bank_id?: number
  }) => void
}

const STATUS_STYLES: Record<string, string> = {
  LOW: 'border-amber-400/40 text-amber-300',
  SURPLUS: 'border-cyan-400/40 text-cyan-300',
  NEAR_EXPIRY: 'border-red-400/40 text-red-300',
  AVAILABLE: 'border-white/10 text-slate-300',
}

export function InventoryExplorer({ inventory, onFilterChange }: InventoryExplorerProps) {
  const [bloodGroup, setBloodGroup] = useState('')
  const [component, setComponent] = useState('')
  const [bankName, setBankName] = useState('')

  const bloodGroups = useMemo(
    () => [...new Set(inventory.map((i) => i.blood_group))].sort(),
    [inventory],
  )
  const components = useMemo(
    () => [...new Set(inventory.map((i) => i.component))].sort(),
    [inventory],
  )
  const banks = useMemo(
    () => [...new Set(inventory.map((i) => i.bank_name))].sort(),
    [inventory],
  )

  const applyFilters = () => {
    onFilterChange({
      blood_group: bloodGroup || undefined,
      component: component || undefined,
    })
  }

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      if (bloodGroup && item.blood_group !== bloodGroup) return false
      if (component && item.component !== component) return false
      if (bankName && item.bank_name !== bankName) return false
      return true
    })
  }, [inventory, bloodGroup, component, bankName])

  return (
    <div className="space-y-4">
      <GlassPanel className="p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <FilterSelect
            label="Blood Group"
            value={bloodGroup}
            onChange={setBloodGroup}
            options={bloodGroups}
          />
          <FilterSelect
            label="Component"
            value={component}
            onChange={setComponent}
            options={components}
          />
          <FilterSelect label="Bank" value={bankName} onChange={setBankName} options={banks} />
          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/20"
            >
              Apply API Filters
            </button>
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.02, 0.4) }}
          >
            <GlassPanel
              className={`p-4 ${STATUS_STYLES[item.status] ?? STATUS_STYLES.AVAILABLE} border`}
              glow={
                item.status === 'NEAR_EXPIRY' ? 'red' : item.status === 'LOW' ? 'amber' : 'none'
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500">{item.bank_name.replace('[DEMO] ', '')}</div>
                  <div className="mt-1 text-sm font-medium text-white">
                    {item.component} · {item.blood_group}
                  </div>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_STYLES[item.status] ?? STATUS_STYLES.AVAILABLE}`}
                >
                  {item.status.replace('_', ' ')}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <Metric label="Qty" value={String(item.quantity)} />
                <Metric label="Collected" value={item.collection_date} />
                <Metric label="Expires" value={item.expiry_date} />
              </div>
            </GlassPanel>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/40"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-slate-600">{label}</div>
      <div className="mt-0.5 text-slate-300">{value}</div>
    </div>
  )
}
