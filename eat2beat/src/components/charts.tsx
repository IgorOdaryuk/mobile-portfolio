import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Rect, Path, G, Line, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { FONT, MACROS, type Palette } from '../theme';
import { useTheme, useStyles } from '../theme-context';
import { ANIMATE } from '../motion';
import { fmt } from '../ui';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Ease a value 0→1 once on mount (and whenever `key` changes). When animations
 *  are disabled (screenshot pass) the value rests at 1 — the settled state. */
function useMountProgress(key: number, duration = 850) {
  const t = useRef(new Animated.Value(ANIMATE ? 0 : 1)).current;
  useEffect(() => {
    if (!ANIMATE) return;
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [key, duration, t]);
  return t;
}

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
  const { C } = useTheme();
  const styles = useStyles(makeStyles);
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const ratio = goal > 0 ? Math.min(1, consumed / goal) : 0;
  const over = consumed > goal;
  const numberSize = Math.round(size * 0.25);
  const labelSize = Math.round(size * 0.082);
  // Signature emerald→mint sweep for on-track; a warm coral sweep when over.
  const gradId = 'e2bRing';
  const g0 = over ? C.over : C.primary;
  const g1 = over ? C.over : C.accent;

  // Sweep the arc up and count the number down to its final value on mount.
  const t = useMountProgress(Math.round(consumed) * 100000 + Math.round(goal));
  const finalShown = Math.round(Math.abs(goal - consumed));
  const [shown, setShown] = useState(ANIMATE ? goal : finalShown);
  useEffect(() => {
    if (!ANIMATE) {
      setShown(finalShown);
      return;
    }
    const id = t.addListener(({ value }) => setShown(Math.round(Math.abs(goal - consumed * value))));
    return () => t.removeListener(id);
  }, [t, consumed, goal, finalShown]);
  const dashoffset = t.interpolate({ inputRange: [0, 1], outputRange: [circ, circ * (1 - ratio)] });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={g0} />
            <Stop offset="1" stopColor={g1} />
          </LinearGradient>
        </Defs>
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          <Circle cx={cx} cy={cy} r={r} stroke={C.ring} strokeWidth={stroke} fill="none" />
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={r}
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={dashoffset}
          />
        </G>
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={[styles.ringNumber, { fontSize: numberSize }, over && { color: C.over }]}>
          {fmt(shown)}
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
  const { C } = useTheme();
  const styles = useStyles(makeStyles);
  const m = MACROS[which];
  const ratio = goal > 0 ? Math.min(1, value / goal) : 0;
  const t = useMountProgress(Math.round(ratio * 1000));
  const width = t.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${ratio * 100}%`] });
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
        <Animated.View style={[styles.macroFill, { width, backgroundColor: m.color }]} />
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
  const { C } = useTheme();
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
  centerValue,
  centerLabel,
}: {
  pct: { protein: number; carbs: number; fat: number };
  size?: number;
  stroke?: number;
  /** Optional big number shown in the hole (e.g. total kcal) so it isn't empty. */
  centerValue?: string;
  centerLabel?: string;
}) {
  const { C } = useTheme();
  const styles = useStyles(makeStyles);
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
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          <Circle cx={cx} cy={cy} r={r} stroke={C.ring} strokeWidth={stroke} fill="none" />
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
      {centerValue != null ? (
        <View style={styles.donutCenter}>
          <Text style={[styles.donutValue, { fontSize: Math.round(size * 0.2) }]}>{centerValue}</Text>
          {centerLabel ? <Text style={styles.donutLabel}>{centerLabel}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Weight line chart — trend line with area fill + optional goal line.  */
/* ------------------------------------------------------------------ */
export function WeightLine({
  data,
  goal,
  width = 318,
  height = 170,
}: {
  data: { date: string; kg: number }[];
  goal?: number;
  width?: number;
  height?: number;
}) {
  const { C } = useTheme();
  const pad = { top: 16, bottom: 22, left: 38, right: 12 };
  const iw = width - pad.left - pad.right;
  const ih = height - pad.top - pad.bottom;

  const kgs = data.map((d) => d.kg);
  const candidates = goal != null ? [...kgs, goal] : kgs;
  const rawLo = Math.min(...candidates);
  const rawHi = Math.max(...candidates);
  // Pad the value range a touch so points never sit on the frame edges.
  const spanPad = Math.max(0.5, (rawHi - rawLo) * 0.15);
  const lo = rawLo - spanPad;
  const hi = rawHi + spanPad;
  const span = hi - lo || 1;

  const n = data.length;
  const x = (i: number) => pad.left + (n === 1 ? iw / 2 : (iw / (n - 1)) * i);
  const y = (kg: number) => pad.top + ih * (1 - (kg - lo) / span);

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.kg)}`).join(' ');
  const areaPath = `${linePath} L ${x(n - 1)} ${pad.top + ih} L ${x(0)} ${pad.top + ih} Z`;
  const goalY = goal != null ? y(goal) : null;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="e2bWLine" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={C.primary} />
          <Stop offset="1" stopColor={C.accent} />
        </LinearGradient>
        <LinearGradient id="e2bWArea" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={C.primary} stopOpacity={0.22} />
          <Stop offset="1" stopColor={C.primary} stopOpacity={0.02} />
        </LinearGradient>
      </Defs>
      {/* y-axis min / max guides */}
      {[hi, lo].map((v, i) => {
        const gy = i === 0 ? pad.top : pad.top + ih;
        return (
          <G key={i}>
            <Line x1={pad.left} y1={gy} x2={width - pad.right} y2={gy} stroke={C.ring} strokeWidth={1} />
            <SvgText x={pad.left - 6} y={gy + 4} fontSize={10} fill={C.textFaint} textAnchor="end" fontFamily={FONT.body}>
              {v.toFixed(1)}
            </SvgText>
          </G>
        );
      })}
      {goalY != null ? (
        <>
          <Line x1={pad.left} y1={goalY} x2={width - pad.right} y2={goalY} stroke={C.primary} strokeWidth={1} strokeDasharray="4 4" opacity={0.7} />
          <SvgText x={width - pad.right} y={goalY - 5} fontSize={10} fill={C.primary} textAnchor="end" fontFamily={FONT.bodySemi}>
            goal
          </SvgText>
        </>
      ) : null}
      <Path d={areaPath} fill="url(#e2bWArea)" />
      <Path d={linePath} fill="none" stroke="url(#e2bWLine)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <Circle key={d.date} cx={x(i)} cy={y(d.kg)} r={i === n - 1 ? 4.5 : 3} fill={C.card} stroke={C.primary} strokeWidth={2} />
      ))}
    </Svg>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    ringCenter: { position: 'absolute', alignItems: 'center' },
    ringNumber: { fontFamily: FONT.display, fontSize: 46, color: C.text, letterSpacing: -1 },
    ringLabel: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.textDim, marginTop: -2 },

    macroRow: { marginBottom: 14 },
    macroHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    macroLabel: { fontFamily: FONT.bodySemi, fontSize: 13, color: C.text },
    macroVal: { fontFamily: FONT.body, fontSize: 13 },
    macroTrack: { height: 9, borderRadius: 5, backgroundColor: C.ring, overflow: 'hidden' },
    macroFill: { height: '100%', borderRadius: 5 },

    donutCenter: { position: 'absolute', alignItems: 'center' },
    donutValue: { fontFamily: FONT.display, color: C.text, letterSpacing: -0.5 },
    donutLabel: { fontFamily: FONT.bodySemi, fontSize: 10, color: C.textFaint, marginTop: -1, letterSpacing: 0.3 },
  });
