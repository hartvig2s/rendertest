'use client';

import React from 'react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import './landing.css';

interface NavigationHeaderProps {
  onMenuClick?: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="landing-header">
      <div className="landing-header-container">
        <button
          className="hamburger-menu"
          onClick={onMenuClick}
          aria-label="Menu"
          title="Menu (coming soon)"
        >
          <span>≡</span>
        </button>

        <div className="language-switcher-wrapper">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};
