/**
 * Hook for detecting mobile vs desktop and managing mobile-specific state
 */

import { useState, useEffect, useCallback } from 'react';

interface UseMobileDetectionReturn {
  isMobile: boolean;
  showMobileMotifPanel: boolean;
  showMobileControlPanel: boolean;
  mobileSelectedMotif: string | null;
  showMotifControlModal: boolean;

  setShowMobileMotifPanel: (show: boolean) => void;
  setShowMobileControlPanel: (show: boolean) => void;
  setMobileSelectedMotif: (id: string | null) => void;
  setShowMotifControlModal: (show: boolean) => void;

  // Panel operations
  toggleMobileMotifPanel: () => void;
  toggleMobileControlPanel: () => void;
  closeMobilePanels: () => void;
}

export const useMobileDetection = (): UseMobileDetectionReturn => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showMobileMotifPanel, setShowMobileMotifPanel] = useState<boolean>(false);
  const [showMobileControlPanel, setShowMobileControlPanel] = useState<boolean>(false);
  const [mobileSelectedMotif, setMobileSelectedMotif] = useState<string | null>(null);
  const [showMotifControlModal, setShowMotifControlModal] = useState<boolean>(false);

  // Detect mobile on mount and on resize
  useEffect(() => {
    const detectMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isTablet = /iPad|Android(?!.*Mobile)/.test(userAgent);
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;

      setIsMobile(isMobileDevice || isSmallScreen || isTablet);
    };

    detectMobile();
    window.addEventListener('resize', detectMobile);

    return () => window.removeEventListener('resize', detectMobile);
  }, []);

  const toggleMobileMotifPanel = useCallback(() => {
    setShowMobileMotifPanel(prev => !prev);
  }, []);

  const toggleMobileControlPanel = useCallback(() => {
    setShowMobileControlPanel(prev => !prev);
  }, []);

  const closeMobilePanels = useCallback(() => {
    setShowMobileMotifPanel(false);
    setShowMobileControlPanel(false);
    setMobileSelectedMotif(null);
    setShowMotifControlModal(false);
  }, []);

  return {
    isMobile,
    showMobileMotifPanel,
    showMobileControlPanel,
    mobileSelectedMotif,
    showMotifControlModal,
    setShowMobileMotifPanel,
    setShowMobileControlPanel,
    setMobileSelectedMotif,
    setShowMotifControlModal,
    toggleMobileMotifPanel,
    toggleMobileControlPanel,
    closeMobilePanels,
  };
};
