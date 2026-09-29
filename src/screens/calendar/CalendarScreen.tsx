import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DayDetailSheet } from './DayDetailSheet';
import { useCalendarViewModel } from './useCalendarViewModel';

const weekLabels = ['일', '월', '화', '수', '목', '금', '토'];

export function CalendarScreen() {
  const { month, selectedDate, completedDates, dayRoutines, changeMonth, selectDate } = useCalendarViewModel();
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const today = new Date();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>운동 달력</Text>
        <View style={styles.monthControls}>
          <Pressable accessibilityLabel="이전 달" onPress={() => changeMonth(-1)} style={styles.arrow}><Text style={styles.arrowText}>‹</Text></Pressable>
          <Text style={styles.monthLabel}>{year}년 {monthIndex + 1}월</Text>
          <Pressable accessibilityLabel="다음 달" onPress={() => changeMonth(1)} style={styles.arrow}><Text style={styles.arrowText}>›</Text></Pressable>
        </View>
      </View>
      <View style={styles.calendar}>
        {weekLabels.map((label, index) => <Text key={label} style={[styles.weekday, index === 0 && styles.sunday, index === 6 && styles.saturday]}>{label}</Text>)}
        {cells.map((day, index) => {
          if (day === null) return <View key={`empty-${index}`} style={styles.cell} />;
          const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = selectedDate === date;
          const isToday = today.getFullYear() === year && today.getMonth() === monthIndex && today.getDate() === day;
          return (
            <Pressable key={date} onPress={() => selectDate(day)} style={styles.cell}>
              <View style={[styles.dayCircle, isSelected && styles.selectedDay, isToday && !isSelected && styles.today]}>
                <Text style={[styles.dayText, isSelected && styles.selectedText]}>{day}</Text>
              </View>
              <View style={styles.markerSlot}>
                {completedDates.has(date) ? <View style={[styles.marker, isSelected && styles.selectedMarker]} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.legend}><View style={styles.legendDot} /><Text style={styles.legendText}>오운완 완료</Text></View>
      <DayDetailSheet date={selectedDate} routines={dayRoutines} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f6f7f3', paddingHorizontal: 20, paddingTop: 24 },
  header: { gap: 18 },
  title: { color: '#1b2923', fontSize: 28, fontWeight: '800' },
  monthControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthLabel: { color: '#26352d', fontSize: 16, fontWeight: '700' },
  arrow: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e9ede8', borderRadius: 18 },
  arrowText: { color: '#30463a', fontSize: 25, lineHeight: 27 },
  calendar: { marginTop: 20, flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: '14.2857%', textAlign: 'center', color: '#747c75', fontSize: 12, paddingBottom: 8 },
  sunday: { color: '#ad5147' },
  saturday: { color: '#4d7089' },
  cell: { width: '14.2857%', aspectRatio: 0.77, alignItems: 'center', paddingTop: 4 },
  dayCircle: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17 },
  selectedDay: { backgroundColor: '#2f6f5e' },
  today: { borderWidth: 1, borderColor: '#2f6f5e' },
  dayText: { color: '#27362e', fontSize: 13 },
  selectedText: { color: '#fff', fontWeight: '700' },
  markerSlot: { height: 10, justifyContent: 'center' },
  marker: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#2f6f5e' },
  selectedMarker: { backgroundColor: '#a9d5bd' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 8 },
  legendDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2f6f5e' },
  legendText: { color: '#747c75', fontSize: 12 },
});