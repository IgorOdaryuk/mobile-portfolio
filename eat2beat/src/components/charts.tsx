import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, Path, G, Line } from 'react-native-svg';
import { C, FONT, MACROS } from '../theme';
import { fmt } from '../ui';

/* ------------------------------------------------------------------ */
/* Calorie ring — circular progress with a big number in the middle.   */
/* ------------------------------------------------------------------ */
export function CalorieRing({
  consumed,
  goal,
  size = 190,
  stroke = 16,
}: {
  consumed: number;
  goal: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const ratio = goal > 0 ? Math.min(1, consumed / goal) : 0;
  const over = consumed > goal;
  const remaining = goal - consumed;
  const color = over ? C.over : C.primary;
  const numberSize = Math.round(size * 0.25);
  const labelSize = Math.round(size * 0.082);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          <Circle cx={cx} cy={cy} r={r} stroke={C.ring} strokeWidth={stroke} fill="none" />
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={circ * (1 - ratio)}
          />
        </G>
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={[styles.ringNumber, { fontSize: numberSize }, over && { color: C.over }]}>
          {fmt(Math.abs(remaining))}
        </Text>
        <Text style={[styles.ringLabel, { fontSize: labelSize }]}>{over ? 'kcal over' : 'kcal left'}</Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Macro progress bar — one row: label, gram value / goal, fill bar.   */
/* ------------------------------------------------------------------ */
export function MacroBar({
  which,
  value,
  goal,
}: {
  which: 'protein' | 'carbs' | 'fat';
  value: number;
  goal: number;
}) {
  const m = MACROS[which];
  const ratio = goal > 0 ? Math.min(1, value / goal) : 0;
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroHead}>
        <Text style={styles.macroLabel}>{m.label}</Text>
        <Text style={styles.macroVal}>
          <Text style={{ color: C.text, fontFamily: FONT.bodyBold }}>{fmt(value)}</Text>
          <Text style={{ color: C.textFaint }}> / {fmt(goal)} g</Text>
        </Text>
      </View>
      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { width: `${ratio * 100}%`, backgroundColor: m.color }]} />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Weekly calorie bars with a goal line.                               */
/* ------------------------------------------------------------------ */
export function WeeklyBars({
  data,
  goal,
  width = 320,
  height = 150,
}: {
  data: { date: string; kcal: number }[];
  goal: number;
  width?: number;
  height?: number;
}) {
  const pad = { top: 14, bottom: 22, left: 4, right: 4 };
  const iw = width - pad.left - pad.right;
  const ih = height - pad.top - pad.bottom;
  const max = Math.max(goal, ...data.map((d) => d.kcal)) * 1.1 || 1;
  const n = data.length;
  const slot = iw / n;
  const bw = Math.min(26, slot * 0.6);
  const goalY = pad.top + ih * (1 - goal / max);

  return (
    <Svg width={width} height={height}>
      {/* goal line */}
      <Line x1={pad.left} y1={goalY} x2={width - pad.right} y2={goalY} stroke={C.textFaint} strokeWidth={1} strokeDasharray="4 4" />
      {data.map((d, i) => {
        const x = pad.left + slot * i + (slot - bw) / 2;
        const h = ih * (d.kcal / max);
        const y = pad.top + ih - h;
        const over = d.kcal > goal;
        const dim = d.kcal === 0;
        return (
          <G key={d.date}>
            <Rect
              x={x}
              y={dim ? pad.top + ih - 3 : y}
              width={bw}
              height={dim ? 3 : Math.max(3, h)}
              rx={4}
              fill={dim ? C.ring : over ? C.over : C.primary}
            />
          </G>
        );
      })}
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* Macro calorie donut — protein/carbs/fat share of calories.          */
/* ------------------------------------------------------------------ */
export function MacroDonut({
  pct,
  size = 130,
  stroke = 20,
}: {
  pct: { protein: number; carbs: number; fat: number };
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const segs = [
    { v: pct.protein, c: MACROS.protein.color },
    { v: pct.carbs, c: MACROS.carbs.color },
    { v: pct.fat, c: MACROS.fat.color },
  ];
  let offset = 0;
  return (
    <Svg width={size} height={size}>
      <G rotation={-90} origin={`${cx}, ${cy}`}>
        {segs.map((s, i) => {
          const len = (s.v / 100) * circ;
          const el = (
            <Circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              stroke={s.c}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringNumber: { fontFamily: FONT.display, fontSize: 46, color: C.text, letterSpacing: -1 },
  ringLabel: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.textDim, marginTop: -2 },

  macroRow: { marginBottom: 14 },
  macroHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  macroLabel: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.text },
  macroVal: { fontFamily: FONT.body, fontSize: 13 },
  macroTrack: { height: 9, borderRadius: 5, backgroundColor: C.ring, overflow: 'hidden' },
  macroFill: { height: '100%', borderRadius: 5 },
});
