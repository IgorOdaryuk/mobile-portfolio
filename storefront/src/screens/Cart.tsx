import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { C, FONT, RADIUS } from '../theme';
import { Tag } from '../ui';
import { ProductArt } from '../components/ProductArt';
import { useStore } from '../store';
import { resolveLines, cartSummary, money } from '../selectors';

export default function Cart({
  onBack,
  onCheckout,
  onOpenProduct,
}: {
  onBack: () => void;
  onCheckout: () => void;
  onOpenProduct: (id: string) => void;
}) {
  const store = useStore();
  const resolved = resolveLines(store.lines, store.productsById);
  const summary = cartSummary(store.lines, store.productsById);

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
                    <Pressable onPress={() => store.setQty(r.product.id, r.variant.id, r.line.qty - 1)} hitSlop={6} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>−</Text></Pressable>
                    <Text style={styles.qtyVal}>{r.line.qty}</Text>
                    <Pressable onPress={() => store.setQty(r.product.id, r.variant.id, r.line.qty + 1)} hitSlop={6} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>+</Text></Pressable>
                    <Pressable onPress={() => store.removeLine(r.product.id, r.variant.id)} hitSlop={6}><Text style={styles.remove}>Remove</Text></Pressable>
                  </View>
                </View>
                <Text style={styles.linePrice}>{money(r.lineCents)}</Text>
              </View>
            ))}
          </ScrollView>

          {/* summary */}
          <View style={styles.summary}>
            <Row label="Subtotal" value={money(summary.subtotalCents)} />
            {summary.savingsCents > 0 ? <Row label="Subscribe savings" value={`−${money(summary.savingsCents)}`} accent /> : null}
            <Row label="Shipping" value="Free" />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{money(summary.totalCents)}</Text>
            </View>
            <Pressable style={styles.checkout} onPress={onCheckout}>
              <Text style={styles.checkoutText}>Checkout · {money(summary.totalCents)}</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, accent && { color: C.terra }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 10 },
  back: { fontFamily: FONT.bodySemi, fontSize: 15, color: C.sage, width: 54 },
  title: { fontFamily: FONT.display, fontSize: 18, color: C.ink },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 30 },
  emptyTitle: { fontFamily: FONT.display, fontSize: 20, color: C.ink, marginTop: 10 },
  emptyText: { fontFamily: FONT.bodyReg, fontSize: 14, color: C.inkDim, textAlign: 'center' },
  emptyCta: { backgroundColor: C.sage, borderRadius: RADIUS.pill, paddingHorizontal: 22, paddingVertical: 12, marginTop: 14 },
  emptyCtaText: { fontFamily: FONT.bodyBold, fontSize: 14, color: C.white },

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
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontFamily: FONT.body, fontSize: 14, color: C.inkDim },
  rowValue: { fontFamily: FONT.bodySemi, fontSize: 14, color: C.ink },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.line },
  totalLabel: { fontFamily: FONT.display, fontSize: 18, color: C.ink },
  totalValue: { fontFamily: FONT.display, fontSize: 18, color: C.ink },
  checkout: { backgroundColor: C.sage, borderRadius: RADIUS.pill, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  checkoutText: { fontFamily: FONT.bodyBold, fontSize: 15, color: C.white },
});
