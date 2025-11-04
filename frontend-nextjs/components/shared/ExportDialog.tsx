/**
 * Export dialog modal for naming and exporting projects
 */

import React from 'react';

interface ExportDialogProps {
  isOpen: boolean;
  title: string;
  placeholder: string;
  value: string;
  cancelLabel: string;
  exportLabel: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onExport: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  title,
  placeholder,
  value,
  cancelLabel,
  exportLabel,
  onChange,
  onCancel,
  onExport,
}) => {
  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onExport();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '90%',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>{title}</h2>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '20px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
            boxSizing: 'border-box',
          }}
          autoFocus
        />

        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onExport}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {exportLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
