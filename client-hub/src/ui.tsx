import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, font, radius, shadow, avatarColor } from './theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ label, fg, bg, small }: { label: string; fg: string; bg: string; small?: boolean }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor: fg + '33' }, small && { paddingVertical: 2, paddingHorizontal: 7 }]}>
      <View style={[styles.dot, { backgroundColor: fg }]} />
      <Text style={[styles.pillText, { color: fg }, small && { fontSize: 9.5 }]}>{label}</Text>
    </View>
  );
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const [bg, fg] = avatarColor(name);
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: radius.md, backgroundColor: bg }]}>
      <Text style={{ color: fg, fontFamily: font.monoBold, fontSize: size * 0.32 }}>{initials}</Text>
    </View>
  );
}

export function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionLeft}>
        <View style={styles.sectionTick} />
        <Text style={styles.sectionLabel}>{children}</Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  dot: { width: 5, height: 5, borderRadius: 1, marginRight: 6 },
  pillText: { fontFamily: font.monoSemi, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase' },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTick: { width: 3, height: 12, borderRadius: 1, backgroundColor: colors.accent },
  sectionLabel: {
    fontFamily: font.monoSemi,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.inkSoft,
    textTransform: 'uppercase',
  },
});
