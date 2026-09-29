import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { Exercise } from '@/domain/models/exercise';
import type { Routine } from '@/domain/models/routine';
import type { WorkoutRecord } from '@/domain/models/workoutRecord';
import { isDailyCompletion } from '@/domain/dailyCompletion';
import { SqliteRecordRepository } from '@/data/repositories/sqliteRecordRepository';
import { SqliteRoutineRepository } from '@/data/repositories/sqliteRoutineRepository';
import { notifyWorkoutComplete } from '@/services/notification';
import { useRestTimerStore } from '@/stores/restTimerStore';
import { toDateKey } from '@/utils/date';

export interface TodayRoutine {
  routine: Routine;
  workout: WorkoutRecord;
  exercises: Array<Exercise & { completed: boolean }>;
}

export function useTodayViewModel() {
  const database = useSQLiteContext();
  const [routines, setRoutines] = useState<TodayRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const startTimer = useRestTimerStore((state) => state.start);
  const date = toDateKey(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const routineRepository = new SqliteRoutineRepository(database);
      const recordRepository = new SqliteRecordRepository(database);
      const weekday = new Date().getDay();
      const scheduled = (await routineRepository.getAll()).filter((routine) => routine.weekdays.includes(weekday));
      const sessions = await Promise.all(scheduled.map(async (routine) => {
        const exercises = await routineRepository.getExercises(routine.id);
        const session = await recordRepository.getOrCreateSession(routine.id, date, exercises);
        return {
          routine,
          workout: session.workout,
          exercises: exercises.map((exercise) => ({
            ...exercise,
            completed: session.exercises.find((record) => record.exerciseId === exercise.id)?.completed ?? false,
          })),
        };
      }));
      setRoutines(sessions);
      return sessions;
    } finally {
      setLoading(false);
    }
  }, [database, date]);

  useEffect(() => { void load(); }, [load]);

  const toggleExercise = useCallback(async (routineId: string, exerciseId: string) => {
    const session = routines.find(({ routine }) => routine.id === routineId);
    const exercise = session?.exercises.find(({ id }) => id === exerciseId);
    if (!session || !exercise) return;
    await new SqliteRecordRepository(database).setExerciseCompleted(
      session.workout.id,
      exerciseId,
      !exercise.completed,
    );
    if (!exercise.completed && exercise.restSeconds > 0) startTimer(exercise.restSeconds);
    const updated = await load();
    if (isDailyCompletion(
      updated.map(({ routine }) => routine.id),
      updated.map(({ workout }) => workout),
    )) {
      await notifyWorkoutComplete();
    }
  }, [database, load, routines, startTimer]);

  const completed = routines.length > 0 && routines.every(({ workout, exercises }) =>
    exercises.length > 0 && exercises.every(({ completed: isDone }) => isDone) && workout.completed,
  );

  return { routines, loading, completed, reload: load, toggleExercise };
}