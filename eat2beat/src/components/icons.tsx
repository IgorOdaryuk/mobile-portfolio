import React from 'react';
import Svg, { Rect, Circle, Line } from 'react-native-svg';

/** Bespoke bathroom-scale glyph for the Weight tab — a rounded body with a dial
 *  and needle. Reads as "weigh-in", and is visually distinct from the Trends
 *  line icon (Feather has no scale glyph). Feather-weight stroke to match. */
export function ScaleIcon({ size = 22, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={5} stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={13} r={3.6} stroke={color} strokeWidth={1.6} />
      <Line x1={12} y1={13} x2={14.2} y2={10.4} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
