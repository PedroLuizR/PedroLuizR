import { ArrowUpRight, Check } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, sizes, spacing, typography } from '../theme/tokens';

type Props = {
  label: string;
  icon?: 'arrow' | 'check';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function PrimaryButton({ label, icon, onPress, style, compact = false }: Props) {
  const Icon = icon === 'arrow' ? ArrowUpRight : icon === 'check' ? Check : null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.btn, compact && styles.compact, pressed && styles.pressed, style]}
    >
      <Text style={styles.label}>{label}</Text>
      {Icon ? <Icon size={sizes.iconSm} color={colors.textOnColor} strokeWidth={2} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + spacing.xxs,
    minHeight: sizes.touch + spacing.xs,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  compact: { minHeight: sizes.touch, alignSelf: 'flex-start' },
  label: { ...typography.button, color: colors.textOnColor },
  pressed: { opacity: 0.85 },
});
