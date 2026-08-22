import React, { createContext, useContext, useMemo, useState } from 'react'
import { bn } from './locales/bn'
import { en } from './locales/en'
import { hi } from './locales/hi'
import { mr } from './locales/mr'
import { ta } from './locales/ta'
import { te } from './locales/te'
import {
  type LanguageCode,
  type LanguageMeta,
  SUPPORTED_LANGUAGES,
  type TranslationSchema,
} from './types'

const LOCAL_STORAGE_KEY = 'pravah_language'
const FIRST_VISIT_KEY = 'pravah_first_visit_completed'

const TRANSLATIONS: Record<LanguageCode, TranslationSchema> = {
  en,
  hi,
  ta,
  te,
  bn,
  mr,
}

interface LanguageContextValue {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (keyPath: string, params?: Record<string, string | number>) => string
  currentLanguageMeta: LanguageMeta
  supportedLanguages: LanguageMeta[]
  isFirstVisit: boolean
  completeFirstVisit: (selectedLanguage?: LanguageCode) => void
  formatDate: (date: Date | string) => string
  formatNumber: (num: number) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY) as LanguageCode | null
      if (stored && ['en', 'hi', 'ta', 'te', 'bn', 'mr'].includes(stored)) {
        return stored
      }
    } catch {
      // ignore
    }
    return 'en'
  })

  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(() => {
    try {
      const visited = localStorage.getItem(FIRST_VISIT_KEY)
      const storedLang = localStorage.getItem(LOCAL_STORAGE_KEY)
      return !visited && !storedLang
    } catch {
      return false
    }
  })

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, lang)
    } catch {
      // ignore
    }
  }

  const completeFirstVisit = (selectedLanguage?: LanguageCode) => {
    if (selectedLanguage) {
      setLanguage(selectedLanguage)
    }
    setIsFirstVisit(false)
    try {
      localStorage.setItem(FIRST_VISIT_KEY, 'true')
    } catch {
      // ignore
    }
  }

  const currentLanguageMeta = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]
  }, [language])

  /**
   * Centralized Translation Lookup with Parameter Interpolation & English Fallback
   */
  const t = (keyPath: string, params?: Record<string, string | number>): string => {
    const keys = keyPath.split('.')
    let current: any = TRANSLATIONS[language]
    let fallback: any = TRANSLATIONS.en

    // Traverse target language
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        current = null
        break
      }
    }

    // Traverse English fallback if target key is missing
    for (const k of keys) {
      if (fallback && typeof fallback === 'object' && k in fallback) {
        fallback = fallback[k]
      } else {
        fallback = null
        break
      }
    }

    let result = (typeof current === 'string' ? current : (typeof fallback === 'string' ? fallback : keyPath))

    // Interpolate dynamic parameters like {count}, {distance}, {hours}
    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal))
      })
    }

    return result
  }

  const formatDate = (dateInput: Date | string): string => {
    try {
      const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
      const localeMap: Record<LanguageCode, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        bn: 'bn-IN',
        mr: 'mr-IN',
      }
      return d.toLocaleDateString(localeMap[language] || 'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return String(dateInput)
    }
  }

  const formatNumber = (num: number): string => {
    try {
      const localeMap: Record<LanguageCode, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        bn: 'bn-IN',
        mr: 'mr-IN',
      }
      return new Intl.NumberFormat(localeMap[language] || 'en-IN').format(num)
    } catch {
      return String(num)
    }
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguageMeta,
        supportedLanguages: SUPPORTED_LANGUAGES,
        isFirstVisit,
        completeFirstVisit,
        formatDate,
        formatNumber,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
