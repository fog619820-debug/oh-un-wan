export interface ExerciseRecord {
  id: string;
  workoutRecordId: string;
  exerciseId: string;
  completed: boolean;
  completedAt: string | null;
}