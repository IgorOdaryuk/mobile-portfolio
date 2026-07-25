import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, font, radius, shadow, stageColor, money } from '../theme';
import { Avatar, Pill } from '../ui';
import { Seed } from '../types';
import { CLIENT_FILTERS, ClientFilter, filterClients, sortByPriority } from '../selectors';

const FILTERS = CLIENT_FILTERS;

export default function Clients({ data, onOpenClient }: { data: Seed; onOpenClient: (id: string) => void }) {
  const [filter, setFilter] = useState<ClientFilter>('All');
  const [q, setQ] = useState('');

  const list = sortByPriority(filterClients(data.clients, filter, q));

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Clients</Text>
          <Text style={styles.count}>{data.clients.length}</Text>
        </View>
        <View style={styles.search}>
          <Feather name="search" size={17} color={colors.muted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search name, city, appliance…"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map((f) => {
            const active = f === filter;
            return (
              <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {list.map((c) => {
          const sc = stageColor[c.stage] || stageColor['New Lead'];
          const lead = c.jobs[0];
          return (
            <Pressable key={c.id} onPress={() => onOpenClient(c.id)} style={styles.row}>
              <Avatar name={c.name} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.rowTop}>
                  <Text style={styles.name}>{c.name}</Text>
                  {c.outstanding > 0 && (
                    <Text style={styles.owed}>{money(c.outstanding)} due</Text>
                  )}
                </View>
                <Text style={styles.sub} numberOfLines={1}>
                  {lead ? `${lead.brand} ${lead.appliance}` : c.city} · {c.city}, {c.state}
                </Text>
                <View style={styles.rowBottom}>
                  <Pill label={c.stage} fg={sc.fg} bg={sc.bg} small />
                  <Text style={styles.ltv}>LTV {money(c.lifetimeValue)}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={colors.muted} />
            </Pressable>
          );
        })}
        <View style={{ height: 12 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6, backgroundColor: colors.paper },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 14 },
  title: { fontFamily: font.display, fontSize: 30, color: colors.ink, letterSpacing: -0.6 },
  count: { fontFamily: font.displayMed, fontSize: 16, color: colors.muted, marginLeft: 10 },
  search: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: radius.md, paddingHorizontal: 14, height: 46, ...shadow.soft,
  },
  searchInput: { flex: 1, marginLeft: 10, fontFamily: font.med, fontSize: 14.5, color: colors.ink, outlineStyle: 'none' as any },
  chips: { paddingVertical: 14, gap: 8 },
  chip: { paddingHorizontal: 14, height: 34, borderRadius: 999, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
  chipActive: { backgroundColor: colors.ink },
  chipText: { fontFamily: font.semi, fontSize: 13, color: colors.inkSoft },
  chipTextActive: { color: '#FFF' },

  scroll: { paddingHorizontal: 20, paddingTop: 2, paddingBottom: 24 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: radius.lg, padding: 14, marginBottom: 10, ...shadow.soft,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontFamily: font.bold, fontSize: 15.5, color: colors.ink },
  owed: { fontFamily: font.bold, fontSize: 13, color: colors.danger },
  sub: { fontFamily: font.reg, fontSize: 13, color: colors.muted, marginTop: 2 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  ltv: { fontFamily: font.semi, fontSize: 12.5, color: colors.inkSoft },
});
