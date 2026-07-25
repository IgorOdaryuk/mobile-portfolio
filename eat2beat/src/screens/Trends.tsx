import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FONT, MACROS, type Palette } from '../theme';
import { useTheme, useStyles } from '../theme-context';
import { Card, SectionTitle, fmt } from '../ui';
import { WeeklyBars, MacroDonut } from '../components/charts';
import { useStore } from '../store';
import {
  dailyKcalSeries,
  averageKcal,
  streak,
  entriesForDate,
  entryMacros,
  sumMacros,
  macroCaloriePct,
  lastNDates,
  buildInsights,
  loggingActivity,
  type Insight,
  type InsightTone,
} from '../selectors';
import { weekdayLetter } from '../dateutil';

export default function Trends() {
  const { C } = useTheme();
  const styles = useStyles(makeStyles);
  const store = useStore();
  const goals = store.goals;
  const dates = lastNDates(store.today, 14);
  const series = dailyKcalSeries(store.entries, store.foodsById, store.today, 14);

  const avg = averageKcal(series);
  const daysLogged = series.filter((d) => d.kcal > 0).length;
  const streakLen = streak(store.entries, store.today);
  const onTarget = series.filter(
    (d) => d.kcal > 0 && Math.abs(d.kcal - goals.kcal) <= goals.kcal * 0.1,
  ).length;

  // period macro split (average of everything logged in the window)
  const periodMacros = sumMacros(
    dates.flatMap((d) => entriesForDate(store.entries, d).map((e) => entryMacros(e, store.foodsById))),
  );
  const pct = macroCaloriePct(periodMacros);

  // Same 14-day window as the rest of the screen, so figures never appear to disagree.
  const insights = buildInsights(store.entries, store.foodsById, goals, store.today, 14);
  const activity = loggingActivity(store.entries, store.today, 35);

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Trends</Text>

      {/* stat tiles */}
      <View style={styles.tiles}>
        <Tile value={fmt(avg)} label="avg kcal / day" tint={C.primary} />
        <Tile value={`${streakLen}🔥`} label="day streak" />
      </View>
      <View style={[styles.tiles, { marginTop: 12 }]}>
        <Tile value={`${onTarget}/${daysLogged}`} label="days on target" />
        <Tile value={fmt(goals.kcal)} label="daily goal" />
      </View>

      {/* insights */}
      <SectionTitle>Insights</SectionTitle>
      <Card style={styles.insightCard}>
        {insights.map((ins, i) => (
          <InsightRow key={ins.id} insight={ins} last={i === insights.length - 1} />
        ))}
      </Card>

      {/* weekly bars */}
      <SectionTitle>Last 14 days</SectionTitle>
      <Card>
        <WeeklyBars data={series} goal={goals.kcal} width={318} height={150} />
        <View style={styles.axis}>
          {series.map((d) => (
            <Text key={d.date} style={styles.axisLabel}>
              {weekdayLetter(d.date)}
            </Text>
          ))}
        </View>
        <View style={styles.legendInline}>
          <View style={styles.legItem}><View style={[styles.legBar, { backgroundColor: C.primary }]} /><Text style={styles.legTxt}>On/under goal</Text></View>
          <View style={styles.legItem}><View style={[styles.legBar, { backgroundColor: C.over }]} /><Text style={styles.legTxt}>Over goal</Text></View>
          <View style={styles.legItem}><View style={[styles.legDash]} /><Text style={styles.legTxt}>Goal {fmt(goals.kcal)}</Text></View>
        </View>
      </Card>

      {/* macro split */}
      <SectionTitle>Macro split · 14-day avg</SectionTitle>
      <Card style={styles.macroCard}>
        <MacroDonut pct={pct} />
        <View style={styles.macroLegend}>
          <MacroLeg label="Protein" pct={pct.protein} g={periodMacros.protein} color={MACROS.protein.color} />
          <MacroLeg label="Carbs" pct={pct.carbs} g={periodMacros.carbs} color={MACROS.carbs.color} />
          <MacroLeg label="Fat" pct={pct.fat} g={periodMacros.fat} color={MACROS.fat.color} />
        </View>
      </Card>

      {/* logging heatmap */}
      <SectionTitle>Logging activity · last 5 weeks</SectionTitle>
      <Card>
        <View style={styles.heat}>
          {activity.map((d) => (
            <View
              key={d.date}
              style={[
                styles.heatCell,
                d.level === 0
                  ? { backgroundColor: C.ring }
                  : { backgroundColor: C.primary, opacity: [0, 0.4, 0.7, 1][d.level] },
              ]}
            />
          ))}
        </View>
        <View style={styles.heatLegend}>
          <Text style={styles.heatLegendTxt}>Less</Text>
          {[0, 1, 2, 3].map((lv) => (
            <View
              key={lv}
              style={[
                styles.heatKey,
                lv === 0 ? { backgroundColor: C.ring } : { backgroundColor: C.primary, opacity: [0, 0.4, 0.7, 1][lv] },
              ]}
            />
          ))}
          <Text style={styles.heatLegendTxt}>More</Text>
        </View>
      </Card>

      <Text style={styles.footer}>All figures derived from synthetic demo entries</Text>
    </ScrollView>
  );
}

