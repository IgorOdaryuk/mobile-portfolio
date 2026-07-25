import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, font, radius, shadow } from '../theme';
import { NewClientInput } from '../store';

const APPLIANCES = ['Dishwasher', 'Refrigerator', 'Washer', 'Dryer', 'Oven / Range', 'Cooktop'];
const LEADS = ['Tampa LSA', 'Charlotte LSA', 'Atlanta LSA', 'Miami LSA', 'Online Booking', 'northline.com'];

export default function NewClientModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: NewClientInput) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [appliance, setAppliance] = useState(APPLIANCES[0]);
  const [brand, setBrand] = useState('');
  const [lead, setLead] = useState(LEADS[0]);
  const [touched, setTouched] = useState(false);

  const nameOk = name.trim().length > 1;
  const phoneOk = phone.replace(/[^0-9]/g, '').length >= 7;
  const valid = nameOk && phoneOk;

  const reset = () => {
    setName(''); setPhone(''); setCity(''); setStateCode(''); setAppliance(APPLIANCES[0]);
    setBrand(''); setLead(LEADS[0]); setTouched(false);
  };
  const submit = () => {
    setTouched(true);
    if (!valid) return;
    onSubmit({ name: name.trim(), phone: phone.trim(), city: city.trim() || 'Tampa', state: stateCode.trim() || 'FL', appliance, brand: brand.trim() || 'Unknown', leadSource: lead });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.grab} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>New client</Text>
            <Pressable onPress={onClose} style={styles.close}>
              <Feather name="x" size={20} color={colors.inkSoft} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
            <Field label="Name" required error={touched && !nameOk ? 'Enter a name' : undefined}>
              <TextInput value={name} onChangeText={setName} placeholder="Jane Cooper" placeholderTextColor={colors.muted} style={styles.input} />
            </Field>
            <Field label="Phone" required error={touched && !phoneOk ? 'Enter a valid phone' : undefined}>
              <TextInput value={phone} onChangeText={setPhone} placeholder="(813) 555-0100" placeholderTextColor={colors.muted} keyboardType="phone-pad" style={styles.input} />
            </Field>
            <View style={styles.row}>
              <Field label="City" style={{ flex: 2 }}>
                <TextInput value={city} onChangeText={setCity} placeholder="Tampa" placeholderTextColor={colors.muted} style={styles.input} />
              </Field>
              <Field label="State" style={{ flex: 1 }}>
                <TextInput value={stateCode} onChangeText={setStateCode} placeholder="FL" placeholderTextColor={colors.muted} maxLength={2} autoCapitalize="characters" style={styles.input} />
              </Field>
            </View>

            <Field label="Appliance">
              <Chips options={APPLIANCES} value={appliance} onChange={setAppliance} />
            </Field>
            <Field label="Brand">
              <TextInput value={brand} onChangeText={setBrand} placeholder="Bosch, LG, Samsung…" placeholderTextColor={colors.muted} style={styles.input} />
            </Field>
            <Field label="Lead source">
              <Chips options={LEADS} value={lead} onChange={setLead} />
            </Field>
          </ScrollView>

          <Pressable onPress={submit} style={[styles.submit, !valid && styles.submitDim]}>
            <Feather name="user-plus" size={17} color="#fff" />
            <Text style={styles.submitText}>Add client</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, required, error, children, style }: any) {
  return (
    <View style={[{ marginBottom: 14 }, style]}>
      <Text style={styles.label}>
        {label} {required && <Text style={{ color: colors.accent }}>*</Text>}
      </Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function Chips({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable key={o} onPress={() => onChange(o)} style={[styles.chip, active && styles.chipOn]}>
            <Text style={[styles.chipText, active && styles.chipTextOn]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(20,14,8,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.paper, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingTop: 10, maxHeight: '92%' },
  grab: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.line, marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontFamily: font.display, fontSize: 22, color: colors.ink, letterSpacing: -0.4 },
  close: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
  label: { fontFamily: font.semi, fontSize: 12.5, color: colors.inkSoft, marginBottom: 7 },
  input: { backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: 14, height: 46, fontFamily: font.med, fontSize: 15, color: colors.ink, borderWidth: 1, borderColor: colors.line, outlineStyle: 'none' as any },
  row: { flexDirection: 'row', gap: 12 },
  error: { fontFamily: font.med, fontSize: 12, color: colors.danger, marginTop: 5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 13, height: 34, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: font.semi, fontSize: 13, color: colors.inkSoft },
  chipTextOn: { color: '#fff' },
  submit: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent, height: 52, borderRadius: radius.md, marginTop: 8 },
  submitDim: { opacity: 0.45 },
  submitText: { fontFamily: font.bold, fontSize: 16, color: '#fff' },
});
