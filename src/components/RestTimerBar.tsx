import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cancelNotification, scheduleRestFinished } from '@/services/notification';
import { useRestTimerStore } from '@/stores/restTimerStore';

export function RestTimerBar() {
  const { endsAt, remainingSeconds, tick, stop } = useRestTimerStore();

  useEffect(() => {
    if (endsAt === null) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt, tick]);

  useEffect(() => {
    if (endsAt === null) return;
    let notificationId: string | null = null;
    let cancelled = false;
    const secondsUntilEnd = Math.max(1, Math.ceil((endsAt - Date.now()) / 1000));
    scheduleRestFinished(secondsUntilEnd).then((id) => {
      notificationId = id;
      if (cancelled) void cancelNotification(id);
    });
    return () => {
      cancelled = true;
      void cancelNotification(notificationId);
    };
  }, [endsAt]);

  if (endsAt === null) return null;
  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const seconds = String(remainingSeconds % 60).padStart(2, '0');

  return (
    <View style={styles.bar}>
      <View>
        <Text style={styles.label}>휴식 중</Text>
        <Text style={styles.time}>{minutes}:{seconds}</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={stop} style={styles.stopButton}>
        <Text style={styles.stopText}>건너뛰기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { minHeight: 68, backgroundColor: '#1e342b', paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#b6c9bb', fontSize: 12 },
  time: { color: '#fff', fontSize: 21, fontWeight: '700', fontVariant: ['tabular-nums'] },
  stopButton: { paddingVertical: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: '#6d8578', borderRadius: 5 },
  stopText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});