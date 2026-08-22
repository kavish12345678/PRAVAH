import type { ReactNode } from 'react'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  glow?: 'cyan' | 'blue' | 'amber' | 'red' | 'emerald' | 'none'
}

const glowStyles = {
  cyan: 'border-cyan-500/20 shadow-[0_0_40px_rgba(34,211,238,0.08)]',
  blue: 'border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.08)]',
  amber: 'border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.08)]',
  red: 'border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.08)]',
  emerald: 'border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.08)]',
  none: 'border-white/10',
}

export function GlassPanel({ children, className = '', glow = 'none' }: GlassPanelProps) {
  return (
    <div
      className={`rounded-2xl border bg-white/[0.04] backdrop-blur-xl ${glowStyles[glow]} ${className}`}
    >
      {children}
    </div>
  )
}
