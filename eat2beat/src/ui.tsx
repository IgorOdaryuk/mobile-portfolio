import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import { C, RADIUS, FONT } from './theme';

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.section}>{children}</Text>
      {right}
    </View>
  );
}

export function SampleBadge() {
  return (
    <View style={styles.sample}>
      <View style={styles.sampleDot} />
      <Text style={styles.sampleText}>SAMPLE DATA</Text>
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
  color = C.primary,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active ? { backgroundColor: color, borderColor: color } : null,
      ]}
    >
      <Text style={[styles.chipText, active ? { color: '#fff' } : null]}>{label}</Text>
    </Pressable>
  );
}

/** Rounds to a whole number and appends a unit, e.g. fmt(153.6,'g') -> "154 g". */
export function fmt(n: number, unit?: string): string {
  const v = Math.round(n).toLocaleString('en-US');
  return unit ? `${v} ${unit}` : v;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderColor: C.cardBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 12,
  },
  section: { fontFamily: FONT.bodyBold, fontSize: 16, color: C.text },
  sample: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: C.carbsSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sampleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.carbs },
  sampleText: { fontFamily: FONT.bodyBold, fontSize: 10, letterSpacing: 0.6, color: '#9A6B12' },
  chip: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.textDim },
});
