import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { aiChat, clinicChat, clinics, collar, pet, petCoords, user, type ChatMessage, type Clinic, type LatLng } from '../data/mock';
import { distanceMeters, placesAvailable, searchNearbyVets } from '../services/places';
import { sendMessage, type AiTurn } from '../services/ai';
import { timing } from '../theme/tokens';

export function useUser() {
  return user;
}

export function greetingFor(date = new Date()): string {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Dados do pet com batimento "ao vivo" (varia entre 82 e 90). */
export function usePet() {
  const [heartRate, setHeartRate] = useState(pet.heartRate);
  useEffect(() => {
    const id = setInterval(() => {
      setHeartRate(82 + Math.round(Math.random() * 8));
    }, timing.heartTickMs);
    return () => clearInterval(id);
  }, []);
  return { ...pet, heartRate };
}

export function useCollar() {
  return collar;
}

/** Clínicas de exemplo (a VetVida é a clínica do chat de demonstração). */
export function useClinics() {
  return clinics;
}

export type NearbyState = {
  clinics: Clinic[];
  origin: LatLng;
  status: 'loading' | 'ready';
  /** 'google' = clínicas reais; 'demo' = exemplos. */
  source: 'google' | 'demo';
  /** Por que estamos mostrando exemplos ou a localização padrão (para exibir na tela). */
  notice?: string;
};

/**
 * Clínicas de exemplo reposicionadas ao redor de `origin`, mantendo o mesmo
 * desenho relativo. Assim o modo de exemplo funciona em qualquer estado
 * (sem puxar o mapa para São Paulo) e as distâncias ficam coerentes.
 */
function samplesAround(origin: LatLng): Clinic[] {
  const dLat = origin.latitude - petCoords.latitude;
  const dLon = origin.longitude - petCoords.longitude;
  return clinics.map((c) => {
    const coords = { latitude: c.coords.latitude + dLat, longitude: c.coords.longitude + dLon };
    return { ...c, coords, distanceM: distanceMeters(origin, coords) };
  });
}

async function currentPosition(): Promise<{ origin: LatLng; notice?: string }> {
  if (Platform.OS === 'web') return { origin: petCoords };
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { origin: petCoords, notice: 'Location permission denied — showing a default area.' };
    const pos =
      (await Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000 })) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { origin: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } };
  } catch {
    return { origin: petCoords, notice: 'Could not get your location — showing a default area.' };
  }
}

/** Clínicas veterinárias reais por perto (Google Places), com reserva nos exemplos. */
export function useNearbyClinics() {
  const [state, setState] = useState<NearbyState>({ clinics, origin: petCoords, status: 'loading', source: 'demo' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!placesAvailable) {
        if (!cancelled) setState({ clinics, origin: petCoords, status: 'ready', source: 'demo' });
        return;
      }
      setState((s) => ({ ...s, status: 'loading' }));
      const { origin, notice } = await currentPosition();
      try {
        const found = await searchNearbyVets(origin);
        if (cancelled) return;
        if (found.length === 0) {
          setState({ clinics: samplesAround(origin), origin, status: 'ready', source: 'demo', notice: 'No vet clinics found within 3 km — showing examples.' });
        } else {
          setState({ clinics: found, origin, status: 'ready', source: 'google', notice });
        }
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        setState({ clinics: samplesAround(origin), origin, status: 'ready', source: 'demo', notice: `Couldn't load real clinics (${msg}) — showing examples.` });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { ...state, reload };
}

let idCounter = 0;
const newId = () => `m${Date.now()}_${idCounter++}`;

type ChatMode = 'clinic' | 'ai';

/** Estado de um chat com resposta mock após ~1,5 s. */
export function useChat(mode: ChatMode) {
  const initial = mode === 'clinic' ? clinicChat.messages : aiChat.messages;
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef<ChatMessage[]>(initial);
  messagesRef.current = messages;
  const replyIdx = useRef(0);
  const alive = useRef(true);
  const generation = useRef(0);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const mine: ChatMessage = { id: newId(), kind: 'text', from: 'me', text: trimmed };
      const history = [...messagesRef.current, mine];
      messagesRef.current = history;
      setMessages(history);
      setTyping(true);
      const gen = generation.current;

      let reply: string;
      if (mode === 'ai') {
        const turns: AiTurn[] = history.map((m) => ({
          role: m.from === 'me' ? 'user' : 'assistant',
          content: m.kind === 'text' ? m.text : m.kind === 'analysis' ? `${m.title}. ${m.text}` : m.detail,
        }));
        reply = await sendMessage(turns);
      } else {
        await new Promise((r) => setTimeout(r, timing.replyDelayMs));
        reply = clinicChat.replies[replyIdx.current++ % clinicChat.replies.length];
      }
      if (!alive.current || gen !== generation.current) return;
      setTyping(false);
      setMessages((prev) => [...prev, { id: newId(), kind: 'text', from: 'them', text: reply }]);
    },
    [mode],
  );

  const reset = useCallback(() => {
    generation.current += 1;
    setTyping(false);
    setMessages(mode === 'ai' ? [{ id: newId(), kind: 'text', from: 'them', text: aiChat.greeting }] : initial);
  }, [mode, initial]);

  return { messages, typing, send, reset };
}
