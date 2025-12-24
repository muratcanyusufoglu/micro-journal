import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {Appearance} from "react-native";
import {
  radius,
  shadows,
  spacing,
  themeColors,
  typography,
  type Theme,
  type ThemeName,
} from "./schema";

const THEME_STORAGE_KEY = "@oneline_theme";

interface ThemeContextType extends Theme {
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({children}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>("light");

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (
        savedTheme &&
        (savedTheme === "light" ||
          savedTheme === "dark" ||
          savedTheme === "warm" ||
          savedTheme === "cool")
      ) {
        setCurrentTheme(savedTheme as ThemeName);
      } else {
        // Default to system preference
        const colorScheme = Appearance.getColorScheme();
        setCurrentTheme(colorScheme === "dark" ? "dark" : "light");
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  }

  async function handleSetTheme(theme: ThemeName) {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setCurrentTheme(theme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  }

  const theme: ThemeContextType = {
    colors: themeColors[currentTheme],
    radius,
    spacing,
    typography,
    shadows,
    currentTheme,
    setTheme: handleSetTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
