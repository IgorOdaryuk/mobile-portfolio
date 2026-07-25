import React, { useId, useState } from 'react';
import { View, StyleSheet, Pressable, ImageSourcePropType } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect, Ellipse, Circle } from 'react-native-svg';
import { PRODUCT_TINTS, RADIUS, type Palette } from '../theme';
import { useStyles } from '../theme-context';
import type { Vessel } from '../types';
import { ProductArt } from './ProductArt';

type ViewKey = 'front' | 'texture' | 'detail';
const VIEWS: ViewKey[] = ['front', 'texture', 'detail'];

/**
 * PDP gallery: one large view + a thumbnail strip. For a product with real
 * photos this would page an image array; with the SVG mockups it shows three
 * angles — the pack front, a texture swatch of the formula, and a zoomed detail.
 */
export function ProductGallery({
  vessel,
  tint,
  name,
  image,
}: {
  vessel: Vessel;
  tint: string;
  name: string;
  image?: ImageSourcePropType | null;
}) {
  const styles = useStyles(makeStyles);
  const [active, setActive] = useState<ViewKey>('front');

  const renderView = (key: ViewKey, size: number) => {
    if (key === 'texture') return <TextureSwatch tint={tint} size={size} />;
    if (key === 'detail')
      return (
        <View style={{ width: size, height: size, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-start' }}>
          <View style={{ transform: [{ scale: 1.7 }, { translateY: size * 0.12 }] }}>
            <ProductArt vessel={vessel} tint={tint} size={size} />
          </View>
        </View>
      );
    return <ProductArt vessel={vessel} tint={tint} size={size * 0.82} image={image} label={name} />;
  };

  return (
    <View>
      <View style={styles.main} accessibilityRole="image" accessibilityLabel={`${name}, image ${VIEWS.indexOf(active) + 1} of ${VIEWS.length}`}>
        {renderView(active, 200)}
      </View>
      <View style={styles.thumbs}>
        {VIEWS.map((k) => (
          <Pressable
            key={k}
            onPress={() => setActive(k)}
            style={[styles.thumb, active === k && styles.thumbActive]}
            accessibilityRole="button"
            accessibilityLabel={`View ${k}`}
          >
            {renderView(k, 52)}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** A soft radial swatch representing the product's texture/formula. */
function TextureSwatch({ tint, size }: { tint: string; size: number }) {
  const t = PRODUCT_TINTS[tint] ?? PRODUCT_TINTS.sage;
  const uid = useId().replace(/[:]/g, '');
  const g = `t${uid}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={g} cx="42%" cy="38%" r="70%">
          <Stop offset="0" stopColor={lighten(t.fill, 0.35)} />
          <Stop offset="0.6" stopColor={t.fill} />
          <Stop offset="1" stopColor={darken(t.fill, 0.1)} />
        </RadialGradient>
      </Defs>
      <Rect x="8" y="8" width="84" height="84" rx="26" fill={`url(#${g})`} />
      <Ellipse cx="40" cy="34" rx="16" ry="10" fill="#FFFFFF" opacity={0.28} />
      <Circle cx="66" cy="60" r="5" fill="#FFFFFF" opacity={0.18} />
      <Circle cx="58" cy="72" r="3" fill="#FFFFFF" opacity={0.14} />
    </Svg>
  );
}

function mix(hex: string, target: number, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const m = (c: number) => Math.round(c + (target - c) * amt);
  return `#${((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1)}`;
}
const lighten = (hex: string, amt: number) => mix(hex, 255, amt);
const darken = (hex: string, amt: number) => mix(hex, 0, amt);

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    main: {
      backgroundColor: C.cardAlt,
      borderRadius: RADIUS.xl,
      height: 230,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      overflow: 'hidden',
    },
    thumbs: { flexDirection: 'row', gap: 10, marginBottom: 6 },
    thumb: {
      width: 62,
      height: 62,
      borderRadius: RADIUS.md,
      backgroundColor: C.cardAlt,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    thumbActive: { borderColor: C.sage },
  });
