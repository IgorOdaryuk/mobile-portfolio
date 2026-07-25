import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { C, FONT, RADIUS, MACROS } from '../theme';
import { fmt } from '../ui';
import { MacroDonut } from '../components/charts';
import { FoodListRow } from '../components/FoodRow';
import { useStore } from '../store';
import { entryMacros, macroCaloriePct } from '../selectors';
import { MEAL_LABEL, MEAL_ORDER, MealKey, Food } from '../types';

export default function AddFood({
  initialMeal = 'breakfast',
  initialFoodId = null,
  onClose,
}: {
  initialMeal?: MealKey;
  initialFoodId?: string | null;
  onClose: () => void;
}) {
  const store = useStore();
  const [meal, setMeal] = useState<MealKey>(initialMeal);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Food | null>(
    initialFoodId ? store.foodsById[initialFoodId] ?? null : null,
  );
  const [servings, setServings] = useState(1);
  const [added, setAdded] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return store.foods;
    return store.foods.filter(
      (f) => f.name.toLowerCase().includes(q) || (f.brand ?? '').toLowerCase().includes(q),
    );
  }, [query, store.foods]);

  if (selected) {
    const preview = entryMacros(
      { id: 'preview', date: store.today, meal, foodId: selected.id, servings },
      store.foodsById,
    );
    const pct = macroCaloriePct(preview);
    return (
      <View style={styles.wrap}>
        <Header title="Add to log" onClose={() => setSelected(null)} closeLabel="Back" />
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.foodHead}>
            <Text style={styles.bigEmoji}>{selected.emoji}</Text>
            <Text style={styles.foodName}>{selected.name}</Text>
            {selected.brand ? <Text style={styles.foodBrand}>{selected.brand}</Text> : null}
            <Text style={styles.foodServing}>{selected.serving}</Text>
          </View>

          {/* meal selector */}
          <Text style={styles.fieldLabel}>Meal</Text>
          <View style={styles.mealChips}>
            {MEAL_ORDER.map((m) => (
              <Pressable
                key={m}
                onPress={() => setMeal(m)}
                style={[styles.mealChip, meal === m && styles.mealChipActive]}
              >
                <Text style={[styles.mealChipText, meal === m && styles.mealChipTextActive]}>
                  {MEAL_LABEL[m]}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* servings stepper */}
          <Text style={styles.fieldLabel}>Servings</Text>
          <View style={styles.stepper}>
            <Pressable
              style={styles.stepBtn}
              onPress={() => setServings((s) => Math.max(0.5, Math.round((s - 0.5) * 2) / 2))}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </Pressable>
            <Text style={styles.stepVal}>{servings}</Text>
            <Pressable
              style={styles.stepBtn}
              onPress={() => setServings((s) => Math.round((s + 0.5) * 2) / 2)}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </Pressable>
          </View>

          {/* nutrition preview */}
          <View style={styles.previewCard}>
            <MacroDonut pct={pct} />
            <View style={styles.previewStats}>
              <Text style={styles.previewKcal}>{fmt(preview.kcal)} kcal</Text>
              <MacroLegend label="Protein" g={preview.protein} pct={pct.protein} color={MACROS.protein.color} />
              <MacroLegend label="Carbs" g={preview.carbs} pct={pct.carbs} color={MACROS.carbs.color} />
              <MacroLegend label="Fat" g={preview.fat} pct={pct.fat} color={MACROS.fat.color} />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footerBar}>
          <Pressable
            style={[styles.addCta, added && styles.addCtaDone]}
            onPress={() => {
              store.addEntry({ date: store.today, meal, foodId: selected.id, servings });
              setAdded(true);
              setTimeout(onClose, 500);
            }}
          >
            <Text style={styles.addCtaText}>
              {added ? '✓ Added' : `Add ${fmt(preview.kcal)} kcal to ${MEAL_LABEL[meal]}`}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Header title="Add food" onClose={onClose} closeLabel="Cancel" />
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search foods…"
          placeholderTextColor={C.textFaint}
          style={styles.search}
        />
      </View>
      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        <Text style={styles.resultCount}>
          {results.length} food{results.length === 1 ? '' : 's'} · tap to log
        </Text>
        {results.map((f) => (
          <FoodListRow key={f.id} food={f} onPress={() => setSelected(f)} />
        ))}
      </ScrollView>
    </View>
  );
}

function Header({ title, onClose, closeLabel }: { title: string; onClose: () => void; closeLabel: string }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onClose} hitSlop={8}>
        <Text style={styles.close}>{closeLabel}</Text>
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 54 }} />
    </View>
  );
}

function MacroLegend({ label, g, pct, color }: { label: string; g: number; pct: number; color: string }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
      <Text style={styles.legendVal}>
        {fmt(g)} g · {pct}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
  },
  close: { fontFamily: FONT.bodySemi, fontSize: 15, color: C.primary, width: 54 },
  headerTitle: { fontFamily: FONT.bodyBold, fontSize: 17, color: C.text },

  searchWrap: { paddingHorizontal: 18, paddingBottom: 6 },
  search: {
    backgroundColor: C.card,
    borderColor: C.cardBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FONT.body,
    fontSize: 15,
    color: C.text,
  },
  list: { paddingHorizontal: 18, paddingBottom: 24 },
  resultCount: { fontFamily: FONT.bodySemi, fontSize: 12, color: C.textFaint, marginVertical: 10 },

  body: { padding: 18, paddingBottom: 20 },
  foodHead: { alignItems: 'center', marginBottom: 8 },
  bigEmoji: { fontSize: 52 },
  foodName: { fontFamily: FONT.display, fontSize: 22, color: C.text, marginTop: 6, textAlign: 'center' },
  foodBrand: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.textDim, marginTop: 2 },
  foodServing: { fontFamily: FONT.body, fontSize: 13, color: C.textFaint, marginTop: 4 },

  fieldLabel: { fontFamily: FONT.bodyBold, fontSize: 13, color: C.textDim, marginTop: 22, marginBottom: 10 },
  mealChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mealChip: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  mealChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  mealChipText: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.textDim },
  mealChipTextActive: { color: '#fff' },

  stepper: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  stepBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontFamily: FONT.display, fontSize: 24, color: C.primaryDark },
  stepVal: { fontFamily: FONT.display, fontSize: 26, color: C.text, minWidth: 50, textAlign: 'center' },

  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 24,
    backgroundColor: C.card,
    borderColor: C.cardBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 16,
  },
  previewStats: { flex: 1, gap: 7 },
  previewKcal: { fontFamily: FONT.display, fontSize: 22, color: C.text, marginBottom: 2 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.text, width: 56 },
  legendVal: { fontFamily: FONT.body, fontSize: 12, color: C.textDim },

  footerBar: { padding: 16, borderTopWidth: 1, borderTopColor: C.cardBorder, backgroundColor: C.card },
  addCta: { backgroundColor: C.primary, borderRadius: RADIUS.md, paddingVertical: 15, alignItems: 'center' },
  addCtaDone: { backgroundColor: C.primaryDark },
  addCtaText: { fontFamily: FONT.bodyBold, fontSize: 15, color: '#fff' },
});
