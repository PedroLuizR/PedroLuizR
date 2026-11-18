import type { MapStyleElement } from 'react-native-maps';
import { colors } from '../../theme/tokens';

/** Estilo do Google Maps alinhado à paleta do PAW (tons claros, poucos rótulos). */
export const pawMapStyle: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: colors.mapLand }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: colors.mapLabel }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: colors.surface }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: colors.mapPark }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: colors.mapRoad }] },
  { featureType: 'road.arterial', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: colors.mapWater }] },
];
