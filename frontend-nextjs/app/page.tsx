'use client'

import { useState } from 'react'
import { ProjectCreation } from '@/components/ProjectCreation'
import { DesignWorkspace } from '@/components/DesignWorkspace'

interface Project {
  name: string
  width: number
  height: number
}

export default function Home() {
  const [currentView, setCurrentView] = useState<'home' | 'create' | 'design'>('home')
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  const handleNewProject = () => {
    setCurrentView('create')
  }

  const handleProjectCreated = (project: Project) => {
    setCurrentProject(project)
    setCurrentView('design')
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setCurrentProject(null)
  }

  const handleCancelCreate = () => {
    setCurrentView('home')
  }

  if (currentView === 'create') {
    return <ProjectCreation onProjectCreated={handleProjectCreated} onCancel={handleCancelCreate} />
  }

  if (currentView === 'design' && currentProject) {
    return <DesignWorkspace project={currentProject} onBack={handleBackToHome} />
  }

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1 className="landing-title">Heklet</h1>
        <p className="landing-subtitle">
          Design din egen hekleveske - fargelegg, plasser motiver og skap din personlige oppskrift
        </p>
        <button className="btn-landing" data-testid="new-project" onClick={handleNewProject}>
          Start designet ditt
        </button>
      </div>
    </div>
  )
}
