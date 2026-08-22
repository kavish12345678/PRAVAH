import React, { useRef, useState } from 'react'

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  intensity?: number
}

export function MagneticButton({
  children,
  className = '',
  intensity = 0.25,
  onClick,
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return
    const { clientX, clientY } = e
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect()
    const centerX = left + width / 2
    const centerY = top + height / 2

    // Max 3px pull in any direction
    const pullX = Math.max(-3.5, Math.min(3.5, (clientX - centerX) * intensity))
    const pullY = Math.max(-3.5, Math.min(3.5, (clientY - centerY) * intensity))

    setPosition({ x: pullX, y: pullY })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: position.x === 0 && position.y === 0 ? 'transform 300ms ease-out' : 'transform 80ms ease-out',
      }}
      className={`group relative overflow-hidden transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-95 pravah-btn-primary ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
