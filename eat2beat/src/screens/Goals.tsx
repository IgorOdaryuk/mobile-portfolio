import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { FONT, RADIUS, MACROS, type Palette } from '../theme';
import { useStyles } from '../theme-context';
import { Chip, fmt } from '../ui';
import { useStore } from '../store';
import { computeGoals } from '../selectors';
import type { ActivityKey, Bio, GoalDir, Sex } from '../types';

const ACTIVITIES: { key: ActivityKey; label: string }[] = [
  { key: 'sedentary', label: 'Sedentary' },
  { key: 'light', label: 'Light' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'active', label: 'Active' },
  { key: 'athlete', label: 'Athlete' },
];

const GOALS: { key: GoalDir; label: string; hint: string }[] = [
  { key: 'lose', label: 'Lose', hint: '−500 kcal' },
  { key: 'maintain', label: 'Maintain', hint: 'at TDEE' },
  { key: 'gain', label: 'Gain', hint: '+350 kcal' },
];

export default function Goals({ onClose }: { onClose: () => void }) {
  const styles = useStyles(makeStyles);
  const store = useStore();
  const [bio, setBio] = useState<Bio>(store.bio);

  const set = <K extends keyof Bio>(key: K, value: Bio[K]) => setBio((b) => ({ ...b, [key]: value }));

  const preview = useMemo(() => computeGoals(bio), [bio]);
  const dirty =
    JSON.stringify(bio) !== JSON.stringify(store.bio) ||
    JSON.stringify(preview) !== JSON.stringify(store.goals);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={8}>
          <Text style={styles.close}>Close</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Your goals</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          We estimate your daily targets with the Mifflin-St Jeor equation, your activity level and your goal.
        </Text>

        <Text style={styles.fieldLabel}>Sex</Text>
        <View style={styles.chips}>
          {(['male', 'female'] as Sex[]).map((s) => (
            <Chip key={s} label={s === 'male' ? 'Male' : 'Female'} active={bio.sex === s} onPress={() => set('sex', s)} />
          ))}
        </View>

        <Stepper label="Age" value={bio.age} unit="yrs" step={1} min={14} max={99} onChange={(v) => set('age', v)} />
        <Stepper label="Height" value={bio.heightCm} unit="cm" step={1} min={120} max={220} onChange={(v) => set('heightCm', v)} />
        <Stepper label="Weight" value={bio.weightKg} unit="kg" step={1} min={35} max={200} onChange={(v) => set('weightKg', v)} />

        <Text style={styles.fieldLabel}>Activity</Text>
        <View style={styles.chips}>
          {ACTIVITIES.map((a) => (
            <Chip key={a.key} label={a.label} active={bio.activity === a.key} onPress={() => set('activity', a.key)} />
          ))}
        </View>

        <Text style={styles.fieldLabel}>Goal</Text>
        <View style={styles.goalRow}>
          {GOALS.map((g) => (
            <Pressable
              key={g.key}
              onPress={() => set('goal', g.key)}
              style={[styles.goalCard, bio.goal === g.key && styles.goalCardActive]}
            >
              <Text style={[styles.goalLabel, bio.goal === g.key && styles.goalLabelActive]}>{g.label}</Text>
              <Text style={[styles.goalHint, bio.goal === g.key && styles.goalHintActive]}>{g.hint}</Text>
            </Pressable>
          ))}
        </View>

        {/* live target preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Daily target</Text>
          <Text style={styles.previewKcal}>
            {fmt(preview.kcal)} <Text style={styles.previewKcalUnit}>kcal</Text>
          </Text>
          <View style={styles.macroRow}>
            <MacroPill label="Protein" g={preview.protein} color={MACROS.protein.color} />
            <MacroPill label="Carbs" g={preview.carbs} color={MACROS.carbs.color} />
            <MacroPill label="Fat" g={preview.fat} color={MACROS.fat.color} />
          </View>
          <Text style={styles.previewWater}>💧 {(preview.waterMl / 1000).toFixed(1)} L water goal</Text>
        </View>
      </ScrollView>

      <View style={styles.footerBar}>
        <Pressable
          style={styles.cta}
          onPress={() => {
            store.setProfile(preview, bio);
            onClose();
          }}
        >
          <Text style={styles.ctaText}>{dirty ? 'Save goals' : 'Done'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Stepper({
  label,
  value,
  unit,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const styles = useStyles(makeStyles);
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <View style={styles.stepRow}>
      <Text style={styles.stepLabel}>{label}</Text>
      <View style={styles.stepControls}>
        <Pressable style={styles.stepBtn} onPress={() => onChange(clamp(value - step))}>
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepValue}>
          {value} <Text style={styles.stepUnit}>{unit}</Text>
        </Text>
        <Pressable style={styles.stepBtn} onPress={() => onChange(clamp(value + step))}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function MacroPill({ label, g, color }: { label: string; g: number; color: string }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.macroPill}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <Text style={styles.macroPillLabel}>{label}</Text>
      <Text style={styles.macroPillVal}>{fmt(g)} g</Text>
    </View>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingTop: 6,
      paddingBottom: 12,
    },
    close: { fontFamily: FONT.bodySemi, fontSize: 15, color: C.primary, width: 48 },
    headerTitle: { fontFamily: FONT.bodyBold, fontSize: 17, color: C.text },

    body: { padding: 18, paddingBottom: 24 },
    intro: { fontFamily: FONT.body, fontSize: 13, color: C.textDim, lineHeight: 19, marginBottom: 6 },

    fieldLabel: { fontFamily: FONT.bodyBold, fontSize: 13, color: C.textDim, marginTop: 22, marginBottom: 10 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

    stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
    stepLabel: { fontFamily: FONT.bodySemi, fontSize: 15, color: C.text },
    stepControls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    stepBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' },
    stepBtnText: { fontFamily: FONT.display, fontSize: 22, color: C.primaryDark },
    stepValue: { fontFamily: FONT.display, fontSize: 20, color: C.text, minWidth: 78, textAlign: 'center' },
    stepUnit: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.textFaint },

    goalRow: { flexDirection: 'row', gap: 10 },
    goalCard: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: C.cardBorder,
      backgroundColor: C.card,
      gap: 3,
    },
    goalCardActive: { backgroundColor: C.primary, borderColor: C.primary },
    goalLabel: { fontFamily: FONT.bodyBold, fontSize: 15, color: C.text },
    goalLabelActive: { color: '#fff' },
    goalHint: { fontFamily: FONT.body, fontSize: 11, color: C.textFaint },
    goalHintActive: { color: 'rgba(255,255,255,0.85)' },

    previewCard: {
      marginTop: 26,
      backgroundColor: C.card,
      borderColor: C.cardBorder,
      borderWidth: 1,
      borderRadius: RADIUS.lg,
      padding: 18,
    },
    previewLabel: { fontFamily: FONT.bodySemi, fontSize: 12, color: C.textDim, letterSpacing: 0.4, textTransform: 'uppercase' },
    previewKcal: { fontFamily: FONT.display, fontSize: 40, color: C.primary, letterSpacing: -1, marginTop: 4 },
    previewKcalUnit: { fontFamily: FONT.bodySemi, fontSize: 16, color: C.textDim },
    macroRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
    macroPill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: C.bg,
      borderRadius: RADIUS.pill,
      paddingVertical: 7,
      paddingHorizontal: 10,
    },
    macroDot: { width: 8, height: 8, borderRadius: 4 },
    macroPillLabel: { fontFamily: FONT.bodySemi, fontSize: 11, color: C.textDim },
    macroPillVal: { fontFamily: FONT.bodyBold, fontSize: 12, color: C.text, marginLeft: 'auto' },
    previewWater: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.waterText, marginTop: 14 },

    footerBar: { padding: 16, borderTopWidth: 1, borderTopColor: C.cardBorder, backgroundColor: C.card },
    cta: { backgroundColor: C.primary, borderRadius: RADIUS.md, paddingVertical: 15, alignItems: 'center' },
    ctaText: { fontFamily: FONT.bodyBold, fontSize: 15, color: '#fff' },
  });
