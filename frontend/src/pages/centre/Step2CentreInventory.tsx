import { useState } from 'react'
import type { InventoryItem } from '../../types'

interface Step2CentreInventoryProps {
  inventory: (InventoryItem & { distance_km: number; city: string; is_anchor: boolean })[]
  onFilter: (filters: { blood_group?: string; component?: string; status?: string }) => void
  onNavigateToStep: (step: string, filter?: Record<string, string>) => void
}

export function Step2CentreInventory({
  inventory,
  onFilter,
  onNavigateToStep,
}: Step2CentreInventoryProps) {
  const [selectedGroup, setSelectedGroup] = useState('All')
  const [selectedComponent, setSelectedComponent] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [maxDistance, setMaxDistance] = useState<number>(200)
  const [selectedItem, setSelectedItem] = useState<
    (InventoryItem & { distance_km: number; city: string; is_anchor: boolean }) | null
  >(inventory[0] || null)

  const handleGroupChange = (bg: string) => {
    setSelectedGroup(bg)
    onFilter({ blood_group: bg, component: selectedComponent, status: selectedStatus })
  }

  const handleComponentChange = (comp: string) => {
    setSelectedComponent(comp)
    onFilter({ blood_group: selectedGroup, component: comp, status: selectedStatus })
  }

  const handleStatusChange = (st: string) => {
    setSelectedStatus(st)
    onFilter({ blood_group: selectedGroup, component: selectedComponent, status: st })
  }

  const filteredInventory = inventory.filter((item) => item.distance_km <= maxDistance)

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1540px] mx-auto w-full space-y-10 select-none font-sans">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 pb-2">
        <div className="space-y-3 max-w-[850px]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full uppercase tracking-wider">
              Step 02 of 10
            </span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Regional Supply Ledger
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-bold text-primary leading-[1.06] tracking-tight">
            What do we have around this centre?
          </h1>

          <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-[800px]">
            Live blood component inventory within the <strong className="text-on-surface font-semibold">200 km Chennai operational radius</strong>.
          </p>
        </div>

        <button
          onClick={() => onNavigateToStep('forecast')}
          className="bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2.5 self-start lg:self-auto shrink-0"
        >
          <span>View Demand Forecast</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </section>

      {/* Filter Controls Bar */}
      <section className="bg-white p-6 rounded-3xl border border-outline-variant/15 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Blood Group Filter */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-full border border-outline-variant/20">
            {['All', 'O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((bg) => (
              <button
                key={bg}
                onClick={() => handleGroupChange(bg)}
                className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
                  selectedGroup === bg ? 'bg-primary text-white shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>

          {/* Component Filter */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-full border border-outline-variant/20">
            {['All', 'Platelet Concentrate', 'RDP', 'SDP'].map((comp) => (
              <button
                key={comp}
                onClick={() => handleComponentChange(comp)}
                className={`px-3.5 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
                  selectedComponent === comp ? 'bg-primary text-white shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-full border border-outline-variant/20">
            {['All', 'AVAILABLE', 'NEAR_EXPIRY', 'LOW'].map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
                  selectedStatus === st ? 'bg-primary text-white shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Max Distance Slider */}
          <div className="flex items-center gap-2.5 bg-surface-container-low px-4 py-1.5 rounded-full border border-outline-variant/20 ml-auto">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">Max Radius:</span>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="accent-primary w-24 cursor-pointer"
            />
            <span className="text-[11px] font-bold text-primary font-mono">{maxDistance} km</span>
          </div>
        </div>
      </section>

      {/* Inventory Master-Detail Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Inventory List */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex justify-between items-center text-xs text-on-surface-variant px-1 font-semibold">
            <span>Showing {filteredInventory.length} Regional Batches</span>
            <span>Sorted by Expiry Horizon</span>
          </div>

          <div className="space-y-3">
            {filteredInventory.map((item) => {
              const isSelected = selectedItem?.id === item.id
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-5 bg-white rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 shadow-md'
                      : 'border-outline-variant/15 hover:border-primary/40 shadow-2xs'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md font-mono">
                        Batch #{item.id}
                      </span>
                      {item.is_anchor && (
                        <span className="px-2 py-0.5 bg-secondary/15 text-secondary text-[10px] font-bold rounded-md uppercase">
                          Anchor Hub
                        </span>
                      )}
                      <span className="text-xs text-on-surface-variant font-mono">
                        {item.distance_km.toFixed(1)} km away
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-on-surface truncate">{item.bank_name}</h4>
                    <p className="text-xs text-on-surface-variant">
                      {item.blood_group} · {item.component} · Expires {item.expiry_date}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0">
                    <span className="text-2xl font-bold text-primary font-mono">{item.quantity} Units</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'NEAR_EXPIRY'
                          ? 'bg-rose-100 text-rose-800'
                          : item.status === 'LOW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Selected Batch Inspection Panel */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-outline-variant/15 shadow-xs space-y-6 sticky top-24">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Batch Investigation
            </span>
            <h3 className="font-serif text-2xl font-bold text-on-surface">
              Batch #{selectedItem?.id ?? '---'}
            </h3>
            <p className="text-xs text-on-surface-variant">
              {selectedItem?.bank_name}
            </p>
          </div>

          {selectedItem ? (
            <div className="space-y-5 text-xs">
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/15 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-semibold">Blood Group:</span>
                  <span className="font-bold text-on-surface font-mono text-sm">{selectedItem.blood_group}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-semibold">Component:</span>
                  <span className="font-bold text-on-surface">{selectedItem.component}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-semibold">Available Quantity:</span>
                  <span className="font-bold text-primary font-mono text-sm">{selectedItem.quantity} Units</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-semibold">Collection Date:</span>
                  <span className="font-mono text-on-surface">{selectedItem.collection_date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-semibold">Expiry Date:</span>
                  <span className="font-mono text-on-surface">{selectedItem.expiry_date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-semibold">Distance from Chennai RGH:</span>
                  <span className="font-bold text-primary font-mono">{selectedItem.distance_km.toFixed(1)} km</span>
                </div>
              </div>

              <button
                onClick={() => onNavigateToStep('risk', { inventory_id: String(selectedItem.id) })}
                className="w-full py-3.5 bg-primary text-white font-bold uppercase text-xs rounded-full hover:bg-primary-container transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Step 04 · Inspect Expiry Risk</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-on-surface-variant bg-surface-container-low rounded-2xl">
              Select a batch from the list to investigate.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
