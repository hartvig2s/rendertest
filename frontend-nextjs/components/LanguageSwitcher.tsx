'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'no' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <button
      className="language-switcher"
      onClick={toggleLanguage}
      title={i18n.language === 'en' ? 'Switch to Norwegian' : 'Switch to English'}
      aria-label={i18n.language === 'en' ? 'Switch to Norwegian' : 'Switch to English'}
    >
      {i18n.language === 'en' ? 'Norsk' : 'English'}
    </button>
  )
}
