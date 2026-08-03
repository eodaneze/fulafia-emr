import 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useAuthStore } from '@/src/store/auth.store';
import { colors } from '@/src/theme';

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="index" />

        <Stack.Screen
          name="connect-server"
          options={{
            animation: 'fade_from_bottom',
          }}
        />

        <Stack.Screen
          name="login"
          options={{
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="(app)"
          options={{
            animation: 'fade',
          }}
        />
      </Stack>
    </>
  );
}