import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import type { Routine } from '@/domain/models/routine';
import { SqliteRoutineRepository } from '@/data/repositories/sqliteRoutineRepository';

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

export function RoutineListScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setRoutines(await new SqliteRoutineRepository(database).getAll());
    } finally {
      setLoading(false);
    }
  }, [database]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>TRAINING PLAN</Text>
          <Text style={styles.title}>내 루틴</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/routine/new')} style={styles.addButton}>
          <Text style={styles.addText}>＋ 루틴 추가</Text>
        </Pressable>
      </View>
      {loading ? <ActivityIndicator color="#2f6f5e" style={styles.loading} /> : (
        <ScrollView contentContainerStyle={styles.list}>
          {routines.length === 0 ? <Text style={styles.empty}>아직 만든 루틴이 없습니다.</Text> : routines.map((routine) => (
            <Pressable key={routine.id} onPress={() => router.push(`/routine/${routine.id}`)} style={styles.item}>
              <View style={styles.itemTop}>
                <Text style={styles.name}>{routine.name}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
              <View style={styles.days}>
                {dayNames.map((day, index) => (
                  <View key={day} style={[styles.day, routine.weekdays.includes(index) && styles.activeDay]}>
                    <Text style={[styles.dayText, routine.weekdays.includes(index) && styles.activeDayText]}>{day}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f6f7f3' },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  eyebrow: { color: '#65746a', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#1b2923', fontSize: 28, fontWeight: '800', marginTop: 4 },
  addButton: { backgroundColor: '#2f6f5e', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 5 },
  addText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  item: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e1e5df', borderRadius: 6, padding: 16, marginBottom: 10 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: '#1b2923', fontSize: 17, fontWeight: '700' },
  chevron: { color: '#738078', fontSize: 24 },
  days: { flexDirection: 'row', gap: 7, marginTop: 15 },
  day: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#f0f2ee' },
  activeDay: { backgroundColor: '#2f6f5e' },
  dayText: { color: '#828a83', fontSize: 12 },
  activeDayText: { color: '#fff', fontWeight: '700' },
  loading: { marginTop: 48 },
  empty: { color: '#747c75', fontSize: 14, paddingVertical: 30 },
});