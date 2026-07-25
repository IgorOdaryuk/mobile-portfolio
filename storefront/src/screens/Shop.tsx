import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FONT, RADIUS, type Palette } from '../theme';
import { useTheme, useStyles } from '../theme-context';
import { SampleBadge, SectionTitle } from '../ui';
import { ProductArt } from '../components/ProductArt';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../store';
import { CATEGORIES, Category, Product } from '../types';

// The hero is a fixed brand block — identical in light & dark (feels intentional).
const HERO = { bg: '#3F5445', kicker: '#B9CDBB', title: '#FFFFFF', pillBg: '#FFFFFF', pillFg: '#3F5445' };

export default function Shop({
  onOpenProduct,
  onOpenCategory,
}: {
  onOpenProduct: (id: string) => void;
  onOpenCategory: (c: Category | 'all') => void;
}) {
  const { C, mode, toggle } = useTheme();
  const styles = useStyles(makeStyles);
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
        <View style={styles.headerRight}>
          <Pressable
            onPress={toggle}
            hitSlop={8}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <Feather name={mode === 'dark' ? 'sun' : 'moon'} size={18} color={C.inkDim} />
          </Pressable>
          <SampleBadge />
        </View>
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
        <Text style={styles.promoText}>On any refillable daily. Skip, swap or cancel anytime — no lock-in.</Text>
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

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    scroll: { padding: 18, paddingTop: 8, paddingBottom: 28 },
    header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
    brand: { fontFamily: FONT.display, fontSize: 32, color: C.ink, letterSpacing: 0.3 },
    brandSub: { fontFamily: FONT.bodyReg, fontSize: 13, color: C.inkDim, marginTop: 2 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.cardAlt, alignItems: 'center', justifyContent: 'center' },

    hero: { flexDirection: 'row', backgroundColor: HERO.bg, borderRadius: RADIUS.xl, padding: 22, overflow: 'hidden', alignItems: 'center' },
    heroText: { flex: 1 },
    heroKicker: { fontFamily: FONT.bodyBold, fontSize: 11, letterSpacing: 1.5, color: HERO.kicker },
    heroTitle: { fontFamily: FONT.display, fontSize: 27, color: HERO.title, marginTop: 8, lineHeight: 31 },
    heroCta: { alignSelf: 'flex-start', backgroundColor: HERO.pillBg, borderRadius: RADIUS.pill, paddingHorizontal: 16, paddingVertical: 9, marginTop: 16 },
    heroCtaText: { fontFamily: FONT.bodyBold, fontSize: 13, color: HERO.pillFg },
    heroArt: { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: RADIUS.lg, padding: 6 },

    link: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.sage },

    cats: { gap: 14, paddingVertical: 2 },
    cat: { alignItems: 'center', width: 76 },
    catArt: { backgroundColor: C.cardAlt, borderRadius: RADIUS.lg, width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
    catLabel: { fontFamily: FONT.bodySemi, fontSize: 12, color: C.ink, marginTop: 7 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

    promo: { backgroundColor: C.terraSoft, borderRadius: RADIUS.lg, padding: 18, marginTop: 6 },
    promoTitle: { fontFamily: FONT.display, fontSize: 18, color: C.terra },
    promoText: { fontFamily: FONT.bodyReg, fontSize: 13, color: C.terraText, marginTop: 5, lineHeight: 19 },

    footer: { fontFamily: FONT.bodyReg, fontSize: 11, color: C.inkFaint, textAlign: 'center', marginTop: 26 },
  });
