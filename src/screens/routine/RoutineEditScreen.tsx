import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import type { Exercise } from '@/domain/models/exercise';
import type { Routine } from '@/domain/models/routine';
import { SqliteRoutineRepository } from '@/data/repositories/sqliteRoutineRepository';

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

export function RoutineEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const database = useSQLiteContext();
  const router = useRouter();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [name, setName] = useState('');
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const isNew = id === 'new';

  useFocusEffect(useCallback(() => {
    if (isNew) return undefined;
    const repository = new SqliteRoutineRepository(database);
    void Promise.all([repository.getById(id), repository.getExercises(id)]).then(([saved, savedExercises]) => {
      if (!saved) return;
      setRoutine(saved);
      setName(saved.name);
      setWeekdays(saved.weekdays);
      setExercises(savedExercises);
    });
  }, [database, id, isNew]));

  const toggleDay = (day: number) => {
    setWeekdays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort());
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('루틴 이름을 입력해주세요.');
      return;
    }
    if (weekdays.length === 0) {
      Alert.alert('운동할 요일을 하나 이상 선택해주세요.');
      return;
    }
    const saved: Routine = {
      id: routine?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      userId: 'local-user',
      name: name.trim(),
      weekdays,
      createdAt: routine?.createdAt ?? new Date().toISOString(),
    };
    await new SqliteRoutineRepository(database).save(saved);
    if (isNew) router.replace(`/routine/${saved.id}`);
    else router.back();
  };

  const remove = () => Alert.alert('루틴 삭제', '이 루틴과 운동 기록을 삭제할까요?', [
    { text: '취소', style: 'cancel' },
    { text: '삭제', style: 'destructive', onPress: async () => {
      await new SqliteRoutineRepository(database).delete(id);
      router.back();
    } },
  ]);

  const repository = new SqliteRoutineRepository(database);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.label}>루틴 이름</Text>
      <TextInput value={name} onChangeText={setName} placeholder="예: 상체 운동" placeholderTextColor="#929a93" style={styles.input} />
      <Text style={styles.label}>반복 요일</Text>
      <View style={styles.days}>
        {dayNames.map((day, index) => {
          const selected = weekdays.includes(index);
          return <Pressable key={day} onPress={() => toggleDay(index)} style={[styles.day, selected && styles.selectedDay]}>
            <Text style={[styles.dayText, selected && styles.selectedDayText]}>{day}</Text>
          </Pressable>;
        })}
      </View>

      {!isNew ? <View style={styles.exerciseSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>운동 항목</Text>
          <Pressable onPress={() => router.push({ pathname: '/routine/exercise', params: { routineId: id } })}>
            <Text style={styles.addExercise}>＋ 운동 추가</Text>
          </Pressable>
        </View>
        {exercises.map((exercise) => <Pressable key={exercise.id} onPress={() => router.push({ pathname: '/routine/exercise', params: { routineId: id, exerciseId: exercise.id } })} style={styles.exerciseRow}>
          <View style={styles.exerciseCopy}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseMeta}>{exercise.sets}세트 · {exercise.reps}회 · 휴식 {exercise.restSeconds}초</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>)}
      </View> : null}

      <Pressable accessibilityRole="button" onPress={() => void save()} style={styles.saveButton}>
        <Text style={styles.saveText}>저장</Text>
      </Pressable>
      {!isNew ? <Pressable onPress={remove} style={styles.deleteButton}><Text style={styles.deleteText}>루틴 삭제</Text></Pressable> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f6f7f3' },
  content: { padding: 20, paddingBottom: 40 },
  label: { color: '#27362e', fontSize: 14, fontWeight: '700', marginBottom: 9 },
  input: { minHeight: 48, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dce1db', borderRadius: 5, paddingHorizontal: 13, color: '#1b2923', fontSize: 15, marginBottom: 25 },
  days: { flexDirection: 'row', gap: 9, marginBottom: 30 },
  day: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: '#e8ebe6' },
  selectedDay: { backgroundColor: '#2f6f5e' },
  dayText: { color: '#59645d', fontWeight: '600' },
  selectedDayText: { color: '#fff' },
  exerciseSection: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addExercise: { color: '#2f6f5e', fontWeight: '700', fontSize: 13, padding: 6 },
  exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#dce1db' },
  exerciseCopy: { flex: 1 },
  exerciseName: { color: '#1b2923', fontSize: 15, fontWeight: '600' },
  exerciseMeta: { color: '#747c75', fontSize: 12, marginTop: 4 },
  chevron: { color: '#738078', fontSize: 23 },
  saveButton: { minHeight: 50, backgroundColor: '#2f6f5e', justifyContent: 'center', alignItems: 'center', borderRadius: 5 },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  deleteButton: { marginTop: 13, minHeight: 46, justifyContent: 'center', alignItems: 'center' },
  deleteText: { color: '#a7433c', fontSize: 14, fontWeight: '600' },
});