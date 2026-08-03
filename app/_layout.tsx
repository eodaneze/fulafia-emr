import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/src/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />

        <Stack.Screen
          name="connect-server"
          options={{
            animation: 'fade_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}