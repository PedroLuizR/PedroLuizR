import { useRouter } from 'expo-router';
import { Crosshair, Plus, Search, SlidersHorizontal, Star } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions, type ScrollViewInstance } from 'react-native';
import { AppHeader, Card, Chip, PrimaryButton, Screen, ScreenTitle, useToast } from '../../components';
import { pet, petCoords, petMapPosition, type Clinic } from '../../data/mock';
import { useClinics } from '../../hooks';
import { colors, radii, shadows, sizes, spacing, typography } from '../../theme/tokens';
import { MapView } from './MapView';

type Filter = 'abertas' | '24h';

const formatDistance = (m: number) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`);
const formatRating = (r: number) => r.toFixed(1);

function ClinicCard({ clinic, width, onChat }: { clinic: Clinic; width: number; onChat: () => void }) {
  return (
    <Card style={[styles.clinicCard, { width }]}>
      <View style={styles.clinicRow}>
        <View style={styles.tile}>
          <Plus size={sizes.icon + 2} color={colors.primary} strokeWidth={2.25} />
        </View>
        <View style={styles.flex}>
          <Text style={[typography.cardTitleLg, { color: colors.textPrimary }]} numberOfLines={1}>
            {clinic.name}
          </Text>
          <View style={styles.meta}>
            <Star size={sizes.iconXs} color={colors.moodIcon} fill={colors.moodIcon} strokeWidth={sizes.iconStroke} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {formatRating(clinic.rating)} · {formatDistance(clinic.distanceM)} · {clinic.is24h ? 'Open 24 hours' : `Open until ${clinic.openUntil}`}
            </Text>
          </View>
        </View>
      </View>
      <PrimaryButton label="Chat with the clinic" icon="arrow" onPress={onChat} style={styles.clinicBtn} />
    </Card>
  );
}

export function MapScreen() {
  const router = useRouter();
  const allClinics = useClinics();
  const toast = useToast();
  const { width: screenW } = useWindowDimensions();
  const [filter, setFilter] = useState<Filter>('abertas');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>(allClinics[0].id);
  const carousel = useRef<ScrollViewInstance>(null);
  const [recenterKey, setRecenterKey] = useState(0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allClinics.filter((c) => (filter === '24h' ? c.is24h : true) && (!q || c.name.toLowerCase().includes(q)));
  }, [allClinics, filter, query]);

  const cardW = screenW - spacing.screen * 2;
  const step = cardW + spacing.md;
  const effectiveSelected = visible.some((c) => c.id === selectedId) ? selectedId : visible[0]?.id ?? null;

  const select = (id: string) => {
    setSelectedId(id);
    const idx = visible.findIndex((c) => c.id === id);
    if (idx >= 0) carousel.current?.scrollTo({ x: idx * step, animated: true });
  };

  return (
    <View style={styles.flex}>
      <Screen>
        <AppHeader onAction={() => toast.show('More options coming soon')} />
        <ScreenTitle title="Nearby" subtitle="Care just a few steps away." />

        <View style={styles.mapBleed}>
          <MapView
            clinics={visible}
            selectedId={effectiveSelected}
            onSelect={select}
            pet={{ name: pet.name, avatar: pet.avatar, position: petMapPosition, coords: petCoords }}
            recenterKey={recenterKey}
          />
          <View style={styles.overlay} pointerEvents="box-none">
            <View style={styles.search}>
              <Search size={sizes.icon} color={colors.textMuted} strokeWidth={sizes.iconStroke} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search clinic or address"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                accessibilityLabel="Search clinic or address"
              />
            </View>
            <View style={styles.chips}>
              <Chip label="Open now" active={filter === 'abertas'} onPress={() => setFilter('abertas')} />
              <Chip label="24 hours" active={filter === '24h'} onPress={() => setFilter('24h')} />
              <Chip
                label="Filters"
                icon={<SlidersHorizontal size={sizes.iconXs} color={colors.textPrimary} strokeWidth={sizes.iconStroke} />}
                onPress={() => toast.show('More filters coming soon')}
              />
            </View>
          </View>
          <Pressable
            onPress={() => {
              setRecenterKey((k) => k + 1);
              toast.show(`Centered on ${pet.name}`);
            }}
            accessibilityRole="button"
            accessibilityLabel="Center on my location"
            style={styles.locate}
          >
            <Crosshair size={sizes.icon} color={colors.textPrimary} strokeWidth={sizes.iconStroke} />
          </Pressable>
        </View>

        <Text style={[typography.h2, styles.sectionTitle, { color: colors.textPrimary }]}>
          {visible.length} {visible.length === 1 ? 'clinic' : 'clinics'} near you
        </Text>

        {visible.length === 0 ? (
          <Text style={[typography.body, { color: colors.textSecondary }]}>No clinics match these filters.</Text>
        ) : (
          <ScrollView
            ref={carousel}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={step}
            decelerationRate="fast"
            style={styles.carousel}
            contentContainerStyle={styles.carouselContent}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / step);
              const c = visible[idx];
              if (c) setSelectedId(c.id);
            }}
          >
            {visible.map((c) => (
              <ClinicCard key={c.id} clinic={c} width={cardW} onChat={() => router.navigate('/clinic')} />
            ))}
          </ScrollView>
        )}
      </Screen>
      {toast.node}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mapBleed: { marginHorizontal: -spacing.screen },
  overlay: { position: 'absolute', top: spacing.lg, left: spacing.screen, right: spacing.screen, gap: spacing.md },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + spacing.xxs,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    minHeight: sizes.touch + spacing.xs,
    ...shadows.float,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary, paddingVertical: spacing.sm },
  chips: { flexDirection: 'row', gap: spacing.sm },
  locate: {
    position: 'absolute',
    right: spacing.screen,
    bottom: spacing.lg,
    width: sizes.iconButton,
    height: sizes.iconButton,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.float,
  },
  sectionTitle: { marginTop: spacing.xxl, marginBottom: spacing.lg },
  carousel: { marginHorizontal: -spacing.screen },
  carouselContent: { paddingHorizontal: spacing.screen, gap: spacing.md, paddingBottom: spacing.xs },
  clinicCard: { gap: spacing.lg },
  clinicRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md + spacing.xxs },
  tile: {
    width: sizes.iconTileLg,
    height: sizes.iconTileLg,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xxs },
  clinicBtn: { alignSelf: 'stretch' },
});
