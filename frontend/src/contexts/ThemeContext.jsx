import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Apply theme to document and save to localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');

    // Add current theme class
    root.classList.add(theme);
    body.classList.add(theme);

    // Set CSS custom properties for background colors
    if (theme === 'dark') {
      root.style.setProperty('--bg-color', '#111827'); // gray-900
      root.style.setProperty('--bg-secondary-color', '#1f2937'); // gray-800
      body.style.backgroundColor = '#111827'; // Ensure body background is dark
    } else {
      root.style.setProperty('--bg-color', '#ffffff'); // white
      root.style.setProperty('--bg-secondary-color', '#f9fafb'); // gray-50
      body.style.backgroundColor = '#ffffff'; // Ensure body background is white
    }

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Theme-aware CSS variables for consistent theming
  const themeStyles = {
    light: {
      background: 'bg-white',
      backgroundSecondary: 'bg-gray-50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textMuted: 'text-gray-500',
      navText: 'text-gray-700',
      navTextHover: 'hover:text-purple-600',
      navDropdown: 'bg-white',
      navDropdownText: 'text-gray-700',
      navDropdownHover: 'hover:bg-gray-100',
      border: 'border-gray-200',
      borderSecondary: 'border-gray-300',
      card: 'bg-white',
      cardHover: 'hover:bg-gray-50',
      input: 'bg-white border-gray-300 focus:border-purple-500',
      button: 'bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600',
      buttonSecondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      navbar: 'bg-white shadow-md border-b border-gray-100',
      modal: 'bg-white',
      modalBackdrop: 'bg-black/50',
      success: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-blue-600',
      gradient: 'from-purple-600 to-orange-500',
      gradientHover: 'hover:from-purple-700 hover:to-orange-600'
    },
    dark: {
      background: 'bg-gray-900',
      backgroundSecondary: 'bg-gray-800',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      textMuted: 'text-gray-400',
      navText: 'text-white',
      navTextHover: 'hover:text-purple-400',
      navDropdown: 'bg-gray-800',
      navDropdownText: 'text-gray-200',
      navDropdownHover: 'hover:bg-gray-700',
      border: 'border-gray-700',
      borderSecondary: 'border-gray-600',
      card: 'bg-gray-800',
      cardHover: 'hover:bg-gray-700',
      input: 'bg-gray-800 border-gray-600 focus:border-purple-400 text-white',
      button: 'bg-gradient-to-r from-purple-500 to-orange-400 hover:from-purple-600 hover:to-orange-500',
      buttonSecondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600',
      navbar: 'bg-gray-800 shadow-md border-b border-gray-700',
      modal: 'bg-gray-800',
      modalBackdrop: 'bg-black/60',
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400',
      gradient: 'from-purple-500 to-orange-400',
      gradientHover: 'hover:from-purple-600 hover:to-orange-500'
    }
  };

  const value = {
    theme,
    toggleTheme,
    styles: themeStyles[theme]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
