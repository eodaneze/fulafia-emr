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

        <Stack.Screen
          name="patient/register"
          options={{
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="patient/[patientId]"
          options={{
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="nursing/index"
          options={{
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="nursing/[patientId]"
          options={{
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="doctor/index"
          options={{
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="doctor/[patientId]"
          options={{
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="laboratory/index"
          options={{
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="laboratory/[requestId]"
          options={{
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="doctor/review/[patientId]"
          options={{
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="doctor/prescription/[patientId]"
          options={{
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="pharmacy/index"
          options={{
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="pharmacy/[prescriptionId]"
          options={{
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="ward/index"
          options={{
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="ward/admit/[patientId]"
          options={{
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="ward/[admissionId]"
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </>
  );
}