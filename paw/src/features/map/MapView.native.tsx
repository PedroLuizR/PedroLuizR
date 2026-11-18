import Constants from 'expo-constants';
import { Plus } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import NativeMap, { Marker, Polyline, PROVIDER_GOOGLE, type LatLng } from 'react-native-maps';
import { colors, radii, shadows, sizes, spacing, typography } from '../../theme/tokens';
import { IllustratedMap } from './IllustratedMap';
import { pawMapStyle } from './mapStyle';
import type { MapProps } from './types';

const hasGoogleKey = Boolean((Constants.expoConfig?.extra as { hasGoogleMaps?: boolean } | undefined)?.hasGoogleMaps);
const DELTA = 0.012;
const FIT_PADDING = { top: 140, right: 60, bottom: 70, left: 60 };

/** Rota aproximada (sem Directions API): um "cotovelo" entre o pet e a clínica. */
function approxRoute(a: LatLng, b: LatLng): LatLng[] {
  return [a, { latitude: a.latitude, longitude: b.longitude }, b];
}

/** Google Maps no Android (iOS usa Apple Maps). Sem chave no Android, cai no mapa ilustrado. */
export function MapView(props: MapProps) {
  if (Platform.OS === 'android' && !hasGoogleKey) return <IllustratedMap {...props} />;
  return <GoogleMap {...props} />;
}

function GoogleMap({ clinics, selectedId, onSelect, pet, recenterKey }: MapProps) {
  const map = useRef<NativeMap>(null);
  const selected = clinics.find((c) => c.id === selectedId);

  useEffect(() => {
    if (!selected) return;
    map.current?.fitToCoordinates([pet.coords, selected.coords], { edgePadding: FIT_PADDING, animated: true });
  }, [selected?.id, pet.coords.latitude, pet.coords.longitude]);

  // A localização real chega depois do primeiro render: move o mapa até ela.
  useEffect(() => {
    if (selected) return;
    map.current?.animateToRegion({ ...pet.coords, latitudeDelta: DELTA, longitudeDelta: DELTA }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet.coords.latitude, pet.coords.longitude]);

  useEffect(() => {
    if (recenterKey === undefined || recenterKey === 0) return;
    map.current?.animateToRegion({ ...pet.coords, latitudeDelta: DELTA, longitudeDelta: DELTA }, 400);
  }, [recenterKey, pet.coords]);

  return (
    <View style={styles.map}>
      <NativeMap
        ref={map}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={pawMapStyle}
        initialRegion={{ ...pet.coords, latitudeDelta: DELTA, longitudeDelta: DELTA }}
        toolbarEnabled={false}
        showsCompass={false}
        showsPointsOfInterests={false}
        accessibilityLabel="Map of nearby clinics"
      >
        {selected ? (
          <Polyline coordinates={approxRoute(pet.coords, selected.coords)} strokeColor={colors.mapRoute} strokeWidth={4} lineDashPattern={[2, 8]} />
        ) : null}

        {clinics.map((c) => {
          const active = c.id === selectedId;
          return (
            <Marker key={c.id} coordinate={c.coords} onPress={() => onSelect(c.id)} anchor={{ x: 0.5, y: 0.5 }} title={c.name}>
              <View style={[styles.clinicPin, active && styles.clinicPinActive]}>
                <Plus size={sizes.iconSm} color={active ? colors.textOnColor : colors.primary} strokeWidth={2.5} />
              </View>
            </Marker>
          );
        })}

        <Marker coordinate={pet.coords} anchor={{ x: 0.5, y: 0.78 }} zIndex={10}>
          <View style={styles.petWrap}>
            <View style={styles.balloon}>
              <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>{pet.name} is with you</Text>
            </View>
            <View style={styles.halo}>
              <Image source={pet.avatar} style={styles.petAvatar} />
            </View>
          </View>
        </Marker>
      </NativeMap>
    </View>
  );
}

const HALO = sizes.mapPinAvatar + spacing.xxl;

const styles = StyleSheet.create({
  map: { height: sizes.mapH, backgroundColor: colors.mapLand, overflow: 'hidden' },
  clinicPin: {
    width: sizes.clinicPin,
    height: sizes.clinicPin,
    borderRadius: sizes.clinicPin / 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: sizes.borderThin,
    borderColor: colors.border,
    ...shadows.float,
  },
  clinicPinActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  petWrap: { alignItems: 'center' },
  balloon: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + spacing.xxs,
    marginBottom: spacing.xs,
    borderWidth: sizes.borderThin,
    borderColor: colors.border,
  },
  halo: {
    width: HALO,
    height: HALO,
    borderRadius: HALO / 2,
    backgroundColor: colors.mapHalo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petAvatar: {
    width: sizes.mapPinAvatar,
    height: sizes.mapPinAvatar,
    borderRadius: sizes.mapPinAvatar / 2,
    borderWidth: 3,
    borderColor: colors.surface,
  },
});
