import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { C, FONT, RADIUS } from '../theme';
import { Card, SampleBadge, fmt } from '../ui';
import { CalorieRing, MacroBar } from '../components/charts';
import { EntryRow } from '../components/FoodRow';
import { useStore } from '../store';
import { dayTotals, mealBreakdown, entriesForDate } from '../selectors';
import { longDate } from '../dateutil';
import { MEAL_LABEL, MealKey } from '../types';

export default function Today({
  onAdd,
  onOpenFood,
}: {
  onAdd: (meal: MealKey) => void;
  onOpenFood: (foodId: string) => void;
}) {
  const store = useStore();
  const date = store.today;
  const totals = dayTotals(store.entries, store.foodsById, date);
  const goals = store.profile.goals;
  const meals = mealBreakdown(store.entries, store.foodsById, date);
  const waterMl = store.water[date] ?? 0;
  const waterCups = Math.round((waterMl / 250) * 10) / 10;
  const goalCups = Math.round(goals.waterMl / 250);
  const loggedCount = entriesForDate(store.entries, date).length;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.hi}>Today</Text>
          <Text style={styles.date}>{longDate(date)}</Text>
        </View>
        <SampleBadge />
      </View>

      {/* calorie hero */}
      <Card style={styles.hero}>
        <View style={styles.heroLeft}>
          <CalorieRing consumed={totals.kcal} goal={goals.kcal} size={150} stroke={14} />
        </View>
        <View style={styles.heroRight}>
          <HeroStat label="Goal" value={fmt(goals.kcal)} />
          <HeroStat label="Food" value={fmt(totals.kcal)} tint={C.primary} />
          <HeroStat
            label="Remaining"
            value={fmt(Math.max(0, goals.kcal - totals.kcal))}
          />
        </View>
      </Card>

      {/* macros */}
      <Card style={{ marginTop: 12 }}>
        <MacroBar which="protein" value={totals.protein} goal={goals.protein} />
        <MacroBar which="carbs" value={totals.carbs} goal={goals.carbs} />
        <MacroBar which="fat" value={totals.fat} goal={goals.fat} />
      </Card>

      {/* water */}
      <Card style={styles.water}>
        <View style={{ flex: 1 }}>
          <Text style={styles.waterLabel}>💧 Water</Text>
          <Text style={styles.waterVal}>
            {waterCups} <Text style={styles.waterGoal}>/ {goalCups} cups</Text>
          </Text>
        </View>
        <Pressable style={styles.waterBtn} onPress={() => store.addWater(date, 250)}>
          <Text style={styles.waterBtnText}>+1 cup</Text>
        </Pressable>
      </Card>

      {/* meals */}
      {meals.map((m) => (
        <MealSection
          key={m.meal}
          meal={m.meal}
          kcal={m.totals.kcal}
          count={m.entries.length}
          onAdd={() => onAdd(m.meal)}
        >
          {m.entries.map((e) => (
            <EntryRow
              key={e.id}
              entry={e}
              food={store.foodsById[e.foodId]}
              onPress={() => onOpenFood(e.foodId)}
              onRemove={() => store.removeEntry(e.id)}
            />
          ))}
        </MealSection>
      ))}

      <Text style={styles.footer}>{loggedCount} items logged today · synthetic demo data</Text>
    </ScrollView>
  );
}

function HeroStat({ label, value, tint }: { label: string; value: string; tint?: string }) {
  return (
    <View style={styles.heroStat}>
      <Text style={[styles.heroStatVal, tint ? { color: tint } : null]}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function MealSection({
  meal,
  kcal,
  count,
  onAdd,
  children,
}: {
  meal: MealKey;
  kcal: number;
  count: number;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.meal}>
      <View style={styles.mealHead}>
        <Text style={styles.mealName}>{MEAL_LABEL[meal]}</Text>
        <View style={styles.mealHeadRight}>
          <Text style={styles.mealKcal}>{fmt(kcal)} kcal</Text>
          <Pressable onPress={onAdd} hitSlop={8} style={styles.addBtn}>
            <Text style={styles.addPlus}>+</Text>
          </Pressable>
        </View>
      </View>
      {count === 0 ? (
        <Text style={styles.empty}>Nothing logged yet</Text>
      ) : (
        <View>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingTop: 8, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  hi: { fontFamily: FONT.display, fontSize: 26, color: C.text },
  date: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.textDim, marginTop: 2 },

  hero: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  heroLeft: { width: 152, alignItems: 'center' },
  heroRight: { flex: 1, gap: 14, paddingLeft: 10 },
  heroStat: {},
  heroStatVal: { fontFamily: FONT.display, fontSize: 22, color: C.text },
  heroStatLabel: { fontFamily: FONT.bodySemi, fontSize: 12, color: C.textDim, marginTop: 1 },

  water: { flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: C.waterSoft, borderColor: '#CDE7F7' },
  waterLabel: { fontFamily: FONT.bodySemi, fontSize: 13, color: '#1C6A9E' },
  waterVal: { fontFamily: FONT.display, fontSize: 20, color: '#12557E', marginTop: 3 },
  waterGoal: { fontFamily: FONT.bodySemi, fontSize: 13, color: '#4F94BD' },
  waterBtn: { backgroundColor: C.water, borderRadius: RADIUS.pill, paddingHorizontal: 16, paddingVertical: 9 },
  waterBtnText: { fontFamily: FONT.bodyBold, fontSize: 13, color: '#fff' },

  meal: { marginTop: 20 },
  mealHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  mealName: { fontFamily: FONT.bodyBold, fontSize: 16, color: C.text },
  mealHeadRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mealKcal: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.textDim },
  addBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' },
  addPlus: { fontFamily: FONT.bodyBold, fontSize: 20, color: C.primaryDark, marginTop: -2 },
  empty: { fontFamily: FONT.body, fontSize: 13, color: C.textFaint, fontStyle: 'italic', paddingVertical: 8 },

  footer: { fontFamily: FONT.body, fontSize: 12, color: C.textFaint, textAlign: 'center', marginTop: 26 },
});
