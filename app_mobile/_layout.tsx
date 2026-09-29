import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { migrateDatabase } from '@/data/db/migrations';
import { requestNotificationPermission } from '@/services/notification';

export default function RootLayout() {
  useEffect(() => {
    void requestNotificationPermission();
  }, []);

  return (
    <SQLiteProvider databaseName="ohunwan.db" onInit={migrateDatabase}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTintColor: '#2f6f5e', headerTitleStyle: { color: '#1b2923' }, contentStyle: { backgroundColor: '#f6f7f3' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="routine/[id]" options={{ title: '루틴 편집', presentation: 'card' }} />
        <Stack.Screen name="routine/exercise" options={{ title: '운동 항목', presentation: 'card' }} />
      </Stack>
    </SQLiteProvider>
  );
}