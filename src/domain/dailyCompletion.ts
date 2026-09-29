import type { WorkoutRecord } from './models/workoutRecord';

export function isDailyCompletion(
  routineIds: string[],
  workoutRecords: WorkoutRecord[],
): boolean {
  if (routineIds.length === 0) return false;

  const completedRoutineIds = new Set(
    workoutRecords.filter((record) => record.completed).map((record) => record.routineId),
  );

  return routineIds.every((routineId) => completedRoutineIds.has(routineId));
}