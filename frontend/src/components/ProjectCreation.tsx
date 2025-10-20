import React, { useState } from 'react';

interface ProjectCreationProps {
  onProjectCreated: (project: { name: string; width: number; height: number }) => void;
  onCancel: () => void;
}

export const ProjectCreation: React.FC<ProjectCreationProps> = ({ onProjectCreated, onCancel }) => {
  const [name, setName] = useState('');
  const [widthCm, setWidthCm] = useState<number>(30);
  const [heightCm, setHeightCm] = useState<number>(35);

  // Calculate grid squares from cm
  // Width: 1 cm = 1 square
  // Height: 0.9 cm = 1 square (so divide by 0.9)
  const gridWidth = Math.round(widthCm / 1.0);
  const gridHeight = Math.round(heightCm / 0.9);

  // Real-time validation
  const getValidationErrors = () => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('Prosjektnavn er påkrevd');
    } else if (name.length > 100) {
      errors.push('Prosjektnavn må være 100 tegn eller mindre');
    }

    if (isNaN(widthCm) || widthCm < 8) {
      errors.push('Bredde må være minst 8 cm');
    } else if (widthCm > 200) {
      errors.push('Bredde må være maksimalt 200 cm');
    }

    if (isNaN(heightCm) || heightCm < 7.2) {
      errors.push('Høyde må være minst 7.2 cm');
    } else if (heightCm > 180) {
      errors.push('Høyde må være maksimalt 180 cm');
    }

    if (gridWidth < 8 || gridWidth > 200) {
      errors.push('Rutenettbredde utenfor gyldig område');
    }

    if (gridHeight < 8 || gridHeight > 200) {
      errors.push('Rutenetthøyde utenfor gyldig område');
    }

    return errors;
  };

  const validationErrors = getValidationErrors();
  const isFormValid = validationErrors.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isFormValid) {
      onProjectCreated({
        name: name.trim(),
        width: gridWidth,
        height: gridHeight,
      });
    }
  };

  return (
    <div className="project-creation">
      <div className="project-creation-modal">
        <h2>Opprett Nytt Prosjekt</h2>

        {validationErrors.length > 0 && (
          <div className="error-messages" data-testid="error-message">
            {validationErrors.map((error, index) => (
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
                max={200}
                step={0.5}
                value={isNaN(widthCm) ? '' : widthCm}
                onChange={(e) => {
                  const value = e.target.value;
                  setWidthCm(value === '' ? NaN : parseFloat(value));
                }}
              />
              <small>8-200 cm (1 cm = 1 rute)</small>
            </div>

            <div className="form-group">
              <label htmlFor="height">Høyde (cm)</label>
              <input
                id="height"
                name="height"
                type="number"
                max={180}
                step={0.1}
                value={isNaN(heightCm) ? '' : heightCm}
                onChange={(e) => {
                  const value = e.target.value;
                  setHeightCm(value === '' ? NaN : parseFloat(value));
                }}
              />
              <small>7.2-180 cm (≈0.9 cm per rute)</small>
            </div>
          </div>

          <div className="form-actions" style={{ justifyContent: 'center' }}>
            <button type="submit" className="btn btn-primary" disabled={!isFormValid}>
              Opprett Prosjekt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};