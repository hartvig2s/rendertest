'use client'

import React, { useEffect, useState } from 'react'
import i18n from '@/lib/i18n'

interface I18nProviderProps {
  children: React.ReactNode
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize i18n if not already initialized
    if (!i18n.isInitialized) {
      i18n.init().then(() => {
        setIsInitialized(true)
      })
    } else {
      setIsInitialized(true)
    }
  }, [])

  if (!isInitialized) {
    return <>{children}</>
  }

  return <>{children}</>
}
