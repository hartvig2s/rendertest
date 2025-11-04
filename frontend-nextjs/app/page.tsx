'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DesignWorkspace } from '@/components/DesignWorkspace'
import { LandingPage } from '@/components/landing'

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
    // Create default project with language-specific name
    const defaultProject: Project = {
      name: t('workspace.untitledProject'),
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
    <LandingPage onStartDesign={handleStartDesign} />
  )
}