function Tile({ value, label, tint }: { value: string; label: string; tint?: string }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.tile}>
      <Text style={[styles.tileVal, tint ? { color: tint } : null]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const INSIGHT_ICON: Record<InsightTone, keyof typeof Feather.glyphMap> = {
  good: 'check-circle',
  warn: 'alert-triangle',
  info: 'info',
};

function InsightRow({ insight, last }: { insight: Insight; last: boolean }) {
  const { C } = useTheme();
  const styles = useStyles(makeStyles);
  const tint = insight.tone === 'good' ? C.primary : insight.tone === 'warn' ? C.over : C.water;
  const bg = insight.tone === 'good' ? C.primarySoft : insight.tone === 'warn' ? C.overSoft : C.waterSoft;
  return (
    <View style={[styles.insightRow, !last && styles.insightRowBorder]}>
      <View style={[styles.insightIcon, { backgroundColor: bg }]}>
        <Feather name={INSIGHT_ICON[insight.tone]} size={15} color={tint} />
      </View>
      <Text style={styles.insightText}>{insight.text}</Text>
    </View>
  );
}

function MacroLeg({ label, pct, g, color }: { label: string; pct: number; g: number; color: string }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.mlRow}>
      <View style={[styles.mlDot, { backgroundColor: color }]} />
      <Text style={styles.mlLabel}>{label}</Text>
      <Text style={styles.mlPct}>{pct}%</Text>
      <Text style={styles.mlG}>{fmt(g)} g total</Text>
    </View>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
  scroll: { padding: 18, paddingTop: 8, paddingBottom: 28 },
  title: { fontFamily: FONT.display, fontSize: 26, color: C.text, marginBottom: 16 },

  tiles: { flexDirection: 'row', gap: 12 },
  tile: {
    flex: 1,
    backgroundColor: C.card,
    borderColor: C.cardBorder,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  tileVal: { fontFamily: FONT.display, fontSize: 26, color: C.text },
  tileLabel: { fontFamily: FONT.bodySemi, fontSize: 12, color: C.textDim, marginTop: 3 },

  insightCard: { paddingVertical: 4 },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  insightRowBorder: { borderBottomWidth: 1, borderBottomColor: C.cardBorder },
  insightIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  insightText: { flex: 1, fontFamily: FONT.bodySemi, fontSize: 13, color: C.text, lineHeight: 18 },

  axis: { flexDirection: 'row', marginTop: 2, paddingHorizontal: 4 },
  axisLabel: { flex: 1, textAlign: 'center', fontFamily: FONT.body, fontSize: 10, color: C.textFaint },
  legendInline: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.cardBorder },
  legItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legBar: { width: 10, height: 10, borderRadius: 3 },
  legDash: { width: 14, height: 0, borderTopWidth: 2, borderColor: C.textFaint, borderStyle: 'dashed' },
  legTxt: { fontFamily: FONT.body, fontSize: 11, color: C.textDim },

  macroCard: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  macroLegend: { flex: 1, gap: 12 },
  mlRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mlDot: { width: 10, height: 10, borderRadius: 5 },
  mlLabel: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.text, width: 58 },
  mlPct: { fontFamily: FONT.display, fontSize: 15, color: C.text, width: 40 },
  mlG: { fontFamily: FONT.body, fontSize: 11, color: C.textFaint },

  heat: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  heatCell: { width: 34, height: 26, borderRadius: 6 },
  heatLegend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 14 },
  heatKey: { width: 12, height: 12, borderRadius: 3 },
  heatLegendTxt: { fontFamily: FONT.body, fontSize: 11, color: C.textFaint },

  footer: { fontFamily: FONT.body, fontSize: 12, color: C.textFaint, textAlign: 'center', marginTop: 26 },
});
