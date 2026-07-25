import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FONT, RADIUS, type Palette } from '../theme';
import { useStyles } from '../theme-context';
import { Stars, Tag, HeartButton } from '../ui';
import { ProductArt } from './ProductArt';
import type { Product } from '../types';
import { money, isOnSale, discountPct } from '../selectors';

/** Grid card used on Shop + Category screens. */
export function ProductCard({
  product,
  onPress,
  wished,
  onWish,
}: {
  product: Product;
  onPress: () => void;
  wished: boolean;
  onWish: () => void;
}) {
  const styles = useStyles(makeStyles);
  const sale = isOnSale(product);
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.art}>
        <ProductArt vessel={product.vessel} tint={product.tint} size={88} />
        <View style={styles.topRow}>
          {sale ? <Tag label={`-${discountPct(product)}%`} tone="terra" /> : <View />}
          <HeartButton active={wished} onPress={onWish} />
        </View>
      </View>
      <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
      <Text style={styles.tagline} numberOfLines={1}>{product.tagline}</Text>
      <View style={styles.metaRow}>
        <Stars rating={product.rating} size={11} />
        <Text style={styles.count}>{product.reviewCount}</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{money(product.priceCents)}</Text>
        {sale && product.compareAtCents ? (
          <Text style={styles.compare}>{money(product.compareAtCents)}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    card: { width: '48%', marginBottom: 18 },
    art: {
      backgroundColor: C.cardAlt,
      borderRadius: RADIUS.lg,
      height: 150,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      overflow: 'hidden',
    },
    topRow: {
      position: 'absolute',
      top: 10,
      left: 10,
      right: 10,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    name: { fontFamily: FONT.bodyBold, fontSize: 14, color: C.ink },
    tagline: { fontFamily: FONT.bodyReg, fontSize: 12, color: C.inkDim, marginTop: 1 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
    count: { fontFamily: FONT.bodyReg, fontSize: 11, color: C.inkFaint },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 7, marginTop: 5 },
    price: { fontFamily: FONT.display, fontSize: 15, color: C.ink },
    compare: { fontFamily: FONT.bodyReg, fontSize: 12, color: C.inkFaint, textDecorationLine: 'line-through' },
  });
