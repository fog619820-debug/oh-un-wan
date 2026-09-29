import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export async function requestNotificationPermission(): Promise<void> {
  if (Platform.OS === 'web') return;
  const current = await Notifications.getPermissionsAsync();
  if (!current.granted) await Notifications.requestPermissionsAsync();
}

export async function scheduleRestFinished(seconds: number): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  return Notifications.scheduleNotificationAsync({
    content: { title: '휴식 종료', body: '다음 운동을 시작해볼까요?' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
  });
}

export async function cancelNotification(id: string | null): Promise<void> {
  if (id) await Notifications.cancelScheduledNotificationAsync(id);
}

export async function notifyWorkoutComplete(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.scheduleNotificationAsync({
    content: { title: '오늘 운동 완료', body: '오늘도 오운완!' },
    trigger: null,
  });
}