import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme/tokens';

export type CardVariant = 'white' | 'lavender' | 'primary' | 'secondary' | 'mood' | 'cream';

const BG: Record<CardVariant, string> = {
  white: colors.surface,
  lavender: colors.surfaceLavender,
  primary: colors.primary,
  secondary: colors.secondary,
  mood: colors.moodBg,
  cream: colors.cream,
};

type Props = {
  variant?: CardVariant;
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Card({ variant = 'white', size = 'md', style, children, onPress, accessibilityLabel }: Props) {
  const base = [
    styles.card,
    { backgroundColor: BG[variant], borderRadius: size === 'lg' ? radii.cardLg : radii.card },
    variant === 'white' && shadows.soft,
    style,
  ];
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [...base, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={base}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { padding: spacing.xl },
  pressed: { opacity: 0.85 },
});
