import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, sizes, spacing, typography } from '../theme/tokens';

type Props = {
  label: string;
  bg?: string;
  dotColor?: string;
  textColor?: string;
  overline?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Pill com ponto colorido + texto (ex.: “AO VIVO”, “Look equipado”). */
export function Badge({
  label,
  bg = colors.surfaceLavender,
  dotColor = colors.primary,
  textColor = colors.textPrimary,
  overline = false,
  style,
}: Props) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[overline ? typography.overline : typography.captionMedium, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export const StatusPill = Badge;

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs + spacing.xxs,
    paddingHorizontal: spacing.md - spacing.xxs,
    paddingVertical: spacing.xs + spacing.xxs,
    borderRadius: radii.pill,
  },
  dot: { width: sizes.dot, height: sizes.dot, borderRadius: radii.pill },
});
