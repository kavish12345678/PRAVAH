import React from 'react'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div className={`animate-pravah-page ${className}`}>
      {children}
    </div>
  )
}
