import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FONT, RADIUS, type Palette } from '../theme';
import { useStyles } from '../theme-context';
import type { Entry, Food } from '../types';
import { entryMacros } from '../selectors';

/** Emoji sitting in a tinted rounded chip, so food reads as designed iconography
 *  rather than a raw emoji dropped into a row. */
export function FoodAvatar({ emoji, size = 40 }: { emoji: string; size?: number }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size * 0.32 }]}>
      <Text style={{ fontSize: size * 0.55 }}>{emoji}</Text>
    </View>
  );
}

/** kcal value with a small unit underneath, right-aligned. */
function KcalCell({ kcal }: { kcal: number }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.kcalCell}>
      <Text style={styles.kcal}>{kcal}</Text>
      <Text style={styles.kcalUnit}>kcal</Text>
    </View>
  );
}

/** One logged entry row: avatar, name, serving amount, kcal. */
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
      <FoodAvatar emoji={food.emoji} />
      <View style={styles.mid}>
        <Text style={styles.name} numberOfLines={1}>
          {food.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {servingLabel}
        </Text>
      </View>
      <KcalCell kcal={m.kcal} />
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={10} style={styles.remove} accessibilityRole="button" accessibilityLabel={`Remove ${food.name}`}>
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
      <FoodAvatar emoji={food.emoji} />
      <View style={styles.mid}>
        <Text style={styles.name} numberOfLines={1}>
          {food.name}
          {food.brand ? <Text style={styles.brand}>  {food.brand}</Text> : null}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {food.serving} · P {food.protein} · C {food.carbs} · F {food.fat}
        </Text>
      </View>
      <KcalCell kcal={food.kcal} />
    </Pressable>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
    avatar: { backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, alignItems: 'center', justifyContent: 'center' },
    mid: { flex: 1 },
    name: { fontFamily: FONT.bodySemi, fontSize: 14, color: C.text },
    brand: { fontFamily: FONT.body, fontSize: 12, color: C.textFaint },
    sub: { fontFamily: FONT.body, fontSize: 12, color: C.textDim, marginTop: 2 },
    kcalCell: { alignItems: 'flex-end', minWidth: 34 },
    kcal: { fontFamily: FONT.display, fontSize: 16, color: C.text },
    kcalUnit: { fontFamily: FONT.bodySemi, fontSize: 9, color: C.textFaint, letterSpacing: 0.3, marginTop: -1 },
    remove: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
    removeX: { fontFamily: FONT.body, fontSize: 20, color: C.textFaint, marginTop: -2 },
  });
