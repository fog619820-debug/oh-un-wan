import { StyleSheet, Text, View } from 'react-native';

export function StampBadge({ complete }: { complete: boolean }) {
  return (
    <View style={[styles.badge, complete && styles.complete]}>
      <Text style={[styles.text, complete && styles.completeText]}>{complete ? '완료' : '진행 중'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#d5dad4', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
  complete: { borderColor: '#2f6f5e', backgroundColor: '#e6f0e9' },
  text: { color: '#747c75', fontSize: 11, fontWeight: '700' },
  completeText: { color: '#2f6f5e' },
});