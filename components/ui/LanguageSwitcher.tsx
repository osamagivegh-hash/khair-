'use client'

import { useLanguage } from '@/lib/language-context'
import { Languages } from 'lucide-react'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar'
    setLanguage(newLang)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
      aria-label={`Switch to ${language === 'ar' ? 'English' : 'Arabic'}`}
    >
      <Languages size={20} />
      <span className="font-medium">{language === 'ar' ? 'EN' : 'ع'}</span>
    </button>
  )
}

