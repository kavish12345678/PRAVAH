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
  subtitleHtml: {
    prefix?: string
    bold1: string
    mid?: string
    bold2: string
    suffix?: string
  }
  icon: string
  tags: string[]
  badge?: string
  statusMsg: string
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
      subtitleHtml: {
        bold1: 'Unifies',
        mid: ' blood-bank ',
        bold2: 'inventory, demand & network data.',
      },
      icon: 'hub',
      tags: ['Inventory', 'Demand', 'Network'],
      statusMsg: '● Synchronizing real-time blood-network intelligence across 4,390 hubs...',
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
      subtitleHtml: {
        prefix: 'AI detects ',
        bold1: 'shortages, expiry',
        mid: ' & ',
        bold2: 'cold-chain risks.',
      },
      icon: 'psychology',
      tags: ['Shortage', 'Expiry', 'Cold Chain'],
      statusMsg: '● Detecting emerging supply shortages, expiry risk & cold-chain thermal spikes...',
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
      subtitleHtml: {
        prefix: 'ML + LP find the ',
        bold1: 'best source, route',
        mid: ' & ',
        bold2: 'multi-stop plan.',
      },
      icon: 'alt_route',
      badge: 'ML + LP',
      tags: ['Source', 'Route', 'Multi-Stop'],
      statusMsg: '● Computing mathematical route & multi-stop consolidation plan (HiGHS LP)...',
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
      subtitleHtml: {
        bold1: 'Transfers blood or mobilizes nearby donors',
        mid: ' when ',
        bold2: 'needed.',
      },
      icon: 'verified',
      tags: ['Transfer', 'Donor Alert', 'Human Check'],
      statusMsg: '● Preparing human-approved clinical intervention & localized Telegram alerts...',
      detailedTitle: '04 · Clinical Authorization, Telegram Mobilization & Audit Trail',
      detailedDesc:
        'Medical Directors review and authorize dispatches with 1-click execution, mobilize nearby voluntary donors via localized Telegram broadcasts, and log every decision into a permanent, verifiable audit trail.',
      techStack: ['1-Click Dispatch Authorization', 'Direct Telegram Bot Mobilization', 'Immutable Cryptographic Audit Trail'],
      metrics: '100% Human Supervised · Instant Telegram Push',
      actionLabel: 'Launch Operations',
    },
  ]

  // Continuous Attention-Control Loop: Stage-weighted timing
  useEffect(() => {
    if (isPaused || selectedStage !== null) return

    // OPTIMIZE stage gets 3000ms, others get 2500ms
    const duration = activeStage === 2 ? 3000 : 2500

    const timer = setTimeout(() => {
      setActiveStage((prev) => (prev + 1) % STAGES.length)
    }, duration)

    return () => clearTimeout(timer)
  }, [activeStage, isPaused, selectedStage, STAGES.length])

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
    const nodeCount = 28
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1.2,
      baseAlpha: Math.random() * 0.2 + 0.08,
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw faint connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.06
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
    <div className="h-screen w-screen overflow-hidden bg-[#FAF7F5] text-[#1F1B19] font-sans antialiased flex flex-col justify-between p-4 sm:p-5 lg:p-6 select-none relative">
      {/* Background Animated Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-60"
      />

      {/* Subtle Ambient Vignette & Warm Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#7A1C28]/4 via-[#9E2A38]/3 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* =========================================================================
          1. TOP HEADER (BRAND + LANGUAGE + ENTER CTA)
          ========================================================================= */}
      <header className="relative z-10 flex justify-between items-center px-2 sm:px-4 py-1 border-b border-[#E8E1DC]/70">
        {/* Brand & Tagline - Clean without Clinical Flow badge */}
        <div className="flex items-center gap-3">
          <img
            src="/pravah-logo.png"
            alt="PRAVAH Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0 drop-shadow-xs"
          />
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1F1B19] leading-none">
              PRAVAH
            </h1>
            <p className="text-[11px] text-[#7A1C28] font-bold italic tracking-wide mt-0.5">
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
      <section className="relative z-10 text-center max-w-4xl mx-auto space-y-1 my-auto pt-0.5">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-white/85 backdrop-blur-xs rounded-full border border-[#E8E1DC] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span className="text-[10px] font-bold text-[#5A5451] uppercase tracking-widest font-mono">
            {t('common.tagline')} · NATIONAL CLINICAL INTELLIGENCE
          </span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1F1B19] tracking-tight leading-tight">
          From Blood Data to Life-Saving Action.
        </h2>

        <p className="text-xs sm:text-sm text-[#5A5451] max-w-2xl mx-auto leading-relaxed">
          PRAVAH turns fragmented blood-supply data into predictive, optimized, and human-approved decisions.
        </p>
      </section>

      {/* =========================================================================
          3. 4-STAGE HORIZONTAL WORKFLOW (STRONG ACTIVE HIGHLIGHT & LIFT)
          ========================================================================= */}
      <section
        className="relative z-10 w-full max-w-[1240px] mx-auto my-auto px-2"
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Animated Blood-Flow Connecting Pathway between cards */}
        <div className="hidden lg:block absolute top-[48px] left-[8%] right-[8%] h-[2.5px] bg-[#E8E1DC]/80 pointer-events-none z-0">
          <div
            className="h-full bg-gradient-to-r from-transparent via-[#7A1C28] to-transparent transition-all duration-700 relative"
            style={{
              width: '25%',
              transform: `translateX(${activeStage * 100}%)`,
            }}
          >
            {/* Moving Blood Flow Particle */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#7A1C28] shadow-lg shadow-[#7A1C28]/80 animate-ping" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#7A1C28]" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 relative">
          {STAGES.map((stage, idx) => {
            const isActive = activeStage === idx

            return (
              <div
                key={stage.id}
                onMouseEnter={() => {
                  setIsPaused(true)
                  setActiveStage(idx)
                }}
                onClick={() => setSelectedStage(stage)}
                className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-500 cursor-pointer flex flex-col justify-between border select-none group ${
                  isActive
                    ? 'bg-white border-2 border-[#7A1C28] ring-4 ring-[#7A1C28]/15 shadow-2xl shadow-[#7A1C28]/20 scale-[1.08] -translate-y-2 z-30 opacity-100'
                    : 'bg-white/70 backdrop-blur-xs border-[#E8E1DC] hover:border-[#7A1C28]/50 hover:bg-white shadow-2xs opacity-55 hover:opacity-90 scale-[0.96] z-10 saturate-80'
                }`}
              >
                {/* Active Stage Spotlight Glow */}
                {isActive && (
                  <div className="absolute -inset-3 bg-radial from-[#7A1C28]/12 via-transparent to-transparent rounded-3xl blur-xl -z-10 pointer-events-none" />
                )}

                {/* Top Number, Active Pill & Icon Row */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-[11px] font-bold font-mono tracking-widest ${
                        isActive ? 'text-[#7A1C28]' : 'text-[#7A7471]'
                      }`}
                    >
                      {stage.num}
                    </span>

                    {/* Active State Indicator Pill */}
                    {isActive && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#FCECEE] rounded-full border border-[#F5D5D9] text-[#7A1C28] text-[9px] font-bold font-mono uppercase tracking-wider animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7A1C28] animate-ping" />
                        <span>ACTIVE</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      {stage.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider font-mono border transition-all ${
                            isActive
                              ? 'bg-[#7A1C28] text-white border-[#7A1C28] shadow-xs scale-105'
                              : 'bg-[#FCECEE] text-[#7A1C28] border-[#F5D5D9]'
                          }`}
                        >
                          {stage.badge}
                        </span>
                      )}
                      <span
                        className={`material-symbols-outlined text-[22px] transition-all duration-300 ${
                          isActive
                            ? 'text-[#7A1C28] scale-115 rotate-3'
                            : 'text-[#7A7471] group-hover:text-[#7A1C28]'
                        }`}
                      >
                        {stage.icon}
                      </span>
                    </div>
                  </div>

                  {/* Stage Title (Significantly Stronger & Animated when active) */}
                  <div>
                    <h3
                      className={`font-serif tracking-tight transition-all duration-300 ${
                        isActive
                          ? 'text-2xl sm:text-[28px] font-extrabold text-[#7A1C28] drop-shadow-2xs translate-y-0 opacity-100'
                          : 'text-lg sm:text-xl font-bold text-[#3A3533]'
                      }`}
                    >
                      {stage.title}
                    </h3>
                    <p
                      className={`text-[11px] mt-1 leading-snug transition-colors ${
                        isActive ? 'text-[#3F3936]' : 'text-[#6A6461]'
                      }`}
                    >
                      {stage.subtitleHtml.prefix}
                      <strong className={isActive ? 'text-[#1F1B19] font-bold' : ''}>
                        {stage.subtitleHtml.bold1}
                      </strong>
                      {stage.subtitleHtml.mid}
                      <strong className={isActive ? 'text-[#7A1C28] font-bold' : ''}>
                        {stage.subtitleHtml.bold2}
                      </strong>
                      {stage.subtitleHtml.suffix}
                    </p>
                  </div>
                </div>

                {/* Interactive Dynamic Micro-Animations for each stage */}
                <div
                  className={`my-3 py-2.5 px-3 rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? 'bg-[#FFF8F8] border-[#F5D5D9] shadow-2xs'
                      : 'bg-[#FAF7F5] border-[#EFE9E5]'
                  }`}
                >
                  {stage.id === 0 && (
                    /* Stage 1: CONNECT Dynamic Flow */
                    <div className="space-y-1.5 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-[#7A7471]">
                        <span className="font-bold">INGESTION FLOW</span>
                        <span className="text-[#16A34A] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping" />
                          LIVE
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isActive ? 'bg-[#7A1C28] animate-ping' : 'bg-[#D5CBC5]'
                          }`}
                        />
                        <span className="text-[#1F1B19] font-bold text-[11px]">
                          4,390 Hubs Synced
                        </span>
                      </div>
                    </div>
                  )}

                  {stage.id === 1 && (
                    /* Stage 2: PREDICT Dynamic Flow */
                    <div className="space-y-1.5 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-[#7A7471]">
                        <span className="font-bold">AI RISK SENTINEL</span>
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded-sm text-[9px] ${
                            isActive
                              ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                              : 'text-[#D97706]'
                          }`}
                        >
                          GBDT R²=0.76
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isActive ? 'bg-[#DC2626] animate-pulse' : 'bg-[#D5CBC5]'
                          }`}
                        />
                        <span className="text-[#1F1B19] font-bold text-[11px]">
                          0 Expiries Detected
                        </span>
                      </div>
                    </div>
                  )}

                  {stage.id === 2 && (
                    /* Stage 3: OPTIMIZE Dynamic Flow (Special Solver Convergence) */
                    <div className="space-y-1.5 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-[#7A7471]">
                        <span className="font-bold">SOLVER NETWORK</span>
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded-sm text-[9px] ${
                            isActive
                              ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]'
                              : 'text-[#2563EB]'
                          }`}
                        >
                          HiGHS LP
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isActive ? 'bg-[#2563EB] animate-ping' : 'bg-[#D5CBC5]'
                          }`}
                        />
                        <span className="text-[#1F1B19] font-bold text-[11px]">
                          {isActive ? '● BEST ROUTE CONVERGED' : '745 Optimal Routes'}
                        </span>
                      </div>
                    </div>
                  )}

                  {stage.id === 3 && (
                    /* Stage 4: ACT Dynamic Flow */
                    <div className="space-y-1.5 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-[#7A7471]">
                        <span className="font-bold">DISPATCH & DONORS</span>
                        <span className="text-[#16A34A] font-bold text-[9px] bg-[#E8F8EE] px-1.5 py-0.2 rounded-sm border border-[#BBF7D0]">
                          VERIFIED
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isActive ? 'bg-[#16A34A] animate-pulse' : 'bg-[#D5CBC5]'
                          }`}
                        />
                        <span className="text-[#1F1B19] font-bold text-[11px]">
                          1-Click Authorized
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub-Items Feature Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#EFE9E5]">
                  {stage.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md transition-all duration-300 ${
                        isActive
                          ? 'bg-[#FCECEE] text-[#7A1C28] border border-[#F5D5D9] scale-102'
                          : 'bg-[#F2ECE8] text-[#5A5451]'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Click for detail hint */}
                <div
                  className={`mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#7A1C28] transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <span>Click for algorithmic depth</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Dynamic Real-Time Intelligence Status Line */}
        <div className="mt-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/90 backdrop-blur-xs rounded-full border border-[#E8E1DC] shadow-2xs text-[11px] font-mono text-[#1F1B19]">
            <span className="w-2 h-2 rounded-full bg-[#7A1C28] animate-ping shrink-0" />
            <span className="font-semibold">{STAGES[activeStage].statusMsg}</span>
          </div>
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
          5. BOTTOM TRUST BAR WITH DYNAMIC RELEVANCE EMPHASIS
          ========================================================================= */}
      <footer className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 pb-1 border-t border-[#E8E1DC]/70 text-xs">
        {/* Trust Tokens with Stage-Specific Emphasis */}
        <div className="flex items-center gap-4 sm:gap-6 text-[#5A5451] font-bold uppercase tracking-widest text-[10px] font-mono">
          <div
            className={`flex items-center gap-1.5 transition-all duration-300 ${
              activeStage === 3 ? 'text-[#16A34A] scale-105 font-extrabold' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-[#16A34A]">
              verified_user
            </span>
            <span>HUMAN-APPROVED</span>
          </div>

          <span className="text-[#D5CBC5]">•</span>

          <div
            className={`flex items-center gap-1.5 transition-all duration-300 ${
              activeStage === 1 || activeStage === 2
                ? 'text-[#7A1C28] scale-105 font-extrabold'
                : ''
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-[#7A1C28]">
              bolt
            </span>
            <span>REAL-TIME</span>
          </div>

          <span className="text-[#D5CBC5]">•</span>

          <div
            className={`flex items-center gap-1.5 transition-all duration-300 ${
              activeStage === 2 || activeStage === 3
                ? 'text-[#2563EB] scale-105 font-extrabold'
                : ''
            }`}
          >
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
