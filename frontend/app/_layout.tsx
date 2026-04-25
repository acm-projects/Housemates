import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useColorScheme } from '../hooks/use-color-scheme';
import { getUserPool } from '../lib/auth';

export const unstable_settings = {
  anchor: 'signin',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already logged in and navigate accordingly
    const checkAuth = () => {
      try {
        const userPool = getUserPool();
        const user = userPool.getCurrentUser();
        
        if (user) {
          // User is logged in, navigate to home
          router.replace('/home');
        } else {
          // User is not logged in, navigate to signin
          router.replace('/signin');
        }
      } catch (error) {
        // If any error, go to signin
        router.replace('/signin');
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#EC8575" />
      </View>
    );
  }

  return (
    <>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
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