import type { ImageSourcePropType } from 'react-native';
import type { Clinic, LatLng } from '../../data/mock';

export type MapProps = {
  clinics: Clinic[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  pet: { name: string; avatar: ImageSourcePropType; position: { x: number; y: number }; coords: LatLng };
  /** Muda de valor para recentralizar o mapa no pet. */
  recenterKey?: number;
};
