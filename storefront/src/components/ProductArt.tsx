import React, { useId } from 'react';
import { View, Image, ImageSourcePropType } from 'react-native';
import Svg, { Rect, Path, Circle, Ellipse, G, Line, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { PRODUCT_TINTS } from '../theme';
import type { Vessel } from '../types';

const HL = '#FFFFFF';

/* --- tiny hex helpers so we can build glass gradients from a single tint --- */
function mix(hex: string, target: number, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const m = (c: number) => Math.round(c + (target - c) * amt);
  return `#${((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1)}`;
}
const lighten = (hex: string, amt: number) => mix(hex, 255, amt);
const darken = (hex: string, amt: number) => mix(hex, 0, amt);

/**
 * Product renders. Two modes:
 *  - `image` given → render that photo (drop-in for real / AI product shots).
 *  - otherwise → a layered SVG "product mockup": glass gradient body, specular
 *    highlight, printed label with the SOLVA wordmark, and a soft ground shadow.
 * Brand asset — identical in light & dark. Drawn on a 100x120 viewBox.
 */
export function ProductArt({
  vessel,
  tint,
  size = 120,
  image,
  label,
}: {
  vessel: Vessel;
  tint: string;
  size?: number;
  image?: ImageSourcePropType | null;
  label?: string;
}) {
  const h = size * 1.2;
  const uid = useId().replace(/[:]/g, '');
  const a11y = label ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel: `${label} product photo` } : { accessibilityElementsHidden: true, importantForAccessibility: 'no' as const };

  if (image) {
    return <Image source={image} style={{ width: size, height: h, resizeMode: 'contain' }} {...a11y} />;
  }

  const t = PRODUCT_TINTS[tint] ?? PRODUCT_TINTS.sage;
  const bodyGrad = `b${uid}`;
  const capGrad = `c${uid}`;

  return (
    <View style={{ width: size, height: h, alignItems: 'center', justifyContent: 'center' }} {...a11y}>
      <Svg width={size} height={h} viewBox="0 0 100 120">
        <Defs>
          <LinearGradient id={bodyGrad} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={lighten(t.fill, 0.28)} />
            <Stop offset="0.5" stopColor={t.fill} />
            <Stop offset="1" stopColor={darken(t.fill, 0.12)} />
          </LinearGradient>
          <LinearGradient id={capGrad} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={lighten(t.cap, 0.18)} />
            <Stop offset="0.55" stopColor={t.cap} />
            <Stop offset="1" stopColor={darken(t.cap, 0.18)} />
          </LinearGradient>
        </Defs>
        {/* soft ground shadow */}
        <Ellipse cx="50" cy="112" rx="27" ry="4.5" fill="#000" opacity={0.08} />
        {shape(vessel, t, bodyGrad, capGrad)}
      </Svg>
    </View>
  );
}

/** Printed label: rounded card + thin accent rule + SOLVA wordmark. */
function Label({ x, y, w, h, accent }: { x: number; y: number; w: number; h: number; accent: string }) {
  const cx = x + w / 2;
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} rx={3} fill={HL} opacity={0.94} />
      <Rect x={x} y={y} width={w} height={h} rx={3} fill="none" stroke="#000" strokeOpacity={0.05} />
      <SvgText x={cx} y={y + h * 0.42} fill={accent} fontSize={5.2} fontWeight="700" textAnchor="middle" letterSpacing={1.2}>
        SOLVA
      </SvgText>
      <Line x1={x + 5} y1={y + h * 0.62} x2={x + w - 5} y2={y + h * 0.62} stroke={accent} strokeWidth={1} opacity={0.5} strokeLinecap="round" />
      <Line x1={x + 5} y1={y + h * 0.78} x2={x + w - 10} y2={y + h * 0.78} stroke={accent} strokeWidth={1} opacity={0.28} strokeLinecap="round" />
    </G>
  );
}

/** Glass sheen highlight down one edge of the body. */
function Sheen({ d }: { d: string }) {
  return <Path d={d} fill={HL} opacity={0.22} />;
}

