import { Move3d, X } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, shadows, sizes, spacing, typography } from '../../theme/tokens';
import { Model3DViewer, type Model3DSubject } from './Model3DViewer';

type Props = {
  visible: boolean;
  onClose: () => void;
  subject: Model3DSubject;
  title: string;
  subtitle?: string;
};

/** Tela cheia com o modelo 3D girando em 360°. */
export function Model3DModal({ visible, onClose, subject, title, subtitle }: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.flex}>
            <Text style={[typography.h1, { color: colors.textPrimary }]} accessibilityRole="header">
              {title}
            </Text>
            {subtitle ? <Text style={[typography.body, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
          </View>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close 3D view" style={styles.close}>
            <X size={sizes.icon} color={colors.textPrimary} strokeWidth={sizes.iconStroke} />
          </Pressable>
        </View>

        {visible ? <Model3DViewer subject={subject} style={styles.viewer} /> : null}

        <View style={styles.hint}>
          <Move3d size={sizes.iconSm} color={colors.primary} strokeWidth={sizes.iconStroke} />
          <Text style={[typography.label, { color: colors.primary }]}>Drag to rotate 360°</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
  },
  close: {
    width: sizes.iconButton,
    height: sizes.iconButton,
    borderRadius: sizes.iconButton / 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  viewer: { flex: 1 },
  hint: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + spacing.xxs,
    marginBottom: spacing.xxl,
    ...shadows.soft,
  },
});
