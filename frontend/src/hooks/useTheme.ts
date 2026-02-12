import { useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'system',
  );

  function setTheme(t: Theme) {
    setThemeState(t);
    if (t === 'system') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    } else {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('theme', t);
    }
  }

  return { theme, setTheme };
}
