import { useState } from 'react';
import { ProjectCreation } from './components/ProjectCreation';
import { DesignWorkspace } from './components/DesignWorkspace';
import './App.css';

interface Project {
  name: string;
  width: number;
  height: number;
}

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'create' | 'design'>('home');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const handleNewProject = () => {
    setCurrentView('create');
  };

  const handleProjectCreated = (project: Project) => {
    setCurrentProject(project);
    setCurrentView('design');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setCurrentProject(null);
  };

  const handleCancelCreate = () => {
    setCurrentView('home');
  };

  if (currentView === 'create') {
    return <ProjectCreation onProjectCreated={handleProjectCreated} onCancel={handleCancelCreate} />;
  }

  if (currentView === 'design' && currentProject) {
    return <DesignWorkspace project={currentProject} onBack={handleBackToHome} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Heklemønster Designverktøy</h1>
        <p>Lag egne mønster for heklevesker med filet-hekleteknikk</p>
      </header>

      <main className="app-main">
        <div className="welcome-screen">
          <div className="welcome-content">
            <h2>Velkommen til Heklemønster Designverktøy</h2>
            <p>
              Design egne heklemønster for vesker med dra-og-slipp motiver,
              automatisk mønsergenerering og garnberegninger.
            </p>

            <div className="quick-start">
              <button className="btn btn-primary" data-testid="new-project" onClick={handleNewProject}>
                Nytt Prosjekt
              </button>
              <button className="btn btn-secondary" data-testid="import-project">
                Importer Prosjekt
              </button>
            </div>

            <div className="features">
              <div className="feature">
                <h3>Designrutenett</h3>
                <p>Egendefinerte dimensjoner 20-200cm med 1cm rutenett</p>
              </div>
              <div className="feature">
                <h3>Dra & Slipp</h3>
                <p>Plasser blomster, fugler, bokstaver og geometriske motiver</p>
              </div>
              <div className="feature">
                <h3>Mønstergenerering</h3>
                <p>Automatiske filet-heklediagrammer med maskinstruks</p>
              </div>
              <div className="feature">
                <h3>Garnkalkulator</h3>
                <p>Presise beregninger av garnbehov basert på mønserkompleksitet</p>
              </div>
              <div className="feature">
                <h3>Eksportvalg</h3>
                <p>PDF-mønster, PNG-bilder og JSON-prosjektfiler</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Laget for hekleentusiaster • Bygget med React + TypeScript + Vite
        </p>
      </footer>
    </div>
  );
}

export default App;