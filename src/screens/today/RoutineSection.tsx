import { StyleSheet, Text, View } from 'react-native';
import { ExerciseCheckItem } from '@/components/ExerciseCheckItem';
import type { TodayRoutine } from './useTodayViewModel';

interface RoutineSectionProps {
  item: TodayRoutine;
  onToggleExercise: (routineId: string, exerciseId: string) => void;
}

export function RoutineSection({ item, onToggleExercise }: RoutineSectionProps) {
  const completedCount = item.exercises.filter(({ completed }) => completed).length;

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.title}>{item.routine.name}</Text>
        <Text style={styles.progress}>{completedCount}/{item.exercises.length}</Text>
      </View>
      {item.exercises.map((exercise) => (
        <ExerciseCheckItem
          key={exercise.id}
          exercise={exercise}
          completed={exercise.completed}
          onToggle={() => onToggleExercise(item.routine.id, exercise.id)}
        />
      ))}
      {item.exercises.length === 0 ? <Text style={styles.empty}>운동 항목을 추가해주세요.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 26 },
  heading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#cfd5ce', paddingBottom: 10 },
  title: { color: '#1b2923', fontSize: 18, fontWeight: '700' },
  progress: { color: '#69756d', fontSize: 13, fontVariant: ['tabular-nums'] },
  empty: { color: '#747c75', fontSize: 14, paddingTop: 12 },
});