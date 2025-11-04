'use client';

import React from 'react';
import './landing.css';

interface HeroSectionProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  imageSrc?: string;
  imageAlt?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
  imageSrc = '/images/landing-hero.jpeg',
  imageAlt = 'Crochet design'
}) => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Left column: Text content */}
        <div className="hero-content">
          <h1 className="hero-title">{title}</h1>
          <p className="hero-description">{description}</p>
          <button className="hero-button" onClick={onButtonClick}>
            {buttonText}
          </button>
        </div>

        {/* Right column: Image */}
        <div className="hero-image-wrapper">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="hero-image"
          />
        </div>
      </div>
    </section>
  );
};
