import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, font, radius, shadow, money } from '../theme';
import { Card, SectionLabel } from '../ui';
import { Seed, Task } from '../types';
import { revenueByMonth } from '../selectors';
import Donut from '../components/Donut';

const LEAD_COLORS = ['#E2570C', '#1D4ED8', '#15803D', '#6D28D9', '#B45309', '#8C8378'];

const taskMeta: Record<Task['type'], { icon: any; color: string; bg: string }> = {
  balance: { icon: 'dollar-sign', color: colors.danger, bg: colors.dangerSoft },
  review: { icon: 'star', color: colors.warn, bg: colors.warnSoft },
  schedule: { icon: 'calendar', color: colors.info, bg: colors.infoSoft },
  winback: { icon: 'refresh-ccw', color: colors.violet, bg: colors.violetSoft },
};

function Stat({ label, value, icon, tint }: { label: string; value: string; icon: any; tint: string }) {
  return (
    <Card style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: tint + '22' }]}>
        <Feather name={icon} size={16} color={tint} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

export default function Dashboard({ data, go, onOpenClient }: { data: Seed; go: (t: string) => void; onOpenClient: (id: string) => void }) {
  const { kpis, tasks } = data;
  const top = tasks.slice(0, 3);

  const months = revenueByMonth(data.clients, 6);
  const maxRev = Math.max(1, ...months.map((m) => m.value));

  const leadTop = kpis.leadSources.slice(0, 5);
  const leadOther = kpis.leadSources.slice(5).reduce((a, [, n]) => a + n, 0);
  const totalLeads = kpis.leadSources.reduce((a, [, n]) => a + n, 0) || 1;
  const donutData = [
    ...leadTop.map(([, n], i) => ({ value: n, color: LEAD_COLORS[i] })),
    ...(leadOther ? [{ value: leadOther, color: LEAD_COLORS[5] }] : []),
  ];

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.topbar}>
        <View>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>Northline</Text>
            <View style={styles.demoPill}>
              <Text style={styles.demoText}>SAMPLE DATA</Text>
            </View>
          </View>
          <Text style={styles.date}>Thursday · Jul 25</Text>
        </View>
        <View style={styles.bell}>
          <Feather name="bell" size={18} color={colors.ink} />
          <View style={styles.bellDot} />
        </View>
      </View>

      {/* Hero revenue */}
      <LinearGradient colors={['#241A12', '#3A2412']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroLabel}>REVENUE · THIS MONTH</Text>
          <View style={styles.heroDelta}>
            <Feather name="trending-up" size={12} color="#7EE0A1" />
            <Text style={styles.heroDeltaText}>+18%</Text>
          </View>
        </View>
        <Text style={styles.heroValue}>{money(kpis.revenue)}</Text>
        <View style={styles.spark}>
          {months.map((m, i) => (
            <View key={i} style={styles.sparkCol}>
              <View style={[styles.sparkBar, { height: 8 + (m.value / maxRev) * 40, opacity: 0.5 + (i / Math.max(1, months.length - 1)) * 0.5 }]} />
              <Text style={styles.sparkLabel}>{m.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.heroFoot}>
          <View>
            <Text style={styles.heroFootVal}>{kpis.jobs}</Text>
            <Text style={styles.heroFootLbl}>jobs</Text>
          </View>
          <View style={styles.heroDivider} />
          <View>
            <Text style={styles.heroFootVal}>{money(kpis.avgTicket)}</Text>
            <Text style={styles.heroFootLbl}>avg ticket</Text>
          </View>
          <View style={styles.heroDivider} />
          <View>
            <Text style={styles.heroFootVal}>{kpis.clients}</Text>
            <Text style={styles.heroFootLbl}>clients</Text>
          </View>
        </View>
      </LinearGradient>

      {/* stat grid */}
      <View style={styles.grid}>
        <Stat label="Open jobs" value={String(kpis.openJobs)} icon="tool" tint={colors.info} />
        <Stat label="Outstanding" value={money(kpis.outstanding)} icon="alert-circle" tint={colors.danger} />
        <Stat label="Completed" value={String(kpis.completed)} icon="check-circle" tint={colors.success} />
        <Stat label="Reviews to ask" value={String(kpis.reviewsPending)} icon="star" tint={colors.warn} />
      </View>

      {/* Lead sources */}
      <SectionLabel>Where leads come from</SectionLabel>
      <Card style={styles.leadCard}>
        <Donut data={donutData} size={116} stroke={18}>
          <Text style={styles.donutNum}>{totalLeads}</Text>
          <Text style={styles.donutLbl}>leads</Text>
        </Donut>
        <View style={styles.legend}>
          {leadTop.map(([name, n], i) => (
            <View key={name} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: LEAD_COLORS[i] }]} />
              <Text style={styles.legendName} numberOfLines={1}>{name}</Text>
              <Text style={styles.legendNum}>{n}</Text>
            </View>
          ))}
          {leadOther > 0 && (
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: LEAD_COLORS[5] }]} />
              <Text style={styles.legendName}>Other</Text>
              <Text style={styles.legendNum}>{leadOther}</Text>
            </View>
          )}
        </View>
      </Card>

      {/* Needs attention */}
      <SectionLabel right={<Pressable onPress={() => go('Tasks')}><Text style={styles.seeAll}>See all</Text></Pressable>}>
        Needs attention
      </SectionLabel>
      {top.map((t) => {
        const m = taskMeta[t.type];
        return (
          <Pressable key={t.id} onPress={() => onOpenClient(t.clientId)}>
            <Card style={styles.taskRow}>
              <View style={[styles.taskIcon, { backgroundColor: m.bg }]}>
                <Feather name={m.icon} size={16} color={m.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{t.title}</Text>
                <Text style={styles.taskSub} numberOfLines={1}>{t.clientName} · {t.sub}</Text>
              </View>
              <View style={[styles.duePill, { backgroundColor: m.bg }]}>
                <Text style={[styles.dueText, { color: m.color }]}>{t.due}</Text>
              </View>
            </Card>
          </Pressable>
        );
      })}
      <View style={{ height: 12 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 8, paddingBottom: 28 },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  demoPill: { backgroundColor: colors.paperDeep, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  demoText: { fontFamily: font.bold, fontSize: 9, letterSpacing: 1, color: colors.muted },
  brand: { fontFamily: font.display, fontSize: 24, color: colors.ink, letterSpacing: -0.5 },
  date: { fontFamily: font.med, fontSize: 13, color: colors.muted, marginTop: 2 },
  bell: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
  bellDot: { position: 'absolute', top: 11, right: 12, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent, borderWidth: 1.5, borderColor: colors.card },

  hero: { borderRadius: radius.xl, padding: 22, marginBottom: 16, ...shadow.card },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { fontFamily: font.bold, fontSize: 11, letterSpacing: 1.4, color: '#C9B69F' },
  heroDelta: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(126,224,161,0.14)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  heroDeltaText: { fontFamily: font.bold, fontSize: 12, color: '#7EE0A1', marginLeft: 3 },
  heroValue: { fontFamily: font.display, fontSize: 42, color: '#FFF', marginTop: 8, letterSpacing: -1 },
  spark: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 66, marginTop: 12 },
  sparkCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 5 },
  sparkBar: { alignSelf: 'stretch', backgroundColor: colors.accent, borderRadius: 3 },
  sparkLabel: { fontFamily: font.med, fontSize: 10, color: '#C9B69F' },
  heroFoot: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  heroFootVal: { fontFamily: font.displayMed, fontSize: 18, color: '#FFF' },
  heroFootLbl: { fontFamily: font.med, fontSize: 11, color: '#C9B69F', marginTop: 1 },
  heroDivider: { width: 1, height: 26, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 20 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 22 },
  stat: { width: '47.5%', flexGrow: 1, padding: 15 },
  statIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontFamily: font.display, fontSize: 22, color: colors.ink, letterSpacing: -0.5 },
  statLabel: { fontFamily: font.med, fontSize: 12.5, color: colors.muted, marginTop: 2 },

  leadCard: { padding: 18, marginBottom: 22, flexDirection: 'row', alignItems: 'center', gap: 18 },
  donutNum: { fontFamily: font.display, fontSize: 22, color: colors.ink },
  donutLbl: { fontFamily: font.med, fontSize: 11, color: colors.muted, marginTop: -2 },
  legend: { flex: 1, gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 9 },
  legendName: { fontFamily: font.semi, fontSize: 13, color: colors.inkSoft, flex: 1 },
  legendNum: { fontFamily: font.display, fontSize: 14, color: colors.ink, marginLeft: 8 },

  seeAll: { fontFamily: font.semi, fontSize: 13, color: colors.accent },
  taskRow: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10 },
  taskIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  taskTitle: { fontFamily: font.semi, fontSize: 14.5, color: colors.ink },
  taskSub: { fontFamily: font.reg, fontSize: 12.5, color: colors.muted, marginTop: 2 },
  duePill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, marginLeft: 8 },
  dueText: { fontFamily: font.bold, fontSize: 11 },
});
