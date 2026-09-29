import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface CompletionDialogProps {
  visible: boolean;
  onClose: () => void;
}

export function CompletionDialog({ visible, onClose }: CompletionDialogProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.kicker}>오늘의 운동</Text>
          <Text style={styles.title}>오운완!</Text>
          <Text style={styles.message}>오늘 예정된 운동을 모두 마쳤어요.</Text>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(16, 28, 22, 0.45)', justifyContent: 'center', padding: 28 },
  dialog: { backgroundColor: '#fff', padding: 24, borderRadius: 8 },
  kicker: { color: '#65746a', fontSize: 12, fontWeight: '700' },
  title: { color: '#1b2923', fontSize: 30, fontWeight: '800', marginTop: 8 },
  message: { color: '#59645d', fontSize: 15, marginTop: 9 },
  button: { marginTop: 22, minHeight: 48, backgroundColor: '#2f6f5e', alignItems: 'center', justifyContent: 'center', borderRadius: 5 },
  buttonText: { color: '#fff', fontWeight: '700' },
});