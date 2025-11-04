'use client';

import React from 'react';
import './landing.css';

interface FeatureCardProps {
  title: string;
  subtitle: string;
  comingSoonText: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  subtitle,
  comingSoonText
}) => {
  return (
    <div className="feature-card">
      <h3 className="feature-card-title">{title}</h3>
      <p className="feature-card-subtitle">{subtitle}</p>
    </div>
  );
};
