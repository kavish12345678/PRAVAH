import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FluidFlowFieldCanvas } from '../canvas/FluidFlowFieldCanvas'

interface FluidWelcomeLandingProps {
  onEnter: () => void
}

export function FluidWelcomeLanding({ onEnter }: FluidWelcomeLandingProps) {
  const [isEntering, setIsEntering] = useState(false)

  const handleEnterClick = () => {
    setIsEntering(true)
    setTimeout(() => {
      onEnter()
    }, 700)
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
      {/* Dynamic Fluid Canvas Engine */}
      <FluidFlowFieldCanvas speedMultiplier={isEntering ? 3.5 : 1} isDimmed={false} />

      {/* Cinematic Warp Zoom Overlay during Transition */}
      <AnimatePresence>
        {isEntering && (
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1.25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 pointer-events-none bg-gradient-to-b from-[#111124]/40 via-[#181631]/80 to-[#111124]"
          />
        )}
      </AnimatePresence>

      {/* Central Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="relative z-10 max-w-xl mx-auto space-y-8"
      >
        {/* Brand Header */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, letterSpacing: '0.4em' }}
            animate={{ opacity: 1, letterSpacing: '0.25em' }}
            transition={{ duration: 1.4, delay: 0.5 }}
            className="text-xs uppercase font-mono tracking-[0.25em] text-[#9A8BC7]"
          >
            THE LIVING FLOW
          </motion.div>

          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-light tracking-tight text-[#F4EFE7] font-serif">
            PRAVAH
          </h1>
        </div>

        {/* Short Statement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="space-y-1 text-sm sm:text-base font-light text-[#F4EFE7]/80 leading-relaxed max-w-sm mx-auto"
        >
          <p>Predict what is coming.</p>
          <p>Protect what exists.</p>
          <p className="text-[#E96B73] font-medium">Move what matters.</p>
        </motion.div>

        {/* Enter Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.1 }}
          className="pt-6"
        >
          <button
            onClick={handleEnterClick}
            className="group px-8 py-3.5 rounded-full border border-white/20 bg-white/[0.04] hover:bg-white/[0.12] hover:border-white/40 text-[#F4EFE7] text-xs font-mono tracking-widest uppercase transition-all duration-300 shadow-xl shadow-black/40 cursor-pointer inline-flex items-center gap-3"
          >
            <span>ENTER PRAVAH</span>
            <span className="text-[#E96B73] group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
