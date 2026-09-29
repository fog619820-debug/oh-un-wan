import { StyleSheet, Text, View } from 'react-native';
import type { DayRoutineSummary } from './useCalendarViewModel';

export function DayDetailSheet({ date, routines }: { date: string; routines: DayRoutineSummary[] }) {
  const [, month, day] = date.split('-');

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{Number(month)}월 {Number(day)}일 운동</Text>
      {routines.length === 0 ? <Text style={styles.empty}>예정된 루틴이 없습니다.</Text> : routines.map(({ routine, workout }) => (
        <View key={routine.id} style={styles.row}>
          <View style={[styles.dot, workout?.completed && styles.doneDot]} />
          <Text style={styles.name}>{routine.name}</Text>
          <Text style={[styles.status, workout?.completed && styles.done]}>
            {workout?.completed ? '완료' : workout ? '진행 중' : '기록 없음'}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 22, paddingBottom: 30 },
  heading: { color: '#1b2923', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e3e6e1' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#c7cec7', marginRight: 12 },
  doneDot: { backgroundColor: '#2f6f5e' },
  name: { flex: 1, color: '#26352d', fontSize: 14, fontWeight: '600' },
  status: { color: '#818981', fontSize: 12 },
  done: { color: '#2f6f5e', fontWeight: '700' },
  empty: { color: '#747c75', fontSize: 14, paddingVertical: 14 },
});