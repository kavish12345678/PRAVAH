import { useEffect, useRef, useState } from 'react'
import { LanguageDropdown } from '../../components/common/LanguageDropdown'
import { SyringeSplashScreen } from '../../components/effects/SyringeSplashScreen'
import { useLanguage } from '../../i18n/LanguageContext'

interface Step0WelcomeProps {
  onEnterPravah: () => void
}

interface StageData {
  id: number
  key: string
  num: string
  title: string
  description: string
  supportText: string
  icon: string
  tags: string[]
  activeStatus: string
  subMetric: string
  statusMsg: string
  detailedTitle: string
  detailedDesc: string
  features: string[]
}

export function Step0Welcome({ onEnterPravah }: Step0WelcomeProps) {
  const { t } = useLanguage()
  const [showSplash, setShowSplash] = useState(true)
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
      description: 'Brings blood-bank stock, demand and hospital information together.',
      supportText: 'Know what is available and where it is needed.',
      icon: 'hub',
      tags: ['Blood Stock', 'Hospital Needs', 'Network'],
      activeStatus: 'BLOOD NETWORK CONNECTED',
      subMetric: '4,390 Hubs Connected',
      statusMsg: 'Bringing blood-supply information together...',
      detailedTitle: '01 · Connect',
      detailedDesc:
        'PRAVAH connects blood banks and hospitals across the region, bringing live inventory, hospital requests, and delivery networks into a single clear picture.',
      features: ['Live Blood Bank Stock', 'Hospital Daily Needs', 'Regional Delivery Map'],
    },
    {
      id: 1,
      key: 'predict',
      num: '02',
      title: 'PREDICT',
      description: 'Finds shortages and risks before they become emergencies.',
      supportText: 'See what may be needed before it runs out.',
      icon: 'psychology',
      tags: ['Shortages', 'Expiry', 'Cold Chain'],
      activeStatus: 'RISK CHECK COMPLETE',
      subMetric: 'Shortages Prevented',
      statusMsg: 'Looking ahead for shortages and risks...',
      detailedTitle: '02 · Predict',
      detailedDesc:
        'PRAVAH analyzes daily patient demand and temperature records to spot upcoming blood shortages, expiring units, and temperature risks days in advance.',
      features: ['Early Shortage Warnings', 'Expiry Date Tracking', 'Safe Temperature Monitoring'],
    },
    {
      id: 2,
      key: 'optimize',
      num: '03',
      title: 'OPTIMIZE',
      description: 'Finds the best way to move blood where it is needed.',
      supportText: 'Choose the right source, route and delivery plan.',
      icon: 'alt_route',
      tags: ['Best Source', 'Best Route', 'Multi-Stop'],
      activeStatus: 'BEST ROUTE FOUND',
      subMetric: 'Optimal Path Selected',
      statusMsg: 'Finding the best way to move blood...',
      detailedTitle: '03 · Optimize',
      detailedDesc:
        'PRAVAH calculates the fastest and safest routes between hospitals with extra blood and hospitals in need, combining deliveries to save critical transit time.',
      features: ['Fastest Hospital Routes', 'Smart Multi-Hospital Pickup', 'Zero-Wastage Matching'],
    },
    {
      id: 3,
      key: 'act',
      num: '04',
      title: 'ACT',
      description: 'Turns the recommendation into timely action.',
      supportText: 'Move blood or call nearby eligible donors when needed.',
      icon: 'verified',
      tags: ['Blood Transfer', 'Donor Alert', 'Human Approval'],
      activeStatus: 'ACTION READY',
      subMetric: 'Doctor Approved',
      statusMsg: 'Preparing the right action...',
      detailedTitle: '04 · Act',
      detailedDesc:
        'Hospital directors approve transfers with 1 click, dispatch blood immediately, or send urgent requests to nearby voluntary donors on Telegram.',
      features: ['1-Click Hospital Approval', 'Nearby Donor Telegram Alert', 'Full Decision Log'],
    },
  ]

  // Continuous Attention-Control Loop: Stage-weighted timing (starts only after splash screen completes)
  useEffect(() => {
    if (showSplash || isPaused || selectedStage !== null) return

    const duration = activeStage === 2 ? 3000 : 2500

    const timer = setTimeout(() => {
      setActiveStage((prev) => (prev + 1) % STAGES.length)
    }, duration)

    return () => clearTimeout(timer)
  }, [showSplash, activeStage, isPaused, selectedStage, STAGES.length])

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
    const nodeCount = 26
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 2 + 1.2,
      baseAlpha: Math.random() * 0.18 + 0.06,
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
            const alpha = (1 - dist / 150) * 0.05
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
    <>
      {/* Interactive Syringe Splash Screen */}
      {showSplash && (
        <SyringeSplashScreen
          onComplete={() => {
            setActiveStage(0)
            setShowSplash(false)
          }}
        />
      )}

      <div className="h-screen w-screen overflow-hidden bg-[#FAF7F5] text-[#1F1B19] font-sans antialiased flex flex-col justify-between p-4 sm:p-5 lg:p-7 select-none relative">
        {/* Background Animated Network Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-0 opacity-50"
        />

        {/* Subtle Ambient Vignette */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-gradient-to-r from-[#7A1C28]/4 via-[#9E2A38]/3 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

        {/* =========================================================================
            1. TOP HEADER (PROMINENT PRAVAH BRANDING + LANGUAGE + ENTER CTA)
            ========================================================================= */}
        <header className="relative z-10 flex justify-between items-center px-2 sm:px-4 py-1.5 border-b border-[#E8E1DC]/70">
          {/* Prominent PRAVAH Logo & Branding */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <img
              src="/pravah-logo.png"
              alt="PRAVAH Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0 drop-shadow-sm transition-transform hover:scale-105"
            />
            <div>
              <h1 className="font-serif text-2xl sm:text-[34px] font-extrabold tracking-tight text-[#1F1B19] leading-none">
                PRAVAH
              </h1>
              <p className="text-xs sm:text-[13px] text-[#7A1C28] font-semibold italic tracking-wide mt-1">
                The Lifeline in Motion
              </p>
            </div>
          </div>

          {/* Right CTA & Language Controls */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={() => setShowSplash(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-semibold text-[#7A7471] hover:text-[#7A1C28] px-3 py-1.5 rounded-full border border-[#E8E1DC] bg-white/70 hover:bg-white transition-colors cursor-pointer"
              title="Replay Intro Animation"
            >
              <span className="material-symbols-outlined text-[15px]">replay</span>
              <span>Intro</span>
            </button>

            <LanguageDropdown />

            <button
              onClick={onEnterPravah}
              className="group relative bg-gradient-to-r from-[#7A1C28] to-[#9E2A38] hover:from-[#63141F] hover:to-[#7A1C28] text-white px-6 sm:px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg shadow-[#7A1C28]/25 hover:scale-[1.03] flex items-center gap-2.5"
            >
              <span>ENTER PRAVAH</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </header>

      {/* =========================================================================
          2. MAIN HEADLINE & OUTCOME PROPOSITION
          ========================================================================= */}
      <section className="relative z-10 text-center max-w-4xl mx-auto space-y-1.5 my-auto pt-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/90 backdrop-blur-xs rounded-full border border-[#E8E1DC] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span className="text-[10.5px] font-bold text-[#5A5451] uppercase tracking-widest font-mono">
            {t('common.tagline')} · NATIONAL BLOOD DECISION FLOW
          </span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#1F1B19] tracking-tight leading-tight">
          From Blood Data to Life-Saving Action.
        </h2>

        <p className="text-xs sm:text-sm text-[#5A5451] max-w-2xl mx-auto leading-relaxed">
          PRAVAH turns blood-supply information into timely decisions that help get blood where it is needed.
        </p>
      </section>

      {/* =========================================================================
          3. 4-STAGE HORIZONTAL WORKFLOW (OUTCOME-FOCUSED & SIMPLE LANGUAGE)
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
                    : 'bg-white/75 backdrop-blur-xs border-[#E8E1DC] hover:border-[#7A1C28]/50 hover:bg-white shadow-2xs opacity-55 hover:opacity-90 scale-[0.96] z-10 saturate-80'
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
                    {isActive ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FCECEE] rounded-full border border-[#F5D5D9] text-[#7A1C28] text-[9.5px] font-bold font-mono uppercase tracking-wider animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7A1C28] animate-ping" />
                        <span>ACTIVE</span>
                      </div>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
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

                  {/* Stage Title */}
                  <div>
                    <h3
                      className={`font-serif tracking-tight transition-all duration-300 ${
                        isActive
                          ? 'text-2xl sm:text-[28px] font-extrabold text-[#7A1C28] drop-shadow-2xs'
                          : 'text-lg sm:text-xl font-bold text-[#3A3533]'
                      }`}
                    >
                      {stage.title}
                    </h3>
                    <p
                      className={`text-[11.5px] mt-1 leading-snug font-medium transition-colors ${
                        isActive ? 'text-[#1F1B19]' : 'text-[#5A5451]'
                      }`}
                    >
                      {stage.description}
                    </p>
                  </div>
                </div>

                {/* Plain-Language Outcome Status Box */}
                <div
                  className={`my-3 py-2.5 px-3 rounded-2xl border transition-all duration-300 space-y-1.5 ${
                    isActive
                      ? 'bg-[#FFF8F8] border-[#F5D5D9] shadow-2xs'
                      : 'bg-[#FAF7F5] border-[#EFE9E5]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-[#7A7471]">{stage.activeStatus}</span>
                    <span className="text-[#16A34A] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping" />
                      LIVE
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#1F1B19]">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isActive ? 'bg-[#7A1C28] animate-ping' : 'bg-[#D5CBC5]'
                      }`}
                    />
                    <span>{stage.supportText}</span>
                  </div>
                </div>

                {/* Sub-Items Feature Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#EFE9E5]">
                  {stage.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-md transition-all duration-300 ${
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
                  <span>Learn more</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Dynamic Plain-Language Status Line */}
        <div className="mt-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/90 backdrop-blur-xs rounded-full border border-[#E8E1DC] shadow-2xs text-[11px] font-mono text-[#1F1B19]">
            <span className="w-2 h-2 rounded-full bg-[#7A1C28] animate-ping shrink-0" />
            <span className="font-semibold">● {STAGES[activeStage].statusMsg}</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. OUTCOME PIPELINE SUMMARY STRIP
          ========================================================================= */}
      <section className="relative z-10 w-full max-w-4xl mx-auto my-auto text-center">
        <div className="py-2.5 px-5 bg-white/90 backdrop-blur-xs rounded-full border border-[#E8E1DC] shadow-2xs inline-flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-[13px] font-semibold text-[#1F1B19] flex-wrap">
          <span className="text-[#7A1C28] font-bold">See the Supply</span>
          <span className="text-[#D5CBC5]">→</span>
          <span>Predict the Need</span>
          <span className="text-[#D5CBC5]">→</span>
          <span>Find the Best Route</span>
          <span className="text-[#D5CBC5]">→</span>
          <span className="text-[#16A34A] font-bold">Save Time & Lives</span>
        </div>
      </section>

      {/* =========================================================================
          5. BOTTOM SIGNATURE TAKEAWAY & SECONDARY CTA
          ========================================================================= */}
      <footer className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 pb-1 border-t border-[#E8E1DC]/70 text-xs">
        {/* Signature Statement: Right Blood. Right Place. Right Time. */}
        <div className="font-serif text-sm sm:text-base text-[#1F1B19] tracking-tight">
          <span>Right Blood. </span>
          <span className="text-[#7A1C28] font-bold">Right Place.</span>
          <span> Right Time.</span>
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
          6. MICRO-EXPLANATION MODAL (ON STAGE CLICK - SIMPLE LANGUAGE)
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
                  {selectedStage.detailedTitle}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#5A5451] leading-relaxed">
              {selectedStage.detailedDesc}
            </p>

            {/* Core Features */}
            <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8E1DC] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7471] font-mono block">
                WHAT PRAVAH DELIVERS
              </span>
              <ul className="text-xs text-[#1F1B19] space-y-1.5 font-medium">
                {selectedStage.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7A1C28]" />
                    <span>{feat}</span>
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
                Close
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
    </>
  )
}
