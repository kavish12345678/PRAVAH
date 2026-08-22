import React, { useEffect, useState } from 'react'
import './BloodSplashTransition.css'

export interface SplashEventDetail {
  x: number
  y: number
  targetLabel?: string
}

interface ActiveSplash extends SplashEventDetail {
  id: number
}

// Global dispatcher to trigger the signature PRAVAH Blood-Flow Splash
export function triggerBloodSplash(x: number, y: number, targetLabel?: string) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent<SplashEventDetail>('pravah-blood-splash', {
      detail: { x, y, targetLabel },
    })
    window.dispatchEvent(event)
  }
}

export const BloodSplashTransition: React.FC = () => {
  const [splashes, setSplashes] = useState<ActiveSplash[]>([])

  useEffect(() => {
    const handleSplash = (e: Event) => {
      const customEvent = e as CustomEvent<SplashEventDetail>
      const { x, y, targetLabel } = customEvent.detail || {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      }

      const id = Date.now() + Math.random()
      setSplashes((prev) => [...prev, { id, x, y, targetLabel }])

      // Auto-remove after animation completes (900ms)
      setTimeout(() => {
        setSplashes((prev) => prev.filter((s) => s.id !== id))
      }, 900)
    }

    window.addEventListener('pravah-blood-splash', handleSplash)
    return () => window.removeEventListener('pravah-blood-splash', handleSplash)
  }, [])

  if (splashes.length === 0) return null

  return (
    <div className="pravah-splash-container" aria-hidden="true">
      {splashes.map((splash) => (
        <SingleBloodSplash key={splash.id} splash={splash} />
      ))}
    </div>
  )
}

// Organic Droplet Trajectories
const DROPLETS = [
  { dx: -180, dy: -140, r: 8, delay: 40 },
  { dx: 160, dy: -160, r: 10, delay: 60 },
  { dx: -210, dy: 60, r: 7, delay: 50 },
  { dx: 190, dy: 110, r: 9, delay: 70 },
  { dx: -90, dy: -210, r: 6, delay: 30 },
  { dx: 110, dy: -220, r: 8, delay: 80 },
  { dx: -130, dy: 190, r: 7, delay: 60 },
  { dx: 140, dy: 180, r: 6, delay: 90 },
  { dx: 0, dy: -240, r: 11, delay: 50 },
  { dx: 220, dy: -20, r: 8, delay: 70 },
  { dx: -230, dy: -60, r: 6, delay: 40 },
]

const SingleBloodSplash: React.FC<{ splash: ActiveSplash }> = ({ splash }) => {
  const { x, y, targetLabel } = splash

  return (
    <div
      className="pravah-splash-origin"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {/* 1. Concentric Organic Blood-Flow SVG Blob */}
      <svg
        viewBox="0 0 400 400"
        className="pravah-splash-svg animate-blood-splash"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="bloodCoreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8A1C28" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#7A1C28" stopOpacity="0.88" />
            <stop offset="85%" stopColor="#5B101A" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#400A12" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="bloodVeilGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A32435" stopOpacity="0.75" />
            <stop offset="65%" stopColor="#7A1C28" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#7A1C28" stopOpacity="0" />
          </radialGradient>

          <filter id="liquidGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Organic Liquid Veil */}
        <path
          d="M200,45 C270,30 350,90 365,160 C380,230 330,310 265,345 C200,380 110,365 65,305 C20,245 35,160 80,105 C125,50 140,58 200,45 Z"
          fill="url(#bloodVeilGrad)"
          filter="url(#liquidGlow)"
          className="animate-veil-morph"
        />

        {/* Dense Clinical Fluid Core */}
        <path
          d="M200,70 C255,58 320,110 335,170 C350,230 305,290 250,315 C195,340 125,325 90,275 C55,225 70,150 105,110 C140,70 155,80 200,70 Z"
          fill="url(#bloodCoreGrad)"
          className="animate-core-morph"
        />

        {/* Radiant Microcirculation Lobe */}
        <path
          d="M200,100 C235,90 280,130 290,175 C300,220 270,260 230,278 C190,295 140,285 115,250 C90,215 100,160 125,130 C150,100 170,108 200,100 Z"
          fill="#8A1C28"
          opacity="0.6"
        />
      </svg>

      {/* 2. Dispersed Blood Droplets */}
      {DROPLETS.map((drop, idx) => (
        <div
          key={idx}
          className="pravah-splash-droplet animate-droplet-burst"
          style={
            {
              '--target-x': `${drop.dx}px`,
              '--target-y': `${drop.dy}px`,
              '--size': `${drop.r * 2}px`,
              '--delay': `${drop.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* 3. Central Brief Clinical Flow Text */}
      {targetLabel && (
        <div className="pravah-splash-text animate-splash-text">
          <div className="pravah-splash-brand">PRAVAH</div>
          <div className="pravah-splash-subtitle">FLOWING TO {targetLabel}</div>
        </div>
      )}
    </div>
  )
}
