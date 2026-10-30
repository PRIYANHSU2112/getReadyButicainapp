import React, {createContext, useContext, useState, ReactNode} from "react";
import {lightTheme, AppTheme} from "./lightTheme";
import {darkTheme} from "./darkTheme";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: AppTheme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme, themeMode: "system", isDark: false,
  setThemeMode: () => {}, toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const isDark = themeMode === "dark";
  const theme = isDark ? darkTheme : lightTheme;
  const toggleTheme = () => setThemeMode(prev => prev === "light" ? "dark" : "light");
  return (
    <ThemeContext.Provider value={{theme, themeMode, isDark, setThemeMode, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export * from "./colors";
export * from "./typography";
export * from "./spacing";
export * from "./radius";
export * from "./shadows";
export * from "./dimensions";
export * from "./animations";
export * from "./lightTheme";
export * from "./darkTheme";
