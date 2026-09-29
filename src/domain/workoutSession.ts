import type { ExerciseRecord } from './models/exerciseRecord';
import type { WorkoutRecord } from './models/workoutRecord';

export function createWorkoutRecord(routineId: string, workoutDate: string): WorkoutRecord {
  return {
    id: createId(),
    routineId,
    workoutDate,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export function createExerciseRecords(
  workoutRecordId: string,
  exerciseIds: string[],
): ExerciseRecord[] {
  return exerciseIds.map((exerciseId) => ({
    id: createId(),
    workoutRecordId,
    exerciseId,
    completed: false,
    completedAt: null,
  }));
}

export function updateExerciseCompletion(
  records: ExerciseRecord[],
  exerciseId: string,
  completed: boolean,
): ExerciseRecord[] {
  return records.map((record) =>
    record.exerciseId === exerciseId
      ? { ...record, completed, completedAt: completed ? new Date().toISOString() : null }
      : record,
  );
}

export function isWorkoutComplete(records: ExerciseRecord[]): boolean {
  return records.length > 0 && records.every((record) => record.completed);
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}