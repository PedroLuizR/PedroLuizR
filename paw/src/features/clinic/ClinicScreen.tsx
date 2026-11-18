import { Plus } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader, Card, ChatList, Screen, ScreenTitle, useToast } from '../../components';
import { clinicChat } from '../../data/mock';
import { useChat, useClinics } from '../../hooks';
import { colors, radii, sizes, spacing, typography } from '../../theme/tokens';

export function ClinicScreen() {
  const clinic = useClinics()[0];
  const chat = useChat('clinic');
  const toast = useToast();

  const header = (
    <View>
      <AppHeader onAction={() => toast.show('Mais opções em breve')} />
      <ScreenTitle title={clinic.name} subtitle={`${clinic.vet} · Veterinária`} />
      <Card variant="lavender" style={styles.trust}>
        <View style={styles.tile}>
          <Plus size={sizes.icon + 2} color={colors.primary} strokeWidth={2.25} />
        </View>
        <View style={styles.flex}>
          <Text style={[typography.cardTitle, { color: colors.textPrimary }]}>Você está em boas mãos</Text>
          <View style={styles.online}>
            <View style={styles.dot} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Online · Responde em poucos minutos</Text>
          </View>
        </View>
      </Card>
      <Text style={[typography.overline, styles.date, { color: colors.textMuted }]}>{clinicChat.dateLabel}</Text>
    </View>
  );

  return (
    <View style={styles.flex}>
      <Screen scroll={false}>
        <ChatList
          header={header}
          messages={chat.messages}
          typing={chat.typing}
          onSend={chat.send}
          placeholder="Escreva sua mensagem…"
          attach
        />
      </Screen>
      {toast.node}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  trust: { flexDirection: 'row', alignItems: 'center', gap: spacing.md + spacing.xxs, paddingVertical: spacing.lg },
  tile: {
    width: sizes.iconTile,
    height: sizes.iconTile,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  online: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + spacing.xxs, marginTop: spacing.xxs },
  dot: { width: sizes.dot, height: sizes.dot, borderRadius: radii.pill, backgroundColor: colors.primary },
  date: { textAlign: 'center', marginTop: spacing.xxl, marginBottom: spacing.xs },
});
