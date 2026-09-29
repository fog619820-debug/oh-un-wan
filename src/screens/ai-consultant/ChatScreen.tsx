import { StyleSheet, Text, View } from 'react-native';

export function ChatScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.label}>P1 · AI CONSULTANT</Text>
      <Text style={styles.title}>AI 운동 상담</Text>
      <View style={styles.divider} />
      <Text style={styles.message}>상담 기능은 AI 서버와 개인정보 전송 범위를 정한 뒤 연결할 예정입니다.</Text>
      <Text style={styles.note}>현재 루틴과 운동 기록은 기기 안에 안전하게 보관됩니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f6f7f3', paddingHorizontal: 22, paddingTop: 30 },
  label: { color: '#65746a', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#1b2923', fontSize: 28, fontWeight: '800', marginTop: 7 },
  divider: { height: 1, backgroundColor: '#dce1db', marginTop: 23, marginBottom: 23 },
  message: { color: '#33443a', fontSize: 16, lineHeight: 24, maxWidth: 340 },
  note: { color: '#747c75', fontSize: 13, lineHeight: 20, marginTop: 11, maxWidth: 340 },
});