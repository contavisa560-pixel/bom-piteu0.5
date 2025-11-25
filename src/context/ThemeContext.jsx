import { createContext, useContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // carrega o tema gravado ou usa light por padrão
  const [theme, setTheme] = useState(
    localStorage.getItem("smartchef_theme") || "light"
  );

  useEffect(() => {
    // atualiza o atributo global
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("smartchef_theme", theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// 🔥 ESTE EXPORT É O QUE FALTAVA
export const useTheme = () => useContext(ThemeContext);
