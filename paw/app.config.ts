import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Estende o app.json com a chave do Google Maps, lida de GOOGLE_MAPS_API_KEY
 * (arquivo .env.local, fora do git). Sem a chave, o app usa o mapa ilustrado.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
  return {
    ...(config as ExpoConfig),
    plugins: [
      ...(config.plugins ?? []),
      ['react-native-maps', mapsKey ? { androidGoogleMapsApiKey: mapsKey } : {}],
    ],
    extra: { ...config.extra, hasGoogleMaps: Boolean(mapsKey) },
  };
};
