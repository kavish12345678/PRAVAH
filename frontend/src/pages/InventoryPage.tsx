import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { InventoryItem } from '../types'

interface InventoryPageProps {
  inventory: InventoryItem[]
  onFilterChange: (filters: { blood_group?: string; component?: string; bank_id?: number }) => void
}

export function InventoryPage({ inventory }: InventoryPageProps) {
  const [selectedBank, setSelectedBank] = useState<string>('')
  const [selectedComponent, setSelectedComponent] = useState<string>('')
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('')

  // Unique filter options
  const banks = useMemo(() => [...new Set(inventory.map((i) => i.bank_name))].sort(), [inventory])
  const components = useMemo(() => [...new Set(inventory.map((i) => i.component))].sort(), [inventory])
  const bloodGroups = useMemo(() => [...new Set(inventory.map((i) => i.blood_group))].sort(), [inventory])

  // Filtered rows
  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      if (selectedBank && item.bank_name !== selectedBank) return false
      if (selectedComponent && item.component !== selectedComponent) return false
      if (selectedBloodGroup && item.blood_group !== selectedBloodGroup) return false
      return true
    })
  }, [inventory, selectedBank, selectedComponent, selectedBloodGroup])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 py-4 max-w-5xl mx-auto"
    >
      {/* 1. EDITORIAL HEADER */}
      <section className="space-y-2">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-sans">
          Inventory
        </h1>
        <p className="text-base text-slate-600">
          Current blood availability across the network.
        </p>
      </section>

      {/* 2. CLEAN FILTER ROW */}
      <section className="p-4 rounded-xl border border-[#e8e6df] bg-white flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <label htmlFor="inventory-bank-filter" className="text-slate-500 font-medium">Bank:</label>
          <select
            id="inventory-bank-filter"
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-slate-200 bg-[#fbfaf7] text-slate-800 focus:outline-none focus:border-slate-400"
          >
            <option value="">All Blood Banks ({banks.length})</option>
            {banks.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="inventory-component-filter" className="text-slate-500 font-medium">Component:</label>
          <select
            id="inventory-component-filter"
            value={selectedComponent}
            onChange={(e) => setSelectedComponent(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-slate-200 bg-[#fbfaf7] text-slate-800 focus:outline-none focus:border-slate-400"
          >
            <option value="">All Components</option>
            {components.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="inventory-group-filter" className="text-slate-500 font-medium">Blood Group:</label>
          <select
            id="inventory-group-filter"
            value={selectedBloodGroup}
            onChange={(e) => setSelectedBloodGroup(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-slate-200 bg-[#fbfaf7] text-slate-800 focus:outline-none focus:border-slate-400"
          >
            <option value="">All Blood Groups</option>
            {bloodGroups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {(selectedBank || selectedComponent || selectedBloodGroup) && (
          <button
            onClick={() => { setSelectedBank(''); setSelectedComponent(''); setSelectedBloodGroup(''); }}
            className="text-rose-800 hover:underline font-medium ml-auto cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </section>

      {/* 3. EDITORIAL INVENTORY TABLE */}
      <section className="rounded-xl border border-[#e8e6df] bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8e6df] bg-[#fbfaf7] text-slate-500 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Blood Bank</th>
                <th className="py-3 px-4 font-semibold">Component</th>
                <th className="py-3 px-4 font-semibold">Group</th>
                <th className="py-3 px-4 font-semibold text-right">Quantity</th>
                <th className="py-3 px-4 font-semibold">Expiry Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1efe9]">
              {filtered.slice(0, 50).map((item) => {
                const isNearExpiry = item.status === 'NEAR_EXPIRY'
                const isLow = item.status === 'LOW'
                const isSurplus = item.status === 'SURPLUS'

                return (
                  <tr key={item.id} className="hover:bg-[#fbfaf7] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {item.bank_name.replace('[DEMO] ', '')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{item.component}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.blood_group}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                      {item.quantity} units
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {item.expiry_date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          isNearExpiry
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : isLow
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : isSurplus
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No matching inventory records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-[#e8e6df] bg-[#fbfaf7] text-slate-500 text-[11px] flex justify-between">
          <span>Showing {Math.min(50, filtered.length)} of {filtered.length} active batches</span>
          <span className="font-mono">5-day Platelet Rule Active</span>
        </div>
      </section>
    </motion.div>
  )
}
