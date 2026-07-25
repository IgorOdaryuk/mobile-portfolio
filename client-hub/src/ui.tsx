import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, font, radius, shadow, avatarColor } from './theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ label, fg, bg, small }: { label: string; fg: string; bg: string; small?: boolean }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }, small && { paddingVertical: 3, paddingHorizontal: 8 }]}>
      <View style={[styles.dot, { backgroundColor: fg }]} />
      <Text style={[styles.pillText, { color: fg }, small && { fontSize: 11 }]}>{label}</Text>
    </View>
  );
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const [bg, fg] = avatarColor(name);
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={{ color: fg, fontFamily: font.bold, fontSize: size * 0.36 }}>{initials}</Text>
    </View>
  );
}

export function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{children}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, ...shadow.card },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  pillText: { fontFamily: font.semi, fontSize: 12.5, letterSpacing: 0.1 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionLabel: {
    fontFamily: font.bold,
    fontSize: 13,
    letterSpacing: 1.2,
    color: colors.muted,
    textTransform: 'uppercase',
  },
});
