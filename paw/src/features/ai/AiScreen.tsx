import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader, ChatList, Screen, ScreenTitle } from '../../components';
import { useChat } from '../../hooks';
import { colors, radii, spacing, typography } from '../../theme/tokens';

function Disclaimer() {
  return (
    <View style={styles.disclaimer} accessibilityRole="alert">
      <Text style={[typography.captionMedium, { color: colors.primary }]}>✦ Orientação inicial. Não substitui o veterinário.</Text>
    </View>
  );
}

export function AiScreen() {
  const router = useRouter();
  const chat = useChat('ai');

  return (
    <Screen scroll={false}>
      {/* Cabeçalho e aviso ficam fixos fora da lista: o aviso é sempre visível. */}
      <View style={styles.top}>
        <AppHeader badge="ai" action="plus" onAction={chat.reset} />
        <ScreenTitle title="Converse com a PAW" subtitle="Uma ajuda para entender os sinais." />
        <Disclaimer />
      </View>
      <ChatList
        header={null}
        messages={chat.messages}
        typing={chat.typing}
        onSend={chat.send}
        placeholder="Conte mais sobre o Bento…"
        onCta={() => router.navigate('/clinica')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { paddingHorizontal: spacing.screen, paddingBottom: spacing.lg },
  disclaimer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLavender,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md + spacing.xxs,
    paddingVertical: spacing.sm,
    marginTop: -spacing.sm,
  },
});
