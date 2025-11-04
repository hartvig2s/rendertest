/**
 * Project header showing name and basic controls
 */

import React from 'react';

interface ProjectHeaderProps {
  projectName: string;
  isEditing: boolean;
  onNameClick: () => void;
  onNameChange: (name: string) => void;
  onNameBlur: () => void;
  onBack: () => void;
  backLabel: string;
  isMobile?: boolean;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectName,
  isEditing,
  onNameClick,
  onNameChange,
  onNameBlur,
  onBack,
  backLabel,
  isMobile = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onNameBlur();
    }
    if (e.key === 'Escape') {
      onNameBlur();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '10px' : '15px',
        borderBottom: '1px solid #ddd',
        backgroundColor: '#f9f9f9',
      }}
    >
      <div style={{ flex: 1 }}>
        {isEditing ? (
          <input
            type="text"
            value={projectName}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={onNameBlur}
            onKeyDown={handleKeyDown}
            style={{
              fontSize: isMobile ? '16px' : '20px',
              padding: '5px 10px',
              border: '2px solid #4CAF50',
              borderRadius: '4px',
              width: '100%',
              maxWidth: '300px',
            }}
            autoFocus
          />
        ) : (
          <h2
            onClick={onNameClick}
            style={{
              margin: 0,
              fontSize: isMobile ? '18px' : '24px',
              cursor: 'pointer',
              padding: '5px 10px',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            {projectName}
          </h2>
        )}
      </div>

      <button
        onClick={onBack}
        style={{
          padding: isMobile ? '8px 12px' : '10px 20px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: isMobile ? '12px' : '14px',
          whiteSpace: 'nowrap',
        }}
      >
        {backLabel}
      </button>
    </div>
  );
};
