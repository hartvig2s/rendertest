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

export default i18n;
