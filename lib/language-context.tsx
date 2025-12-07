'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, defaultLanguage } from './i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)

  useEffect(() => {
    // Load language from localStorage
    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      setLanguageState(savedLang)
      document.documentElement.lang = savedLang
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr'
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }

  const t = (key: string): string => {
    const translations = require('./i18n').translations
    return translations[language]?.[key] || translations[defaultLanguage]?.[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

