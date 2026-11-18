import { BatteryMedium, Bluetooth, Clock } from 'lucide-react-native';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AppHeader, Badge, Card, Screen, ScreenTitle, useToast } from '../../components';
import { useCollar } from '../../hooks';
import { colors, radii, sizes, spacing, typography } from '../../theme/tokens';

export function CollarScreen() {
  const collar = useCollar();
  const toast = useToast();

  return (
    <View style={styles.flex}>
      <Screen>
        <AppHeader onAction={() => toast.show('Configurações da coleira em breve')} />
        <ScreenTitle title="Sempre conectados" subtitle="Tecnologia que cuida de quem você ama." />

        <Card variant="cream" size="lg" style={styles.product}>
          <Image source={collar.photo} style={styles.productImg} resizeMode="cover" accessibilityLabel={`Coleira ${collar.model}`} />
          <Badge label="Conectada ao Bento" bg={colors.surface} dotColor={colors.accent} />
          <View style={styles.productInfo}>
            <Text style={[typography.cardTitle, { color: colors.textPrimary }]}>{collar.model}</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{collar.kind}</Text>
          </View>
        </Card>

        <Card variant="secondary" style={styles.gap}>
          <View style={styles.row}>
            <BatteryMedium size={sizes.icon} color={colors.accent} strokeWidth={sizes.iconStroke} />
            <Text style={[typography.bodyMedium, { color: colors.textOnColor }]}>Bateria</Text>
          </View>
          <Text style={[typography.metric, styles.battery, { color: colors.textOnColor }]}>{collar.battery}%</Text>
          <View
            style={styles.track}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: collar.battery }}
          >
            <View style={[styles.fill, { width: `${collar.battery}%` }]} />
          </View>
          <Text style={[typography.caption, styles.autonomy, { color: colors.textOnColorSoft }]}>
            Até {collar.autonomyDays} dias de autonomia
          </Text>
        </Card>

        <View style={[styles.twoCol, styles.gap]}>
          <Card style={styles.col}>
            <View style={styles.row}>
              <Clock size={sizes.iconSm} color={colors.textMuted} strokeWidth={sizes.iconStroke} />
              <Text style={[typography.caption, { color: colors.textMuted }]}>Tempo de uso hoje</Text>
            </View>
            <Text style={[typography.h2, styles.colValue, { color: colors.textPrimary }]}>{collar.usageToday}</Text>
          </Card>
          <Card variant="lavender" style={styles.col}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>Status da coleira</Text>
            <View style={[styles.row, styles.colValue]}>
              <View style={styles.bigDot} />
              <Text style={[typography.h2, { color: colors.primary }]}>{collar.status}</Text>
            </View>
          </Card>
        </View>

        <Card style={[styles.row, styles.sensors]}>
          <View style={styles.btIcon}>
            <Bluetooth size={sizes.icon} color={colors.primary} strokeWidth={sizes.iconStroke} />
          </View>
          <View style={styles.flex}>
            <Text style={[typography.cardTitle, { color: colors.textPrimary }]}>Todos os sensores ativos</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Bluetooth {collar.bluetooth ? 'conectado' : 'desconectado'} · Sincronizado {collar.lastSync}
            </Text>
            <Text style={[typography.caption, styles.firmware, { color: colors.textMuted }]}>Firmware atualizado · {collar.firmware}</Text>
          </View>
        </Card>
      </Screen>
      {toast.node}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  product: { height: sizes.productH, padding: spacing.lg, justifyContent: 'space-between', overflow: 'hidden' },
  productImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  gap: { marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  battery: { marginTop: spacing.sm, marginBottom: spacing.md },
  track: { height: sizes.progressH, borderRadius: radii.pill, backgroundColor: colors.whiteTrack, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radii.pill, backgroundColor: colors.surface },
  autonomy: { marginTop: spacing.sm + spacing.xxs },
  twoCol: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
  colValue: { marginTop: spacing.md },
  bigDot: { width: sizes.dotLg, height: sizes.dotLg, borderRadius: radii.pill, backgroundColor: colors.primary },
  sensors: { marginTop: spacing.md, gap: spacing.md + spacing.xxs, alignItems: 'flex-start' },
  btIcon: {
    width: sizes.iconTile,
    height: sizes.iconTile,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceLavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  firmware: { marginTop: spacing.xs },
});
