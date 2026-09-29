import type { SQLiteDatabase } from 'expo-sqlite';
import { initialSchema } from './sql/001_init';

export async function migrateDatabase(database: SQLiteDatabase): Promise<void> {
  await database.execAsync('PRAGMA foreign_keys = ON;');
  const result = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const version = result?.user_version ?? 0;

  if (version < 1) {
    await database.withTransactionAsync(async () => {
      await database.execAsync(initialSchema);
      await database.execAsync('PRAGMA user_version = 1;');
    });
  }

  await database.runAsync(
    'INSERT OR IGNORE INTO users (id, name) VALUES (?, ?);',
    'local-user',
    '사용자',
  );
}