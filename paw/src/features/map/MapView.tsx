import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType, type LayoutChangeEvent } from 'react-native';
import Svg, { Ellipse, Path, Polyline, Rect } from 'react-native-svg';
import type { Clinic } from '../../data/mock';
import { colors, radii, shadows, sizes, spacing, typography } from '../../theme/tokens';

/**
 * Mapa ilustrado em SVG. A interface (props) é a mesma que um futuro
 * `react-native-maps` precisaria: troque só este arquivo.
 */
type Props = {
  clinics: Clinic[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  pet: { name: string; avatar: ImageSourcePropType; position: { x: number; y: number } };
};

type Pt = { x: number; y: number };

/** Rota em "L" seguindo as ruas, do pet até a clínica. */
function routePoints(from: Pt, to: Pt): Pt[] {
  const mid = { x: from.x + (to.x - from.x) * 0.55, y: from.y + (to.y - from.y) * 0.15 };
  return [from, mid, { x: mid.x, y: to.y - 0.02 }, to];
}

export function MapView({ clinics, selectedId, onSelect, pet }: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const { w, h } = size;
  const X = (f: number) => f * w;
  const Y = (f: number) => f * h;
  const selected = clinics.find((c) => c.id === selectedId);

  return (
    <View style={styles.map} onLayout={onLayout}>
      {w > 0 ? (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          <Rect x={0} y={0} width={w} height={h} fill={colors.mapLand} />
          {/* Parque + lago */}
          <Path
            d={`M${X(0.52)},${Y(0.08)} L${X(1)},${Y(0.02)} L${X(1)},${Y(0.36)} L${X(0.62)},${Y(0.44)} Z`}
            fill={colors.mapPark}
          />
          <Ellipse cx={X(0.8)} cy={Y(0.2)} rx={X(0.1)} ry={Y(0.055)} fill={colors.mapWater} />
          {/* Ruas */}
          {[
            [-0.1, 0.42, 1.1, 0.12],
            [-0.1, 0.78, 1.1, 0.5],
            [-0.1, 1.05, 1.1, 0.8],
            [0.08, -0.05, 0.42, 1.05],
            [0.5, -0.05, 0.86, 1.05],
          ].map(([x1, y1, x2, y2], i) => (
            <Path key={i} d={`M${X(x1)},${Y(y1)} L${X(x2)},${Y(y2)}`} stroke={colors.mapRoad} strokeWidth={i < 3 ? 14 : 10} />
          ))}
          <Path d={`M${X(-0.1)},${Y(0.62)} L${X(1.1)},${Y(0.3)}`} stroke={colors.mapRoad} strokeWidth={6} />
          {selected ? (
            <Polyline
              points={routePoints(pet.position, selected.pin)
                .map((p) => `${X(p.x)},${Y(p.y)}`)
                .join(' ')}
              fill="none"
              stroke={colors.mapRoute}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1 8"
            />
          ) : null}
        </Svg>
      ) : null}

      {/* Rótulos */}
      <Text style={[styles.label, { left: X(0.66), top: Y(0.3) }]}>Parque Ibirapuera</Text>
      <Text style={[styles.label, styles.district, { left: X(0.06), top: Y(0.34) }]}>VILA MARIANA</Text>
      <Text style={[styles.label, { left: X(0.44), top: Y(0.9), transform: [{ rotate: '-14deg' }] }]}>R. França Pinto</Text>

      {/* Pins de clínica */}
      {w > 0 &&
        clinics.map((c) => {
          const active = c.id === selectedId;
          return (
            <Pressable
              key={c.id}
              onPress={() => onSelect(c.id)}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar ${c.name}`}
              hitSlop={spacing.sm}
              style={[
                styles.clinicPin,
                { left: X(c.pin.x) - sizes.clinicPin / 2, top: Y(c.pin.y) - sizes.clinicPin / 2 },
                active ? styles.clinicPinActive : null,
              ]}
            >
              <Plus size={sizes.iconSm} color={active ? colors.textOnColor : colors.primary} strokeWidth={2.5} />
            </Pressable>
          );
        })}

      {/* Pin do pet */}
      {w > 0 ? (
        <View
          pointerEvents="none"
          style={[styles.petWrap, { left: X(pet.position.x) - PET_WRAP_W / 2, top: Y(pet.position.y) - HALO / 2 - BALLOON_OFFSET }]}
        >
          <View style={styles.balloon}>
            <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>{pet.name} está com você</Text>
          </View>
          <View style={styles.halo}>
            <Image source={pet.avatar} style={styles.petAvatar} accessibilityLabel={`${pet.name} no mapa`} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const HALO = sizes.mapPinAvatar + spacing.xxl;
const PET_WRAP_W = sizes.mapPinAvatar * 4;
/** Altura do balão + margem acima do halo. */
const BALLOON_OFFSET = typography.captionMedium.lineHeight! + (spacing.xs + spacing.xxs) * 2 + spacing.xs;

const styles = StyleSheet.create({
  map: { height: sizes.mapH, backgroundColor: colors.mapLand, overflow: 'hidden' },
  label: { position: 'absolute', ...typography.mapLabel, color: colors.mapLabel },
  district: { letterSpacing: 2 },
  clinicPin: {
    position: 'absolute',
    width: sizes.clinicPin,
    height: sizes.clinicPin,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.float,
  },
  clinicPinActive: { backgroundColor: colors.primary },
  petWrap: { position: 'absolute', width: PET_WRAP_W, alignItems: 'center' },
  balloon: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + spacing.xxs,
    marginBottom: spacing.xs,
    ...shadows.float,
  },
  halo: {
    width: HALO,
    height: HALO,
    borderRadius: radii.pill,
    backgroundColor: colors.mapHalo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petAvatar: {
    width: sizes.mapPinAvatar,
    height: sizes.mapPinAvatar,
    borderRadius: radii.pill,
    borderWidth: 3,
    borderColor: colors.surface,
  },
});
