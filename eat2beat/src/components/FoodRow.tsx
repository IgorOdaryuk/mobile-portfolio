import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FONT, type Palette } from '../theme';
import { useStyles } from '../theme-context';
import type { Entry, Food } from '../types';
import { entryMacros } from '../selectors';

/** One logged entry row: emoji, name, serving amount, kcal. */
export function EntryRow({
  entry,
  food,
  onPress,
  onRemove,
}: {
  entry: Entry;
  food: Food;
  onPress?: () => void;
  onRemove?: () => void;
}) {
  const styles = useStyles(makeStyles);
  const m = entryMacros(entry, { [food.id]: food });
  const servingLabel = entry.servings === 1 ? food.serving : `${entry.servings} × ${food.serving}`;
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={styles.emoji}>{food.emoji}</Text>
      <View style={styles.mid}>
        <Text style={styles.name} numberOfLines={1}>
          {food.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {servingLabel}
        </Text>
      </View>
      <Text style={styles.kcal}>{m.kcal}</Text>
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={10} style={styles.remove}>
          <Text style={styles.removeX}>×</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

/** Food-DB row used in the Add Food search list. */
export function FoodListRow({ food, onPress }: { food: Food; onPress?: () => void }) {
  const styles = useStyles(makeStyles);
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={styles.emoji}>{food.emoji}</Text>
      <View style={styles.mid}>
        <Text style={styles.name} numberOfLines={1}>
          {food.name}
          {food.brand ? <Text style={styles.brand}>  {food.brand}</Text> : null}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {food.serving} · P {food.protein} · C {food.carbs} · F {food.fat}
        </Text>
      </View>
      <Text style={styles.kcal}>{food.kcal}</Text>
    </Pressable>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
    emoji: { fontSize: 24, width: 30, textAlign: 'center' },
    mid: { flex: 1 },
    name: { fontFamily: FONT.bodySemi, fontSize: 14, color: C.text },
    brand: { fontFamily: FONT.body, fontSize: 12, color: C.textFaint },
    sub: { fontFamily: FONT.body, fontSize: 12, color: C.textDim, marginTop: 2 },
    kcal: { fontFamily: FONT.display, fontSize: 15, color: C.text },
    remove: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
    removeX: { fontFamily: FONT.body, fontSize: 20, color: C.textFaint, marginTop: -2 },
  });
