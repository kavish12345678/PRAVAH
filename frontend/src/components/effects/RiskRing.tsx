import { useEffect, useRef, useState } from 'react'

interface RiskRingProps {
  score: number // Real model risk score between 0.0 and 1.0
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
}

export function RiskRing({
  score,
  size = 54,
  strokeWidth = 4.5,
  className = '',
  showLabel = true,
}: RiskRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState<number>(0)
  const elementRef = useRef<SVGSVGElement>(null)
  const hasAnimatedRef = useRef<boolean>(false)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const validScore = Math.max(0, Math.min(1, score || 0))

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnimatedProgress(validScore)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true

          const startTime = performance.now()
          const duration = 750

          const step = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeOut = 1 - Math.pow(1 - progress, 3)

            setAnimatedProgress(validScore * easeOut)

            if (progress < 1) {
              requestAnimationFrame(step)
            } else {
              setAnimatedProgress(validScore)
            }
          }

          requestAnimationFrame(step)
        }
      },
      { threshold: 0.1 },
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [validScore])

  // Color mapping based on actual risk score threshold
  const getColor = () => {
    if (validScore >= 0.70) return '#DC2626' // Critical/High Red
    if (validScore >= 0.40) return '#D97706' // Moderate Amber
    return '#16A34A' // Low Green
  }

  const color = getColor()
  const strokeDashoffset = circumference - (hasAnimatedRef.current ? animatedProgress : 0) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        ref={elementRef}
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Dynamic Animated Progress Stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: hasAnimatedRef.current ? 'stroke-dashoffset 80ms ease-out' : 'none',
          }}
        />
      </svg>

      {showLabel && (
        <span
          className="absolute font-mono font-bold text-xs"
          style={{ color }}
        >
          {validScore.toFixed(2)}
        </span>
      )}
    </div>
  )
}
