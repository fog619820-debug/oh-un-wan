import type { SQLiteDatabase } from 'expo-sqlite';
import type { Exercise } from '@/domain/models/exercise';
import type { Routine } from '@/domain/models/routine';
import type { RoutineRepository } from '@/domain/repositories';

type RoutineRow = {
  id: string;
  user_id: string;
  name: string;
  weekdays: string;
  created_at: string;
};

type ExerciseRow = {
  id: string;
  routine_id: string;
  name: string;
  sets: number;
  reps: number;
  weight_kg: number | null;
  rest_seconds: number;
  position: number;
};

export class SqliteRoutineRepository implements RoutineRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async getAll(): Promise<Routine[]> {
    const rows = await this.database.getAllAsync<RoutineRow>(
      'SELECT * FROM routines ORDER BY created_at, name;',
    );
    return rows.map(toRoutine);
  }

  async getById(id: string): Promise<Routine | null> {
    const row = await this.database.getFirstAsync<RoutineRow>(
      'SELECT * FROM routines WHERE id = ?;',
      id,
    );
    return row ? toRoutine(row) : null;
  }

  async save(routine: Routine): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO routines (id, user_id, name, weekdays, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         weekdays = excluded.weekdays;`,
      routine.id,
      routine.userId,
      routine.name,
      JSON.stringify(routine.weekdays),
      routine.createdAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.database.runAsync('DELETE FROM routines WHERE id = ?;', id);
  }

  async getExercises(routineId: string): Promise<Exercise[]> {
    const rows = await this.database.getAllAsync<ExerciseRow>(
      'SELECT * FROM exercises WHERE routine_id = ? ORDER BY position, rowid;',
      routineId,
    );
    return rows.map(toExercise);
  }

  async saveExercise(exercise: Exercise): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO exercises (id, routine_id, name, sets, reps, weight_kg, rest_seconds, position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         sets = excluded.sets,
         reps = excluded.reps,
         weight_kg = excluded.weight_kg,
         rest_seconds = excluded.rest_seconds,
         position = excluded.position;`,
      exercise.id,
      exercise.routineId,
      exercise.name,
      exercise.sets,
      exercise.reps,
      exercise.weightKg,
      exercise.restSeconds,
      exercise.position,
    );
  }

  async deleteExercise(id: string): Promise<void> {
    await this.database.runAsync('DELETE FROM exercises WHERE id = ?;', id);
  }
}

function toRoutine(row: RoutineRow): Routine {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    weekdays: JSON.parse(row.weekdays) as number[],
    createdAt: row.created_at,
  };
}

function toExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    routineId: row.routine_id,
    name: row.name,
    sets: row.sets,
    reps: row.reps,
    weightKg: row.weight_kg,
    restSeconds: row.rest_seconds,
    position: row.position,
  };
}