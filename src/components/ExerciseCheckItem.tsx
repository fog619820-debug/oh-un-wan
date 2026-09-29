import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Exercise } from '@/domain/models/exercise';

interface ExerciseCheckItemProps {
  exercise: Exercise;
  completed: boolean;
  onToggle: () => void;
}

export function ExerciseCheckItem({ exercise, completed, onToggle }: ExerciseCheckItemProps) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: completed }} onPress={onToggle} style={styles.row}>
      <View style={[styles.check, completed && styles.checked]}>
        {completed ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <View style={styles.details}>
        <Text style={[styles.name, completed && styles.completedName]}>{exercise.name}</Text>
        <Text style={styles.meta}>
          {exercise.sets}세트 · {exercise.reps}회{exercise.weightKg === null ? '' : ` · ${exercise.weightKg}kg`}
        </Text>
      </View>
      <Text style={styles.rest}>{Math.floor(exercise.restSeconds / 60)}분 휴식</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e7e9e5' },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: '#aab3a9', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  checked: { backgroundColor: '#2f6f5e', borderColor: '#2f6f5e' },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: '700' },
  details: { flex: 1 },
  name: { color: '#1b2923', fontSize: 16, fontWeight: '600' },
  completedName: { color: '#7a827b', textDecorationLine: 'line-through' },
  meta: { color: '#747c75', fontSize: 13, marginTop: 4 },
  rest: { color: '#536b5e', fontSize: 12, marginLeft: 8 },
});