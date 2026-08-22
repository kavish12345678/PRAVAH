import { useState, useId } from 'react'
import { motion } from 'framer-motion'
import { GlassPanel } from './GlassPanel'

interface UnitAudit {
  id: string
  batch: string
  component: string
  bloodGroup: string
  oldRisk: number
  newRisk: number
  delta: number
  degradation: number
  action: string
}

export function IncidentSimulator() {
  const [bank, setBank] = useState('Bengaluru City Blood Bank')
  const [eventType, setEventType] = useState('Thermal Excursion + Agitation Loss')
  const [tempSpike, setTempSpike] = useState(27.8)
  const [durationMin, setDurationMin] = useState(60)
  const [agitationOff, setAgitationOff] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [auditList, setAuditList] = useState<UnitAudit[]>([])

  // Accessibility IDs for form inputs
  const bankSelectId = useId()
  const eventTypeSelectId = useId()
  const tempSpikeInputId = useId()
  const durationInputId = useId()

  const handleSimulate = async () => {
    setSimulating(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const sampleUnits: UnitAudit[] = [
      {
        id: 'INV-1024',
        batch: 'PLT-BNG-0819',
        component: 'Platelets',
        bloodGroup: 'O+',
        oldRisk: 0.35,
        newRisk: 0.91,
        delta: 0.56,
        degradation: 0.68,
        action: 'CRITICAL: Expedite immediate local transfusion or priority dispatch',
      },
      {
        id: 'INV-1025',
        batch: 'PLT-BNG-0820',
        component: 'Platelets',
        bloodGroup: 'B+',
        oldRisk: 0.28,
        newRisk: 0.84,
        delta: 0.56,
        degradation: 0.64,
        action: 'CRITICAL: Mark for emergency redistribution within 6 hours',
      },
      {
        id: 'INV-1026',
        batch: 'RBC-BNG-0810',
        component: 'Packed RBC',
        bloodGroup: 'A+',
        oldRisk: 0.12,
        newRisk: 0.42,
        delta: 0.30,
        degradation: 0.35,
        action: 'WARNING: Increased monitoring required; shelf-life degraded',
      },
    ]

    setAuditList(sampleUnits)
    setHasRun(true)
    setSimulating(false)
  }

  return (
    <div className="space-y-6">
      <GlassPanel className="p-6" glow="amber">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-400">
              Live Event Orchestrator
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Event-Driven Dynamic Re-Scoring Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Simulate sudden cold-chain telemetry excursions or hardware faults and observe real-time risk cascades across affected batches.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={simulating}
            onClick={handleSimulate}
            className="px-5 py-2.5 rounded-xl border border-amber-400/40 bg-amber-500/20 text-xs font-bold uppercase tracking-wider text-amber-200 hover:bg-amber-500/30 transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-amber-500/10"
          >
            <span>⚡</span>
            {simulating ? 'Processing Event Cascade...' : 'Trigger Incident Event'}
          </motion.button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label htmlFor={bankSelectId} className="block text-slate-300 mb-1">Target Blood Bank Node</label>
            <select
              id={bankSelectId}
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Bengaluru City Blood Bank">Bengaluru City Blood Bank</option>
              <option value="Delhi Central Blood Bank">Delhi Central Blood Bank</option>
              <option value="Mumbai Regional Blood Centre">Mumbai Regional Blood Centre</option>
              <option value="Chennai South Blood Bank">Chennai South Blood Bank</option>
              <option value="Hyderabad Central Blood Bank">Hyderabad Central Blood Bank</option>
            </select>
          </div>

          <div>
            <label htmlFor={eventTypeSelectId} className="block text-slate-300 mb-1">Incident Scenario</label>
            <select
              id={eventTypeSelectId}
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Thermal Excursion + Agitation Loss">Thermal Excursion + Agitation Loss</option>
              <option value="Chamber Compressor Failure">Chamber Compressor Failure (&gt; 28°C)</option>
              <option value="Power Grid Outage (Backup Delay)">Power Grid Outage (Backup Delay)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <label htmlFor={tempSpikeInputId}>Chamber Temperature Spike</label>
              <span className="font-mono text-red-400 font-bold">{tempSpike.toFixed(1)} °C</span>
            </div>
            <input
              id={tempSpikeInputId}
              type="range"
              min="24.0"
              max="32.0"
              step="0.2"
              value={tempSpike}
              onChange={(e) => setTempSpike(Number(e.target.value))}
              className="w-full accent-red-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <label htmlFor={durationInputId}>Excursion Duration</label>
              <span className="font-mono text-amber-300 font-bold">{durationMin} min</span>
            </div>
            <input
              id={durationInputId}
              type="range"
              min="10"
              max="180"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div className="md:col-span-4 flex items-center justify-between p-3 rounded-xl border border-white/10 bg-black/40">
            <div>
              <div className="font-semibold text-slate-200">Agitation Hardware Status</div>
              <div className="text-[10px] text-slate-500">Inject agitation motor failure into incident simulation</div>
            </div>
            <button
              onClick={() => setAgitationOff(!agitationOff)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                agitationOff ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {agitationOff ? 'AGITATION FAILED (OFF)' : 'AGITATION NORMAL (ON)'}
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* Dynamic Results Display */}
      {hasRun && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">🚨</span>
              <div>
                <div className="text-xs font-bold text-red-300 uppercase tracking-wider">
                  Incident Alert Generated · Real-Time Rescore Completed
                </div>
                <div className="text-xs text-red-200/80">
                  Node: <span className="font-bold text-white">{bank}</span> · Excursion to {tempSpike}°C for {durationMin} min. Automatic LP redistribution re-run recommended!
                </div>
              </div>
            </div>
            <span className="px-3 py-1 text-xs rounded-full bg-red-500/20 text-red-300 font-mono font-bold border border-red-500/40">
              Δ Risk &gt; +0.50
            </span>
          </div>

          {/* Unit Audit Table */}
          <GlassPanel className="p-6" glow="red">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
              Real-Time Unit-Level Re-Scoring Audit Trail
            </h3>

            <div className="space-y-3">
              {auditList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-white/10 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-cyan-300">{item.id}</span>
                      <span className="text-xs font-mono text-slate-400">[{item.batch}]</span>
                      <span className="text-xs font-semibold text-white">
                        {item.component} ({item.bloodGroup})
                      </span>
                    </div>
                    <div className="text-xs text-amber-200 font-medium">{item.action}</div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-center p-2 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] text-slate-500 uppercase">Pre-Incident</div>
                      <div className="text-emerald-400 font-bold">{(item.oldRisk * 100).toFixed(0)}%</div>
                    </div>

                    <span className="text-slate-500">➔</span>

                    <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="text-[10px] text-red-400 uppercase">Post-Incident</div>
                      <div className="text-red-400 font-bold">{(item.newRisk * 100).toFixed(0)}%</div>
                    </div>

                    <div className="text-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <div className="text-[10px] text-amber-400 uppercase">Risk Delta</div>
                      <div className="text-amber-400 font-bold">+{(item.delta * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </div>
  )
}
