import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CompletionDialog } from '@/components/CompletionDialog';
import { RestTimerBar } from '@/components/RestTimerBar';
import { StampBadge } from '@/components/StampBadge';
import { RoutineSection } from './RoutineSection';
import { useTodayViewModel } from './useTodayViewModel';

const weekdayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export function TodayScreen() {
  const router = useRouter();
  const { routines, loading, completed, toggleExercise } = useTodayViewModel();
  const [dismissed, setDismissed] = useState(false);
  const today = new Date();
  const dateLabel = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${weekdayNames[today.getDay()]}`;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.date}>{dateLabel}</Text>
        <View style={styles.headingRow}>
          <Text style={styles.title}>오늘의 운동</Text>
          {routines.length > 0 ? <StampBadge complete={completed} /> : null}
        </View>
        {loading ? <ActivityIndicator color="#2f6f5e" style={styles.loading} /> : routines.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>오늘 등록된 루틴이 없어요</Text>
            <Text style={styles.emptyText}>운동할 요일을 지정해 루틴을 추가해보세요.</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/routines')} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>루틴 만들기</Text>
            </Pressable>
          </View>
        ) : routines.map((item) => (
          <RoutineSection key={item.routine.id} item={item} onToggleExercise={(routineId, exerciseId) => void toggleExercise(routineId, exerciseId)} />
        ))}
      </ScrollView>
      <RestTimerBar />
      <CompletionDialog visible={completed && !dismissed} onClose={() => setDismissed(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f6f7f3' },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 36 },
  date: { color: '#69756d', fontSize: 13 },
  headingRow: { marginTop: 7, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#1b2923', fontSize: 28, fontWeight: '800' },
  loading: { marginTop: 48 },
  empty: { paddingTop: 42, alignItems: 'flex-start' },
  emptyTitle: { color: '#1b2923', fontSize: 17, fontWeight: '700' },
  emptyText: { color: '#747c75', fontSize: 14, marginTop: 8 },
  primaryButton: { marginTop: 20, minHeight: 46, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2f6f5e', borderRadius: 5 },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});