"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations } from './types';
import { en } from './en';
import { de } from './de';

const translations: Record<Language, Translations> = {
  en,
  de,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  locale: string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: en,
  locale: 'en-US',
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always default to English as requested
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('tjournal_lang') as Language;
      if (savedLang === 'en' || savedLang === 'de') {
        setLanguageState(savedLang);
      }
    } catch {
      // Ignore localStorage errors (e.g. in private browsing)
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('tjournal_lang', newLang);
      document.documentElement.lang = newLang;
    } catch {
      // Ignore
    }
  };

  const t = translations[language] || en;
  const locale = language === 'de' ? 'de-DE' : 'en-US';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, locale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: en,
      locale: 'en-US',
    };
  }
  return context;
}
