'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DesignWorkspace } from '@/components/DesignWorkspace'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface Project {
  name: string
  width: number
  height: number
}

export default function Home() {
  const { t } = useTranslation('common')
  const [currentView, setCurrentView] = useState<'home' | 'design'>('home')
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  const handleStartDesign = () => {
    // Create default project
    const defaultProject: Project = {
      name: 'Untitled Design',
      width: 30,
      height: 35
    }
    setCurrentProject(defaultProject)
    setCurrentView('design')
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setCurrentProject(null)
  }

  if (currentView === 'design' && currentProject) {
    return <DesignWorkspace project={currentProject} onBack={handleBackToHome} />
  }

  return (
    <div className="landing-page">
      <div className="landing-content">
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <LanguageSwitcher />
        </div>
        <h1 className="landing-title">{t('home.title')}</h1>
        <p className="landing-subtitle">
          {t('home.subtitle')}
        </p>
        <button className="btn-landing" data-testid="new-project" onClick={handleStartDesign}>
          {t('home.startButton')}
        </button>
      </div>
    </div>
  )
}
