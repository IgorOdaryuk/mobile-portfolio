import React from 'react';
import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { C, FONT, RADIUS } from './theme';

/** Row of 5 stars with partial fill for the fractional part. */
export function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return <Star key={i} size={size} fill={fill} />;
      })}
    </View>
  );
}

function Star({ size, fill }: { size: number; fill: number }) {
  const d =
    'M12 2 L15 8.5 L22 9.3 L17 14 L18.3 21 L12 17.5 L5.7 21 L7 14 L2 9.3 L9 8.5 Z';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={d} fill={C.line} />
      {fill > 0 ? (
        <Path d={d} fill={C.gold} clipPath={undefined} opacity={fill >= 1 ? 1 : fill} />
      ) : null}
    </Svg>
  );
}

export function SampleBadge() {
  return (
    <View style={styles.sample}>
      <Text style={styles.sampleText}>SAMPLE STORE</Text>
    </View>
  );
}

export function Tag({ label, tone = 'sage' }: { label: string; tone?: 'sage' | 'terra' }) {
  const bg = tone === 'terra' ? C.terraSoft : C.sageSoft;
  const fg = tone === 'terra' ? C.terra : C.sage;
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[styles.tagText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.section}>{children}</Text>
      {right}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function HeartButton({ active, onPress }: { active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.heart}>
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path
          d="M12 21s-7-4.35-9.5-8.5C1 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 7C19 16.65 12 21 12 21z"
          fill={active ? C.terra : 'none'}
          stroke={active ? C.terra : C.inkFaint}
          strokeWidth={1.8}
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sample: {
    alignSelf: 'flex-start',
    backgroundColor: C.ink,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sampleText: { fontFamily: FONT.bodyBold, fontSize: 9, letterSpacing: 1, color: C.bg },

  tag: { borderRadius: RADIUS.pill, paddingHorizontal: 9, paddingVertical: 3, alignSelf: 'flex-start' },
  tagText: { fontFamily: FONT.bodyBold, fontSize: 10, letterSpacing: 0.4 },

  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 },
  section: { fontFamily: FONT.display, fontSize: 20, color: C.ink },

  card: { backgroundColor: C.card, borderColor: C.line, borderWidth: 1, borderRadius: RADIUS.lg, padding: 16 },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 16 },

  heart: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...( { boxShadow: '0 2px 6px rgba(38,34,29,0.12)' } as any),
  },
});
