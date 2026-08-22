import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { Screen1Genesis } from './Screen1Genesis'
import { Screen2Movement } from './Screen2Movement'
import { Screen3UnitJourney } from './Screen3UnitJourney'
import { Screen4InvisibleForces } from './Screen4InvisibleForces'
import { Screen5LivingFlow } from './Screen5LivingFlow'

interface LivingWelcomeExperienceProps {
  onComplete: () => void
}

const TOTAL_SCREENS = 5

export function LivingWelcomeExperience({ onComplete }: LivingWelcomeExperienceProps) {
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
    <div className="relative min-h-screen bg-[#06090e] text-slate-100 flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden network-canvas-grid">
      {/* Top Floating Mini Bar */}
      <header className="relative z-10 flex items-center justify-between max-w-4xl w-full mx-auto pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-600 animate-heartbeat" />
          <span className="text-xs font-bold tracking-widest text-white uppercase font-mono">
            PRAVAH NETWORK GENESIS
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
                  ? 'w-6 bg-rose-600'
                  : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
              aria-label={`Go to stage ${idx + 1}`}
            />
          ))}
        </div>

        {/* Skip */}
        <button
          onClick={onComplete}
          className="text-xs font-mono uppercase tracking-wider text-slate-500 hover:text-white transition cursor-pointer"
        >
          Skip Intro
        </button>
      </header>

      {/* Screen Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center my-auto">
        <AnimatePresence mode="wait">
          {currentScreen === 0 && (
            <motion.div
              key="screen-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Screen1Genesis onNext={handleNext} />
            </motion.div>
          )}

          {currentScreen === 1 && (
            <motion.div
              key="screen-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Screen2Movement onNext={handleNext} />
            </motion.div>
          )}

          {currentScreen === 2 && (
            <motion.div
              key="screen-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Screen3UnitJourney onNext={handleNext} />
            </motion.div>
          )}

          {currentScreen === 3 && (
            <motion.div
              key="screen-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Screen4InvisibleForces onNext={handleNext} />
            </motion.div>
          )}

          {currentScreen === 4 && (
            <motion.div
              key="screen-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Screen5LivingFlow onEnter={onComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 max-w-4xl w-full mx-auto pt-4 flex items-center justify-between border-t border-white/5 text-xs text-slate-500 font-mono">
        <div>
          {currentScreen > 0 ? (
            <button
              onClick={handleBack}
              className="text-slate-400 hover:text-white transition cursor-pointer flex items-center gap-1"
            >
              <span>←</span>
              <span>Back</span>
            </button>
          ) : (
            <span className="text-slate-600">Stage 1 of {TOTAL_SCREENS}</span>
          )}
        </div>

        <div className="text-[11px] text-slate-600">
          Digital Twin Genesis
        </div>

        <div>
          {currentScreen < TOTAL_SCREENS - 1 ? (
            <button
              onClick={handleNext}
              className="text-slate-300 hover:text-white font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <span>→</span>
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="text-rose-400 font-bold hover:underline transition cursor-pointer"
            >
              Enter Network →
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
