import { useEffect, useRef, useState } from 'react'
import { LanguageDropdown } from '../../components/common/LanguageDropdown'
import { useLanguage } from '../../i18n/LanguageContext'

interface Step0WelcomeProps {
  onEnterPravah: () => void
}

interface StageData {
  id: number
  key: string
  num: string
  title: string
  subtitle: string
  icon: string
  tags: string[]
  badge?: string
  detailedTitle: string
  detailedDesc: string
  techStack: string[]
  metrics: string
  actionLabel: string
}

export function Step0Welcome({ onEnterPravah }: Step0WelcomeProps) {
  const { t } = useLanguage()
  const [activeStage, setActiveStage] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedStage, setSelectedStage] = useState<StageData | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const STAGES: StageData[] = [
    {
      id: 0,
      key: 'connect',
      num: '01',
      title: 'CONNECT',
      subtitle: 'Unifies blood-bank inventory, demand & network data.',
      icon: 'hub',
      tags: ['Inventory', 'Demand', 'Network'],
      detailedTitle: '01 · Unified Data Ingestion & Spatial Network',
      detailedDesc:
        'PRAVAH continuously aggregates real-time inventory levels, component-level blood bags, patient demand histories, cold-chain temperatures, and regional transport graphs across 4,390 facilities into a unified clinical state.',
      techStack: ['e-RaktKosh API Ingestion', 'Spatial Distance Matrix', 'IoT Cold-Chain Telemetry'],
      metrics: '4,390 Blood Banks · 43,329 Monitored Units',
      actionLabel: 'Explore Data Layer',
    },
    {
      id: 1,
      key: 'predict',
      num: '02',
      title: 'PREDICT',
      subtitle: 'AI detects shortages, expiry & cold-chain risks.',
      icon: 'psychology',
      tags: ['Shortage', 'Expiry', 'Cold Chain'],
      detailedTitle: '02 · Gradient Boosted Inference & Thermal Anomaly Detection',
      detailedDesc:
        'LightGBM & HistGradientBoosting models forecast 24h/72h clinical demand, while unit-level ML classifies impending expiry risk and Isolation Forest detects thermal excursions before spoilage occurs.',
      techStack: ['HistGradientBoosting (R²=0.763)', 'GBDT Expiry Classifier (AUC=0.999)', 'Isolation Forest Thermal Sentinel'],
      metrics: '24h/72h Predictive Horizon · 0 Spoilage Target',
      actionLabel: 'View AI Models',
    },
    {
      id: 2,
      key: 'optimize',
      num: '03',
      title: 'OPTIMIZE',
      subtitle: 'ML + LP find the best source, route & multi-stop plan.',
      icon: 'alt_route',
      badge: 'ML + LP',
      tags: ['Source', 'Route', 'Multi-Stop'],
      detailedTitle: '03 · Mathematical Linear Programming & Multi-Stop Consolidation',
      detailedDesc:
        'HiGHS Linear Programming (LP) solver computes globally optimal surplus-to-deficit allocations minimizing transit time, carbon footprint, and cold-chain exposure with intelligent multi-stop consolidation.',
      techStack: ['HiGHS Simplex/Interior LP Engine', 'Multi-Stop Cluster Solver', 'Cold-Chain Exposure Penalization'],
      metrics: '745 Solved Routing Paths · 200 km Radius',
      actionLabel: 'Inspect Solver Plans',
    },
    {
      id: 3,
      key: 'act',
      num: '04',
      title: 'ACT',
      subtitle: 'Transfers blood or mobilizes nearby donors when needed.',
      icon: 'verified',
      tags: ['Transfer', 'Donor Alert', 'Human Check'],
      detailedTitle: '04 · Clinical Authorization, Telegram Mobilization & Audit Trail',
      detailedDesc:
        'Medical Directors review and authorize dispatches with 1-click execution, mobilize nearby voluntary donors via localized Telegram broadcasts, and log every decision into a permanent, verifiable audit trail.',
      techStack: ['1-Click Dispatch Authorization', 'Direct Telegram Bot Mobilization', 'Immutable Cryptographic Audit Trail'],
      metrics: '100% Human Supervised · Instant Telegram Push',
      actionLabel: 'Launch Operations',
    },
  ]

  // Continuous Attention-Control Loop: 2.5s per stage (10s cycle)
  useEffect(() => {
    if (isPaused || selectedStage !== null) return

    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % STAGES.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [isPaused, selectedStage, STAGES.length])

  // Subtle Background Network Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Generate lightweight network nodes
    const nodeCount = 32
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 2 + 1.2,
      baseAlpha: Math.random() * 0.25 + 0.1,
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw faint connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.08
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(122, 28, 40, ${alpha})`
            ctx.lineWidth = 0.75
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy

        if (node.x < 0 || node.x > width) node.vx *= -1
        if (node.y < 0 || node.y > height) node.vy *= -1

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(122, 28, 40, ${node.baseAlpha})`
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAF7F5] text-[#1F1B19] font-sans antialiased flex flex-col justify-between p-4 sm:p-6 lg:p-7 select-none relative">
      {/* Background Animated Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-70"
      />

      {/* Subtle Ambient Vignette & Warm Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#7A1C28]/4 via-[#9E2A38]/3 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* =========================================================================
          1. TOP HEADER (BRAND + LANGUAGE + ENTER CTA)
          ========================================================================= */}
      <header className="relative z-10 flex justify-between items-center px-2 sm:px-4 py-1 border-b border-[#E8E1DC]/70">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <img
            src="/pravah-logo.png"
            alt="PRAVAH Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0 drop-shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1F1B19] leading-none">
                PRAVAH
              </h1>
              <span className="px-2 py-0.5 bg-[#FCECEE] text-[#7A1C28] text-[9px] font-bold uppercase tracking-wider rounded-sm font-mono border border-[#F5D5D9]">
                Clinical Flow
              </span>
            </div>
            <p className="text-[10.5px] text-[#7A1C28] font-bold italic tracking-wide mt-0.5">
              The Lifeline in Motion
            </p>
          </div>
        </div>

        {/* Right CTA & Language Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageDropdown />

          <button
            onClick={onEnterPravah}
            className="group relative bg-gradient-to-r from-[#7A1C28] to-[#9E2A38] hover:from-[#63141F] hover:to-[#7A1C28] text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg shadow-[#7A1C28]/25 hover:scale-[1.03] flex items-center gap-2"
          >
            <span>ENTER PRAVAH</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN HEADLINE & VALUE PROPOSITION
          ========================================================================= */}
      <section className="relative z-10 text-center max-w-4xl mx-auto space-y-1.5 my-auto pt-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-xs rounded-full border border-[#E8E1DC] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span className="text-[10px] font-bold text-[#5A5451] uppercase tracking-widest font-mono">
            {t('common.tagline')} · NATIONAL CLINICAL INTELLIGENCE
          </span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#1F1B19] tracking-tight leading-tight">
          From Blood Data to Life-Saving Action.
        </h2>

        <p className="text-xs sm:text-sm text-[#5A5451] max-w-2xl mx-auto leading-relaxed">
          PRAVAH turns fragmented blood-supply data into predictive, optimized, and human-approved decisions.
        </p>
      </section>

      {/* =========================================================================
          3. 4-STAGE HORIZONTAL INTERACTIVE WORKFLOW PIPELINE
          ========================================================================= */}
      <section
        className="relative z-10 w-full max-w-6xl mx-auto my-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Animated Blood-Flow Connecting Pathway between cards */}
        <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-[#E8E1DC] pointer-events-none z-0">
          <div
            className="h-full bg-gradient-to-r from-transparent via-[#7A1C28] to-transparent transition-all duration-700 relative"
            style={{
              width: '33.3%',
              transform: `translateX(${activeStage * 100}%)`,
            }}
          >
            {/* Moving Blood Flow Particle */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#7A1C28] shadow-md shadow-[#7A1C28]/60 animate-ping" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#7A1C28]" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 relative">
          {STAGES.map((stage, idx) => {
            const isActive = activeStage === idx

            return (
              <div
                key={stage.id}
                onClick={() => setSelectedStage(stage)}
                className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-400 cursor-pointer flex flex-col justify-between border select-none group ${
                  isActive
                    ? 'bg-white border-[#7A1C28] ring-2 ring-[#7A1C28]/15 shadow-xl shadow-[#7A1C28]/10 scale-[1.025] z-20'
                    : 'bg-white/85 backdrop-blur-xs border-[#E8E1DC] hover:border-[#7A1C28]/50 hover:bg-white shadow-2xs opacity-85 hover:opacity-100 hover:scale-[1.01] z-10'
                }`}
              >
                {/* Active Stage Cycle Progress Line */}
                {isActive && !isPaused && (
                  <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-[#7A1C28] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#9E2A38] to-[#7A1C28] animate-[pulse_2.5s_ease-in-out_infinite]" />
                  </div>
                )}

                {/* Top Number & Icon Row */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-[11px] font-bold font-mono tracking-widest ${
                        isActive ? 'text-[#7A1C28]' : 'text-[#7A7471]'
                      }`}
                    >
                      {stage.num}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {stage.badge && (
                        <span className="px-2 py-0.5 bg-[#FCECEE] text-[#7A1C28] text-[9px] font-bold rounded-sm uppercase tracking-wider font-mono border border-[#F5D5D9]">
                          {stage.badge}
                        </span>
                      )}
                      <span
                        className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${
                          isActive
                            ? 'text-[#7A1C28] scale-110'
                            : 'text-[#7A7471] group-hover:text-[#7A1C28]'
                        }`}
                      >
                        {stage.icon}
                      </span>
                    </div>
                  </div>

                  {/* Stage Title & Description */}
                  <div>
                    <h3
                      className={`font-serif text-xl sm:text-2xl font-bold tracking-tight ${
                        isActive ? 'text-[#7A1C28]' : 'text-[#1F1B19]'
                      }`}
                    >
                      {stage.title}
                    </h3>
                    <p className="text-[11px] text-[#5A5451] mt-1 leading-snug">
                      {stage.subtitle}
                    </p>
                  </div>
                </div>

                {/* Interactive Dynamic Visuals for each stage */}
                <div className="my-3 py-2.5 px-3 bg-[#FAF7F5] rounded-2xl border border-[#EFE9E5] space-y-2">
                  {stage.id === 0 && (
                    /* Stage 1: CONNECT Dynamic Flow */
                    <div className="space-y-1.5 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-[#7A7471]">
                        <span>INGESTION FLOW</span>
                        <span className="text-[#16A34A] font-bold">● LIVE</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? 'bg-[#7A1C28] animate-ping' : 'bg-[#D5CBC5]'
                          }`}
                        />
                        <span className="text-[#1F1B19] font-bold">4,390 Hubs Synced</span>
                      </div>
                    </div>
                  )}

                  {stage.id === 1 && (
                    /* Stage 2: PREDICT Dynamic Flow */
                    <div className="space-y-1.5 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-[#7A7471]">
                        <span>AI RISK SENTINEL</span>
                        <span className="text-[#D97706] font-bold">GBDT R²=0.76</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? 'bg-[#DC2626] animate-pulse' : 'bg-[#D5CBC5]'
                          }`}
                        />
                        <span className="text-[#1F1B19] font-bold">0 Expiries Detected</span>
                      </div>
                    </div>
                  )}

                  {stage.id === 2 && (
                    /* Stage 3: OPTIMIZE Dynamic Flow */
                    <div className="space-y-1.5 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-[#7A7471]">
                        <span>SOLVER NETWORK</span>
                        <span className="text-[#2563EB] font-bold">HiGHS LP</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? 'bg-[#2563EB] animate-ping' : 'bg-[#D5CBC5]'
                          }`}
                        />
                        <span className="text-[#1F1B19] font-bold">745 Optimal Routes</span>
                      </div>
                    </div>
                  )}

                  {stage.id === 3 && (
                    /* Stage 4: ACT Dynamic Flow */
                    <div className="space-y-1.5 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-[#7A7471]">
                        <span>DISPATCH & DONORS</span>
                        <span className="text-[#16A34A] font-bold">VERIFIED</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? 'bg-[#16A34A] animate-pulse' : 'bg-[#D5CBC5]'
                          }`}
                        />
                        <span className="text-[#1F1B19] font-bold">1-Click Authorized</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub-Items Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#EFE9E5]">
                  {stage.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                        isActive
                          ? 'bg-[#FCECEE] text-[#7A1C28]'
                          : 'bg-[#F2ECE8] text-[#5A5451] group-hover:bg-[#FCECEE] group-hover:text-[#7A1C28]'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Click for detail hint */}
                <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#7A1C28] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn details</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* =========================================================================
          4. MODEL TRANSPARENCY & TECHNICAL STRIP
          ========================================================================= */}
      <section className="relative z-10 w-full max-w-5xl mx-auto my-auto">
        <div className="p-3 sm:p-3.5 bg-white/90 backdrop-blur-xs rounded-2xl border border-[#E8E1DC] shadow-2xs grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="border-r border-[#EFE9E5] pr-2 last:border-r-0">
            <span className="text-[9px] font-bold text-[#7A7471] uppercase tracking-wider block font-mono">
              01 DATA LAYER
            </span>
            <p className="text-[11px] font-bold text-[#1F1B19] mt-0.5">Inventory & Demand</p>
            <p className="text-[9.5px] text-[#5A5451]">4,390 Blood Banks</p>
          </div>

          <div className="border-r border-[#EFE9E5] pr-2 last:border-r-0">
            <span className="text-[9px] font-bold text-[#7A7471] uppercase tracking-wider block font-mono">
              02 AI PREDICTION
            </span>
            <p className="text-[11px] font-bold text-[#1F1B19] mt-0.5">Risk & Forecast</p>
            <p className="text-[9.5px] text-[#5A5451]">GBDT + Isolation Forest</p>
          </div>

          <div className="border-r border-[#EFE9E5] pr-2 last:border-r-0">
            <span className="text-[9px] font-bold text-[#7A7471] uppercase tracking-wider block font-mono">
              03 OPTIMIZATION
            </span>
            <p className="text-[11px] font-bold text-[#1F1B19] mt-0.5">Routing & Multi-Stop</p>
            <p className="text-[9.5px] text-[#5A5451]">HiGHS Linear Programming</p>
          </div>

          <div>
            <span className="text-[9px] font-bold text-[#7A7471] uppercase tracking-wider block font-mono">
              04 DECISION
            </span>
            <p className="text-[11px] font-bold text-[#1F1B19] mt-0.5">Human Authorization</p>
            <p className="text-[9.5px] text-[#5A5451]">Telegram & Audit Ledger</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. BOTTOM TRUST BAR & CTA
          ========================================================================= */}
      <footer className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 pb-1 border-t border-[#E8E1DC]/70 text-xs">
        {/* Trust Tokens */}
        <div className="flex items-center gap-4 sm:gap-6 text-[#5A5451] font-bold uppercase tracking-widest text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-[#16A34A]">
              verified_user
            </span>
            <span>HUMAN-APPROVED</span>
          </div>

          <span className="text-[#D5CBC5]">•</span>

          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-[#7A1C28]">
              bolt
            </span>
            <span>REAL-TIME</span>
          </div>

          <span className="text-[#D5CBC5]">•</span>

          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-[#2563EB]">
              lock
            </span>
            <span>AUDITABLE</span>
          </div>
        </div>

        {/* Enter CTA Secondary */}
        <button
          onClick={onEnterPravah}
          className="text-xs font-bold uppercase tracking-wider text-[#7A1C28] hover:text-[#63141F] transition-colors cursor-pointer flex items-center gap-1.5 group"
        >
          <span>Explore Live Decision Flow</span>
          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </button>
      </footer>

      {/* =========================================================================
          6. MICRO-EXPLANATION MODAL (ON STAGE CLICK)
          ========================================================================= */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1DC] shadow-2xl space-y-5 relative">
            <button
              onClick={() => setSelectedStage(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF7F5] hover:bg-[#F2ECE8] text-[#5A5451] flex items-center justify-center cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FCECEE] text-[#7A1C28] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">
                  {selectedStage.icon}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#7A7471] uppercase tracking-wider">
                  STAGE {selectedStage.num} OF 04
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1F1B19]">
                  {selectedStage.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#5A5451] leading-relaxed">
              {selectedStage.detailedDesc}
            </p>

            {/* Core Tech Stack */}
            <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7471] font-mono block">
                ALGORITHMIC FOUNDATION
              </span>
              <ul className="text-xs text-[#1F1B19] space-y-1.5 font-medium">
                {selectedStage.techStack.map((tech) => (
                  <li key={tech} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7A1C28]" />
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSelectedStage(null)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-[#5A5451] hover:bg-[#FAF7F5] transition-colors cursor-pointer"
              >
                Continue Overview
              </button>

              <button
                onClick={onEnterPravah}
                className="px-6 py-3 bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>Enter Workspace</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
