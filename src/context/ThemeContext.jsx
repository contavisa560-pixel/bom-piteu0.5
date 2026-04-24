// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Função para obter o ID do usuário atual
  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem('bomPiteuUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || user._id;
      }
    } catch (e) {
      console.error('Erro ao ler usuário:', e);
    }
    return null;
  };

  // Carrega o tema do usuário atual
  const [theme, setTheme] = useState(() => {
    const userId = getCurrentUserId();
    
    // Se tiver usuário logado, busca tema específico dele
    if (userId) {
      const userTheme = localStorage.getItem(`smartchef_theme_${userId}`);
      if (userTheme) return userTheme;
    }
    
    // Fallback para tema padrão
    return localStorage.getItem("smartchef_theme") || "light";
  });

  // Guarda o tema quando mudar
  useEffect(() => {
    const userId = getCurrentUserId();
    
    // Guarda com base no usuário
    if (userId) {
      localStorage.setItem(`smartchef_theme_${userId}`, theme);
    } else {
      localStorage.setItem("smartchef_theme", theme);
    }

    // Aplica o tema no documento
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    document.documentElement.setAttribute('data-theme', theme);
    
  }, [theme]);

  // Ouvir mudanças na preferência do sistema
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);