import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { FONT, RADIUS, type Palette } from '../theme';
import { useTheme, useStyles } from '../theme-context';
import { Card, SectionTitle, SampleBadge } from '../ui';
import { WeightLine } from '../components/charts';
import { useStore } from '../store';
import { weightSeries, weightStats } from '../selectors';
import { shortDate } from '../dateutil';

const WINDOW = 30;

export default function Weight() {
  const { C } = useTheme();
  const styles = useStyles(makeStyles);
  const store = useStore();
  const goal = store.profile.weightGoalKg;

  const series = weightSeries(store.weight, store.today, WINDOW);
  const stats = weightStats(series);

  const [draft, setDraft] = useState<number>(
    () => stats.current ?? store.bio.weightKg,
  );
  const [saved, setSaved] = useState(false);
  const bump = (delta: number) => {
    setDraft((w) => Math.round((w + delta) * 10) / 10);
    setSaved(false);
  };

  const change = stats.changeKg;
  const changeStr = `${change > 0 ? '+' : ''}${change.toFixed(1)} kg`;
  const toGoal = stats.current != null ? Math.round((stats.current - goal) * 10) / 10 : 0;
  const axisDates = series.length
    ? [series[0], series[Math.floor(series.length / 2)], series[series.length - 1]]
    : [];

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Weight</Text>
        <SampleBadge />
      </View>

      {/* stat tiles */}
      <View style={styles.tiles}>
        <Tile value={stats.current != null ? stats.current.toFixed(1) : '—'} unit="kg" label="current" tint={C.text} />
        <Tile value={changeStr} label="since start" tint={change <= 0 ? C.primary : C.over} />
        <Tile value={goal.toFixed(1)} unit="kg" label={toGoal > 0 ? `${toGoal.toFixed(1)} to go` : 'goal reached'} tint={C.textDim} />
      </View>

      {/* trend chart */}
      <SectionTitle>Trend · last {WINDOW} days</SectionTitle>
      <Card>
        {series.length >= 2 ? (
          <>
            <WeightLine data={series} goal={goal} width={318} height={170} />
            <View style={styles.axis}>
              {axisDates.map((d) => (
                <Text key={d.date} style={styles.axisLabel}>
                  {shortDate(d.date)}
                </Text>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.empty}>Log a few days to see your trend.</Text>
        )}
      </Card>

      {/* log today's weight */}
      <SectionTitle>Log today</SectionTitle>
      <Card style={styles.logCard}>
        <View style={styles.stepper}>
          <Pressable style={styles.stepBtn} onPress={() => bump(-0.1)} accessibilityRole="button" accessibilityLabel="Decrease weight">
            <Text style={styles.stepBtnText}>−</Text>
          </Pressable>
          <View style={styles.draftWrap}>
            <Text style={styles.draftVal}>{draft.toFixed(1)}</Text>
            <Text style={styles.draftUnit}>kg</Text>
          </View>
          <Pressable style={styles.stepBtn} onPress={() => bump(0.1)} accessibilityRole="button" accessibilityLabel="Increase weight">
            <Text style={styles.stepBtnText}>+</Text>
          </Pressable>
        </View>
        <Pressable
          style={[styles.logBtn, saved && styles.logBtnDone]}
          onPress={() => {
            store.logWeight(store.today, draft);
            setSaved(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Save today's weight as ${draft.toFixed(1)} kilograms`}
        >
          <Text style={styles.logBtnText}>{saved ? '✓ Saved for today' : 'Save today’s weight'}</Text>
        </Pressable>
      </Card>

      <Text style={styles.footer}>Body-weight figures are synthetic demo data</Text>
    </ScrollView>
  );
}

function Tile({ value, unit, label, tint }: { value: string; unit?: string; label: string; tint?: string }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.tile}>
      <Text style={[styles.tileVal, tint ? { color: tint } : null]}>
        {value}
        {unit ? <Text style={styles.tileUnit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    scroll: { padding: 18, paddingTop: 8, paddingBottom: 28 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    title: { fontFamily: FONT.display, fontSize: 26, color: C.text },

    tiles: { flexDirection: 'row', gap: 10, marginTop: 8 },
    tile: {
      flex: 1,
      backgroundColor: C.card,
      borderColor: C.cardBorder,
      borderWidth: 1,
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 12,
    },
    tileVal: { fontFamily: FONT.display, fontSize: 22, color: C.text },
    tileUnit: { fontFamily: FONT.bodySemi, fontSize: 12, color: C.textFaint },
    tileLabel: { fontFamily: FONT.bodySemi, fontSize: 11, color: C.textDim, marginTop: 3 },

    axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingHorizontal: 4 },
    axisLabel: { fontFamily: FONT.body, fontSize: 11, color: C.textFaint },
    empty: { fontFamily: FONT.body, fontSize: 13, color: C.textFaint, fontStyle: 'italic', paddingVertical: 20, textAlign: 'center' },

    logCard: { alignItems: 'center', gap: 18 },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 26 },
    stepBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' },
    stepBtnText: { fontFamily: FONT.display, fontSize: 26, color: C.primaryDark },
    draftWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 4, minWidth: 96, justifyContent: 'center' },
    draftVal: { fontFamily: FONT.display, fontSize: 34, color: C.text, letterSpacing: -1 },
    draftUnit: { fontFamily: FONT.bodySemi, fontSize: 15, color: C.textDim },
    logBtn: { alignSelf: 'stretch', backgroundColor: C.primary, borderRadius: RADIUS.md, paddingVertical: 14, alignItems: 'center' },
    logBtnDone: { backgroundColor: C.primaryDark },
    logBtnText: { fontFamily: FONT.bodyBold, fontSize: 15, color: '#fff' },

    footer: { fontFamily: FONT.body, fontSize: 12, color: C.textFaint, textAlign: 'center', marginTop: 26 },
  });
