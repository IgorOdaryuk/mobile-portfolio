import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { FONT, RADIUS, type Palette } from '../theme';
import { useTheme, useStyles } from '../theme-context';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../store';
import { filterAndSort, SortKey } from '../selectors';
import { CATEGORIES, Category as Cat } from '../types';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'rating', label: 'Top rated' },
  { key: 'price-asc', label: 'Price ↑' },
  { key: 'price-desc', label: 'Price ↓' },
];

export default function Category({
  initial,
  onBack,
  onOpenProduct,
}: {
  initial: Cat | 'all';
  onBack: () => void;
  onOpenProduct: (id: string) => void;
}) {
  const { C } = useTheme();
  const styles = useStyles(makeStyles);
  const store = useStore();
  const [cat, setCat] = useState<Cat | 'all'>(initial);
  const [sort, setSort] = useState<SortKey>('featured');
  const [query, setQuery] = useState('');

  const results = useMemo(() => filterAndSort(store.products, cat, sort, query), [store.products, cat, sort, query]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8}><Text style={styles.back}>‹ Shop</Text></Pressable>
        <Text style={styles.title}>Shop all</Text>
        <View style={{ width: 54 }} />
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Solva…"
          placeholderTextColor={C.inkFaint}
          style={styles.search}
        />
      </View>

      <View style={styles.chips}>
        <Chip label="All" active={cat === 'all'} onPress={() => setCat('all')} />
        {CATEGORIES.map((c) => (
          <Chip key={c.key} label={c.label} active={cat === c.key} onPress={() => setCat(c.key)} />
        ))}
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.count}>{results.length} products</Text>
        <View style={styles.sorts}>
          {SORTS.map((s) => (
            <Pressable key={s.key} onPress={() => setSort(s.key)}>
              <Text style={[styles.sort, sort === s.key && styles.sortOn]}>{s.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.grid}>
          {results.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              wished={store.wishlist.includes(p.id)}
              onWish={() => store.toggleWish(p.id)}
              onPress={() => onOpenProduct(p.id)}
            />
          ))}
        </View>
        {results.length === 0 ? <Text style={styles.none}>No products match “{query}”.</Text> : null}
      </ScrollView>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const styles = useStyles(makeStyles);
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipOn]}>
      <Text style={[styles.chipText, active && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 8 },
    back: { fontFamily: FONT.bodySemi, fontSize: 15, color: C.sage, width: 54 },
    title: { fontFamily: FONT.display, fontSize: 19, color: C.ink },

    searchWrap: { paddingHorizontal: 18, paddingBottom: 8 },
    search: { backgroundColor: C.card, borderColor: C.line, borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 11, fontFamily: FONT.body, fontSize: 15, color: C.ink },

    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 18, paddingVertical: 6 },
    chip: { borderRadius: RADIUS.pill, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, paddingHorizontal: 15, paddingVertical: 8 },
    chipOn: { backgroundColor: C.ink, borderColor: C.ink },
    chipText: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.inkDim },
    chipTextOn: { color: C.bg },

    sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 10, gap: 12 },
    count: { fontFamily: FONT.bodySemi, fontSize: 12, color: C.inkFaint },
    sorts: { flexDirection: 'row', gap: 14 },
    sort: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.inkFaint },
    sortOn: { color: C.sage, textDecorationLine: 'underline' },

    list: { paddingHorizontal: 18, paddingBottom: 24 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    none: { fontFamily: FONT.bodyReg, fontSize: 14, color: C.inkDim, textAlign: 'center', marginTop: 30 },
  });
