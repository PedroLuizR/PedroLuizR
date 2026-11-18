import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Estende o app.json com a chave do Google Maps, lida de GOOGLE_MAPS_API_KEY
 * (arquivo .env.local, fora do git). Sem a chave, o app usa o mapa ilustrado.
 */
const PROGUARD_RULES = [
  '-keep class androidx.work.** { *; }',
  '-keep class androidx.room.** { *; }',
  '-keep class * extends androidx.room.RoomDatabase { *; }',
  '-keep class androidx.startup.** { *; }',
  '-dontwarn androidx.work.**',
].join('\n');

export default ({ config }: ConfigContext): ExpoConfig => {
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
  return {
    ...(config as ExpoConfig),
    plugins: [
      ...(config.plugins ?? []),
      ['react-native-maps', mapsKey ? { androidGoogleMapsApiKey: mapsKey } : {}],
      // O Google Maps traz o WorkManager (que usa Room por reflexão). Sem estas
      // regras o R8 do build release remove o WorkDatabase_Impl e o app fecha ao abrir.
      ['expo-build-properties', { android: { extraProguardRules: PROGUARD_RULES } }],
    ],
    extra: { ...config.extra, hasGoogleMaps: Boolean(mapsKey) },
  };
};
