import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, font, radius, shadow } from '../theme';
import { Seed, Task } from '../types';
import { groupTasks } from '../selectors';

const META: Record<Task['type'], { icon: any; color: string; bg: string; group: string }> = {
  balance: { icon: 'dollar-sign', color: colors.danger, bg: colors.dangerSoft, group: 'Collect balance' },
  schedule: { icon: 'calendar', color: colors.info, bg: colors.infoSoft, group: 'Schedule visit' },
  review: { icon: 'star', color: colors.warn, bg: colors.warnSoft, group: 'Ask for review' },
  winback: { icon: 'refresh-ccw', color: colors.violet, bg: colors.violetSoft, group: 'Win back' },
};

export default function Tasks({
  data,
  onOpenClient,
  done,
  onToggle,
}: {
  data: Seed;
  onOpenClient: (id: string) => void;
  done: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const grouped = groupTasks(data.tasks);
  const openCount = data.tasks.filter((t) => !done[t.id]).length;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.subtitle}>{openCount} open · auto-generated from job state</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {grouped.map((g) => {
          const m = META[g.type];
          return (
            <View key={g.type} style={{ marginBottom: 20 }}>
              <View style={styles.groupHead}>
                <View style={[styles.groupIcon, { backgroundColor: m.bg }]}>
                  <Feather name={m.icon} size={13} color={m.color} />
                </View>
                <Text style={styles.groupTitle}>{m.group}</Text>
                <View style={styles.groupCount}><Text style={styles.groupCountText}>{g.items.length}</Text></View>
              </View>
              {g.items.map((t) => {
                const checked = !!done[t.id];
                return (
                  <Pressable key={t.id} onPress={() => onOpenClient(t.clientId)} style={styles.task}>
                    <Pressable onPress={() => onToggle(t.id)} style={[styles.check, checked && styles.checkOn]}>
                      {checked && <Feather name="check" size={13} color="#FFF" />}
                    </Pressable>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.taskTitle, checked && styles.strike]}>{t.title}</Text>
                      <Text style={styles.taskSub} numberOfLines={1}>{t.clientName} · {t.sub}</Text>
                    </View>
                    <View style={[styles.due, { backgroundColor: m.bg }]}>
                      <Text style={[styles.dueText, { color: m.color }]}>{t.due}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
        <View style={{ height: 12 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontFamily: font.display, fontSize: 28, color: colors.ink, letterSpacing: -0.6 },
  subtitle: { fontFamily: font.med, fontSize: 13, color: colors.muted, marginTop: 3 },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  groupHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 11 },
  groupIcon: { width: 24, height: 24, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  groupTitle: { fontFamily: font.bold, fontSize: 14.5, color: colors.ink },
  groupCount: { backgroundColor: colors.paperDeep, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 7, paddingVertical: 1, marginLeft: 8 },
  groupCountText: { fontFamily: font.monoSemi, fontSize: 10.5, color: colors.inkSoft },
  task: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 13, marginBottom: 8, ...shadow.soft },
  check: { width: 22, height: 22, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.line, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.success, borderColor: colors.success },
  taskTitle: { fontFamily: font.semi, fontSize: 14, color: colors.ink },
  strike: { textDecorationLine: 'line-through', color: colors.muted },
  taskSub: { fontFamily: font.reg, fontSize: 12, color: colors.muted, marginTop: 2 },
  due: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.sm, marginLeft: 8 },
  dueText: { fontFamily: font.monoSemi, fontSize: 10, letterSpacing: 0.3 },
});
