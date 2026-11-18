import { Check, RotateCw } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader, Badge, Card, Chip, PrimaryButton, Screen, ScreenTitle, useToast } from '../../components';
import { closetItems, pet, type ClosetCategory, type ClosetItemKind } from '../../data/mock';
import { colors, radii, shadows, sizes, spacing, typography } from '../../theme/tokens';
import { ClothingIcon } from './ClothingIcon';

type Filter = 'todos' | ClosetCategory;
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'roupinhas', label: 'Roupinhas' },
  { id: 'acessorios', label: 'Acessórios' },
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
        <AppHeader onAction={() => toast.show('Mais opções em breve')} />
        <ScreenTitle title={`O estilo do ${pet.name}`} subtitle="Um look para cada aventura." />

        <Card variant="cream" size="lg" style={styles.preview}>
          <Image source={pet.closetPhoto} style={styles.photo} resizeMode="cover" accessibilityLabel={`${pet.name} vestindo ${appliedItem?.name ?? 'o look'}`} />
          <Badge label="Look equipado" bg={colors.surface} dotColor={colors.accent} />
          <Pressable
            onPress={() => toast.show('Visualização 360° em breve')}
            accessibilityRole="button"
            accessibilityLabel="Ver em 360 graus"
            style={styles.rotate}
          >
            <RotateCw size={sizes.iconSm} color={colors.textPrimary} strokeWidth={sizes.iconStroke} />
            <Text style={[typography.label, { color: colors.textPrimary }]}>360°</Text>
          </Pressable>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={[typography.h2, { color: colors.textPrimary }]}>Guarda-roupa virtual</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>{items.length} {items.length === 1 ? 'item' : 'itens'}</Text>
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
          label={isApplied ? `Look aplicado no ${pet.name}` : 'Aplicar look'}
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
