import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, shadows, sizes, spacing, typography } from '../theme/tokens';

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
  inactiveBg?: string;
};

export function Chip({ label, active = false, onPress, icon, inactiveBg = colors.surface }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      hitSlop={spacing.xs}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: active ? colors.primary : inactiveBg },
        !active && styles.inactive,
        pressed && styles.pressed,
      ]}
    >
      {icon}
      <Text style={[typography.label, { color: active ? colors.textOnColor : colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + spacing.xxs,
    minHeight: sizes.touch - spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
  },
  inactive: { borderWidth: sizes.borderThin, borderColor: colors.border, ...shadows.soft },
  pressed: { opacity: 0.8 },
});
