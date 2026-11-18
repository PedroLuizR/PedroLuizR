import { BatteryMedium, Bluetooth, Clock, Rotate3d } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Model3DModal } from '../three/Model3DModal';
import { Model3DViewer } from '../three/Model3DViewer';
import { AppHeader, Badge, Card, Screen, ScreenTitle, useToast } from '../../components';
import { useCollar } from '../../hooks';
import { colors, radii, sizes, spacing, typography } from '../../theme/tokens';

export function CollarScreen() {
  const collar = useCollar();
  const toast = useToast();
  const [show3d, setShow3d] = useState(false);

  return (
    <View style={styles.flex}>
      <Screen>
        <AppHeader onAction={() => toast.show('Collar settings coming soon')} />
        <ScreenTitle title="Always connected" subtitle="Technology that cares for the ones you love." />

        <Card variant="cream" size="lg" style={styles.product}>
          {/* Coleira rastreadora em 3D; pausa enquanto a tela cheia está aberta. */}
          {show3d ? null : <Model3DViewer subject={{ kind: 'collar' }} style={styles.productImg} embedded />}
          <View style={styles.productTop}>
            <Badge label="Connected to Bento" bg={colors.surface} dotColor={colors.accent} />
            <Pressable onPress={() => setShow3d(true)} accessibilityRole="button" accessibilityLabel="View collar in 3D" style={styles.view3d}>
              <Rotate3d size={sizes.iconSm} color={colors.textPrimary} strokeWidth={sizes.iconStroke} />
              <Text style={[typography.label, { color: colors.textPrimary }]}>3D</Text>
            </Pressable>
          </View>
          <View style={styles.productInfo}>
            <Text style={[typography.cardTitle, { color: colors.textPrimary }]}>{collar.model}</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{collar.kind}</Text>
          </View>
        </Card>

        <Card variant="secondary" style={styles.gap}>
          <View style={styles.row}>
            <BatteryMedium size={sizes.icon} color={colors.accent} strokeWidth={sizes.iconStroke} />
            <Text style={[typography.bodyMedium, { color: colors.textOnColor }]}>Battery</Text>
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
            Up to {collar.autonomyDays} days of battery life
          </Text>
        </Card>

        <View style={[styles.twoCol, styles.gap]}>
          <Card style={styles.col}>
            <View style={styles.row}>
              <Clock size={sizes.iconSm} color={colors.textMuted} strokeWidth={sizes.iconStroke} />
              <Text style={[typography.caption, { color: colors.textMuted }]}>Worn today</Text>
            </View>
            <Text style={[typography.h2, styles.colValue, { color: colors.textPrimary }]}>{collar.usageToday}</Text>
          </Card>
          <Card variant="lavender" style={styles.col}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>Collar status</Text>
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
            <Text style={[typography.cardTitle, { color: colors.textPrimary }]}>All sensors active</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Bluetooth {collar.bluetooth ? 'connected' : 'disconnected'} · Synced {collar.lastSync}
            </Text>
            <Text style={[typography.caption, styles.firmware, { color: colors.textMuted }]}>Firmware up to date · {collar.firmware}</Text>
          </View>
        </Card>
      </Screen>
      {toast.node}
      <Model3DModal
        visible={show3d}
        onClose={() => setShow3d(false)}
        subject={{ kind: 'collar' }}
        title={collar.model}
        subtitle={collar.kind}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  product: { height: sizes.productH, padding: spacing.lg, justifyContent: 'space-between', overflow: 'hidden' },
  productTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  view3d: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + spacing.xxs,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    minHeight: sizes.touch - spacing.sm,
  },
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
