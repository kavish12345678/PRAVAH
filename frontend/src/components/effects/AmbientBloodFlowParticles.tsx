import { useMemo } from 'react'

export function AmbientBloodFlowParticles() {
  const particles = useMemo(() => {
    return [
      { id: 1, left: '3%', top: '15%', size: 6, duration: 18, delay: 0 },
      { id: 2, left: '95%', top: '22%', size: 8, duration: 24, delay: 2 },
      { id: 3, left: '2%', top: '48%', size: 5, duration: 20, delay: 4 },
      { id: 4, left: '97%', top: '65%', size: 7, duration: 26, delay: 1 },
      { id: 5, left: '4%', top: '82%', size: 6, duration: 22, delay: 3 },
      { id: 6, left: '96%', top: '88%', size: 5, duration: 19, delay: 5 },
    ]
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden lg:block select-none" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-[#7A1C28]/10 backdrop-blur-[1px]"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            boxShadow: '0 0 8px rgba(122, 28, 40, 0.08)',
            animation: `pravahAmbientDrift ${p.duration}s ease-in-out infinite alternate`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
