import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, font, radius, shadow, stageColor, money } from '../theme';
import { Avatar, Pill } from '../ui';
import { Seed } from '../types';
import { CLIENT_FILTERS, ClientFilter, filterClients, sortByPriority } from '../selectors';
import { NewClientInput } from '../store';
import NewClientModal from '../components/NewClientModal';

const FILTERS = CLIENT_FILTERS;

export default function Clients({
  data,
  onOpenClient,
  onAddClient,
}: {
  data: Seed;
  onOpenClient: (id: string) => void;
  onAddClient: (input: NewClientInput) => void;
}) {
  const [filter, setFilter] = useState<ClientFilter>('All');
  const [q, setQ] = useState('');
  const [showNew, setShowNew] = useState(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('modal') === 'new'
  );

  const list = sortByPriority(filterClients(data.clients, filter, q));

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Clients</Text>
            <Text style={styles.count}>{data.clients.length}</Text>
          </View>
          <Pressable style={styles.addBtn} onPress={() => setShowNew(true)}>
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.addText}>NEW</Text>
          </Pressable>
        </View>
        <View style={styles.search}>
          <Feather name="search" size={16} color={colors.muted} />
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
                    <Text style={styles.owed}>{money(c.outstanding)} DUE</Text>
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
              <Feather name="chevron-right" size={19} color={colors.muted} />
            </Pressable>
          );
        })}
        <View style={{ height: 12 }} />
      </ScrollView>

      <NewClientModal visible={showNew} onClose={() => setShowNew(false)} onSubmit={onAddClient} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6, backgroundColor: colors.paper },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  titleWrap: { flexDirection: 'row', alignItems: 'baseline' },
  title: { fontFamily: font.display, fontSize: 28, color: colors.ink, letterSpacing: -0.6 },
  count: { fontFamily: font.monoSemi, fontSize: 14, color: colors.muted, marginLeft: 10 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.accent, paddingHorizontal: 13, height: 36, borderRadius: radius.sm, ...shadow.soft },
  addText: { fontFamily: font.monoBold, fontSize: 12.5, color: '#fff', letterSpacing: 0.5 },
  search: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 13, height: 44, ...shadow.soft,
  },
  searchInput: { flex: 1, marginLeft: 10, fontFamily: font.med, fontSize: 14, color: colors.ink, outlineStyle: 'none' as any },
  chips: { paddingVertical: 14, gap: 7 },
  chip: { paddingHorizontal: 13, height: 32, borderRadius: radius.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: font.monoSemi, fontSize: 11.5, color: colors.inkSoft, letterSpacing: 0.3 },
  chipTextActive: { color: '#FFF' },

  scroll: { paddingHorizontal: 20, paddingTop: 2, paddingBottom: 24 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 13, marginBottom: 9, ...shadow.soft,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontFamily: font.bold, fontSize: 15, color: colors.ink },
  owed: { fontFamily: font.monoSemi, fontSize: 11.5, color: colors.danger, letterSpacing: 0.2 },
  sub: { fontFamily: font.reg, fontSize: 12.5, color: colors.muted, marginTop: 3 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  ltv: { fontFamily: font.mono, fontSize: 11.5, color: colors.inkSoft, letterSpacing: 0.2 },
});
