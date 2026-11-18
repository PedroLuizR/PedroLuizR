import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Home, MapPin, MessageSquare, Shirt, Sparkles, type LucideProps } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, sizes, spacing, typography } from '../theme/tokens';
import { CollarIcon } from './CollarIcon';

type IconComp = ComponentType<Pick<LucideProps, 'size' | 'color' | 'strokeWidth'>>;

const TABS: Record<string, { label: string; Icon: IconComp }> = {
  index: { label: 'Home', Icon: Home },
  map: { label: 'Map', Icon: MapPin },
  clinic: { label: 'Clinic', Icon: MessageSquare },
  closet: { label: 'Closet', Icon: Shirt },
  collar: { label: 'Collar', Icon: CollarIcon as IconComp },
  ai: { label: 'PAW AI', Icon: Sparkles },
};

export function BottomTabBar({ state, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const onPress = () => {
          if (!focused) navigateToTab(route.key);
        };
        const { Icon } = tab;
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            style={styles.item}
          >
            <View style={[styles.pill, focused && styles.pillActive]}>
              <Icon size={sizes.icon} color={colors.textPrimary} strokeWidth={sizes.iconStroke} />
            </View>
            <Text
              numberOfLines={1}
              style={[focused ? typography.tabLabelActive : typography.tabLabel, { color: focused ? colors.textPrimary : colors.textMuted }]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.tabBar,
    borderWidth: sizes.borderThin,
    borderColor: colors.border,
    paddingVertical: spacing.sm + spacing.xxs,
    paddingHorizontal: spacing.xs,
    ...shadows.float,
  },
  item: { flex: 1, alignItems: 'center', gap: spacing.xs, minHeight: sizes.touch },
  pill: {
    width: sizes.tabPillW,
    height: sizes.tabPillH,
    borderRadius: sizes.tabPillH / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: colors.accent },
});
