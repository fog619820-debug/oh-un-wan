import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SqliteRoutineRepository } from '@/data/repositories/sqliteRoutineRepository';

export function ExerciseEditScreen() {
  const { routineId, exerciseId } = useLocalSearchParams<{ routineId: string; exerciseId?: string }>();
  const database = useSQLiteContext();
  const router = useRouter();
  const [name, setName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('');
  const [rest, setRest] = useState('90');

  useEffect(() => {
    if (!exerciseId) return;
    void new SqliteRoutineRepository(database).getExercises(routineId).then((items) => {
      const exercise = items.find((item) => item.id === exerciseId);
      if (!exercise) return;
      setName(exercise.name);
      setSets(String(exercise.sets));
      setReps(String(exercise.reps));
      setWeight(exercise.weightKg === null ? '' : String(exercise.weightKg));
      setRest(String(exercise.restSeconds));
    });
  }, [database, exerciseId, routineId]);

  const save = async () => {
    const parsedSets = Number(sets);
    const parsedReps = Number(reps);
    const parsedRest = Number(rest);
    if (!name.trim() || !Number.isInteger(parsedSets) || parsedSets < 1 || !Number.isInteger(parsedReps) || parsedReps < 1 || !Number.isInteger(parsedRest) || parsedRest < 0) {
      Alert.alert('운동 이름과 올바른 세트·횟수·휴식 시간을 입력해주세요.');
      return;
    }
    const repository = new SqliteRoutineRepository(database);
    const current = await repository.getExercises(routineId);
    await repository.saveExercise({
      id: exerciseId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      routineId,
      name: name.trim(),
      sets: parsedSets,
      reps: parsedReps,
      weightKg: weight.trim() ? Number(weight) : null,
      restSeconds: parsedRest,
      position: current.find((item) => item.id === exerciseId)?.position ?? current.length,
    });
    router.back();
  };

  const remove = async () => {
    if (!exerciseId) return;
    await new SqliteRoutineRepository(database).deleteExercise(exerciseId);
    router.back();
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.label}>운동 이름</Text>
      <TextInput value={name} onChangeText={setName} placeholder="예: 스쿼트" style={styles.input} />
      <View style={styles.row}>
        <NumericField label="세트" value={sets} onChange={setSets} suffix="세트" />
        <NumericField label="반복 횟수" value={reps} onChange={setReps} suffix="회" />
      </View>
      <View style={styles.row}>
        <NumericField label="무게" value={weight} onChange={setWeight} suffix="kg" decimal />
        <NumericField label="휴식 시간" value={rest} onChange={setRest} suffix="초" />
      </View>
      <Pressable accessibilityRole="button" onPress={() => void save()} style={styles.saveButton}>
        <Text style={styles.saveText}>저장</Text>
      </Pressable>
      {exerciseId ? <Pressable onPress={() => Alert.alert('운동 삭제', '이 운동을 삭제할까요?', [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => void remove() },
      ])} style={styles.deleteButton}><Text style={styles.deleteText}>운동 삭제</Text></Pressable> : null}
    </ScrollView>
  );
}

function NumericField({ label, value, onChange, suffix, decimal = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  decimal?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.numberInput}>
        <TextInput value={value} onChangeText={onChange} keyboardType={decimal ? 'decimal-pad' : 'number-pad'} style={styles.numberText} />
        <Text style={styles.suffix}>{suffix}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f6f7f3' },
  content: { padding: 20, paddingBottom: 40 },
  label: { color: '#27362e', fontSize: 14, fontWeight: '700', marginBottom: 9 },
  input: { minHeight: 48, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dce1db', borderRadius: 5, paddingHorizontal: 13, color: '#1b2923', fontSize: 15, marginBottom: 22 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  field: { flex: 1 },
  numberInput: { minHeight: 48, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dce1db', borderRadius: 5, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  numberText: { flex: 1, color: '#1b2923', fontSize: 15 },
  suffix: { color: '#747c75', fontSize: 13 },
  saveButton: { minHeight: 50, marginTop: 10, backgroundColor: '#2f6f5e', justifyContent: 'center', alignItems: 'center', borderRadius: 5 },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  deleteButton: { marginTop: 13, minHeight: 46, justifyContent: 'center', alignItems: 'center' },
  deleteText: { color: '#a7433c', fontSize: 14, fontWeight: '600' },
});