import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko.json';
import en from './locales/en.json';
import ja from './locales/ja.json';

i18next.use(initReactI18next).init({
  lng: localStorage.getItem('i18nextLng') || 'ko',
  fallbackLng: 'ko',
  resources: {
    ko: { translation: ko },
    en: { translation: en },
    ja: { translation: ja },
  },
  interpolation: { escapeValue: false },
});

export default i18next;
