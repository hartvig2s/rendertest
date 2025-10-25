'use client'

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

interface ProjectCreationProps {
  onProjectCreated: (project: { name: string; width: number; height: number }) => void;
  onCancel: () => void;
}

export const ProjectCreation: React.FC<ProjectCreationProps> = ({ onProjectCreated, onCancel }) => {
  const { t } = useTranslation('common');
  const [name, setName] = useState('');
  const [widthCm, setWidthCm] = useState(30);
  const [heightCm, setHeightCm] = useState(35);
  const [errors, setErrors] = useState<string[]>([]);

  // Calculate grid squares from cm
  // Width: 1 cm = 1 square
  // Height: 0.9 cm = 1 square (so divide by 0.9)
  const gridWidth = Math.round(widthCm / 1.0);
  const gridHeight = Math.round(heightCm / 0.9);

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!name.trim()) {
      newErrors.push(t('project.nameRequired'));
    } else if (name.length > 100) {
      newErrors.push(t('project.nameTooLong'));
    }

    if (widthCm < 8 || widthCm > 200) {
      newErrors.push(t('project.widthInvalid'));
    }

    if (heightCm < 7.2 || heightCm > 180) {
      newErrors.push(t('project.heightInvalid'));
    }

    if (gridWidth < 8 || gridWidth > 200) {
      newErrors.push(t('project.gridWidthInvalid'));
    }

    if (gridHeight < 8 || gridHeight > 200) {
      newErrors.push(t('project.gridHeightInvalid'));
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
    <div className="project-creation-page">
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <LanguageSwitcher />
      </div>
      <div className="project-creation-card">
        <h2>{t('project.new')}</h2>

        {errors.length > 0 && (
          <div className="error-messages" data-testid="error-message">
            {errors.map((error, index) => (
              <div key={index} className="error-message">
                {error}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="project-form-new">
          <div className="form-group-new">
            <label htmlFor="projectName">{t('project.projectName')}</label>
            <input
              id="projectName"
              name="projectName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Demo"
              maxLength={100}
              className="project-input"
            />
          </div>

          <div className="form-row-new">
            <div className="form-group-new">
              <label htmlFor="width">{t('project.width')}</label>
              <div className="input-with-unit">
                <input
                  id="width"
                  name="width"
                  type="number"
                  max={200}
                  step={0.5}
                  value={widthCm}
                  onChange={(e) => setWidthCm(parseFloat(e.target.value) || 0)}
                  className="dimension-input"
                />
                <span className="unit-label">cm</span>
              </div>
            </div>

            <div className="form-group-new">
              <label htmlFor="height">{t('project.height')}</label>
              <div className="input-with-unit">
                <input
                  id="height"
                  name="height"
                  type="number"
                  max={180}
                  step={0.1}
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                  className="dimension-input"
                />
                <span className="unit-label">cm</span>
              </div>
            </div>
          </div>

          <div className="form-actions-new">
            <button type="button" onClick={onCancel} className="btn-cancel-new">
              {t('project.cancel')}
            </button>
            <button type="submit" className="btn-submit-new">
              {t('project.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
