import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '../hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: 'signin',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          initialRouteName="signin"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="signin" options={{ headerShown: false, animationEnabled: false }} />
          <Stack.Screen name="signUp" options={{ headerShown: false }} />
          <Stack.Screen name="verify" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false, animationEnabled: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="AddTask" options={{ headerShown: false }} />
          <Stack.Screen name="AddList" options={{ headerShown: false }} />
          <Stack.Screen name="AddHouse" options={{ headerShown: false }} />
          <Stack.Screen name="JoinHouse" options={{ headerShown: false }} />
          <Stack.Screen name="QrCode" options={{ headerShown: false }} />
          <Stack.Screen name="taskPage" options={{ headerShown: false }} />
          <Stack.Screen name="ShoppingList" options={{ headerShown: false }} />
          <Stack.Screen name="calendar" options={{ headerShown: false }} />
          <Stack.Screen name="expenses" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
      <StatusBar style="dark" />
    </>
  );
}
