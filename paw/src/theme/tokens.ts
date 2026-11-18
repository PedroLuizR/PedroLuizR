import type { TextStyle } from 'react-native';

export const colors = {
  // Base
  background: '#FAF9FD',
  surface: '#FFFFFF',
  surfaceLavender: '#F2EFFB',
  surfaceLavender2: '#E6E1F2',
  border: '#E6E0F5',

  // Texto
  textPrimary: '#24183E',
  textSecondary: '#756D87',
  textMuted: '#867E96',
  textNeutral: '#454649',
  textOnColor: '#FFFFFF',
  textOnColorSoft: 'rgba(255,255,255,0.8)',

  // Marca
  primary: '#8C6DCF',
  secondary: '#6D83CF',
  secondaryLight: '#9FB3E8',
  accent: '#A0CF6D',

  // Humor
  moodBg: '#F4F1E8',
  moodText: '#B5AE52',
  moodIcon: '#CFC86D',

  // Saúde
  heart: '#D88760',

  // Mapa
  mapLand: '#E7EBE3',
  mapPark: '#D0E3C4',
  mapWater: '#B8D9E6',
  mapRoute: '#6D83CF',
  mapRoad: '#FFFFFF',
  mapLabel: '#9A9FA0',
  mapHalo: 'rgba(109,131,207,0.22)',

  // Closet / produto
  cream: '#F1EBD9',
  sageGreen: '#9BAF92',
  sunYellow: '#CFC86D',
  terracotta: '#C87550',
  sageDark: '#7F9879',
  sunDark: '#B5AE52',
  terracottaLight: '#D88760',
  terracottaDark: '#A95C41',
  terracottaHighlight: '#E6AC7E',

  // 3D (modelo do Bento e da coleira)
  fur: '#DCA45C',
  furLight: '#F3D6A4',
  furShade: '#B9813F',
  nose: '#2B1D14',
  tongue: '#E58A8A',
  collarStrap: '#3E5B47',
  collarDevice: '#4F6F58',
  metal: '#C9C6C0',
  shadow3d: '#24183E',

  // Utilitários
  whiteTrack: 'rgba(255,255,255,0.3)',
  shadow: '#24183E',
  toastBg: 'rgba(36,24,62,0.92)',
  transparent: 'transparent',
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

const t = (fontFamily: string, fontSize: number, lineHeight: number, extra: TextStyle = {}): TextStyle => ({
  fontFamily,
  fontSize,
  lineHeight,
  ...extra,
});

export const typography = {
  logo: t(fonts.bold, 22, 28, { letterSpacing: 0.5 }),
  h1: t(fonts.semibold, 28, 34, { letterSpacing: -0.4 }),
  h2: t(fonts.semibold, 20, 26, { letterSpacing: -0.2 }),
  petName: t(fonts.medium, 32, 38, { letterSpacing: -0.4 }),
  metric: t(fonts.semibold, 36, 42, { letterSpacing: -0.6 }),
  metricUnit: t(fonts.medium, 14, 18),
  cardTitle: t(fonts.semibold, 16, 22),
  cardTitleLg: t(fonts.semibold, 17, 23),
  body: t(fonts.regular, 14, 20),
  bodyMedium: t(fonts.medium, 14, 20),
  button: t(fonts.semibold, 14, 18),
  label: t(fonts.medium, 13, 18),
  caption: t(fonts.regular, 12, 16),
  captionMedium: t(fonts.medium, 12, 16),
  overline: t(fonts.medium, 10, 14, { letterSpacing: 0.5, textTransform: 'uppercase' }),
  overlineLg: t(fonts.medium, 11, 14, { letterSpacing: 0.5, textTransform: 'uppercase' }),
  tabLabel: t(fonts.regular, 11, 14),
  tabLabelActive: t(fonts.semibold, 11, 14),
  mapLabel: t(fonts.medium, 9, 12, { letterSpacing: 1 }),
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 28,
  screen: 24,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  card: 20,
  cardLg: 24,
  pill: 999,
  tabBar: 28,
} as const;

export const sizes = {
  iconButton: 44,
  touch: 44,
  icon: 20,
  iconSm: 16,
  iconXs: 14,
  iconStroke: 1.75,
  dot: 6,
  dotLg: 12,
  tabPillW: 52,
  tabPillH: 32,
  tabBarH: 68,
  petCardH: 196,
  petAvatar: 132,
  avatarBorder: 4,
  iconTile: 44,
  iconTileLg: 52,
  mapH: 450,
  mapPinAvatar: 56,
  clinicPin: 34,
  closetPreviewH: 340,
  closetItemW: 112,
  closetItemH: 110,
  check: 22,
  productH: 340,
  progressH: 8,
  chatMaxWidth: '78%',
  sendButton: 40,
  ecgW: 120,
  ecgH: 48,
  borderThin: 1,
  borderSelected: 1.5,
} as const;

export const shadows = {
  soft: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  float: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
} as const;

export const timing = {
  replyDelayMs: 1500,
  heartTickMs: 2500,
  toastMs: 1800,
} as const;
