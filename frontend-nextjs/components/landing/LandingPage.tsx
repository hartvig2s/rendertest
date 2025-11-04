'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavigationHeader } from './NavigationHeader';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import './landing.css';

interface LandingPageProps {
  onStartDesign: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartDesign }) => {
  const { t } = useTranslation('common');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      title: t('features.product.title'),
      subtitle: t('features.product.subtitle'),
      comingSoonText: t('features.product.comingSoon')
    },
    {
      title: t('features.size.title'),
      subtitle: t('features.size.subtitle'),
      comingSoonText: t('features.size.comingSoon')
    },
    {
      title: t('features.yarn.title'),
      subtitle: t('features.yarn.subtitle'),
      comingSoonText: t('features.yarn.comingSoon')
    },
    {
      title: t('features.edge.title'),
      subtitle: t('features.edge.subtitle'),
      comingSoonText: t('features.edge.comingSoon')
    },
    {
      title: t('features.motif.title'),
      subtitle: t('features.motif.subtitle'),
      comingSoonText: t('features.motif.comingSoon')
    },
    {
      title: t('features.fill.title'),
      subtitle: t('features.fill.subtitle'),
      comingSoonText: t('features.fill.comingSoon')
    }
  ];

  return (
    <div className="landing-page-wrapper">
      <NavigationHeader onMenuClick={() => setIsMenuOpen(!isMenuOpen)} />

      <main className="landing-main">
        <HeroSection
          title={t('home.title')}
          description={t('home.subtitle')}
          buttonText={t('home.startButton')}
          onButtonClick={onStartDesign}
          imageSrc="/images/landing-hero.jpeg"
          imageAlt="Crochet design tool hero"
        />

        <FeaturesSection
          featuresTitle={t('features.title')}
          features={features}
        />
      </main>
    </div>
  );
};
