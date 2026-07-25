import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { FONT, RADIUS, BTN, FREE_SHIP_CENTS, PROMO, type Palette } from '../theme';
import { useTheme, useStyles } from '../theme-context';
import { Tag } from '../ui';
import { ProductArt } from '../components/ProductArt';
import { useStore } from '../store';
import {
  resolveLines,
  cartSummary,
  money,
  freeShipRemaining,
  standardShippingCents,
  promoDiscountCents,
  promoRate,
} from '../selectors';

export default function Cart({
  onBack,
  onCheckout,
  onOpenProduct,
}: {
  onBack: () => void;
  onCheckout: () => void;
  onOpenProduct: (id: string) => void;
}) {
  const { C } = useTheme();
  const styles = useStyles(makeStyles);
  const store = useStore();
  const resolved = resolveLines(store.lines, store.productsById);
  const summary = cartSummary(store.lines, store.productsById);

  const payable = summary.totalCents;
  const promoDisc = promoDiscountCents(payable, store.promo);
  const shipCents = standardShippingCents(payable);
  const finalTotal = payable - promoDisc + shipCents;
  const shipRemaining = freeShipRemaining(payable);
  const shipPct = Math.max(0, Math.min(1, payable / FREE_SHIP_CENTS));

  const [code, setCode] = useState(store.promo);
  const promoApplied = promoRate(store.promo) > 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8}><Text style={styles.back}>‹ Shop</Text></Pressable>
        <Text style={styles.title}>Your bag</Text>
        <View style={{ width: 54 }} />
      </View>

      {resolved.length === 0 ? (
        <View style={styles.empty}>
          <ProductArt vessel="bottle" tint="sage" size={90} />
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
          <Text style={styles.emptyText}>Add a few daily essentials to get started.</Text>
          <Pressable style={styles.emptyCta} onPress={onBack}><Text style={styles.emptyCtaText}>Browse shop</Text></Pressable>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {resolved.map((r) => (
              <View key={r.line.productId + r.line.variantId} style={styles.line}>
                <Pressable style={styles.lineArt} onPress={() => onOpenProduct(r.product.id)}>
                  <ProductArt vessel={r.product.vessel} tint={r.product.tint} size={52} />
                </Pressable>
                <View style={styles.lineMid}>
                  <Text style={styles.lineName} numberOfLines={1}>{r.product.name}</Text>
                  <Text style={styles.lineVariant}>{r.variant.label}</Text>
                  {r.line.subscribe ? <View style={styles.subTag}><Tag label="Subscription · save 15%" tone="terra" /></View> : null}
                  <View style={styles.qtyRow}>
                    <Pressable onPress={() => store.setQty(r.product.id, r.variant.id, r.line.qty - 1)} hitSlop={12} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>−</Text></Pressable>
                    <Text style={styles.qtyVal}>{r.line.qty}</Text>
                    <Pressable onPress={() => store.setQty(r.product.id, r.variant.id, r.line.qty + 1)} hitSlop={12} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>+</Text></Pressable>
                    <Pressable onPress={() => store.removeLine(r.product.id, r.variant.id)} hitSlop={12}><Text style={styles.remove}>Remove</Text></Pressable>
                  </View>
                </View>
                <Text style={styles.linePrice}>{money(r.lineCents)}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.summary}>
            {/* free-shipping progress */}
            <View style={styles.ship}>
              <Text style={styles.shipMsg}>
                {shipRemaining > 0
                  ? <>Add <Text style={styles.shipStrong}>{money(shipRemaining)}</Text> for free shipping</>
                  : <><Text style={styles.shipStrong}>✓ Free shipping</Text> unlocked</>}
              </Text>
              <View style={styles.shipTrack}>
                <View style={[styles.shipFill, { width: `${shipPct * 100}%` }]} />
              </View>
            </View>

            {/* promo code */}
            <View style={styles.promoRow}>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="Promo code"
                placeholderTextColor={C.inkFaint}
                autoCapitalize="characters"
                style={styles.promoInput}
                accessibilityLabel="Promo code"
              />
              <Pressable style={styles.promoBtn} onPress={() => store.setPromo(code)}>
                <Text style={styles.promoBtnText}>Apply</Text>
              </Pressable>
            </View>
            {code.trim().length > 0 ? (
              <Text style={[styles.promoNote, promoApplied ? styles.promoOk : styles.promoBad]}>
                {promoApplied ? `${PROMO.label} applied` : 'Invalid code'} · try {PROMO.code}
              </Text>
            ) : null}

            <Row label="Subtotal" value={money(summary.subtotalCents)} />
            {summary.savingsCents > 0 ? <Row label="Subscribe savings" value={`−${money(summary.savingsCents)}`} accent /> : null}
            {promoDisc > 0 ? <Row label={`Promo (${PROMO.code})`} value={`−${money(promoDisc)}`} accent /> : null}
            <Row label="Shipping" value={shipCents === 0 ? 'Free' : money(shipCents)} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{money(finalTotal)}</Text>
            </View>
            <Pressable style={styles.checkout} onPress={onCheckout}>
              <Text style={styles.checkoutText}>Checkout · {money(finalTotal)}</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  const { C } = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, accent && { color: C.terra }]}>{value}</Text>
    </View>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 10 },
    back: { fontFamily: FONT.bodySemi, fontSize: 15, color: C.sage, width: 54 },
    title: { fontFamily: FONT.display, fontSize: 19, color: C.ink },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 30 },
    emptyTitle: { fontFamily: FONT.display, fontSize: 21, color: C.ink, marginTop: 10 },
    emptyText: { fontFamily: FONT.bodyReg, fontSize: 14, color: C.inkDim, textAlign: 'center' },
    emptyCta: { backgroundColor: BTN.fill, borderRadius: RADIUS.pill, paddingHorizontal: 22, paddingVertical: 12, marginTop: 14 },
    emptyCtaText: { fontFamily: FONT.bodyBold, fontSize: 14, color: BTN.text },

    list: { paddingHorizontal: 18, paddingBottom: 16 },
    line: { flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.line },
    lineArt: { width: 64, height: 64, borderRadius: RADIUS.md, backgroundColor: C.cardAlt, alignItems: 'center', justifyContent: 'center' },
    lineMid: { flex: 1 },
    lineName: { fontFamily: FONT.bodyBold, fontSize: 14, color: C.ink },
    lineVariant: { fontFamily: FONT.bodyReg, fontSize: 12, color: C.inkDim, marginTop: 1 },
    subTag: { marginTop: 5 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
    qtyBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.cardAlt, alignItems: 'center', justifyContent: 'center' },
    qtyBtnText: { fontFamily: FONT.display, fontSize: 15, color: C.ink },
    qtyVal: { fontFamily: FONT.bodyBold, fontSize: 14, color: C.ink, minWidth: 14, textAlign: 'center' },
    remove: { fontFamily: FONT.bodySemi, fontSize: 12, color: C.inkFaint, marginLeft: 4 },
    linePrice: { fontFamily: FONT.display, fontSize: 15, color: C.ink },

    summary: { backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.line, padding: 18, gap: 8 },
    ship: { marginBottom: 4 },
    shipMsg: { fontFamily: FONT.body, fontSize: 13, color: C.inkDim, marginBottom: 7 },
    shipStrong: { fontFamily: FONT.bodyBold, color: C.sage },
    shipTrack: { height: 6, borderRadius: 3, backgroundColor: C.cardAlt, overflow: 'hidden' },
    shipFill: { height: '100%', borderRadius: 3, backgroundColor: C.sage },
    promoRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
    promoInput: { flex: 1, backgroundColor: C.bg, borderColor: C.line, borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, fontFamily: FONT.body, fontSize: 14, color: C.ink },
    promoBtn: { paddingHorizontal: 18, justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: C.cardAlt },
    promoBtnText: { fontFamily: FONT.bodyBold, fontSize: 13, color: C.ink },
    promoNote: { fontFamily: FONT.bodySemi, fontSize: 12, marginTop: 2 },
    promoOk: { color: C.sage },
    promoBad: { color: C.terra },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    rowLabel: { fontFamily: FONT.body, fontSize: 14, color: C.inkDim },
    rowValue: { fontFamily: FONT.bodySemi, fontSize: 14, color: C.ink },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.line },
    totalLabel: { fontFamily: FONT.display, fontSize: 19, color: C.ink },
    totalValue: { fontFamily: FONT.display, fontSize: 19, color: C.ink },
    checkout: { backgroundColor: BTN.fill, borderRadius: RADIUS.pill, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
    checkoutText: { fontFamily: FONT.bodyBold, fontSize: 15, color: BTN.text },
  });
