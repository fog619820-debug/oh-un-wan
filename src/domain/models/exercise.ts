export interface Exercise {
  id: string;
  routineId: string;
  name: string;
  sets: number;
  reps: number;
  weightKg: number | null;
  restSeconds: number;
  position: number;
}