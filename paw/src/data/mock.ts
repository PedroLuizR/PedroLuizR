import type { ImageSourcePropType } from 'react-native';

export const user = { name: 'Marina' };

export const pet = {
  name: 'Bento',
  breed: 'Golden retriever',
  ageYears: 3,
  avatar: require('../../assets/images/bento_avatar.png') as ImageSourcePropType,
  closetPhoto: require('../../assets/images/bento_closet.png') as ImageSourcePropType,
  heartRate: 86,
  heartState: 'Em repouso · normal',
  health: { title: 'Tudo em dia', note: 'Sinais estáveis' },
  mood: { title: 'Feliz e tranquilo', note: 'Um ótimo dia por aqui' },
};

export const collar = {
  model: 'PAW One',
  kind: 'Coleira inteligente',
  photo: require('../../assets/images/coleira_paw_one.png') as ImageSourcePropType,
  battery: 82,
  autonomyDays: 4,
  usageToday: '8h 32min',
  status: 'Em uso',
  firmware: 'v2.4.1',
  bluetooth: true,
  lastSync: 'agora',
};

export type LatLng = { latitude: number; longitude: number };

export type Clinic = {
  id: string;
  name: string;
  rating: number;
  distanceM: number;
  openUntil: string;
  vet?: string;
  is24h: boolean;
  /** Posição do pin no mapa ilustrado (0–1 relativo à largura/altura). */
  pin: { x: number; y: number };
  /** Coordenadas reais (mock) para o Google Maps. */
  coords: LatLng;
};

export const clinics: Clinic[] = [
  { id: 'vetvida', name: 'Clínica VetVida', rating: 4.9, distanceM: 650, openUntil: '22h', vet: 'Dra. Luiza', is24h: false, pin: { x: 0.72, y: 0.74 }, coords: { latitude: -23.5893, longitude: -46.6352 } },
  { id: 'c2', name: 'Pet Care Vila Mariana', rating: 4.7, distanceM: 900, openUntil: '24h', is24h: true, pin: { x: 0.2, y: 0.82 }, coords: { latitude: -23.5921, longitude: -46.6421 } },
  { id: 'c3', name: 'Hospital Vet Ibirapuera', rating: 4.8, distanceM: 1200, openUntil: '20h', is24h: false, pin: { x: 0.84, y: 0.4 }, coords: { latitude: -23.5838, longitude: -46.6497 } },
];

/** Posição do Bento no mapa ilustrado. */
export const petMapPosition = { x: 0.36, y: 0.56 };
/** Coordenadas do Bento (mock) — perto da R. França Pinto, Vila Mariana. */
export const petCoords: LatLng = { latitude: -23.5869, longitude: -46.6398 };

export type ClosetCategory = 'roupinhas' | 'acessorios';
export type ClosetItemKind = 'moletom' | 'bandana' | 'capa';

export type ClosetItem = {
  id: ClosetItemKind;
  name: string;
  color: string;
  swatch: 'sageGreen' | 'sunYellow' | 'terracotta';
  category: ClosetCategory;
};

export const closetItems: ClosetItem[] = [
  { id: 'moletom', name: 'Moletom', color: 'Verde sálvia', swatch: 'sageGreen', category: 'roupinhas' },
  { id: 'bandana', name: 'Bandana', color: 'Raio de sol', swatch: 'sunYellow', category: 'acessorios' },
  { id: 'capa', name: 'Capa de chuva', color: 'Terracota', swatch: 'terracotta', category: 'roupinhas' },
];

export type ChatMessage =
  | { id: string; kind: 'text'; from: 'me' | 'them'; text: string }
  | { id: string; kind: 'petSummary'; from: 'me'; title: string; detail: string; caption: string }
  | { id: string; kind: 'analysis'; from: 'them'; title: string; text: string; advice: string; cta: string };

export const clinicChat = {
  dateLabel: 'Hoje, 10:42',
  messages: [
    { id: 'c1', kind: 'text', from: 'them', text: 'Olá, Marina! Sou a Dra. Luiza, da VetVida. Como posso ajudar você e o Bento hoje?' },
    { id: 'c2', kind: 'text', from: 'me', text: 'Oi, doutora! O Bento coçou bastante a orelha hoje. Posso levar ele para uma avaliação?' },
    { id: 'c3', kind: 'petSummary', from: 'me', title: 'Resumo do Bento', detail: '86 bpm · Sinais estáveis', caption: 'Dados da coleira compartilhados às 10:44' },
    { id: 'c4', kind: 'text', from: 'them', text: 'Claro! Temos um horário às 14h30. Até lá, evite colocar produtos na orelha sem avaliação.' },
  ] as ChatMessage[],
  replies: [
    'Anotado! Vou deixar registrado no prontuário do Bento.',
    'Perfeito. Qualquer mudança, me avise por aqui.',
    'Combinado! Te esperamos às 14h30.',
  ],
};

export const aiChat = {
  messages: [
    { id: 'a1', kind: 'text', from: 'them', text: 'Oi, Marina! Vamos entender a coceira do Bento. Há quanto tempo começou? É em uma ou nas duas orelhas?' },
    { id: 'a2', kind: 'text', from: 'me', text: 'Começou hoje, só na orelha direita.' },
    { id: 'a3', kind: 'text', from: 'them', text: 'Ele balança a cabeça? Tem secreção, cheiro forte ou sente dor ao tocar?' },
    { id: 'a4', kind: 'text', from: 'me', text: 'Balança a cabeça, mas não notei secreção nem dor.' },
    {
      id: 'a5',
      kind: 'analysis',
      from: 'them',
      title: 'O que esses sinais podem indicar',
      text: 'Pode ser irritação ou otite, entre outras causas. Só um exame veterinário confirma.',
      advice: 'Não aplique produtos. Procure avaliação; se houver dor intensa, perda de equilíbrio ou piora, busque atendimento imediato.',
      cta: 'Falar com a VetVida',
    },
  ] as ChatMessage[],
  greeting: 'Oi, Marina! Como o Bento está hoje? Me conte o que você notou.',
};
