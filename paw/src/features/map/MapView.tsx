// Web (e tipos): mapa ilustrado. No Android/iOS o Metro usa MapView.native.tsx.
import { IllustratedMap } from './IllustratedMap';
import type { MapProps } from './types';

export function MapView(props: MapProps) {
  return <IllustratedMap {...props} />;
}
