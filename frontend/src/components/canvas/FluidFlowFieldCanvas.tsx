import { useEffect, useRef } from 'react'

export type FlowEnvironmentMode = 'normal' | 'risk' | 'cold' | 'transfer' | 'dimmed'

interface FluidFlowFieldCanvasProps {
  mode?: FlowEnvironmentMode
  isDimmed?: boolean
  speedMultiplier?: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  type: 'rbc' | 'platelet' | 'plasma'
  alpha: number
  baseAlpha: number
  life: number
  maxLife: number
}

export function FluidFlowFieldCanvas({
  mode = 'normal',
  isDimmed = false,
  speedMultiplier = 1,
}: FluidFlowFieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  })

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

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      mouseRef.current.active = true
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reducedMotion = mediaQuery.matches

    // Initialize biological particles
    const particleCount = reducedMotion ? 0 : Math.min(90, Math.floor((width * height) / 14000))
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      const rand = Math.random()
      const type = rand < 0.45 ? 'rbc' : rand < 0.75 ? 'platelet' : 'plasma'
      const baseAlpha = type === 'rbc' ? 0.4 : type === 'platelet' ? 0.5 : 0.25
      const size = type === 'rbc' ? 2.6 : type === 'platelet' ? 1.6 : 3.4

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        size,
        type,
        alpha: baseAlpha,
        baseAlpha,
        life: Math.random() * 400,
        maxLife: 300 + Math.random() * 300,
      })
    }

    let time = 0

    // Animation Loop
    const render = () => {
      time += 0.003 * speedMultiplier

      ctx.clearRect(0, 0, width, height)

      // ── LAYER 1: DEEP FLUID BACKGROUND GRADIENT ──
      const bgGrad = ctx.createLinearGradient(0, 0, width, height)
      if (mode === 'cold') {
        bgGrad.addColorStop(0, '#0e1526')
        bgGrad.addColorStop(0.5, '#131e33')
        bgGrad.addColorStop(1, '#0b101c')
      } else if (mode === 'risk') {
        bgGrad.addColorStop(0, '#1a1024')
        bgGrad.addColorStop(0.5, '#26142a')
        bgGrad.addColorStop(1, '#110c1a')
      } else {
        bgGrad.addColorStop(0, '#111124')
        bgGrad.addColorStop(0.5, '#181631')
        bgGrad.addColorStop(1, '#0e0e1e')
      }
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Ambient radial lighting drift
      const radX = width * (0.5 + Math.sin(time * 0.4) * 0.2)
      const radY = height * (0.4 + Math.cos(time * 0.3) * 0.15)
      const radGlow = ctx.createRadialGradient(radX, radY, 50, radX, radY, width * 0.65)

      if (mode === 'cold') {
        radGlow.addColorStop(0, 'rgba(112, 185, 198, 0.09)')
        radGlow.addColorStop(1, 'rgba(17, 17, 36, 0)')
      } else if (mode === 'risk') {
        radGlow.addColorStop(0, 'rgba(233, 107, 115, 0.12)')
        radGlow.addColorStop(1, 'rgba(17, 17, 36, 0)')
      } else {
        radGlow.addColorStop(0, 'rgba(154, 139, 199, 0.09)')
        radGlow.addColorStop(0.5, 'rgba(40, 32, 61, 0.15)')
        radGlow.addColorStop(1, 'rgba(17, 17, 36, 0)')
      }
      ctx.fillStyle = radGlow
      ctx.fillRect(0, 0, width, height)

      if (reducedMotion) {
        return // Static atmospheric background when reduced motion is preferred
      }

      // ── LAYER 2: TRANSLUCENT FLOWING RIBBONS ──
      const ribbonCount = 4
      for (let r = 0; r < ribbonCount; r++) {
        ctx.beginPath()
        const rOffset = (r * Math.PI) / 2
        const rTime = time * 0.7 + rOffset

        const startY = height * (0.3 + (r * 0.15) + Math.sin(rTime * 0.5) * 0.08)
        ctx.moveTo(0, startY)

        const cp1x = width * (0.3 + Math.sin(rTime * 0.4) * 0.08)
        const cp1y = height * (0.2 + Math.cos(rTime * 0.6) * 0.12)
        const cp2x = width * (0.7 + Math.cos(rTime * 0.5) * 0.08)
        const cp2y = height * (0.6 + Math.sin(rTime * 0.7) * 0.12)
        const endY = height * (0.5 + Math.cos(rTime * 0.4) * 0.1)

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, width, endY)

        const ribbonGrad = ctx.createLinearGradient(0, startY, width, endY)
        if (mode === 'cold') {
          ribbonGrad.addColorStop(0, 'rgba(112, 185, 198, 0)')
          ribbonGrad.addColorStop(0.5, isDimmed ? 'rgba(112, 185, 198, 0.03)' : 'rgba(112, 185, 198, 0.08)')
          ribbonGrad.addColorStop(1, 'rgba(112, 185, 198, 0)')
        } else if (mode === 'risk') {
          ribbonGrad.addColorStop(0, 'rgba(233, 107, 115, 0)')
          ribbonGrad.addColorStop(0.5, isDimmed ? 'rgba(233, 107, 115, 0.03)' : 'rgba(233, 107, 115, 0.08)')
          ribbonGrad.addColorStop(1, 'rgba(233, 107, 115, 0)')
        } else {
          ribbonGrad.addColorStop(0, 'rgba(154, 139, 199, 0)')
          ribbonGrad.addColorStop(0.3, isDimmed ? 'rgba(154, 139, 199, 0.02)' : 'rgba(154, 139, 199, 0.06)')
          ribbonGrad.addColorStop(0.7, isDimmed ? 'rgba(201, 87, 115, 0.02)' : 'rgba(201, 87, 115, 0.05)')
          ribbonGrad.addColorStop(1, 'rgba(154, 139, 199, 0)')
        }

        ctx.strokeStyle = ribbonGrad
        ctx.lineWidth = 2.5 + r * 1.2
        ctx.stroke()
      }

      // ── LAYER 3: BIOLOGICAL PARTICLES FLOWING WITH THE VECTOR FIELD ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Compute vector angle from sinusoidal flow field
        const angle =
          Math.sin(p.x * 0.0015 + time) * Math.cos(p.y * 0.0015 + time * 0.8) * Math.PI * 2

        let vx = Math.cos(angle) * 0.65
        let vy = Math.sin(angle) * 0.45 + 0.25 // General subtle diagonal downward drift

        // Interactive mouse deflection
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x
          const dy = p.y - mouseRef.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 180 && dist > 1) {
            const force = (1 - dist / 180) * 0.4
            vx += (dx / dist) * force
            vy += (dy / dist) * force
          }
        }

        p.x += vx * speedMultiplier
        p.y += vy * speedMultiplier
        p.life += 1

        // Wrap around boundaries
        if (p.x < -20) p.x = width + 20
        if (p.x > width + 20) p.x = -20
        if (p.y < -20) p.y = height + 20
        if (p.y > height + 20) p.y = -20

        // Subtle alpha breathing
        const lifeRatio = p.life / p.maxLife
        const alphaFade = Math.sin(lifeRatio * Math.PI)
        const finalAlpha = p.baseAlpha * alphaFade * (isDimmed ? 0.35 : 1)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)

        if (p.type === 'rbc') {
          ctx.fillStyle = `rgba(233, 107, 115, ${finalAlpha})`
        } else if (p.type === 'platelet') {
          ctx.fillStyle = `rgba(244, 239, 231, ${finalAlpha})`
        } else {
          ctx.fillStyle = `rgba(154, 139, 199, ${finalAlpha})`
        }
        ctx.fill()

        if (p.life >= p.maxLife) {
          p.life = 0
          p.x = Math.random() * width
          p.y = Math.random() * height
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mode, isDimmed, speedMultiplier])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full"
    />
  )
}
