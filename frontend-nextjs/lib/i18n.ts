import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import type { InitOptions } from 'i18next';

// Import translation resources
import enCommon from '../public/locales/en/common.json';
import enInstructions from '../public/locales/en/instructions.json';
import noCommon from '../public/locales/no/common.json';
import noInstructions from '../public/locales/no/instructions.json';

const resources = {
  en: {
    common: enCommon,
    instructions: enInstructions,
  },
  no: {
    common: noCommon,
    instructions: noInstructions,
  },
};

// Async function to detect language based on geolocation
const detectLanguageByGeolocation = async (): Promise<string> => {
  try {
    // Check if already cached in localStorage
    const cached = localStorage.getItem('i18nextLng');
    if (cached && (cached === 'en' || cached === 'no')) {
      return cached;
    }

    // Try to detect country from IP using free geolocation API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const countryCode = data.country_code;

      // Set language based on country
      if (countryCode === 'NO') {
        return 'no';
      }
    }
  } catch (error) {
    // Silently fail and use fallback
  }

  // Fallback: check navigator language
  const navigatorLang = navigator.language || navigator.languages?.[0];
  if (navigatorLang?.startsWith('no')) {
    return 'no';
  }

  // Final fallback to English
  return 'en';
};

const initOptions: InitOptions = {
  resources,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'instructions'],
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
};

i18n
  // Use language detector
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init(initOptions);

// Detect and set language based on geolocation if not in localStorage
if (typeof window !== 'undefined') {
  const cachedLng = localStorage.getItem('i18nextLng');
  if (!cachedLng) {
    detectLanguageByGeolocation().then((detectedLng) => {
      i18n.changeLanguage(detectedLng);
    });
  }
}

export default i18n;
