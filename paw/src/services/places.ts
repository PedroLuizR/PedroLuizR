import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { Clinic, LatLng } from '../data/mock';

type Extra = { googleApiKey?: string | null; androidPackage?: string | null; androidCertSha1?: string | null };
const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const placesAvailable = Platform.OS !== 'web' && Boolean(extra.googleApiKey);

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchNearby';
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.rating',
  'places.userRatingCount',
  'places.location',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.currentOpeningHours.openNow',
  'places.currentOpeningHours.nextCloseTime',
  'places.regularOpeningHours.periods',
].join(',');

type Period = { open?: { day?: number; hour?: number; minute?: number }; close?: unknown };
type Place = {
  id: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  location?: { latitude: number; longitude: number };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  currentOpeningHours?: { openNow?: boolean; nextCloseTime?: string };
  regularOpeningHours?: { periods?: Period[] };
};

/** Distância em metros (haversine). */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/** Google marca "aberto 24h" como um único período sem fechamento. */
function isOpen24h(periods?: Period[]): boolean {
  return Boolean(periods?.length === 1 && !periods[0].close && periods[0].open?.hour === 0);
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return m ? `${h}:${String(m).padStart(2, '0')} ${ampm}` : `${h} ${ampm}`;
}

function hoursLabel(p: Place, is24h: boolean): string {
  if (is24h) return 'Open 24 hours';
  const open = p.currentOpeningHours?.openNow;
  if (open === undefined) return 'Hours unavailable';
  if (!open) return 'Closed now';
  const close = p.currentOpeningHours?.nextCloseTime;
  return close ? `Open until ${formatTime(close)}` : 'Open now';
}

/** Posição aproximada no mapa ilustrado (web/reserva), relativa à origem. */
function illustratedPin(origin: LatLng, c: LatLng, radiusM: number) {
  const k = 0.42 / (radiusM / 111320); // graus → fração do mapa
  const clamp = (v: number) => Math.min(0.92, Math.max(0.08, v));
  return { x: clamp(0.36 + (c.longitude - origin.longitude) * k), y: clamp(0.56 - (c.latitude - origin.latitude) * k) };
}

export class PlacesError extends Error {}

/** Busca veterinárias reais perto de `origin` (Places API New, Nearby Search). */
export async function searchNearbyVets(origin: LatLng, radiusM = 3000): Promise<Clinic[]> {
  if (!placesAvailable) throw new PlacesError('Google Places is not configured');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': extra.googleApiKey as string,
    'X-Goog-FieldMask': FIELD_MASK,
  };
  if (Platform.OS === 'android' && extra.androidPackage && extra.androidCertSha1) {
    headers['X-Android-Package'] = extra.androidPackage;
    headers['X-Android-Cert'] = extra.androidCertSha1;
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      includedTypes: ['veterinary_care'],
      maxResultCount: 10,
      rankPreference: 'DISTANCE',
      languageCode: 'en',
      locationRestriction: { circle: { center: origin, radius: radiusM } },
    }),
  });
  const json = (await res.json().catch(() => ({}))) as { places?: Place[]; error?: { message?: string; status?: string } };
  if (!res.ok) throw new PlacesError(json.error?.message ?? `Places request failed (${res.status})`);

  return (json.places ?? [])
    .filter((p): p is Place & { location: LatLng } => Boolean(p.location))
    .map((p) => {
      const coords = { latitude: p.location.latitude, longitude: p.location.longitude };
      const is24h = isOpen24h(p.regularOpeningHours?.periods);
      return {
        id: p.id,
        name: p.displayName?.text ?? 'Vet clinic',
        rating: p.rating ?? null,
        ratingCount: p.userRatingCount,
        distanceM: distanceMeters(origin, coords),
        hoursLabel: hoursLabel(p, is24h),
        openNow: is24h ? true : p.currentOpeningHours?.openNow,
        is24h,
        phone: p.internationalPhoneNumber ?? p.nationalPhoneNumber,
        address: p.formattedAddress,
        pin: illustratedPin(origin, coords, radiusM),
        coords,
        source: 'google' as const,
      };
    })
    .sort((a, b) => a.distanceM - b.distanceM);
}
