'use client';

import React from 'react';
import { FeatureCard } from './FeatureCard';
import './landing.css';

interface Feature {
  title: string;
  subtitle: string;
  comingSoonText: string;
}

interface FeaturesSectionProps {
  featuresTitle: string;
  features: Feature[];
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  featuresTitle,
  features
}) => {
  return (
    <section className="features-section">
      <div className="features-container">
        <h2 className="features-title">{featuresTitle}</h2>

        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              subtitle={feature.subtitle}
              comingSoonText={feature.comingSoonText}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
