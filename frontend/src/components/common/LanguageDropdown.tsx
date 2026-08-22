import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import type { LanguageCode } from '../../i18n/types'

export function LanguageDropdown() {
  const { language, setLanguage, currentLanguageMeta, supportedLanguages } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F5] hover:bg-[#F2ECE8] border border-[#E8E1DC] hover:border-[#7A1C28]/40 rounded-full text-xs font-bold text-[#1F1B19] transition-all cursor-pointer shadow-2xs"
        aria-label="Select Application Language"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined text-[16px] text-[#7A1C28]">
          language
        </span>
        <span className="font-mono text-[11px] uppercase">{currentLanguageMeta.badge}</span>
        <span className="hidden sm:inline text-[11px] text-[#5A5451] font-sans">
          {currentLanguageMeta.nativeName}
        </span>
        <span className="material-symbols-outlined text-[14px] text-[#7A7471]">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E8E1DC] rounded-2xl shadow-xl z-50 py-1.5 font-sans animate-fade-in divide-y divide-[#F5EFEB]">
          <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7A7471] font-mono">
            SELECT LANGUAGE
          </div>

          <div className="py-1">
            {supportedLanguages.map((lang) => {
              const isSelected = language === lang.code

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#FCECEE] text-[#7A1C28] font-bold'
                      : 'text-[#1F1B19] hover:bg-[#FAF7F5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                        isSelected
                          ? 'bg-[#7A1C28] text-white'
                          : 'bg-[#F2ECE8] text-[#7A7471]'
                      }`}
                    >
                      {lang.badge}
                    </span>
                    <div className="truncate">
                      <span className="block font-medium leading-none">{lang.nativeName}</span>
                      <span className="block text-[10px] text-[#7A7471] mt-0.5">{lang.name}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="material-symbols-outlined text-[16px] text-[#7A1C28] shrink-0">
                      check
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
