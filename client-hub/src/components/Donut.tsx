import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

export type DonutSlice = { value: number; color: string };

/** Lightweight SVG donut chart. Segments are drawn as dash-offset arcs. */
export default function Donut({
  data,
  size = 128,
  stroke = 20,
  children,
}: {
  data: DonutSlice[];
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  let acc = 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          {/* track */}
          <Circle cx={size / 2} cy={size / 2} r={r} stroke="#00000010" strokeWidth={stroke} fill="none" />
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = frac * c;
            const gap = 2; // small separator
            const offset = -acc * c;
            acc += frac;
            return (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={d.color}
                strokeWidth={stroke}
                strokeDasharray={`${Math.max(0, dash - gap)} ${c - Math.max(0, dash - gap)}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                fill="none"
              />
            );
          })}
        </G>
      </Svg>
      {children ? (
        <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>{children}</View>
      ) : null}
    </View>
  );
}
