import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FONT, RADIUS, BTN, type Palette } from '../theme';
import { useStyles } from '../theme-context';
import { Stars, Tag, HeartButton } from '../ui';
import { ProductArt } from './ProductArt';
import { productImage } from '../data/productImages';
import type { Product } from '../types';
import { money, isOnSale, discountPct } from '../selectors';

/** Grid card used on Shop + Category screens. */
export function ProductCard({
  product,
  onPress,
  wished,
  onWish,
  onQuickAdd,
}: {
  product: Product;
  onPress: () => void;
  wished: boolean;
  onWish: () => void;
  onQuickAdd?: () => void;
}) {
  const styles = useStyles(makeStyles);
  const [added, setAdded] = useState(false);
  const sale = isOnSale(product);
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.art}>
        <ProductArt vessel={product.vessel} tint={product.tint} size={110} image={productImage(product.id)} label={product.name} />
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
      {onQuickAdd ? (
        <Pressable
          style={[styles.quickAdd, added && styles.quickAddDone]}
          onPress={() => {
            onQuickAdd();
            setAdded(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Add ${product.name} to bag`}
        >
          <Text style={[styles.quickAddText, added && { color: '#FFFFFF' }]}>{added ? '✓ Added' : 'Add to bag'}</Text>
        </Pressable>
      ) : null}
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
    quickAdd: { marginTop: 9, borderWidth: 1.5, borderColor: C.sage, borderRadius: RADIUS.pill, paddingVertical: 8, alignItems: 'center' },
    quickAddDone: { backgroundColor: BTN.fill, borderColor: BTN.fill },
    quickAddText: { fontFamily: FONT.bodyBold, fontSize: 12, color: C.sage },
  });
