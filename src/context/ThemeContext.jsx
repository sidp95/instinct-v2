import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('instinct-theme');
    return saved || 'light';
  });

  // Persist to localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('instinct-theme', theme);
    // Update document class for global CSS access
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';

  // Theme colors
  const colors = isDark ? {
    // Dark mode colors
    background: '#1a1a1a',
    backgroundSecondary: '#222',
    paper: '#2a2a2a',
    border: '#444',
    text: '#f0f0f0',
    textSecondary: '#aaa',
    textMuted: '#666',
  } : {
    // Light mode colors
    background: '#E8E8E8',
    backgroundSecondary: '#f5f5f5',
    paper: '#fff',
    border: '#222',
    text: '#222',
    textSecondary: '#666',
    textMuted: '#888',
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
