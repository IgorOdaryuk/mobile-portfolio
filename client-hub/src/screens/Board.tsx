import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, font, radius, shadow, stageColor, money } from '../theme';
import { Avatar } from '../ui';
import { Seed } from '../types';
import { clientsByStage } from '../selectors';

const COLUMNS = ['New Lead', 'Scheduled', 'In Progress', 'Completed'];

export default function Board({ data, onOpenClient }: { data: Seed; onOpenClient: (id: string) => void }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Board</Text>
        <Text style={styles.subtitle}>Every job by pipeline stage</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cols}>
        {COLUMNS.map((col) => {
          const items = clientsByStage(data.clients, col);
          const sc = stageColor[col];
          const total = items.reduce((a, c) => a + c.lifetimeValue, 0);
          return (
            <View key={col} style={styles.col}>
              <View style={styles.colHead}>
                <View style={styles.colHeadLeft}>
                  <View style={[styles.colDot, { backgroundColor: sc.fg }]} />
                  <Text style={styles.colTitle}>{col}</Text>
                  <View style={styles.colCount}>
                    <Text style={styles.colCountText}>{items.length}</Text>
                  </View>
                </View>
                <Text style={styles.colTotal}>{money(total)}</Text>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {items.map((c) => {
                  const lead = c.jobs[0];
                  return (
                    <Pressable key={c.id} onPress={() => onOpenClient(c.id)} style={[styles.kcard, { borderLeftColor: sc.fg }]}>
                      <View style={styles.kTop}>
                        <Avatar name={c.name} size={28} />
                        <Text style={styles.kName} numberOfLines={1}>{c.name}</Text>
                      </View>
                      <Text style={styles.kJob} numberOfLines={1}>{lead ? `${lead.brand} ${lead.appliance}` : c.city}</Text>
                      <View style={styles.kFoot}>
                        <Text style={styles.kCity}>{c.city}, {c.state}</Text>
                        <Text style={styles.kAmt}>{money(c.lifetimeValue)}</Text>
                      </View>
                      {c.outstanding > 0 && (
                        <View style={styles.kDue}>
                          <Text style={styles.kDueText}>{money(c.outstanding)} DUE</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontFamily: font.display, fontSize: 28, color: colors.ink, letterSpacing: -0.6 },
  subtitle: { fontFamily: font.med, fontSize: 13, color: colors.muted, marginTop: 3 },
  cols: { paddingHorizontal: 16, gap: 12 },
  col: { width: 210, backgroundColor: colors.paperDeep, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 11 },
  colHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 2 },
  colHeadLeft: { flexDirection: 'row', alignItems: 'center' },
  colDot: { width: 7, height: 7, borderRadius: 1, marginRight: 7 },
  colTitle: { fontFamily: font.bold, fontSize: 13, color: colors.ink },
  colCount: { backgroundColor: colors.card, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 6, paddingVertical: 1, marginLeft: 7 },
  colCountText: { fontFamily: font.monoSemi, fontSize: 10.5, color: colors.inkSoft },
  colTotal: { fontFamily: font.monoSemi, fontSize: 12, color: colors.inkSoft },

  kcard: { backgroundColor: colors.card, borderRadius: radius.sm, padding: 11, marginBottom: 9, borderWidth: 1, borderColor: colors.line, borderLeftWidth: 3, ...shadow.soft },
  kTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  kName: { fontFamily: font.bold, fontSize: 13, color: colors.ink, flex: 1 },
  kJob: { fontFamily: font.med, fontSize: 12.5, color: colors.inkSoft, marginTop: 9 },
  kFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  kCity: { fontFamily: font.reg, fontSize: 11.5, color: colors.muted },
  kAmt: { fontFamily: font.monoSemi, fontSize: 12, color: colors.ink },
  kDue: { marginTop: 9, backgroundColor: colors.dangerSoft, borderRadius: radius.sm, paddingVertical: 4, alignItems: 'center' },
  kDueText: { fontFamily: font.monoSemi, fontSize: 10, color: colors.danger, letterSpacing: 0.3 },
});
