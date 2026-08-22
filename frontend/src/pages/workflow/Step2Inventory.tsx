import { useState, useMemo, useEffect } from 'react'
import type { InventoryItem } from '../../types'

interface Step2InventoryProps {
  inventory: InventoryItem[]
  selectedBank: string | null
  initialStatusFilter?: string | null
  onSelectBank: (bank: string) => void
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step2Inventory({
  inventory,
  selectedBank: _selectedBank,
  initialStatusFilter,
  onSelectBank,
  onNavigateToStep,
}: Step2InventoryProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>('All')
  const [selectedComponent, setSelectedComponent] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'All')
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(() => inventory[0] || null)

  useEffect(() => {
    if (!selectedItem && inventory.length > 0) {
      setSelectedItem(inventory[0])
    }
  }, [inventory, selectedItem])

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      if (selectedGroup !== 'All' && item.blood_group !== selectedGroup) return false
      if (selectedComponent !== 'All' && item.component !== selectedComponent) return false
      if (statusFilter !== 'All' && item.status !== statusFilter) return false
      return true
    })
  }, [inventory, selectedGroup, selectedComponent, statusFilter])

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
              Step 02 of 10
            </span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Inventory Ledger
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight mt-1">
            What blood do we currently have?
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl">
            Live inventory ledger queried directly from the PRAVAH operational dataset ({inventory.length} records active).
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('forecast')}
          className="bg-primary text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-colors cursor-pointer shadow-md flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <span>Analyze Demand</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
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
          <option value="Platelet Concentrate">Platelet Concentrate</option>
          <option value="RDP">RDP</option>
          <option value="SDP">SDP</option>
          <option value="Packed RBC">Packed RBC</option>
          <option value="Whole Blood">Whole Blood</option>
          <option value="Plasma">Plasma</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface font-sans text-xs font-semibold border-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="All">Status: All</option>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="SURPLUS">SURPLUS</option>
          <option value="LOW">LOW</option>
          <option value="NEAR_EXPIRY">NEAR_EXPIRY</option>
        </select>

        {(selectedGroup !== 'All' || selectedComponent !== 'All' || statusFilter !== 'All') && (
          <button
            onClick={() => {
              setSelectedGroup('All')
              setSelectedComponent('All')
              setStatusFilter('All')
            }}
            className="px-4 py-2 rounded-full bg-primary-container text-white font-sans text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Clear Filters</span>
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Main Grid: Table (Left 65%) + Selected Item Detail (Right 35%) */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Table View */}
        <div className="w-full lg:w-2/3 bg-white rounded-2xl border border-outline-variant/15 overflow-hidden">
          {filteredInventory.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant text-xs space-y-2">
              <span className="material-symbols-outlined text-3xl text-outline-variant">inventory_2</span>
              <p className="font-semibold text-on-surface">No PRAVAH records found for this selection.</p>
              <p>Try clearing filters to view available inventory batches.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="hairline-b text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider bg-surface-container-low">
                  <th className="py-3.5 px-4">Batch ID</th>
                  <th className="py-3.5 px-4">Facility Name</th>
                  <th className="py-3.5 px-4">Group</th>
                  <th className="py-3.5 px-4">Component</th>
                  <th className="py-3.5 px-4 text-right">Units</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredInventory.slice(0, 15).map((item) => {
                  const isSelected = selectedItem?.id === item.id

                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item)
                        onSelectBank(item.bank_name)
                      }}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-primary-container/10 font-medium' : 'hover:bg-f5f1ee'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono text-[11px] text-on-surface-variant">
                        #{item.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-on-surface max-w-[200px] truncate">
                        {item.bank_name}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-primary">{item.blood_group}</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">{item.component}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-on-surface">{item.quantity} u</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'NEAR_EXPIRY' || item.status === 'LOW'
                              ? 'bg-error-container text-error'
                              : item.status === 'SURPLUS'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-secondary-container text-secondary'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Selected Item Detail Card */}
        <div className="w-full lg:w-1/3 bg-f5f1ee p-6 rounded-2xl border border-outline-variant/15 flex flex-col justify-between space-y-6">
          {selectedItem ? (
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">
                Selected Batch #{selectedItem.id}
              </span>
              <h3 className="font-serif text-2xl font-semibold text-on-surface leading-snug">
                {selectedItem.bank_name}
              </h3>

              <div className="space-y-3 text-xs pt-3 border-t border-outline-variant/20">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Blood Group:</span>
                  <span className="font-bold text-primary">{selectedItem.blood_group}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Component:</span>
                  <span className="font-semibold text-on-surface">{selectedItem.component}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Available Volume:</span>
                  <span className="font-bold text-on-surface">{selectedItem.quantity} Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Collection Date:</span>
                  <span className="text-on-surface">{selectedItem.collection_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Expiry Date:</span>
                  <span className="text-on-surface">{selectedItem.expiry_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Batch Status:</span>
                  <span className="font-bold text-primary">{selectedItem.status}</span>
                </div>
              </div>

              {/* Context-aware single next action */}
              <div className="pt-4 border-t border-outline-variant/20">
                {selectedItem.status === 'NEAR_EXPIRY' ? (
                  <button
                    onClick={() => onNavigateToStep('risk')}
                    className="w-full py-3 bg-primary text-white text-xs font-bold uppercase rounded-full hover:bg-primary-container transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                  >
                    <span>Check Risk Factors</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigateToStep('forecast')}
                    className="w-full py-3 bg-primary text-white text-xs font-bold uppercase rounded-full hover:bg-primary-container transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                  >
                    <span>Analyze Demand</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-on-surface-variant text-xs">
              Select an inventory item to inspect details.
            </div>
          )}

          {/* Previous / Next navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20 text-xs">
            <button
              onClick={() => onNavigateToStep('overview')}
              className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              ← Step 01 Flow
            </button>
            <button
              onClick={() => onNavigateToStep('forecast')}
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              Step 03 Forecast →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
