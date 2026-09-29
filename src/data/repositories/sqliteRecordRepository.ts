import type { SQLiteDatabase } from 'expo-sqlite';
import type { Exercise } from '@/domain/models/exercise';
import type { ExerciseRecord } from '@/domain/models/exerciseRecord';
import type { WorkoutRecord } from '@/domain/models/workoutRecord';
import type { RecordRepository } from '@/domain/repositories';
import { createExerciseRecords, createWorkoutRecord } from '@/domain/workoutSession';

type WorkoutRow = {
  id: string;
  routine_id: string;
  workout_date: string;
  completed: number;
  created_at: string;
};

type ExerciseRecordRow = {
  id: string;
  workout_record_id: string;
  exercise_id: string;
  completed: number;
  completed_at: string | null;
};

export class SqliteRecordRepository implements RecordRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async getOrCreateSession(routineId: string, date: string, exercises: Exercise[]) {
    let workout: WorkoutRecord | null = null;

    await this.database.withTransactionAsync(async () => {
      let row = await this.database.getFirstAsync<WorkoutRow>(
        'SELECT * FROM workout_records WHERE routine_id = ? AND workout_date = ?;',
        routineId,
        date,
      );

      if (!row) {
        const created = createWorkoutRecord(routineId, date);
        await this.database.runAsync(
          `INSERT OR IGNORE INTO workout_records (id, routine_id, workout_date, completed, created_at)
           VALUES (?, ?, ?, ?, ?);`,
          created.id,
          created.routineId,
          created.workoutDate,
          Number(created.completed),
          created.createdAt,
        );
        row = await this.database.getFirstAsync<WorkoutRow>(
          'SELECT * FROM workout_records WHERE routine_id = ? AND workout_date = ?;',
          routineId,
          date,
        );
      }

      if (!row) throw new Error('운동 기록을 생성하지 못했습니다.');
      workout = toWorkout(row);

      const missingRecords = createExerciseRecords(workout.id, exercises.map(({ id }) => id));
      for (const record of missingRecords) {
        await this.database.runAsync(
          `INSERT OR IGNORE INTO exercise_records
           (id, workout_record_id, exercise_id, completed, completed_at)
           VALUES (?, ?, ?, 0, NULL);`,
          record.id,
          record.workoutRecordId,
          record.exerciseId,
        );
      }
    });

    const session = workout as WorkoutRecord;
    const rows = await this.database.getAllAsync<ExerciseRecordRow>(
      'SELECT * FROM exercise_records WHERE workout_record_id = ? ORDER BY rowid;',
      session.id,
    );
    return { workout: session, exercises: rows.map(toExerciseRecord) };
  }

  async setExerciseCompleted(recordId: string, exerciseId: string, completed: boolean): Promise<void> {
    await this.database.withTransactionAsync(async () => {
      await this.database.runAsync(
        `UPDATE exercise_records SET completed = ?, completed_at = ?
         WHERE workout_record_id = ? AND exercise_id = ?;`,
        Number(completed),
        completed ? new Date().toISOString() : null,
        recordId,
        exerciseId,
      );
      await this.database.runAsync(
        `UPDATE workout_records
         SET completed = (
           SELECT COUNT(*) > 0 AND SUM(completed) = COUNT(*)
           FROM exercise_records WHERE workout_record_id = ?
         )
         WHERE id = ?;`,
        recordId,
        recordId,
      );
    });
  }

  async getRecordsForDate(date: string): Promise<WorkoutRecord[]> {
    const rows = await this.database.getAllAsync<WorkoutRow>(
      'SELECT * FROM workout_records WHERE workout_date = ?;',
      date,
    );
    return rows.map(toWorkout);
  }

  async getCompletedDates(startDate: string, endDate: string): Promise<string[]> {
    const rows = await this.database.getAllAsync<{ workout_date: string }>(
      `SELECT workout_date FROM workout_records
       WHERE workout_date BETWEEN ? AND ?
       GROUP BY workout_date
       HAVING COUNT(*) > 0 AND SUM(completed) = COUNT(*);`,
      startDate,
      endDate,
    );
    return rows.map(({ workout_date }) => workout_date);
  }
}

function toWorkout(row: WorkoutRow): WorkoutRecord {
  return {
    id: row.id,
    routineId: row.routine_id,
    workoutDate: row.workout_date,
    completed: row.completed === 1,
    createdAt: row.created_at,
  };
}

function toExerciseRecord(row: ExerciseRecordRow): ExerciseRecord {
  return {
    id: row.id,
    workoutRecordId: row.workout_record_id,
    exerciseId: row.exercise_id,
    completed: row.completed === 1,
    completedAt: row.completed_at,
  };
}