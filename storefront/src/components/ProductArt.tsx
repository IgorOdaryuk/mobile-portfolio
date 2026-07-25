import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Path, Circle, Ellipse, G, Line } from 'react-native-svg';
import { PRODUCT_TINTS, C } from '../theme';
import type { Vessel } from '../types';

/**
 * Minimalist SVG product illustrations, tinted per product. Gives the whole
 * catalog a cohesive boutique look with zero stock photos / image assets.
 * Drawn on a 100x120 viewBox and scaled to `size`.
 */
export function ProductArt({
  vessel,
  tint,
  size = 120,
}: {
  vessel: Vessel;
  tint: string;
  size?: number;
}) {
  const t = PRODUCT_TINTS[tint] ?? PRODUCT_TINTS.sage;
  const h = size * 1.2;
  return (
    <View style={{ width: size, height: h, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={h} viewBox="0 0 100 120">
        {shape(vessel, t)}
      </Svg>
    </View>
  );
}

function shape(vessel: Vessel, t: { fill: string; cap: string }) {
  const label = <Rect x="34" y="62" width="32" height="26" rx="4" fill={C.white} opacity={0.55} />;
  switch (vessel) {
    case 'bottle':
      return (
        <G>
          <Rect x="43" y="16" width="14" height="12" rx="2" fill={t.cap} />
          <Rect x="40" y="26" width="20" height="6" rx="2" fill={t.cap} opacity={0.85} />
          <Rect x="30" y="32" width="40" height="72" rx="12" fill={t.fill} />
          {label}
          <Line x1="40" y1="70" x2="60" y2="70" stroke={t.cap} strokeWidth="2" strokeLinecap="round" opacity={0.5} />
        </G>
      );
    case 'dropper':
      return (
        <G>
          <Rect x="42" y="12" width="16" height="16" rx="3" fill={t.cap} />
          <Rect x="47" y="24" width="6" height="16" fill={t.cap} opacity={0.7} />
          <Path d="M32 44 h36 a6 6 0 0 1 6 6 v46 a10 10 0 0 1 -10 10 h-28 a10 10 0 0 1 -10 -10 v-46 a6 6 0 0 1 6 -6 z" fill={t.fill} />
          {label}
        </G>
      );
    case 'jar':
      return (
        <G>
          <Rect x="26" y="30" width="48" height="12" rx="4" fill={t.cap} />
          <Path d="M28 42 h44 v46 a12 12 0 0 1 -12 12 h-20 a12 12 0 0 1 -12 -12 z" fill={t.fill} />
          <Ellipse cx="50" cy="42" rx="22" ry="5" fill={C.white} opacity={0.35} />
        </G>
      );
    case 'tube':
      return (
        <G>
          <Rect x="44" y="16" width="12" height="10" rx="2" fill={t.cap} />
          <Path d="M34 26 h32 v66 a8 8 0 0 1 -8 8 h-16 a8 8 0 0 1 -8 -8 z" fill={t.fill} />
          <Path d="M34 100 l4 6 h24 l4 -6 z" fill={t.cap} opacity={0.85} />
          {label}
        </G>
      );
    case 'pouch':
      return (
        <G>
          <Path d="M28 20 h44 v6 h-44 z" fill={t.cap} />
          <Path d="M30 26 h40 v70 a4 4 0 0 1 -4 4 h-32 a4 4 0 0 1 -4 -4 z" fill={t.fill} />
          <Circle cx="50" cy="40" r="8" fill={C.white} opacity={0.4} />
        </G>
      );
  }
}
