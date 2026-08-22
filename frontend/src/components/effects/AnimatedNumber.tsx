import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number | string
  duration?: number
  className?: string
  suffix?: string
}

export function AnimatedNumber({
  value,
  duration = 600,
  className = '',
  suffix = '',
}: AnimatedNumberProps) {
  const numericValue =
    typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, ''), 10)
  const isNumber = !isNaN(numericValue)

  const [displayValue, setDisplayValue] = useState<number>(() => (isNumber ? numericValue : 0))
  const elementRef = useRef<HTMLSpanElement>(null)
  const prevValueRef = useRef<number>(numericValue)

  useEffect(() => {
    if (!isNumber) return

    // If reduced motion is preferred, show value immediately
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(numericValue)
      prevValueRef.current = numericValue
      return
    }

    const startVal = prevValueRef.current
    const endVal = numericValue
    prevValueRef.current = numericValue

    if (startVal === endVal) {
      setDisplayValue(endVal)
      return
    }

    const startTime = performance.now()

    let animationFrameId: number

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startVal + (endVal - startVal) * easeProgress)

      setDisplayValue(current)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      } else {
        setDisplayValue(endVal)
      }
    }

    animationFrameId = requestAnimationFrame(step)

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [numericValue, duration, isNumber])

  if (!isNumber) {
    return <span className={className}>{String(value)}</span>
  }

  return (
    <span ref={elementRef} className={className}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  )
}
