import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { FONT, RADIUS, MACROS, type Palette } from '../theme';
import { useStyles } from '../theme-context';
import { fmt } from '../ui';
import { MacroDonut } from '../components/charts';
import { FoodAvatar } from '../components/FoodRow';
import { useStore } from '../store';
import { macroCaloriePct } from '../selectors';

export default function FoodDetail({
  foodId,
  onBack,
  onAdd,
}: {
  foodId: string;
  onBack: () => void;
  onAdd: (foodId: string) => void;
}) {
  const styles = useStyles(makeStyles);
  const store = useStore();
  const food = store.foodsById[foodId];
  if (!food) {
    return (
      <View style={styles.wrap}>
        <Header onBack={onBack} />
        <Text style={styles.missing}>Food not found.</Text>
      </View>
    );
  }
  const pct = macroCaloriePct(food);

  return (
    <View style={styles.wrap}>
      <Header onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <FoodAvatar emoji={food.emoji} size={84} />
          <Text style={styles.name}>{food.name}</Text>
          {food.brand ? <Text style={styles.brand}>{food.brand}</Text> : null}
          <Text style={styles.serving}>per {food.serving}</Text>
        </View>

        <View style={styles.kcalCard}>
          <MacroDonut pct={pct} size={120} stroke={18} centerValue={fmt(food.kcal)} centerLabel="kcal" />
          <View style={styles.kcalRight}>
            <Text style={styles.kcalServingLabel}>per serving</Text>
            <Text style={styles.kcalServing}>{food.serving}</Text>
          </View>
        </View>

        {/* nutrition facts */}
        <Text style={styles.factsTitle}>Nutrition</Text>
        <View style={styles.facts}>
          <Fact label="Protein" value={`${food.protein} g`} pct={pct.protein} color={MACROS.protein.color} />
          <Fact label="Carbs" value={`${food.carbs} g`} pct={pct.carbs} color={MACROS.carbs.color} />
          <Fact label="Fat" value={`${food.fat} g`} pct={pct.fat} color={MACROS.fat.color} />
        </View>
      </ScrollView>

      <View style={styles.footerBar}>
        <Pressable style={styles.cta} onPress={() => onAdd(food.id)}>
          <Text style={styles.ctaText}>Add to today's log</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={8}>
        <Text style={styles.back}>‹ Back</Text>
      </Pressable>
      <Text style={styles.headerTitle}>Food</Text>
      <View style={{ width: 54 }} />
    </View>
  );
}

function Fact({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.factRow}>
      <View style={[styles.factDot, { backgroundColor: color }]} />
      <Text style={styles.factLabel}>{label}</Text>
      <View style={styles.factBarTrack}>
        <View style={[styles.factBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingTop: 6,
      paddingBottom: 12,
    },
    back: { fontFamily: FONT.bodySemi, fontSize: 15, color: C.primary, width: 70 },
    headerTitle: { fontFamily: FONT.bodyBold, fontSize: 17, color: C.text },
    missing: { fontFamily: FONT.body, fontSize: 14, color: C.textDim, padding: 18 },

    body: { padding: 18, paddingBottom: 20 },
    hero: { alignItems: 'center', marginBottom: 6 },
    name: { fontFamily: FONT.display, fontSize: 24, color: C.text, marginTop: 12, textAlign: 'center' },
    brand: { fontFamily: FONT.bodySemi, fontSize: 14, color: C.textDim, marginTop: 3 },
    serving: { fontFamily: FONT.body, fontSize: 13, color: C.textFaint, marginTop: 4 },

    kcalCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      marginTop: 20,
      backgroundColor: C.card,
      borderColor: C.cardBorder,
      borderWidth: 1,
      borderRadius: RADIUS.lg,
      padding: 18,
    },
    kcalRight: { flex: 1 },
    kcalServingLabel: { fontFamily: FONT.bodySemi, fontSize: 12, color: C.textFaint, letterSpacing: 0.3, textTransform: 'uppercase' },
    kcalServing: { fontFamily: FONT.display, fontSize: 20, color: C.text, marginTop: 4 },

    factsTitle: { fontFamily: FONT.bodyBold, fontSize: 16, color: C.text, marginTop: 26, marginBottom: 12 },
    facts: {
      backgroundColor: C.card,
      borderColor: C.cardBorder,
      borderWidth: 1,
      borderRadius: RADIUS.lg,
      padding: 16,
      gap: 16,
    },
    factRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    factDot: { width: 10, height: 10, borderRadius: 5 },
    factLabel: { fontFamily: FONT.bodySemi, fontSize: 14, color: C.text, width: 60 },
    factBarTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: C.ring, overflow: 'hidden' },
    factBarFill: { height: '100%', borderRadius: 4 },
    factValue: { fontFamily: FONT.display, fontSize: 15, color: C.text, width: 48, textAlign: 'right' },

    footerBar: { padding: 16, borderTopWidth: 1, borderTopColor: C.cardBorder, backgroundColor: C.card },
    cta: { backgroundColor: C.primary, borderRadius: RADIUS.md, paddingVertical: 15, alignItems: 'center' },
    ctaText: { fontFamily: FONT.bodyBold, fontSize: 15, color: '#fff' },
  });
