import { useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import type { LanguageCode } from '../../i18n/types'

interface LanguageSelectModalProps {
  isOpen?: boolean
  onClose?: () => void
}

export function LanguageSelectModal({ isOpen, onClose }: LanguageSelectModalProps) {
  const { language, setLanguage, supportedLanguages, isFirstVisit, completeFirstVisit, t } = useLanguage()
  const [selected, setSelected] = useState<LanguageCode>(language)

  const showModal = isOpen !== undefined ? isOpen : isFirstVisit

  if (!showModal) return null

  const handleConfirm = () => {
    setLanguage(selected)
    completeFirstVisit(selected)
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs select-none font-sans animate-fade-in">
      <div className="bg-[#FAF7F5] border border-[#E8E1DC] rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 flex flex-col">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FCECEE] text-[#7A1C28] border border-[#F5D5D9] flex items-center justify-center shadow-2xs">
            <span className="material-symbols-outlined text-[24px]">
              translate
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1B19]">
            {t('common.chooseLanguageTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7471] max-w-md mx-auto">
            {t('common.chooseLanguageSubtitle')}
          </p>
        </div>

        {/* 6 Large Language Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2">
          {supportedLanguages.map((lang) => {
            const isChosen = selected === lang.code

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelected(lang.code)}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between h-28 relative group ${
                  isChosen
                    ? 'bg-white border-[#7A1C28] ring-2 ring-[#7A1C28]/20 shadow-md'
                    : 'bg-white border-[#E8E1DC] hover:border-[#7A1C28]/40 hover:bg-[#FFFDFD] shadow-2xs'
                }`}
              >
                {/* Top Badge & Script */}
                <div className="flex justify-between items-center w-full">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                      isChosen
                        ? 'bg-[#7A1C28] text-white'
                        : 'bg-[#FAF7F5] text-[#7A7471] group-hover:text-[#1F1B19]'
                    }`}
                  >
                    {lang.badge}
                  </span>
                  {isChosen && (
                    <span className="material-symbols-outlined text-[18px] text-[#7A1C28]">
                      check_circle
                    </span>
                  )}
                </div>

                {/* Language Names */}
                <div>
                  <h3 className="text-base font-bold text-[#1F1B19] leading-tight font-serif">
                    {lang.nativeName}
                  </h3>
                  <p className="text-[11px] text-[#7A7471] font-sans mt-0.5">
                    {lang.name}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-[#E8E1DC] flex justify-end items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#E8E1DC] text-xs font-bold text-[#5A5451] hover:bg-white cursor-pointer"
            >
              {t('common.cancel')}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-8 py-3 bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            <span>{t('common.continue')}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}
