import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { C, FONT, RADIUS } from '../theme';
import { Card, fmt } from '../ui';
import { MacroBar } from '../components/charts';
import { EntryRow } from '../components/FoodRow';
import { useStore } from '../store';
import { dayTotals, mealBreakdown, lastNDates, progress } from '../selectors';
import { longDate, weekdayLetter, dayOfMonth } from '../dateutil';
import { MEAL_LABEL } from '../types';

export default function Diary({ onOpenFood }: { onOpenFood: (foodId: string) => void }) {
  const store = useStore();
  const goals = store.profile.goals;
  // Most-recent day first so "today" sits at the left edge, selected by default.
  const days = lastNDates(store.today, 14).slice().reverse();
  const [selected, setSelected] = useState(store.today);

  const totals = dayTotals(store.entries, store.foodsById, selected);
  const meals = mealBreakdown(store.entries, store.foodsById, selected);
  const ratio = progress(totals.kcal, goals.kcal);
  const over = totals.kcal > goals.kcal;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Diary</Text>

      {/* date strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
      >
        {days.map((d) => {
          const active = d === selected;
          const kcal = dayTotals(store.entries, store.foodsById, d).kcal;
          const hit = kcal > 0 && Math.abs(kcal - goals.kcal) <= goals.kcal * 0.1;
          return (
            <Pressable key={d} onPress={() => setSelected(d)} style={[styles.pill, active && styles.pillActive]}>
              <Text style={[styles.pillDow, active && styles.pillTextActive]}>{weekdayLetter(d)}</Text>
              <Text style={[styles.pillDay, active && styles.pillTextActive]}>{dayOfMonth(d)}</Text>
              <View style={[styles.pillDot, { backgroundColor: kcal === 0 ? 'transparent' : hit ? C.primary : C.carbs }]} />
            </Pressable>
          );
        })}
      </ScrollView>

      {/* day summary */}
      <Card style={styles.summary}>
        <View style={styles.summaryHead}>
          <Text style={styles.summaryDate}>{longDate(selected)}</Text>
          <Text style={[styles.summaryKcal, over && { color: C.over }]}>
            {fmt(totals.kcal)} <Text style={styles.summaryGoal}>/ {fmt(goals.kcal)} kcal</Text>
          </Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${ratio * 100}%`, backgroundColor: over ? C.over : C.primary }]} />
        </View>
        <View style={{ marginTop: 16 }}>
          <MacroBar which="protein" value={totals.protein} goal={goals.protein} />
          <MacroBar which="carbs" value={totals.carbs} goal={goals.carbs} />
          <MacroBar which="fat" value={totals.fat} goal={goals.fat} />
        </View>
      </Card>

      {/* meals for the selected day */}
      {meals.map((m) =>
        m.entries.length === 0 ? null : (
          <View key={m.meal} style={styles.meal}>
            <View style={styles.mealHead}>
              <Text style={styles.mealName}>{MEAL_LABEL[m.meal]}</Text>
              <Text style={styles.mealKcal}>{fmt(m.totals.kcal)} kcal</Text>
            </View>
            {m.entries.map((e) => (
              <EntryRow key={e.id} entry={e} food={store.foodsById[e.foodId]} onPress={() => onOpenFood(e.foodId)} />
            ))}
          </View>
        ),
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingTop: 8, paddingBottom: 28 },
  title: { fontFamily: FONT.display, fontSize: 26, color: C.text, marginBottom: 14 },

  strip: { gap: 8, paddingBottom: 4 },
  pill: {
    width: 46,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 3,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillDow: { fontFamily: FONT.bodySemi, fontSize: 11, color: C.textDim },
  pillDay: { fontFamily: FONT.display, fontSize: 16, color: C.text },
  pillTextActive: { color: '#fff' },
  pillDot: { width: 5, height: 5, borderRadius: 3 },

  summary: { marginTop: 16 },
  summaryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  summaryDate: { fontFamily: FONT.bodyBold, fontSize: 15, color: C.text },
  summaryKcal: { fontFamily: FONT.display, fontSize: 18, color: C.text },
  summaryGoal: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.textFaint },
  barTrack: { height: 10, borderRadius: 5, backgroundColor: C.ring, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },

  meal: { marginTop: 20 },
  mealHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  mealName: { fontFamily: FONT.bodyBold, fontSize: 15, color: C.text },
  mealKcal: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.textDim },
});
