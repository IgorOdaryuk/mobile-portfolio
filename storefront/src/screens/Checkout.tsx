import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { FONT, RADIUS, BTN, type Palette } from '../theme';
import { useTheme, useStyles } from '../theme-context';
import { ProductArt } from '../components/ProductArt';
import { useStore } from '../store';
import { resolveLines, cartSummary, money, validateCheckout, isCheckoutValid } from '../selectors';

const SHIPPING = [
  { key: 'standard', label: 'Standard', detail: '3–5 business days', cents: 0 },
  { key: 'express', label: 'Express', detail: '1–2 business days', cents: 700 },
];

export default function Checkout({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const styles = useStyles(makeStyles);
  const store = useStore();
  const resolved = resolveLines(store.lines, store.productsById);
  const summary = cartSummary(store.lines, store.productsById);
  const [ship, setShip] = useState('standard');
  const [placed, setPlaced] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [form, setForm] = useState({ name: 'Alex Morgan', email: 'alex@example.com', address: '742 Sunset Blvd', city: 'Austin, TX 78704' });

  const shipCents = SHIPPING.find((s) => s.key === ship)?.cents ?? 0;
  const total = summary.totalCents + shipCents;
  const errors = validateCheckout(form);
  const valid = isCheckoutValid(form);
  const err = (k: 'name' | 'email' | 'address' | 'city') => (showErrors ? errors[k] : undefined);

  if (placed) {
    return (
      <View style={styles.wrap}>
        <View style={styles.doneWrap}>
          <View style={styles.doneMark}><Text style={styles.doneMarkText}>✓</Text></View>
          <Text style={styles.doneTitle}>Order placed</Text>
          <Text style={styles.doneText}>Thanks, {form.name.split(' ')[0]}. A confirmation is on its way to {form.email}.</Text>
          <View style={styles.doneCard}>
            <Text style={styles.doneOrder}>Order #SOLVA-4821</Text>
            <Text style={styles.doneTotal}>{money(total)} · {summary.itemCount} items</Text>
            {summary.hasSubscription ? <Text style={styles.doneSub}>Includes a subscription — next refill in 4 weeks</Text> : null}
          </View>
          <Pressable style={styles.doneCta} onPress={() => { store.clearCart(); onDone(); }}>
            <Text style={styles.doneCtaText}>Continue shopping</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8}><Text style={styles.back}>‹ Bag</Text></Pressable>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 54 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.section}>Shipping to</Text>
        <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={err('name')} />
        <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={err('email')} keyboardType="email-address" />
        <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} error={err('address')} />
        <Field label="City, State ZIP" value={form.city} onChange={(v) => setForm({ ...form, city: v })} error={err('city')} />

        <Text style={styles.section}>Delivery</Text>
        {SHIPPING.map((s) => {
          const on = s.key === ship;
          return (
            <Pressable key={s.key} style={[styles.ship, on && styles.shipOn]} onPress={() => setShip(s.key)}>
              <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.shipLabel}>{s.label}</Text>
                <Text style={styles.shipDetail}>{s.detail}</Text>
              </View>
              <Text style={styles.shipPrice}>{s.cents === 0 ? 'Free' : money(s.cents)}</Text>
            </Pressable>
          );
        })}

        <Text style={styles.section}>Order summary</Text>
        <View style={styles.orderCard}>
          {resolved.map((r) => (
            <View key={r.line.productId + r.line.variantId} style={styles.orderLine}>
              <View style={styles.orderArt}><ProductArt vessel={r.product.vessel} tint={r.product.tint} size={34} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderName} numberOfLines={1}>{r.product.name}</Text>
                <Text style={styles.orderMeta}>{r.variant.label} · qty {r.line.qty}{r.line.subscribe ? ' · sub' : ''}</Text>
              </View>
              <Text style={styles.orderPrice}>{money(r.lineCents)}</Text>
            </View>
          ))}
          <View style={styles.sep} />
          <SummaryRow label="Subtotal" value={money(summary.subtotalCents)} />
          {summary.savingsCents > 0 ? <SummaryRow label="Subscribe savings" value={`−${money(summary.savingsCents)}`} accent /> : null}
          <SummaryRow label="Shipping" value={shipCents === 0 ? 'Free' : money(shipCents)} />
        </View>
      </ScrollView>

      <View style={styles.bar}>
        <View>
          <Text style={styles.barLabel}>Total</Text>
          <Text style={styles.barTotal}>{money(total)}</Text>
        </View>
        <Pressable
          style={[styles.place, !valid && styles.placeDisabled]}
          onPress={() => (valid ? setPlaced(true) : setShowErrors(true))}
          accessibilityRole="button"
          accessibilityState={{ disabled: !valid }}
        >
          <Text style={styles.placeText}>Place order</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  keyboardType?: 'default' | 'email-address';
}) {
  const { C } = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor={C.inkFaint}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        accessibilityLabel={label}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  const { C } = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.sumRow}>
      <Text style={styles.sumLabel}>{label}</Text>
      <Text style={[styles.sumValue, accent && { color: C.terra }]}>{value}</Text>
    </View>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 8 },
    back: { fontFamily: FONT.bodySemi, fontSize: 15, color: C.sage, width: 54 },
    title: { fontFamily: FONT.display, fontSize: 19, color: C.ink },

    body: { paddingHorizontal: 18, paddingBottom: 20 },
    section: { fontFamily: FONT.bodyBold, fontSize: 15, color: C.ink, marginTop: 20, marginBottom: 10 },
    field: { marginBottom: 10 },
    fieldLabel: { fontFamily: FONT.bodySemi, fontSize: 12, color: C.inkDim, marginBottom: 5 },
    input: { backgroundColor: C.card, borderColor: C.line, borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 11, fontFamily: FONT.body, fontSize: 15, color: C.ink },
    inputError: { borderColor: C.terra, borderWidth: 1.5 },
    errorText: { fontFamily: FONT.bodySemi, fontSize: 12, color: C.terra, marginTop: 5 },

    ship: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: C.line, borderRadius: RADIUS.md, padding: 14, marginBottom: 10 },
    shipOn: { borderColor: C.sage, backgroundColor: C.sageSoft },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: C.inkFaint, alignItems: 'center', justifyContent: 'center' },
    radioOn: { borderColor: C.sage },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.sage },
    shipLabel: { fontFamily: FONT.bodyBold, fontSize: 14, color: C.ink },
    shipDetail: { fontFamily: FONT.bodyReg, fontSize: 12, color: C.inkDim, marginTop: 1 },
    shipPrice: { fontFamily: FONT.bodyBold, fontSize: 14, color: C.ink },

    orderCard: { backgroundColor: C.card, borderColor: C.line, borderWidth: 1, borderRadius: RADIUS.lg, padding: 14 },
    orderLine: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
    orderArt: { width: 44, height: 44, borderRadius: RADIUS.sm, backgroundColor: C.cardAlt, alignItems: 'center', justifyContent: 'center' },
    orderName: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.ink },
    orderMeta: { fontFamily: FONT.bodyReg, fontSize: 11, color: C.inkFaint, marginTop: 1 },
    orderPrice: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.ink },
    sep: { height: 1, backgroundColor: C.line, marginVertical: 10 },
    sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
    sumLabel: { fontFamily: FONT.body, fontSize: 13, color: C.inkDim },
    sumValue: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.ink },

    bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.card },
    barLabel: { fontFamily: FONT.bodyReg, fontSize: 12, color: C.inkDim },
    barTotal: { fontFamily: FONT.display, fontSize: 20, color: C.ink },
    place: { backgroundColor: BTN.fill, borderRadius: RADIUS.pill, paddingHorizontal: 30, paddingVertical: 15 },
    placeDisabled: { opacity: 0.45 },
    placeText: { fontFamily: FONT.bodyBold, fontSize: 15, color: BTN.text },

    doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
    doneMark: { width: 68, height: 68, borderRadius: 34, backgroundColor: BTN.fill, alignItems: 'center', justifyContent: 'center' },
    doneMarkText: { color: BTN.text, fontSize: 34, fontFamily: FONT.bodyBold },
    doneTitle: { fontFamily: FONT.display, fontSize: 25, color: C.ink, marginTop: 18 },
    doneText: { fontFamily: FONT.bodyReg, fontSize: 14, color: C.inkDim, textAlign: 'center', marginTop: 8, lineHeight: 20 },
    doneCard: { backgroundColor: C.card, borderColor: C.line, borderWidth: 1, borderRadius: RADIUS.lg, padding: 18, alignItems: 'center', marginTop: 22, alignSelf: 'stretch' },
    doneOrder: { fontFamily: FONT.bodyBold, fontSize: 14, color: C.ink },
    doneTotal: { fontFamily: FONT.display, fontSize: 19, color: C.ink, marginTop: 4 },
    doneSub: { fontFamily: FONT.bodyReg, fontSize: 12, color: C.terra, marginTop: 6, textAlign: 'center' },
    doneCta: { backgroundColor: BTN.fill, borderRadius: RADIUS.pill, paddingHorizontal: 28, paddingVertical: 14, marginTop: 24 },
    doneCtaText: { fontFamily: FONT.bodyBold, fontSize: 14, color: BTN.text },
  });
