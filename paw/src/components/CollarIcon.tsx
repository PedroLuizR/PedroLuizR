import Svg, { Circle, Ellipse, Rect } from 'react-native-svg';

/** Ícone de coleira no estilo lucide (traço fino). */
export function CollarIcon({ size = 24, color = 'currentColor', strokeWidth = 1.75 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Ellipse cx={12} cy={10} rx={9} ry={5} />
      <Rect x={9.5} y={13} width={5} height={3} rx={1} />
      <Circle cx={12} cy={19} r={2.2} />
    </Svg>
  );
}
