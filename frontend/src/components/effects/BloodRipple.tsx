import { useEffect, useState } from 'react'

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

export function BloodRippleContainer() {
  const [ripples, setRipples] = useState<Ripple[]>([])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Trigger on interactive elements (buttons, links, clickable cards, tabs)
      const target = e.target as HTMLElement | null
      const interactive = target?.closest('button, a, [role="button"], .cursor-pointer, .pravah-ripple-target')
      if (!interactive) return

      const rect = interactive.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height, 40)
      const newRipple: Ripple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        size,
      }

      setRipples((prev) => [...prev.slice(-6), newRipple])

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, 550)
    }

    window.addEventListener('pointerdown', handleClick, { passive: true })
    return () => window.removeEventListener('pointerdown', handleClick)
  }, [])

  if (ripples.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: `${ripple.size * 0.8}px`,
            height: `${ripple.size * 0.8}px`,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(122, 28, 40, 0.22) 0%, rgba(122, 28, 40, 0.08) 50%, rgba(122, 28, 40, 0) 75%)',
            animation: 'pravahRipple 500ms ease-out forwards',
          }}
        />
      ))}
    </div>
  )
}
