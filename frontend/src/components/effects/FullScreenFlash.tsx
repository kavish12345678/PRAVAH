import React, { useEffect, useState } from 'react'

// Global dispatcher to trigger the full-screen soft light-red flash
export function triggerFlash() {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('pravah-page-flash')
    window.dispatchEvent(event)
  }
}

export const FullScreenFlash: React.FC = () => {
  const [isFlashing, setIsFlashing] = useState<boolean>(false)
  const [flashKey, setFlashKey] = useState<number>(0)

  useEffect(() => {
    const handleFlash = () => {
      setFlashKey((k) => k + 1)
      setIsFlashing(true)

      // Automatically reset state after 350ms
      const timer = setTimeout(() => {
        setIsFlashing(false)
      }, 350)

      return () => clearTimeout(timer)
    }

    window.addEventListener('pravah-page-flash', handleFlash)
    return () => window.removeEventListener('pravah-page-flash', handleFlash)
  }, [])

  if (!isFlashing) return null

  return (
    <div
      key={flashKey}
      className="fixed inset-0 w-screen h-screen pointer-events-none z-[99999] select-none"
      style={{
        backgroundColor: 'rgba(180, 25, 55, 0.20)',
        animation: 'pravahScreenFlash 320ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards',
      }}
      aria-hidden="true"
    />
  )
}
