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
  // Views nativas do Expo (ex.: GLView do 3D) são criadas por reflexão com o
  // construtor (Context, AppContext); sem isto o R8 o remove e o app fecha.
  '-keep class * extends expo.modules.kotlin.views.ExpoView { <init>(...); }',
  '-keep class expo.modules.gl.** { *; }',
  '-keepclassmembers class * { <init>(android.content.Context, expo.modules.kotlin.AppContext); }',
].join('\n');

/** SHA-1 da chave de debug que assina o APK hoje (troque ao usar uma keystore própria). */
const DEBUG_CERT_SHA1 = '5E8F16062EA3CD2C4A0D547876BAA6F38CABF625';

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
      [
        'expo-location',
        { locationWhenInUsePermission: 'PAW uses your location to find vet clinics near you and Bento.' },
      ],
    ],
    extra: {
      ...config.extra,
      hasGoogleMaps: Boolean(mapsKey),
      // Usada pela Places API (clínicas reais). Chaves restritas a app Android
      // exigem o pacote + SHA-1 do certificado que assinou o APK.
      googleApiKey: mapsKey ?? null,
      androidPackage: config.android?.package ?? null,
      androidCertSha1: process.env.ANDROID_CERT_SHA1 ?? DEBUG_CERT_SHA1,
    },
  };
};
