import React from 'react'

interface BloodFlowHoverProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  lift?: boolean
  flowColor?: 'burgundy' | 'green' | 'amber' | 'blue'
  isActive?: boolean
}

export function BloodFlowHover({
  children,
  className = '',
  lift = true,
  flowColor = 'burgundy',
  isActive = false,
  ...rest
}: BloodFlowHoverProps) {
  const colorMap = {
    burgundy: {
      line: 'bg-[#7A1C28]',
      dot: 'bg-[#7A1C28]',
      glow: 'rgba(122, 28, 40, 0.6)',
      hoverBorder: 'hover:border-[#7A1C28]/40',
      activeBorder: 'border-[#7A1C28]/60',
      hoverShadow: 'hover:shadow-[0_12px_28px_-4px_rgba(122,28,40,0.12),0_4px_10px_-2px_rgba(0,0,0,0.04)]',
      hoverBg: 'hover:bg-[#FDF8F8]',
    },
    green: {
      line: 'bg-[#16A34A]',
      dot: 'bg-[#16A34A]',
      glow: 'rgba(22, 163, 74, 0.6)',
      hoverBorder: 'hover:border-[#16A34A]/40',
      activeBorder: 'border-[#16A34A]/60',
      hoverShadow: 'hover:shadow-[0_12px_28px_-4px_rgba(22,163,74,0.12),0_4px_10px_-2px_rgba(0,0,0,0.04)]',
      hoverBg: 'hover:bg-[#F0FDF4]',
    },
    amber: {
      line: 'bg-[#D97706]',
      dot: 'bg-[#D97706]',
      glow: 'rgba(217, 119, 6, 0.6)',
      hoverBorder: 'hover:border-[#D97706]/40',
      activeBorder: 'border-[#D97706]/60',
      hoverShadow: 'hover:shadow-[0_12px_28px_-4px_rgba(217,119,6,0.12),0_4px_10px_-2px_rgba(0,0,0,0.04)]',
      hoverBg: 'hover:bg-[#FFFBEB]',
    },
    blue: {
      line: 'bg-[#0284C7]',
      dot: 'bg-[#0284C7]',
      glow: 'rgba(2, 132, 199, 0.6)',
      hoverBorder: 'hover:border-[#0284C7]/40',
      activeBorder: 'border-[#0284C7]/60',
      hoverShadow: 'hover:shadow-[0_12px_28px_-4px_rgba(2,132,199,0.12),0_4px_10px_-2px_rgba(0,0,0,0.04)]',
      hoverBg: 'hover:bg-[#F0F9FF]',
    },
  }

  const selected = colorMap[flowColor]

  return (
    <div
      className={`group relative overflow-hidden transition-all duration-300 ease-out cursor-pointer ${
        lift ? 'hover:-translate-y-[3px]' : ''
      } ${selected.hoverBorder} ${selected.hoverShadow} ${selected.hoverBg} ${
        isActive ? selected.activeBorder : ''
      } ${className}`}
      {...rest}
    >
      {children}

      {/* Signature Bottom Vascular Flow Line & Traveling Blood Cell */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className={`w-full h-full ${selected.line} opacity-30`} />
        <div
          className={`absolute top-0 bottom-0 w-16 ${selected.line} blur-[1px] animate-pravah-flow-particle`}
          style={{
            boxShadow: `0 0 8px ${selected.glow}`,
          }}
        />
        {/* Tiny traveling circular cell */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${selected.dot} animate-pravah-cell-move`}
          style={{
            boxShadow: `0 0 6px ${selected.glow}`,
          }}
        />
      </div>
    </div>
  )
}
