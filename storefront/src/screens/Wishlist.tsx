import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { C, FONT, RADIUS } from '../theme';
import { ProductArt } from '../components/ProductArt';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../store';

export default function Wishlist({
  onOpenProduct,
  onBrowse,
}: {
  onOpenProduct: (id: string) => void;
  onBrowse: () => void;
}) {
  const store = useStore();
  const items = store.wishlist.map((id) => store.productsById[id]).filter(Boolean);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Saved</Text>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <ProductArt vessel="jar" tint="blush" size={88} />
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyText}>Tap the heart on any product to save it here.</Text>
          <Pressable style={styles.cta} onPress={onBrowse}><Text style={styles.ctaText}>Browse shop</Text></Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {items.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                wished
                onWish={() => store.toggleWish(p.id)}
                onPress={() => onOpenProduct(p.id)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  title: { fontFamily: FONT.display, fontSize: 26, color: C.ink, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 30 },
  emptyTitle: { fontFamily: FONT.display, fontSize: 20, color: C.ink, marginTop: 10 },
  emptyText: { fontFamily: FONT.bodyReg, fontSize: 14, color: C.inkDim, textAlign: 'center' },
  cta: { backgroundColor: C.sage, borderRadius: RADIUS.pill, paddingHorizontal: 22, paddingVertical: 12, marginTop: 14 },
  ctaText: { fontFamily: FONT.bodyBold, fontSize: 14, color: C.white },
  list: { paddingHorizontal: 18, paddingBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