function shape(vessel: Vessel, t: { fill: string; cap: string }, body: string, cap: string) {
  const g = `url(#${body})`;
  const c = `url(#${cap})`;
  switch (vessel) {
    case 'bottle':
      return (
        <G>
          <Rect x="43" y="15" width="14" height="13" rx="2" fill={c} />
          <Rect x="40" y="26" width="20" height="6" rx="2" fill={t.cap} opacity={0.9} />
          <Rect x="30" y="32" width="40" height="74" rx="13" fill={g} />
          <Sheen d="M35 40 q-3 4 -3 12 v34 q0 6 4 8 q-2 -26 -1 -54 z" />
          <Label x={35} y={58} w={30} h={30} accent={t.cap} />
        </G>
      );
    case 'dropper':
      return (
        <G>
          <Rect x="41" y="10" width="18" height="18" rx="3" fill={c} />
          <Rect x="47" y="24" width="6" height="18" fill={t.cap} opacity={0.75} />
          <Path d="M31 44 h38 a6 6 0 0 1 6 6 v48 a11 11 0 0 1 -11 11 h-28 a11 11 0 0 1 -11 -11 v-48 a6 6 0 0 1 6 -6 z" fill={g} />
          <Sheen d="M36 50 q-3 3 -3 10 v36 q0 6 4 8 q-2 -28 -1 -54 z" />
          <Label x={35} y={60} w={30} h={30} accent={t.cap} />
        </G>
      );
    case 'jar':
      return (
        <G>
          <Rect x="25" y="28" width="50" height="13" rx="4" fill={c} />
          <Ellipse cx="50" cy="41" rx="25" ry="4" fill={darken(t.cap, 0.1)} opacity={0.5} />
          <Path d="M27 42 h46 v44 a13 13 0 0 1 -13 13 h-20 a13 13 0 0 1 -13 -13 z" fill={g} />
          <Ellipse cx="50" cy="42" rx="23" ry="5" fill={HL} opacity={0.4} />
          <Sheen d="M33 50 q-3 4 -3 12 v20 q0 6 4 8 q-2 -22 -1 -40 z" />
          <Label x={34} y={60} w={32} h={26} accent={t.cap} />
        </G>
      );
    case 'tube':
      return (
        <G>
          <Rect x="43" y="14" width="14" height="11" rx="2" fill={c} />
          <Path d="M34 25 h32 v60 a9 9 0 0 1 -9 9 h-14 a9 9 0 0 1 -9 -9 z" fill={g} />
          <Path d="M34 100 l3 -6 h26 l3 6 z" fill={t.cap} opacity={0.9} />
          <Sheen d="M39 32 q-3 3 -3 10 v40 q0 6 4 7 q-2 -30 -1 -57 z" />
          <Label x={35} y={44} w={30} h={30} accent={t.cap} />
        </G>
      );
    case 'pouch':
      return (
        <G>
          <Path d="M27 18 h46 v7 h-46 z" fill={c} />
          <Path d="M29 25 h42 v70 a4 4 0 0 1 -4 4 h-34 a4 4 0 0 1 -4 -4 z" fill={g} />
          <Sheen d="M35 32 q-3 3 -3 10 v42 q0 4 3 6 q-2 -30 -1 -58 z" />
          <Label x={35} y={44} w={30} h={34} accent={t.cap} />
        </G>
      );
    case 'pump':
      return (
        <G>
          <Rect x="47" y="8" width="7" height="9" rx="1.5" fill={c} />
          <Rect x="40" y="14" width="24" height="8" rx="3" fill={c} />
          <Rect x="62" y="16" width="9" height="6" rx="2" fill={darken(t.cap, 0.12)} />
          <Rect x="43" y="22" width="14" height="8" rx="2" fill={t.cap} opacity={0.9} />
          <Rect x="31" y="30" width="38" height="76" rx="11" fill={g} />
          <Sheen d="M36 38 q-3 4 -3 12 v36 q0 6 4 8 q-2 -28 -1 -56 z" />
          <Label x={35} y={58} w={30} h={30} accent={t.cap} />
        </G>
      );
    case 'mist':
      return (
        <G>
          <Rect x="45" y="9" width="14" height="8" rx="1.5" fill={c} />
          <Rect x="41" y="16" width="6" height="4" rx="1" fill={darken(t.cap, 0.12)} />
          <Rect x="43" y="19" width="18" height="8" rx="2" fill={t.cap} opacity={0.9} />
          <Rect x="33" y="27" width="34" height="79" rx="9" fill={g} />
          <Sheen d="M38 34 q-3 3 -3 11 v40 q0 6 4 8 q-2 -30 -1 -58 z" />
          <Label x={36} y={56} w={28} h={32} accent={t.cap} />
        </G>
      );
    case 'stick':
      return (
        <G>
          <Rect x="39" y="18" width="22" height="36" rx="9" fill={c} />
          <Ellipse cx="50" cy="20" rx="11" ry="3" fill={lighten(t.cap, 0.18)} opacity={0.6} />
          <Rect x="41" y="50" width="18" height="56" rx="7" fill={g} />
          <Sheen d="M44 56 q-2 3 -2 9 v32 q0 5 3 6 q-2 -24 -1 -47 z" />
          <Label x={42} y={68} w={16} h={30} accent={t.cap} />
        </G>
      );
  }
}
