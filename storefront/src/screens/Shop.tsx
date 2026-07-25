import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { C, FONT, RADIUS } from '../theme';
import { SampleBadge, SectionTitle, Stars } from '../ui';
import { ProductArt } from '../components/ProductArt';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../store';
import { filterAndSort, money } from '../selectors';
import { CATEGORIES, Category, Product } from '../types';

export default function Shop({
  onOpenProduct,
  onOpenCategory,
}: {
  onOpenProduct: (id: string) => void;
  onOpenCategory: (c: Category | 'all') => void;
}) {
  const store = useStore();
  const bestsellers = store.products.filter((p) => p.bestseller);
  const hero = store.productsById['p00'];

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* brand header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Solva</Text>
          <Text style={styles.brandSub}>Clean skincare + wellness</Text>
        </View>
        <SampleBadge />
      </View>

      {/* hero */}
      <Pressable style={styles.hero} onPress={() => onOpenProduct(hero.id)}>
        <View style={styles.heroText}>
          <Text style={styles.heroKicker}>SUMMER EDIT</Text>
          <Text style={styles.heroTitle}>Your lightest{'\n'}skin season</Text>
          <View style={styles.heroCta}>
            <Text style={styles.heroCtaText}>Shop bestsellers</Text>
          </View>
        </View>
        <View style={styles.heroArt}>
          <ProductArt vessel={hero.vessel} tint={hero.tint} size={104} />
        </View>
      </Pressable>

      {/* categories */}
      <SectionTitle right={<Pressable onPress={() => onOpenCategory('all')}><Text style={styles.link}>All</Text></Pressable>}>
        Shop by category
      </SectionTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats}>
        {CATEGORIES.map((c) => (
          <Pressable key={c.key} style={styles.cat} onPress={() => onOpenCategory(c.key)}>
            <View style={styles.catArt}>
              <ProductArt vessel={vesselFor(store.products, c.key)} tint={tintFor(store.products, c.key)} size={54} />
            </View>
            <Text style={styles.catLabel}>{c.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* bestsellers grid */}
      <SectionTitle>Bestsellers</SectionTitle>
      <View style={styles.grid}>
        {bestsellers.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            wished={store.wishlist.includes(p.id)}
            onWish={() => store.toggleWish(p.id)}
            onPress={() => onOpenProduct(p.id)}
          />
        ))}
      </View>

      {/* editorial strip */}
      <View style={styles.promo}>
        <Text style={styles.promoTitle}>Subscribe + save 15%</Text>
        <Text style={styles.promoText}>
          On any refillable daily. Skip, swap or cancel anytime — no lock-in.
        </Text>
      </View>

      <Text style={styles.footer}>Solva is a fictional brand · 100% synthetic demo catalog</Text>
    </ScrollView>
  );
}

function vesselFor(products: Product[], c: Category) {
  return products.find((p) => p.category === c)?.vessel ?? 'bottle';
}
function tintFor(products: Product[], c: Category) {
  return products.find((p) => p.category === c)?.tint ?? 'sage';
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingTop: 8, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  brand: { fontFamily: FONT.display, fontSize: 30, color: C.ink, letterSpacing: 0.5 },
  brandSub: { fontFamily: FONT.bodyReg, fontSize: 13, color: C.inkDim, marginTop: 1 },

  hero: {
    flexDirection: 'row',
    backgroundColor: C.sage,
    borderRadius: RADIUS.xl,
    padding: 22,
    overflow: 'hidden',
    alignItems: 'center',
  },
  heroText: { flex: 1 },
  heroKicker: { fontFamily: FONT.bodyBold, fontSize: 11, letterSpacing: 1.5, color: C.sageSoft },
  heroTitle: { fontFamily: FONT.display, fontSize: 26, color: C.white, marginTop: 8, lineHeight: 30 },
  heroCta: { alignSelf: 'flex-start', backgroundColor: C.white, borderRadius: RADIUS.pill, paddingHorizontal: 16, paddingVertical: 9, marginTop: 16 },
  heroCtaText: { fontFamily: FONT.bodyBold, fontSize: 13, color: C.sage },
  heroArt: { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: RADIUS.lg, padding: 6 },

  link: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.sage },

  cats: { gap: 14, paddingVertical: 2 },
  cat: { alignItems: 'center', width: 76 },
  catArt: { backgroundColor: C.cardAlt, borderRadius: RADIUS.lg, width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontFamily: FONT.bodySemi, fontSize: 12, color: C.ink, marginTop: 7 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  promo: { backgroundColor: C.terraSoft, borderRadius: RADIUS.lg, padding: 18, marginTop: 6 },
  promoTitle: { fontFamily: FONT.display, fontSize: 17, color: C.terra },
  promoText: { fontFamily: FONT.bodyReg, fontSize: 13, color: '#8A4930', marginTop: 5, lineHeight: 19 },

  footer: { fontFamily: FONT.bodyReg, fontSize: 11, color: C.inkFaint, textAlign: 'center', marginTop: 26 },
});
