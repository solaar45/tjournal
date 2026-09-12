"use client";

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground"
        aria-label="Toggle theme"
      >
        <div className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-all duration-150 rounded-xl cursor-pointer"
      title={isDark ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[#FFCF5C] transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-[#6979F8] transition-transform duration-200 rotate-0 hover:-rotate-12" />
      )}
    </Button>
  );
}
