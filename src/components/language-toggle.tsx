"use client";

import React from 'react';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'de' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="h-8 px-2 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
      title={language === 'en' ? 'Sprache zu Deutsch wechseln' : 'Switch language to English'}
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{language.toUpperCase()}</span>
    </Button>
  );
}
