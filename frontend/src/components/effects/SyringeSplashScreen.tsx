import { useState } from 'react'

interface SyringeSplashScreenProps {
  onComplete: () => void
}

export function SyringeSplashScreen({ onComplete }: SyringeSplashScreenProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase2, setPhase2] = useState(false)
  const [showLogo, setShowLogo] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  const handleStart = () => {
    if (hasStarted) return
    setHasStarted(true)

    // Animate Counter 0 -> 100% over 2000ms
    const duration = 2000
    const intervalTime = 20
    const steps = duration / intervalTime
    const increment = 100 / steps

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(timer)
          triggerPhase2()
          return 100
        }
        return next
      })
    }, intervalTime)
  }

  const triggerPhase2 = () => {
    setPhase2(true)

    // Reveal PRAVAH text when the screen is completely covered in red (~2000ms)
    setTimeout(() => {
      setShowLogo(true)
    }, 2000)

    // Complete splash screen and transition smoothly to landing page
    setTimeout(() => {
      setIsFadingOut(true)
      setTimeout(() => {
        onComplete()
      }, 700)
    }, 3800)
  }

  // Auto-start prompt pulse or click anywhere
  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#fcf9f8] text-[#1b1b1c] flex flex-col justify-center items-center select-none overflow-hidden transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Skip Button in Top Right */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 text-xs font-mono font-bold uppercase tracking-widest text-[#7A7471] hover:text-[#7A1C28] px-4 py-2 rounded-full border border-[#E8E1DC] bg-white/80 hover:bg-white transition-all cursor-pointer shadow-2xs z-50"
      >
        Skip Intro →
      </button>

      {/* Syringe SVG Container */}
      <div
        onClick={handleStart}
        className="relative w-20 h-52 mb-8 cursor-pointer group transition-transform duration-300 hover:scale-105"
        title="Click to initialize PRAVAH"
      >
        <svg
          className="w-full h-full stroke-[#1b1b1c] stroke-[2] fill-none overflow-visible"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 100 300"
        >
          {/* Drop Parts */}
          <path
            id="blood-drop"
            d="M50 20 C50 20, 45 28, 45 32 A5 5 0 0 0 55 32 C55 28, 50 20, 50 20 Z"
            className={phase2 ? 'animate-fall-drop fill-[#7a1a21] stroke-none' : 'opacity-0 fill-[#7a1a21] stroke-none'}
          />

          <circle
            id="blood-circle"
            cx="50"
            cy="162"
            r="5"
            className={phase2 ? 'animate-circle-expand fill-[#7a1a21] stroke-none' : 'opacity-0 fill-[#7a1a21] stroke-none'}
            style={{ transformOrigin: '50px 162px' }}
          />

          {/* Syringe Parts */}
          <g
            id="syringe-parts"
            className={`transition-opacity duration-500 ${phase2 ? 'opacity-0' : 'opacity-100'}`}
          >
            {/* Needle */}
            <line x1="50" x2="50" y1="20" y2="60" />
            {/* Barrel */}
            <rect height="150" rx="4" width="40" x="30" y="60" />
            {/* Measurement lines */}
            <line x1="30" x2="40" y1="80" y2="80" />
            <line x1="30" x2="45" y1="110" y2="110" />
            <line x1="30" x2="40" y1="140" y2="140" />
            <line x1="30" x2="45" y1="170" y2="170" />
            {/* Plunger base */}
            <rect height="10" rx="2" width="50" x="25" y="210" />
            {/* Plunger rod */}
            <rect height="60" width="10" x="45" y="220" />
            {/* Plunger handle */}
            <rect height="10" rx="2" width="60" x="20" y="280" />

            {/* The Blood Fill Animation */}
            <rect
              id="fill-rect"
              className="fill-[#7a1a21] transition-all duration-2000 ease-in-out"
              height={hasStarted ? 148 : 0}
              rx="2"
              width="38"
              x="31"
              y={hasStarted ? 61 : 209}
            />
          </g>
        </svg>

        {/* Pulse prompt if not clicked yet */}
        {!hasStarted && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-mono font-bold uppercase tracking-widest text-[#7a1a21] animate-pulse bg-[#FCECEE] px-3 py-1 rounded-full border border-[#F5D5D9]">
            Click to Activate
          </div>
        )}
      </div>

      {/* Percentage Counter */}
      <div
        id="counter"
        className={`font-serif text-3xl text-[#1b1b1c] transition-opacity duration-300 ${
          hasStarted && !phase2 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {Math.floor(progress)}%
      </div>

      {/* Logo Reveal (Text Only over Red Screen) */}
      <div
        id="logo-reveal"
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none transition-all duration-700 z-50 ${
          showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <h1 className="font-serif text-5xl sm:text-7xl font-extrabold mb-3 tracking-tight text-white drop-shadow-lg">
          PRAVAH
        </h1>
        <p className="font-serif text-xl sm:text-2xl italic text-white/95 font-semibold drop-shadow-md">
          The Lifeline in Motion
        </p>
      </div>

      {/* Embedded CSS Keyframes from user's provided design */}
      <style>{`
        @keyframes dropFall {
          0% {
            opacity: 0;
            transform: translate(0, 0);
          }
          5% {
            opacity: 1;
            transform: translate(0, 0);
          }
          23% {
            opacity: 1;
            transform: translate(0, 130px);
          }
          24%,
          100% {
            opacity: 0;
            transform: translate(0, 130px);
          }
        }

        @keyframes circleExpand {
          0%,
          23% {
            opacity: 0;
            transform: scale(0);
          }
          24% {
            opacity: 1;
            transform: scale(1);
          }
          75% {
            opacity: 1;
            transform: scale(350);
          }
          100% {
            opacity: 0;
            transform: scale(500);
          }
        }

        .animate-fall-drop {
          animation: dropFall 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-circle-expand {
          animation: circleExpand 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  )
}
