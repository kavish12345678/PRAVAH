import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { Screen01Intro } from './Screen01Intro'
import { Screen02Problem } from './Screen02Problem'
import { Screen03Thinking } from './Screen03Thinking'
import { Screen04Engine } from './Screen04Engine'
import { Screen05CommandPreview } from './Screen05CommandPreview'

interface WelcomeExperienceProps {
  onComplete: () => void
}

const TOTAL_SCREENS = 5

export function WelcomeExperience({ onComplete }: WelcomeExperienceProps) {
  const [currentScreen, setCurrentScreen] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (currentScreen < TOTAL_SCREENS - 1) setCurrentScreen((prev) => prev + 1)
        else onComplete()
      } else if (e.key === 'ArrowLeft') {
        if (currentScreen > 0) setCurrentScreen((prev) => prev - 1)
      } else if (e.key === 'Escape') {
        onComplete()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentScreen, onComplete])

  const handleNext = () => {
    if (currentScreen < TOTAL_SCREENS - 1) {
      setCurrentScreen((prev) => prev + 1)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen((prev) => prev - 1)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-slate-900 flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Top Minimal Header */}
      <header className="flex items-center justify-between max-w-4xl w-full mx-auto pb-4 border-b border-[#e8e6df]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-700" />
          <span className="text-xs font-bold tracking-widest text-slate-900 uppercase font-mono">
            PRAVAH
          </span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[...Array(TOTAL_SCREENS)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentScreen(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentScreen === idx
                  ? 'w-6 bg-slate-900'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Skip */}
        <button
          onClick={onComplete}
          className="text-xs font-mono uppercase tracking-wider text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          Skip
        </button>
      </header>

      {/* Slide Body */}
      <main className="flex-1 flex items-center justify-center my-auto">
        <AnimatePresence mode="wait">
          {currentScreen === 0 && (
            <motion.div
              key="screen-0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Screen01Intro onNext={handleNext} />
            </motion.div>
          )}

          {currentScreen === 1 && (
            <motion.div
              key="screen-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Screen02Problem onNext={handleNext} />
            </motion.div>
          )}

          {currentScreen === 2 && (
            <motion.div
              key="screen-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Screen03Thinking onNext={handleNext} />
            </motion.div>
          )}

          {currentScreen === 3 && (
            <motion.div
              key="screen-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Screen04Engine onNext={handleNext} />
            </motion.div>
          )}

          {currentScreen === 4 && (
            <motion.div
              key="screen-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Screen05CommandPreview onEnter={onComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Minimal Footer */}
      <footer className="max-w-4xl w-full mx-auto pt-4 flex items-center justify-between border-t border-[#e8e6df] text-xs text-slate-500 font-mono">
        <div>
          {currentScreen > 0 ? (
            <button
              onClick={handleBack}
              className="text-slate-600 hover:text-slate-900 transition cursor-pointer flex items-center gap-1"
            >
              <span>←</span>
              <span>Back</span>
            </button>
          ) : (
            <span className="text-slate-400">Step 1 of {TOTAL_SCREENS}</span>
          )}
        </div>

        <div className="text-[11px] text-slate-400">
          Screen {currentScreen + 1} of {TOTAL_SCREENS}
        </div>

        <div>
          {currentScreen < TOTAL_SCREENS - 1 ? (
            <button
              onClick={handleNext}
              className="text-slate-900 font-semibold hover:underline transition cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <span>→</span>
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="text-rose-900 font-bold hover:underline transition cursor-pointer"
            >
              Enter PRAVAH →
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
