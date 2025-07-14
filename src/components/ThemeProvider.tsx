import React, { useEffect, useState } from 'react';
import { ThemeContext, Theme } from '../contexts/ThemeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove classes anteriores
    root.classList.remove('light', 'dark');
    
    let resolvedTheme: 'light' | 'dark';
    
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolvedTheme = systemPrefersDark ? 'dark' : 'light';
    } else {
      resolvedTheme = theme;
    }
    
    // Adiciona a classe do tema
    root.classList.add(resolvedTheme);
    setActualTheme(resolvedTheme);
    
    // Salva no localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listener para mudanças no tema do sistema
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      
      const systemPrefersDark = mediaQuery.matches;
      const resolvedTheme = systemPrefersDark ? 'dark' : 'light';
      
      root.classList.add(resolvedTheme);
      setActualTheme(resolvedTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    actualTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
