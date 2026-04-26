'use client';

import React, { createContext, useContext, useState } from 'react';

type Language = 'es' | 'en';

const LanguageContext = createContext({
  language: 'es' as Language,
  setLanguage: (lang: Language) => {},
  t: (key: string): string => '' 
});

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');

  const translations: Record<string, Record<string, string>> = {
    es: {
      slogan: "Laboratorio de ingeniería psicológica y arquitectura del deseo",
      chatTitle: "AGENTE V.O.I.D.",
      chatStatus: "En línea",
      chatPlaceholder: "Escriba su mensaje...",
    },
    en: {
      slogan: "Laboratory of psychological engineering and architecture of desire",
      chatTitle: "V.O.I.D. AGENT",
      chatStatus: "Online",
      chatPlaceholder: "Type your message...",
    }
  };

  const t = (key: string) => translations[language]?.[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
