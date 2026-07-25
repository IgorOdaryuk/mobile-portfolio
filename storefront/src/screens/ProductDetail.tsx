import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { FONT, RADIUS, SUBSCRIBE_DISCOUNT, BTN, type Palette } from '../theme';
import { useTheme, useStyles } from '../theme-context';
import { Stars, Tag, HeartButton, Divider } from '../ui';
import { ProductGallery } from '../components/ProductGallery';
import { ProductArt } from '../components/ProductArt';
import { productImage } from '../data/productImages';
import { useStore } from '../store';
import { money, isOnSale, discountPct, unitPriceCents, reviewsFor, averageReviewRating, relatedProducts } from '../selectors';

export default function ProductDetail({
  productId,
  onBack,
  onOpenCart,
  onOpenProduct,
}: {
  productId: string;
  onBack: () => void;
  onOpenCart: () => void;
  onOpenProduct: (id: string) => void;
}) {
  const { C } = useTheme();
  const styles = useStyles(makeStyles);
  const store = useStore();
  const product = store.productsById[productId];
  const [variantId, setVariantId] = useState(product?.variants[0]?.id ?? '');
  const [subscribe, setSubscribe] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const reviews = useMemo(() => reviewsFor(store.reviews, productId), [store.reviews, productId]);
  const related = useMemo(() => (product ? relatedProducts(store.products, product, 4) : []), [store.products, product]);

  if (!product) {
    return (
      <View style={styles.wrap}>
        <Header onBack={onBack} wished={false} onWish={() => {}} />
        <Text style={styles.missing}>Product not found.</Text>
      </View>
    );
  }

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const unit = unitPriceCents(product, variant, subscribe);
  const sale = isOnSale(product);
  const avg = averageReviewRating(store.reviews, productId, product.rating);
  const wished = store.wishlist.includes(product.id);

  return (
    <View style={styles.wrap}>
      <Header onBack={onBack} wished={wished} onWish={() => store.toggleWish(product.id)} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.galleryWrap}>
          <ProductGallery vessel={product.vessel} tint={product.tint} name={product.name} image={productImage(product.id)} />
          {sale ? <View style={styles.saleTag}><Tag label={`-${discountPct(product)}% summer`} tone="terra" /></View> : null}
        </View>

        <View style={styles.headRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.tagline}>{product.tagline}</Text>
          </View>
          {product.bestseller ? <Tag label="Bestseller" /> : null}
        </View>

        <View style={styles.ratingRow}>
          <Stars rating={avg} size={15} />
          <Text style={styles.ratingText}>{avg.toFixed(1)}</Text>
          <Text style={styles.ratingCount}>· {product.reviewCount} reviews</Text>
        </View>

        {/* variant selector */}
        <Text style={styles.label}>Size</Text>
        <View style={styles.variants}>
          {product.variants.map((v) => {
            const on = v.id === variant.id;
            return (
              <Pressable key={v.id} onPress={() => setVariantId(v.id)} style={[styles.variant, on && styles.variantOn]}>
                <Text style={[styles.variantLabel, on && styles.variantLabelOn]}>{v.label}</Text>
                <Text style={[styles.variantPrice, on && styles.variantLabelOn]}>{money(v.priceCents)}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* subscribe-and-save */}
        {product.subscribable ? (
          <Pressable style={[styles.sub, subscribe && styles.subOn]} onPress={() => setSubscribe((s) => !s)}>
            <View style={[styles.check, subscribe && styles.checkOn]}>{subscribe ? <Text style={styles.checkMark}>✓</Text> : null}</View>
            <View style={{ flex: 1 }}>
              <Text style={styles.subTitle}>Subscribe & save {Math.round(SUBSCRIBE_DISCOUNT * 100)}%</Text>
              <Text style={styles.subText}>Deliver every 4 weeks · skip or cancel anytime</Text>
            </View>
            <Text style={styles.subPrice}>{money(Math.round(variant.priceCents * (1 - SUBSCRIBE_DISCOUNT)))}</Text>
          </Pressable>
        ) : null}

        <Divider />

        <Text style={styles.label}>Why you'll love it</Text>
        <View style={styles.benefits}>
          {product.benefits.map((b) => (
            <View key={b} style={styles.benefit}>
              <View style={styles.dot} />
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 18 }]}>Key ingredients</Text>
        <Text style={styles.ingredients}>{product.ingredients}</Text>

        <Divider />

        <Text style={styles.label}>Reviews</Text>
        {reviews.map((r) => (
          <View key={r.id} style={styles.review}>
            <View style={styles.reviewHead}>
              <Stars rating={r.rating} size={12} />
              <Text style={styles.reviewAuthor}>{r.author}</Text>
            </View>
            <Text style={styles.reviewTitle}>{r.title}</Text>
            <Text style={styles.reviewBody}>{r.body}</Text>
          </View>
        ))}

        {related.length > 0 ? (
          <>
            <Divider />
            <Text style={styles.label}>You may also like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.railScroll} contentContainerStyle={styles.rail}>
              {related.map((rp) => (
                <Pressable key={rp.id} style={styles.relTile} onPress={() => onOpenProduct(rp.id)}>
                  <View style={styles.relArt}>
                    <ProductArt vessel={rp.vessel} tint={rp.tint} size={64} image={productImage(rp.id)} label={rp.name} />
                  </View>
                  <Text style={styles.relName} numberOfLines={1}>{rp.name}</Text>
                  <Text style={styles.relPrice}>{money(rp.priceCents)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}
      </ScrollView>

      {/* sticky add bar */}
      <View style={styles.bar}>
        <View style={styles.qty}>
          <Pressable onPress={() => setQty((q) => Math.max(1, q - 1))} hitSlop={6} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>−</Text></Pressable>
          <Text style={styles.qtyVal}>{qty}</Text>
          <Pressable onPress={() => setQty((q) => q + 1)} hitSlop={6} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>+</Text></Pressable>
        </View>
        <Pressable
          style={[styles.add, added && styles.addDone]}
          onPress={() => {
            store.addToCart({ productId: product.id, variantId: variant.id, qty, subscribe });
            setAdded(true);
            setTimeout(onOpenCart, 450);
          }}
        >
          <Text style={styles.addText}>{added ? '✓ Added to bag' : `Add · ${money(unit * qty)}`}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Header({ onBack, wished, onWish }: { onBack: () => void; wished: boolean; onWish: () => void }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={8}><Text style={styles.headerBack}>‹ Shop</Text></Pressable>
      <HeartButton active={wished} onPress={onWish} />
    </View>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 8 },
    headerBack: { fontFamily: FONT.bodySemi, fontSize: 15, color: C.sage },
    missing: { fontFamily: FONT.body, fontSize: 14, color: C.inkDim, padding: 18 },

    body: { paddingHorizontal: 18, paddingBottom: 20 },
    galleryWrap: { marginBottom: 6 },
    saleTag: { position: 'absolute', top: 14, left: 14, zIndex: 5 },

    headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    name: { fontFamily: FONT.display, fontSize: 25, color: C.ink },
    tagline: { fontFamily: FONT.bodyReg, fontSize: 14, color: C.inkDim, marginTop: 2 },

    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
    ratingText: { fontFamily: FONT.bodyBold, fontSize: 13, color: C.ink },
    ratingCount: { fontFamily: FONT.bodyReg, fontSize: 13, color: C.inkFaint },

    label: { fontFamily: FONT.bodyBold, fontSize: 14, color: C.ink, marginTop: 20, marginBottom: 10 },
    variants: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    variant: { borderWidth: 1.5, borderColor: C.line, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
    variantOn: { borderColor: C.sage, backgroundColor: C.sageSoft },
    variantLabel: { fontFamily: FONT.bodySemi, fontSize: 14, color: C.ink },
    variantLabelOn: { color: C.sage },
    variantPrice: { fontFamily: FONT.bodyReg, fontSize: 12, color: C.inkFaint, marginTop: 2 },

    sub: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: C.line, borderRadius: RADIUS.md, padding: 14, marginTop: 16 },
    subOn: { borderColor: C.terra, backgroundColor: C.terraSoft },
    check: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: C.inkFaint, alignItems: 'center', justifyContent: 'center' },
    checkOn: { backgroundColor: C.terra, borderColor: C.terra },
    checkMark: { color: '#FFFFFF', fontSize: 13, fontFamily: FONT.bodyBold },
    subTitle: { fontFamily: FONT.bodyBold, fontSize: 14, color: C.ink },
    subText: { fontFamily: FONT.bodyReg, fontSize: 12, color: C.inkDim, marginTop: 2 },
    subPrice: { fontFamily: FONT.display, fontSize: 15, color: C.terra },

    benefits: { gap: 9 },
    benefit: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.sage },
    benefitText: { fontFamily: FONT.body, fontSize: 14, color: C.ink },
    ingredients: { fontFamily: FONT.bodyReg, fontSize: 13, color: C.inkDim, lineHeight: 20 },

    review: { marginTop: 14 },
    reviewHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    reviewAuthor: { fontFamily: FONT.bodySemi, fontSize: 12, color: C.inkDim },
    reviewTitle: { fontFamily: FONT.bodyBold, fontSize: 14, color: C.ink, marginTop: 4 },
    reviewBody: { fontFamily: FONT.bodyReg, fontSize: 13, color: C.inkDim, marginTop: 2, lineHeight: 19 },

    railScroll: { height: 150 },
    rail: { gap: 12, paddingVertical: 2 },
    relTile: { width: 104 },
    relArt: { width: 104, height: 96, borderRadius: RADIUS.md, backgroundColor: C.cardAlt, alignItems: 'center', justifyContent: 'center', marginBottom: 7, overflow: 'hidden' },
    relName: { fontFamily: FONT.bodySemi, fontSize: 12, color: C.ink },
    relPrice: { fontFamily: FONT.display, fontSize: 13, color: C.ink, marginTop: 1 },

    bar: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.card },
    qty: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.line, borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 9 },
    qtyBtn: { width: 22, alignItems: 'center' },
    qtyBtnText: { fontFamily: FONT.display, fontSize: 18, color: C.ink },
    qtyVal: { fontFamily: FONT.bodyBold, fontSize: 15, color: C.ink, minWidth: 16, textAlign: 'center' },
    add: { flex: 1, backgroundColor: BTN.fill, borderRadius: RADIUS.pill, paddingVertical: 15, alignItems: 'center' },
    addDone: { backgroundColor: BTN.done },
    addText: { fontFamily: FONT.bodyBold, fontSize: 15, color: BTN.text },
  });
