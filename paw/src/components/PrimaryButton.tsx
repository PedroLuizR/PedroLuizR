import { ArrowUpRight, Check, Navigation, Phone } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, sizes, spacing, typography } from '../theme/tokens';

type Props = {
  label: string;
  icon?: 'arrow' | 'check' | 'phone' | 'route';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  /** 'outline' = botão secundário (fundo branco, borda roxa). */
  variant?: 'solid' | 'outline';
  disabled?: boolean;
};

const ICONS = { arrow: ArrowUpRight, check: Check, phone: Phone, route: Navigation } as const;

export function PrimaryButton({ label, icon, onPress, style, compact = false, variant = 'solid', disabled = false }: Props) {
  const Icon = icon ? ICONS[icon] : null;
  const outline = variant === 'outline';
  const fg = outline ? colors.primary : colors.textOnColor;
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.btn,
        outline && styles.outline,
        compact && styles.compact,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
      {Icon ? <Icon size={sizes.iconSm} color={fg} strokeWidth={2} /> : null}
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
  outline: { backgroundColor: colors.surface, borderWidth: sizes.borderSelected, borderColor: colors.primary },
  disabled: { opacity: 0.4 },
});
