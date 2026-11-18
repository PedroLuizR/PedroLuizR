import type { ImageSourcePropType } from 'react-native';

export const user = { name: 'Marina' };

export const pet = {
  name: 'Bento',
  breed: 'Golden retriever',
  ageYears: 3,
  avatar: require('../../assets/images/bento_avatar.png') as ImageSourcePropType,
  closetPhoto: require('../../assets/images/bento_closet.png') as ImageSourcePropType,
  heartRate: 86,
  heartState: 'Resting · normal',
  health: { title: 'All good', note: 'Stable vitals' },
  mood: { title: 'Happy and calm', note: 'A great day so far' },
};

export const collar = {
  model: 'PAW One',
  kind: 'Smart collar',
  photo: require('../../assets/images/coleira_paw_one.png') as ImageSourcePropType,
  battery: 82,
  autonomyDays: 4,
  usageToday: '8h 32min',
  status: 'In use',
  firmware: 'v2.4.1',
  bluetooth: true,
  lastSync: 'just now',
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
  { id: 'vetvida', name: 'VetVida Clinic', rating: 4.9, distanceM: 650, openUntil: '10 PM', vet: 'Dr. Luiza', is24h: false, pin: { x: 0.72, y: 0.74 }, coords: { latitude: -23.5893, longitude: -46.6352 } },
  { id: 'c2', name: 'Pet Care Vila Mariana', rating: 4.7, distanceM: 900, openUntil: '24 hours', is24h: true, pin: { x: 0.2, y: 0.82 }, coords: { latitude: -23.5921, longitude: -46.6421 } },
  { id: 'c3', name: 'Ibirapuera Vet Hospital', rating: 4.8, distanceM: 1200, openUntil: '8 PM', is24h: false, pin: { x: 0.84, y: 0.4 }, coords: { latitude: -23.5838, longitude: -46.6497 } },
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
  { id: 'moletom', name: 'Hoodie', color: 'Sage green', swatch: 'sageGreen', category: 'roupinhas' },
  { id: 'bandana', name: 'Bandana', color: 'Sunbeam', swatch: 'sunYellow', category: 'acessorios' },
  { id: 'capa', name: 'Raincoat', color: 'Terracotta', swatch: 'terracotta', category: 'roupinhas' },
];

export type ChatMessage =
  | { id: string; kind: 'text'; from: 'me' | 'them'; text: string }
  | { id: string; kind: 'petSummary'; from: 'me'; title: string; detail: string; caption: string }
  | { id: string; kind: 'analysis'; from: 'them'; title: string; text: string; advice: string; cta: string };

export const clinicChat = {
  dateLabel: 'Today, 10:42 AM',
  messages: [
    { id: 'c1', kind: 'text', from: 'them', text: 'Hi, Marina! I\'m Dr. Luiza from VetVida. How can I help you and Bento today?' },
    { id: 'c2', kind: 'text', from: 'me', text: 'Hi, doctor! Bento has been scratching his ear a lot today. Can I bring him in for a check-up?' },
    { id: 'c3', kind: 'petSummary', from: 'me', title: 'Bento\'s summary', detail: '86 bpm · Stable vitals', caption: 'Collar data shared at 10:44 AM' },
    { id: 'c4', kind: 'text', from: 'them', text: 'Of course! We have a slot at 2:30 PM. Until then, avoid putting anything in his ear before he\'s examined.' },
  ] as ChatMessage[],
  replies: [
    'Noted! I\'ll add it to Bento\'s record.',
    'Perfect. If anything changes, let me know here.',
    'Great! See you at 2:30 PM.',
  ],
};

export const aiChat = {
  messages: [
    { id: 'a1', kind: 'text', from: 'them', text: 'Hi, Marina! Let\'s look into Bento\'s itching. When did it start? Is it one ear or both?' },
    { id: 'a2', kind: 'text', from: 'me', text: 'It started today, only in the right ear.' },
    { id: 'a3', kind: 'text', from: 'them', text: 'Is he shaking his head? Any discharge, strong smell, or pain when touched?' },
    { id: 'a4', kind: 'text', from: 'me', text: 'He shakes his head, but I haven\'t noticed discharge or pain.' },
    {
      id: 'a5',
      kind: 'analysis',
      from: 'them',
      title: 'What these signs may mean',
      text: 'It could be irritation or an ear infection, among other causes. Only a vet exam can confirm.',
      advice: 'Don\'t apply any products. Get him checked; if there\'s severe pain, loss of balance or it gets worse, seek care right away.',
      cta: 'Talk to VetVida',
    },
  ] as ChatMessage[],
  greeting: 'Hi, Marina! How is Bento today? Tell me what you\'ve noticed.',
};
