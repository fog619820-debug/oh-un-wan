import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#2f6f5e',
      tabBarInactiveTintColor: '#858d86',
      tabBarStyle: { height: 62, paddingTop: 5, paddingBottom: 7, borderTopColor: '#e0e4de', backgroundColor: '#fff' },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ title: '오늘' }} />
      <Tabs.Screen name="routines" options={{ title: '루틴' }} />
      <Tabs.Screen name="calendar" options={{ title: '달력' }} />
      <Tabs.Screen name="ai" options={{ title: 'AI 상담' }} />
    </Tabs>
  );
}