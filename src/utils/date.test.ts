import test from 'node:test';
import assert from 'node:assert/strict';

import { getKoreanWeekdayLabel, toDateKey } from './date.ts';

test('Monday should map to 월요일, not 화요일', () => {
  const date = new Date(2026, 9, 5); // 2026-10-05 is Monday
  assert.equal(getKoreanWeekdayLabel(date), '월');
});

test('date key should respect local calendar date, not UTC conversion', () => {
  const date = new Date(2026, 9, 5, 9, 30, 0);
  assert.equal(toDateKey(date), '2026-10-05');
});
