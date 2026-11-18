import { useRouter } from 'expo-router';
import { ArrowUpRight, Heart, Smile, Sparkles } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { AppHeader, Badge, Card, Screen, ScreenTitle, useToast } from '../../components';
import { greetingFor, usePet, useUser } from '../../hooks';
import { colors, radii, sizes, spacing, typography } from '../../theme/tokens';

const ECG_POINTS = '0,30 18,30 26,30 32,18 38,42 46,6 54,40 60,30 74,30 82,24 88,30 120,30';

function EcgLine() {
  return (
    <Svg width={sizes.ecgW} height={sizes.ecgH} viewBox="0 0 120 48">
      <Polyline points={ECG_POINTS} fill="none" stroke={colors.accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const user = useUser();
  const pet = usePet();
  const toast = useToast();

  return (
    <View style={styles.flex}>
      <Screen>
        <AppHeader action="bell" onAction={() => toast.show('Nenhuma notificação nova')} />
        <ScreenTitle title={`${greetingFor()}, ${user.name}`} subtitle="Mais cuidado. Mais momentos juntos." />

        {/* Card do pet */}
        <Card variant="primary" size="lg" style={styles.petCard}>
          <View style={styles.petInfo}>
            <Text style={[typography.overline, { color: colors.textOnColor }]}>Seu melhor amigo</Text>
            <Text style={[typography.petName, { color: colors.textOnColor }]}>{pet.name}</Text>
            <Text style={[typography.body, { color: colors.textOnColorSoft }]}>
              {pet.breed} · {pet.ageYears} anos
            </Text>
            <Pressable
              onPress={() => router.navigate('/coleira')}
              accessibilityRole="button"
              accessibilityLabel="Coleira conectada, ver detalhes"
              style={styles.collarChip}
            >
              <Badge label="Coleira conectada" bg={colors.accent} dotColor={colors.textPrimary} textColor={colors.textPrimary} />
            </Pressable>
          </View>
          <Image source={pet.avatar} style={styles.avatar} accessibilityLabel={`Foto do ${pet.name}`} />
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={[typography.h2, { color: colors.textPrimary }]}>Um olhar sobre hoje</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Atualizado agora</Text>
        </View>

        {/* Batimentos */}
        <Card style={styles.gapBottom}>
          <View style={styles.rowBetween}>
            <View style={styles.row}>
              <Heart size={sizes.icon} color={colors.heart} strokeWidth={sizes.iconStroke} />
              <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>Batimentos cardíacos</Text>
            </View>
          </View>
          <Badge label={pet.heartState} dotColor={colors.accent} textColor={colors.textSecondary} style={styles.heartPill} />
          <View style={styles.rowBetween}>
            <View style={styles.metricRow} accessibilityLabel={`${pet.heartRate} batimentos por minuto`}>
              <Text style={[typography.metric, { color: colors.textPrimary }]}>{pet.heartRate}</Text>
              <Text style={[typography.metricUnit, { color: colors.textMuted }]}>bpm</Text>
            </View>
            <EcgLine />
          </View>
        </Card>

        {/* Saúde + Humor */}
        <View style={styles.twoCol}>
          <Card variant="lavender" style={styles.col}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>Saúde atual</Text>
            <Text style={[typography.cardTitle, styles.colTitle, { color: colors.textPrimary }]}>{pet.health.title}</Text>
            <Text style={[typography.captionMedium, { color: colors.primary }]}>{pet.health.note}</Text>
          </Card>
          <Card variant="mood" style={styles.col}>
            <View style={styles.rowBetween}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>Humor</Text>
              <Smile size={sizes.icon + 2} color={colors.moodIcon} strokeWidth={sizes.iconStroke} />
            </View>
            <Text style={[typography.cardTitle, styles.colTitle, { color: colors.textPrimary }]}>{pet.mood.title}</Text>
            <Text style={[typography.captionMedium, { color: colors.moodText }]}>{pet.mood.note}</Text>
          </Card>
        </View>

        <Text style={[typography.h2, styles.sectionTitle, { color: colors.textPrimary }]}>Cuidado que acompanha</Text>
        <Card
          variant="secondary"
          onPress={() => router.navigate('/ia')}
          accessibilityLabel="Notou algo diferente? Converse com a PAW"
          style={styles.ctaCard}
        >
          <View style={styles.ctaIcon}>
            <Sparkles size={sizes.icon + 2} color={colors.primary} strokeWidth={sizes.iconStroke} />
          </View>
          <View style={styles.flex}>
            <Text style={[typography.cardTitle, { color: colors.textOnColor }]}>Notou algo diferente?</Text>
            <Text style={[typography.body, { color: colors.textOnColorSoft }]}>Converse com a PAW</Text>
          </View>
          <ArrowUpRight size={sizes.icon + 2} color={colors.accent} strokeWidth={2} />
        </Card>
      </Screen>
      {toast.node}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  petCard: {
    minHeight: sizes.petCardH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.lg,
  },
  petInfo: { flex: 1, gap: spacing.xs },
  collarChip: { marginTop: spacing.md, alignSelf: 'flex-start', minHeight: sizes.touch, justifyContent: 'center' },
  avatar: {
    width: sizes.petAvatar,
    height: sizes.petAvatar,
    borderRadius: radii.pill,
    borderWidth: sizes.avatarBorder,
    borderColor: colors.accent,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.section,
    marginBottom: spacing.lg,
  },
  sectionTitle: { marginTop: spacing.section, marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heartPill: { marginTop: spacing.md, marginBottom: spacing.xs },
  metricRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  gapBottom: { marginBottom: spacing.md },
  twoCol: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1, gap: spacing.xs },
  colTitle: { marginTop: spacing.sm },
  ctaCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  ctaIcon: {
    width: sizes.iconTileLg,
    height: sizes.iconTileLg,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
