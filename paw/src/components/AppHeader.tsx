import { Bell, MoreHorizontal, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, sizes, spacing, typography } from '../theme/tokens';
import { Badge } from './Badge';

type Action = 'bell' | 'more' | 'plus';

type Props = {
  badge?: 'live' | 'ai';
  action?: Action;
  onAction?: () => void;
};

const ACTION_ICON = { bell: Bell, more: MoreHorizontal, plus: Plus } as const;
const ACTION_LABEL: Record<Action, string> = {
  bell: 'Notifications',
  more: 'More options',
  plus: 'New conversation',
};

export function AppHeader({ badge = 'live', action = 'more', onAction }: Props) {
  const Icon = ACTION_ICON[action];
  const isAi = badge === 'ai';
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.logo} accessibilityRole="header">
          PAW
        </Text>
        <Badge
          overline
          label={isAi ? 'AI assistant' : 'Live'}
          bg={isAi ? colors.accent : colors.surfaceLavender}
          dotColor={isAi ? colors.textPrimary : colors.primary}
          textColor={isAi ? colors.textPrimary : colors.primary}
        />
      </View>
      <Pressable
        onPress={onAction}
        accessibilityRole="button"
        accessibilityLabel={ACTION_LABEL[action]}
        style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
      >
        <Icon size={sizes.icon} color={colors.textPrimary} strokeWidth={sizes.iconStroke} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md - spacing.xxs },
  logo: { ...typography.logo, color: colors.textPrimary },
  iconBtn: {
    width: sizes.iconButton,
    height: sizes.iconButton,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: sizes.borderThin,
    borderColor: colors.border,
    ...shadows.soft,
  },
  pressed: { opacity: 0.7 },
});
