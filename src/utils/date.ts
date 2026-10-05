export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMondayFirstWeekdayIndex(date: Date): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function getKoreanWeekdayLabel(date: Date): string {
  const labels = ['월', '화', '수', '목', '금', '토', '일'];
  return labels[getMondayFirstWeekdayIndex(date)];
}

export function getMonthBounds(year: number, month: number): { start: string; end: string } {
  return {
    start: toDateKey(new Date(year, month, 1)),
    end: toDateKey(new Date(year, month + 1, 0)),
  };
}