import Svg, { Path } from 'react-native-svg';
import type { ClosetItemKind } from '../../data/mock';
import { colors } from '../../theme/tokens';

/** Ícones das roupinhas desenhados à mão (SVG simples). */
export function ClothingIcon({ kind, color, size = 44 }: { kind: ClosetItemKind; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {kind === 'moletom' ? (
        <>
          <Path d="M17 8c2 3 4.5 4.5 7 4.5S29 11 31 8l9 5 4 10-6 3-2-4v20H12V22l-2 4-6-3 4-10 9-5z" fill={color} />
          <Path d="M19 8c1 4 3 6 5 6s4-2 5-6" fill="none" stroke={colors.surface} strokeOpacity={0.5} strokeWidth={1.5} />
          <Path d="M12 37h24" stroke={colors.surface} strokeOpacity={0.4} strokeWidth={1.5} />
        </>
      ) : kind === 'bandana' ? (
        <>
          <Path d="M6 14h36l-18 24z" fill={color} />
          <Path d="M6 14h36v4H6z" fill={color} opacity={0.75} />
          <Path d="M18 22a1.5 1.5 0 1 0 0.01 0M28 22a1.5 1.5 0 1 0 0.01 0M23 29a1.5 1.5 0 1 0 0.01 0" fill={colors.surface} fillOpacity={0.7} />
        </>
      ) : (
        <>
          <Path d="M24 6c-6 0-9 4-9 8v3l-6 4 3 19h24l3-19-6-4v-3c0-4-3-8-9-8z" fill={color} />
          <Path d="M15 17c3 2 6 3 9 3s6-1 9-3" fill="none" stroke={colors.surface} strokeOpacity={0.5} strokeWidth={1.5} />
          <Path d="M24 20v20" stroke={colors.surface} strokeOpacity={0.4} strokeWidth={1.5} />
        </>
      )}
    </Svg>
  );
}
