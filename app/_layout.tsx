import {Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";
import {useEffect, useState} from "react";
import "react-native-reanimated";
import {initDatabase} from "../src/data/db";
import {ThemeProvider} from "../src/theme/ThemeProvider";
import {ToastProvider} from "../src/ui";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();
        setDbReady(true);
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    }

    prepare();
  }, []);

  if (!dbReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <Stack screenOptions={{headerShown: false}}>
          <Stack.Screen name="index" />
          <Stack.Screen name="calendar" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="theme-selector" />
          <Stack.Screen name="day/[dateKey]" />
          <Stack.Screen name="revision/[entryId]" />
        </Stack>
        <StatusBar style="auto" />
      </ToastProvider>
    </ThemeProvider>
  );
}
