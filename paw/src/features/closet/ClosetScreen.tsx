import { Check, RotateCw } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader, Badge, Card, Chip, PrimaryButton, Screen, ScreenTitle, useToast } from '../../components';
import { closetItems, pet, type ClosetCategory, type ClosetItemKind } from '../../data/mock';
import { colors, radii, shadows, sizes, spacing, typography } from '../../theme/tokens';
import { ClothingIcon } from './ClothingIcon';

type Filter = 'todos' | ClosetCategory;
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todos', label: 'All' },
  { id: 'roupinhas', label: 'Clothes' },
  { id: 'acessorios', label: 'Accessories' },
];

export function ClosetScreen() {
  const [filter, setFilter] = useState<Filter>('todos');
  const [selected, setSelected] = useState<ClosetItemKind>('moletom');
  const [applied, setApplied] = useState<ClosetItemKind>('moletom');
  const toast = useToast();

  const items = useMemo(() => closetItems.filter((i) => filter === 'todos' || i.category === filter), [filter]);
  const isApplied = selected === applied;
  const appliedItem = closetItems.find((i) => i.id === applied);

  return (
    <View style={styles.flex}>
      <Screen>
        <AppHeader onAction={() => toast.show('More options coming soon')} />
        <ScreenTitle title={`${pet.name}'s style`} subtitle="A look for every adventure." />

        <Card variant="cream" size="lg" style={styles.preview}>
          <Image source={pet.closetPhoto} style={styles.photo} resizeMode="cover" accessibilityLabel={`${pet.name} wearing the ${appliedItem?.name.toLowerCase() ?? 'outfit'}`} />
          <Badge label="Outfit on" bg={colors.surface} dotColor={colors.accent} />
          <Pressable
            onPress={() => toast.show('360° view coming soon')}
            accessibilityRole="button"
            accessibilityLabel="View in 360 degrees"
            style={styles.rotate}
          >
            <RotateCw size={sizes.iconSm} color={colors.textPrimary} strokeWidth={sizes.iconStroke} />
            <Text style={[typography.label, { color: colors.textPrimary }]}>360°</Text>
          </Pressable>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={[typography.h2, { color: colors.textPrimary }]}>Virtual wardrobe</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>{items.length} {items.length === 1 ? 'item' : 'items'}</Text>
        </View>

        <View style={styles.chips}>
          {FILTERS.map((f) => (
            <Chip key={f.id} label={f.label} active={filter === f.id} onPress={() => setFilter(f.id)} />
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.grid} style={styles.gridScroll}>
          {items.map((item) => {
            const isSel = item.id === selected;
            return (
              <Pressable
                key={item.id}
                onPress={() => setSelected(item.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSel }}
                accessibilityLabel={`${item.name}, ${item.color}`}
                style={[styles.item, isSel && styles.itemSelected]}
              >
                {isSel ? (
                  <View style={styles.check}>
                    <Check size={sizes.iconXs} color={colors.textOnColor} strokeWidth={2.5} />
                  </View>
                ) : null}
                <ClothingIcon kind={item.id} color={colors[item.swatch]} />
                <View>
                  <Text style={[typography.label, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>{item.color}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <PrimaryButton
          label={isApplied ? `Outfit applied to ${pet.name}` : 'Apply outfit'}
          icon={isApplied ? 'check' : undefined}
          onPress={() => setApplied(selected)}
          style={styles.cta}
        />
      </Screen>
      {toast.node}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  preview: {
    height: sizes.closetPreviewH,
    overflow: 'hidden',
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  photo: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  rotate: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + spacing.xxs,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    minHeight: sizes.touch - spacing.xs,
    ...shadows.soft,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.section,
    marginBottom: spacing.lg,
  },
  chips: { flexDirection: 'row', gap: spacing.sm },
  gridScroll: { marginTop: spacing.lg, marginHorizontal: -spacing.screen },
  grid: { gap: spacing.md, paddingHorizontal: spacing.screen, paddingTop: spacing.xs },
  item: {
    width: sizes.closetItemW,
    minHeight: sizes.closetItemH,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: sizes.borderSelected,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  itemSelected: { backgroundColor: colors.surfaceLavender, borderColor: colors.primary },
  check: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: sizes.check,
    height: sizes.check,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: { marginTop: spacing.xxl },
});
