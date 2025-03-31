import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { FirebaseProvider } from '../context/FirebaseContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <FirebaseProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          },
          headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'CricVerse',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            title: 'Authentication',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </FirebaseProvider>
  );
} 