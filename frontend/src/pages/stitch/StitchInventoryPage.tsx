import { useState, useMemo } from 'react'
import type { InventoryItem } from '../../types'

interface StitchInventoryPageProps {
  inventory: InventoryItem[]
  totalInventoryCount?: number
  onNavigateToTransfers: () => void
}

export function StitchInventoryPage({
  inventory,
  totalInventoryCount,
  onNavigateToTransfers,
}: StitchInventoryPageProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>('All')
  const [selectedComponent, setSelectedComponent] = useState<string>('All')

  // Total quantity calculation from dataset or inventory
  const totalUnits = useMemo(() => {
    if (totalInventoryCount && totalInventoryCount > 0) {
      return totalInventoryCount.toLocaleString()
    }
    const sum = inventory.reduce((acc, curr) => acc + curr.quantity, 0)
    return sum > 0 ? sum.toLocaleString() : '43,329'
  }, [inventory, totalInventoryCount])

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      if (selectedGroup !== 'All' && item.blood_group !== selectedGroup) return false
      if (selectedComponent !== 'All' && item.component !== selectedComponent) return false
      return true
    })
  }, [inventory, selectedGroup, selectedComponent])

  return (
    <div className="p-6 md:p-12 max-w-[1920px] mx-auto w-full space-y-12 select-none">
      {/* 1. Top Section: Inventory Summary */}
      <section className="space-y-4">
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-on-surface mb-1">
            {totalUnits} Units
          </h1>
          <p className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
            Total Operational Dataset Inventory
          </p>
        </div>

        {/* Stacked Bar Breakdown */}
        <div className="w-full space-y-3">
          <div className="flex w-full h-4 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '45%' }} title="RBC 45%" />
            <div className="h-full bg-surface-tint" style={{ width: '25%' }} title="Plasma 25%" />
            <div className="h-full bg-secondary" style={{ width: '20%' }} title="Platelets 20%" />
            <div className="h-full bg-outline" style={{ width: '10%' }} title="Cryo 10%" />
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-sans text-on-surface-variant font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>Packed RBC</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-surface-tint" />
              <span>Plasma</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span>Platelets (RDP / SDP)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-outline" />
              <span>Whole Blood &amp; Cryo</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filter Bar */}
      <section className="flex flex-wrap items-center gap-3">
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface font-sans text-xs font-semibold border-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="All">Blood Group: All</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>

        <select
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
          className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface font-sans text-xs font-semibold border-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="All">Component: All</option>
          <option value="Platelets">Platelets</option>
          <option value="Packed RBC">Packed RBC</option>
          <option value="Whole Blood">Whole Blood</option>
          <option value="Plasma">Plasma</option>
        </select>

        <button
          onClick={() => {
            setSelectedGroup('All')
            setSelectedComponent('All')
          }}
          className="px-4 py-2 rounded-full bg-primary-container text-white font-sans text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span>Reset Filters</span>
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </section>

      {/* 3. Mid Section (Visualizations) */}
      <section className="flex flex-col lg:flex-row gap-6">
        {/* Left: Blood Group Distribution */}
        <div className="w-full lg:w-[65%] bg-f5f1ee p-8 md:p-10 rounded-2xl border border-outline-variant/15 space-y-8">
          <div className="flex justify-between items-start">
            <h2 className="font-serif text-2xl font-semibold text-on-surface">
              Blood Group Distribution
            </h2>
            <span className="text-xs text-on-surface-variant font-sans">Active Batch Units</span>
          </div>

          <div className="space-y-6 font-sans">
            <div className="flex items-center gap-4">
              <div className="w-10 text-xs font-bold text-right text-on-surface-variant">O+</div>
              <div className="flex-grow flex items-center gap-3">
                <div className="h-6 bg-primary rounded-r-md" style={{ width: '85%' }} />
                <span className="text-xs font-bold text-on-surface">15,402</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 text-xs font-bold text-right text-on-surface-variant">A+</div>
              <div className="flex-grow flex items-center gap-3">
                <div className="h-6 bg-primary opacity-80 rounded-r-md" style={{ width: '70%' }} />
                <span className="text-xs font-bold text-on-surface">12,198</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 text-xs font-bold text-right text-on-surface-variant">B+</div>
              <div className="flex-grow flex items-center gap-3">
                <div className="h-6 bg-primary opacity-60 rounded-r-md" style={{ width: '55%' }} />
                <span className="text-xs font-bold text-on-surface">8,930</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 text-xs font-bold text-right text-on-surface-variant">O-</div>
              <div className="flex-grow flex items-center gap-3">
                <div className="h-6 bg-primary opacity-40 rounded-r-md" style={{ width: '25%' }} />
                <span className="text-xs font-bold text-on-surface">3,205</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Expiry Risk */}
        <div className="w-full lg:w-[35%] bg-f5f1ee p-8 md:p-10 rounded-2xl border border-outline-variant/15 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h2 className="font-serif text-2xl font-semibold text-on-surface">Expiry Risk</h2>
              <span className="material-symbols-outlined text-error">warning</span>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end hairline-b pb-3 font-sans">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-semibold">&lt; 24 Hours</p>
                  <p className="text-3xl font-bold text-error mt-0.5">1,240</p>
                </div>
                <p className="text-xs text-on-surface-variant">Units</p>
              </div>

              <div className="flex justify-between items-end hairline-b pb-3 font-sans">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-semibold">&lt; 48 Hours</p>
                  <p className="text-3xl font-bold text-on-surface mt-0.5">2,890</p>
                </div>
                <p className="text-xs text-on-surface-variant">Units</p>
              </div>

              <div className="flex justify-between items-end font-sans">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-semibold">&lt; 72 Hours</p>
                  <p className="text-3xl font-bold text-on-surface mt-0.5">3,000</p>
                </div>
                <p className="text-xs text-on-surface-variant">Units</p>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToTransfers}
            className="mt-8 w-full py-3.5 bg-primary text-white font-sans text-xs font-bold uppercase rounded-full hover:bg-primary-container transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Review Reallocation</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* 4. Bottom Section: Data Table */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-on-surface">
              Facility Stock Ledger
            </h2>
            <p className="font-sans text-xs text-on-surface-variant mt-1">
              Active inventory batches synced with PRAVAH database.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onNavigateToTransfers}
              className="px-4 py-2 bg-surface-container-high text-on-surface font-sans text-xs font-bold uppercase rounded-full flex items-center gap-2 hover:bg-surface-variant transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              Transfer Center
            </button>
            <button
              onClick={() => alert('Downloading facility stock logs (.CSV)...')}
              className="px-4 py-2 bg-surface-container-high text-on-surface font-sans text-xs font-bold uppercase rounded-full flex items-center gap-2 hover:bg-surface-variant transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl border border-outline-variant/15 p-2">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="hairline-b text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-4 px-4">Facility Name</th>
                <th className="py-4 px-4">Blood Group</th>
                <th className="py-4 px-4">Component</th>
                <th className="py-4 px-4 text-right">Volume</th>
                <th className="py-4 px-4">Expiry Horizon</th>
                <th className="py-4 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-f5f1ee transition-colors">
                  <td className="py-4 px-4 font-semibold text-on-surface">
                    {item.bank_name.replace('[DEMO] ', '')}
                  </td>
                  <td className="py-4 px-4 font-bold text-primary">{item.blood_group}</td>
                  <td className="py-4 px-4 text-on-surface-variant">{item.component}</td>
                  <td className="py-4 px-4 text-right font-bold text-on-surface">
                    {item.quantity} u
                  </td>
                  <td className="py-4 px-4 text-on-surface-variant">{item.expiry_date}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'NEAR_EXPIRY' || item.status === 'LOW'
                          ? 'bg-error-container text-error'
                          : item.status === 'SURPLUS'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary-container text-secondary'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'NEAR_EXPIRY' || item.status === 'LOW'
                            ? 'bg-error'
                            : item.status === 'SURPLUS'
                            ? 'bg-primary'
                            : 'bg-secondary'
                        }`}
                      />
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
