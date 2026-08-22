import { useState } from 'react'
import { LanguageDropdown } from '../../components/common/LanguageDropdown'
import { useLanguage } from '../../i18n/LanguageContext'

interface Step0WelcomeProps {
  onEnterPravah: () => void
}

export function Step0Welcome({ onEnterPravah }: Step0WelcomeProps) {
  const { t } = useLanguage()
  const [activeScreen, setActiveScreen] = useState(0)

  const screens = [
    {
      step: '01 DATA',
      title: 'Operational Baseline',
      desc: 'Ingests blood bank inventory, demand records, temperature logs, and equipment status across 4,390 facilities.',
      icon: 'database',
      metrics: '43,329 Units · 4,390 Facilities',
    },
    {
      step: '02 INTELLIGENCE',
      title: 'Predictive ML Inference',
      desc: 'GBDT models forecast 24h/72h demand and evaluate unit-level expiry risk, while Isolation Forest detects thermal excursions.',
      icon: 'psychology',
      metrics: 'R² = 0.7634 · ROC-AUC = 0.9999',
    },
    {
      step: '03 DECISION',
      title: 'Surplus & Deficit Matching',
      desc: 'HiGHS Linear Programming engine matches surplus hubs with deficit trauma centers to prevent both stockouts and spoilage.',
      icon: 'alt_route',
      metrics: '745 Solved Routes · Zero Wastage Target',
    },
    {
      step: '04 ACTION',
      title: 'Human Authorization & Audit',
      desc: 'Clinical directors review routing recommendations, authorize dispatches, and log all decisions into a permanent audit trail.',
      icon: 'fact_check',
      metrics: '1-Click Authorization · Real-time Audit',
    },
  ]

  return (
    <div className="min-h-screen bg-[#FBF7F4] text-[#1f1b19] font-sans antialiased flex flex-col justify-between p-6 md:p-16 max-w-6xl mx-auto selection:bg-primary-container selection:text-white select-none">
      {/* Top Header */}
      <header className="flex justify-between items-center border-b border-outline-variant/15 pb-6">
        <div className="flex items-center gap-3.5">
          <img
            src="/pravah-logo.png"
            alt="PRAVAH Logo"
            className="w-12 h-12 object-contain shrink-0 drop-shadow-sm"
          />
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary tracking-tight leading-none">
              PRAVAH
            </h1>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">
              {t('common.tagline')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageDropdown />
          <button
            onClick={onEnterPravah}
            className="bg-primary-container text-white px-7 py-3 rounded-full font-sans text-xs font-bold uppercase tracking-wider hover:bg-primary transition-colors cursor-pointer shadow-md flex items-center gap-2"
          >
            <span>{t('common.continue')}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </header>

      {/* Hero Headline */}
      <div className="py-8 space-y-3">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">
          The Living Clinical Decision Workflow
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-on-surface leading-tight max-w-3xl">
          What happens to every blood unit across the nation?
        </h2>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
          PRAVAH connects inventory monitoring, demand forecasting, expiry risk modeling, and linear programming redistribution into one continuous operational journey.
        </p>
      </div>

      {/* 4 Sequenced Stage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
        {screens.map((s, idx) => {
          const isSelected = activeScreen === idx

          return (
            <div
              key={s.step}
              onClick={() => setActiveScreen(idx)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-f5f1ee border-primary ring-1 ring-primary/20 shadow-xs'
                  : 'bg-white border-outline-variant/15 hover:bg-f5f1ee/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {s.step}
                  </span>
                  <span className={`material-symbols-outlined text-[22px] ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {s.icon}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-on-surface">{s.title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{s.desc}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-outline-variant/15 text-[11px] font-bold text-on-surface">
                {s.metrics}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom CTA Bar */}
      <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-outline-variant/15">
        <div className="text-xs text-on-surface-variant">
          Step 0 of 10 · Authoritative Operational Dataset
        </div>

        <button
          onClick={onEnterPravah}
          className="w-full sm:w-auto bg-primary text-white px-9 py-4 rounded-full font-sans text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          <span>Begin Operational Workflow</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </footer>
    </div>
  )
}
