import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { Routine } from '@/domain/models/routine';
import type { WorkoutRecord } from '@/domain/models/workoutRecord';
import { SqliteRecordRepository } from '@/data/repositories/sqliteRecordRepository';
import { SqliteRoutineRepository } from '@/data/repositories/sqliteRoutineRepository';
import { getMondayFirstWeekdayIndex, getMonthBounds, toDateKey } from '@/utils/date';

export interface DayRoutineSummary {
  routine: Routine;
  workout: WorkoutRecord | null;
}

export function useCalendarViewModel() {
  const database = useSQLiteContext();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const [dayRoutines, setDayRoutines] = useState<DayRoutineSummary[]>([]);

  useEffect(() => {
    const bounds = getMonthBounds(month.getFullYear(), month.getMonth());
    void new SqliteRecordRepository(database).getCompletedDates(bounds.start, bounds.end)
      .then((dates) => setCompletedDates(new Set(dates)));
  }, [database, month]);

  useEffect(() => {
    const weekday = getMondayFirstWeekdayIndex(new Date(`${selectedDate}T12:00:00`));
    void Promise.all([
      new SqliteRoutineRepository(database).getAll(),
      new SqliteRecordRepository(database).getRecordsForDate(selectedDate),
    ]).then(([allRoutines, records]) => {
      const byRoutine = new Map(records.map((record) => [record.routineId, record]));
      setDayRoutines(allRoutines
        .filter((routine) => routine.weekdays.includes(weekday))
        .map((routine) => ({ routine, workout: byRoutine.get(routine.id) ?? null })));
    });
  }, [database, selectedDate]);

  const changeMonth = useCallback((amount: number) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }, []);

  const selectDate = useCallback((day: number) => {
    setSelectedDate(toDateKey(new Date(month.getFullYear(), month.getMonth(), day)));
  }, [month]);

  return { month, selectedDate, completedDates, dayRoutines, changeMonth, selectDate };
}