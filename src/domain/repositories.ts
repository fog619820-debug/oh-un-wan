import type { Exercise } from './models/exercise';
import type { ExerciseRecord } from './models/exerciseRecord';
import type { Routine } from './models/routine';
import type { WorkoutRecord } from './models/workoutRecord';

export interface RoutineRepository {
  getAll(): Promise<Routine[]>;
  getById(id: string): Promise<Routine | null>;
  save(routine: Routine): Promise<void>;
  delete(id: string): Promise<void>;
  getExercises(routineId: string): Promise<Exercise[]>;
  saveExercise(exercise: Exercise): Promise<void>;
  deleteExercise(id: string): Promise<void>;
}

export interface RecordRepository {
  getOrCreateSession(routineId: string, date: string, exercises: Exercise[]): Promise<{
    workout: WorkoutRecord;
    exercises: ExerciseRecord[];
  }>;
  setExerciseCompleted(recordId: string, exerciseId: string, completed: boolean): Promise<void>;
  getRecordsForDate(date: string): Promise<WorkoutRecord[]>;
  getCompletedDates(startDate: string, endDate: string): Promise<string[]>;
}