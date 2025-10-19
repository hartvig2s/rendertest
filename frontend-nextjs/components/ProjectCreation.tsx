'use client'

import React, { useState } from 'react';

interface ProjectCreationProps {
  onProjectCreated: (project: { name: string; width: number; height: number }) => void;
  onCancel: () => void;
}

export const ProjectCreation: React.FC<ProjectCreationProps> = ({ onProjectCreated, onCancel }) => {
  const [name, setName] = useState('');
  const [widthCm, setWidthCm] = useState(40);
  const [heightCm, setHeightCm] = useState(45);
  const [errors, setErrors] = useState<string[]>([]);

  // Calculate grid squares from cm
  // Width: 1 cm = 1 square
  // Height: 0.9 cm = 1 square (so divide by 0.9)
  const gridWidth = Math.round(widthCm / 1.0);
  const gridHeight = Math.round(heightCm / 0.9);

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!name.trim()) {
      newErrors.push('Prosjektnavn er påkrevd');
    } else if (name.length > 100) {
      newErrors.push('Prosjektnavn må være 100 tegn eller mindre');
    }

    if (widthCm < 8 || widthCm > 200) {
      newErrors.push('Bredde må være mellom 8 og 200 cm');
    }

    if (heightCm < 7.2 || heightCm > 180) {
      newErrors.push('Høyde må være mellom 7.2 og 180 cm');
    }

    if (gridWidth < 8 || gridWidth > 200) {
      newErrors.push('Rutenettbredde utenfor gyldig område');
    }

    if (gridHeight < 8 || gridHeight > 200) {
      newErrors.push('Rutenetthøyde utenfor gyldig område');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const project = {
        name: name.trim(),
        width: gridWidth,
        height: gridHeight,
      };

      // Track project creation event in Plausible
      if (typeof window !== 'undefined' && (window as any).plausible) {
        console.log('🎯 Plausible: Tracking Project Created event');
        (window as any).plausible('Project Created', {
          props: {
            projectName: project.name,
            gridSize: `${project.width}x${project.height}`,
            totalCells: project.width * project.height
          }
        });
        console.log('✅ Plausible: Project Created event sent');
      } else {
        console.warn('⚠️ Plausible not loaded - event not tracked');
      }

      onProjectCreated(project);
    }
  };

  return (
    <div className="project-creation">
      <div className="project-creation-modal">
        <h2>Opprett Nytt Prosjekt</h2>
        <p>Design et egendefinert heklemønster for veske</p>

        {errors.length > 0 && (
          <div className="error-messages" data-testid="error-message">
            {errors.map((error, index) => (
              <div key={index} className="error-message">
                {error}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-group">
            <label htmlFor="projectName">Prosjektnavn</label>
            <input
              id="projectName"
              name="projectName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="f.eks., Min Første Veske"
              maxLength={100}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="width">Bredde (cm)</label>
              <input
                id="width"
                name="width"
                type="number"
                min={8}
                max={200}
                step={0.5}
                value={widthCm}
                onChange={(e) => setWidthCm(parseFloat(e.target.value) || 8)}
              />
              <small>8-200 cm (1 cm = 1 rute)</small>
            </div>

            <div className="form-group">
              <label htmlFor="height">Høyde (cm)</label>
              <input
                id="height"
                name="height"
                type="number"
                min={7.2}
                max={180}
                step={0.1}
                value={heightCm}
                onChange={(e) => setHeightCm(parseFloat(e.target.value) || 7.2)}
              />
              <small>7.2-180 cm (≈0.9 cm per rute)</small>
            </div>
          </div>

          <div className="grid-preview">
            <p>Rutenettstørrelse: {gridWidth} × {gridHeight} ruter</p>
            <p>Inndata: {widthCm.toFixed(1)} × {heightCm.toFixed(1)} cm</p>
            <p>Faktisk rutenett: {(gridWidth * 1.0).toFixed(1)} × {(gridHeight * 0.9).toFixed(1)} cm</p>
            <p>Totalt masker: {gridWidth * gridHeight}</p>
            <p>Estimert garn: {Math.ceil((gridWidth * gridHeight * 4 * 0.95) / 7500)} nøste{Math.ceil((gridWidth * gridHeight * 4 * 0.95) / 7500) !== 1 ? 'r' : ''}</p>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Avbryt
            </button>
            <button type="submit" className="btn btn-primary">
              Opprett Prosjekt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
