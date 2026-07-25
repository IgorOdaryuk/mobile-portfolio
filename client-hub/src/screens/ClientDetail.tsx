import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, font, radius, shadow, statusMeta, money, avatarColor } from '../theme';
import { Pill, SectionLabel } from '../ui';
import { Client } from '../types';

const STAGES = ['New Lead', 'Scheduled', 'In Progress', 'Completed'];

function Action({ icon, label }: { icon: any; label: string }) {
  return (
    <Pressable style={styles.action}>
      <View style={styles.actionIcon}>
        <Feather name={icon} size={18} color={colors.ink} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

export default function ClientDetail({ client, onBack }: { client: Client; onBack: () => void }) {
  const [abg, afg] = avatarColor(client.name);
  const stageIdx = STAGES.indexOf(client.stage);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#2A1D12', '#4A2C13']} style={styles.head}>
        <View style={styles.headBar}>
          <Pressable onPress={onBack} style={styles.iconBtn}>
            <Feather name="chevron-left" size={22} color="#FFF" />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Feather name="more-horizontal" size={20} color="#FFF" />
          </Pressable>
        </View>
        <View style={styles.headMain}>
          <View style={[styles.bigAvatar, { backgroundColor: abg }]}>
            <Text style={{ color: afg, fontFamily: font.bold, fontSize: 26 }}>
              {client.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </Text>
          </View>
          <Text style={styles.name}>{client.name}</Text>
          <Text style={styles.meta}>{client.kind} · {client.city}, {client.state} · since {client.since}</Text>
          <View style={styles.leadTag}>
            <Feather name="radio" size={11} color="#F4C89E" />
            <Text style={styles.leadTagText}>{client.leadSource}</Text>
          </View>
        </View>
        <View style={styles.moneyRow}>
          <View style={styles.moneyCol}>
            <Text style={styles.moneyVal}>{money(client.lifetimeValue)}</Text>
            <Text style={styles.moneyLbl}>Lifetime value</Text>
          </View>
          <View style={styles.moneyDiv} />
          <View style={styles.moneyCol}>
            <Text style={[styles.moneyVal, client.outstanding > 0 && { color: '#FF9E8A' }]}>{money(client.outstanding)}</Text>
            <Text style={styles.moneyLbl}>Outstanding</Text>
          </View>
          <View style={styles.moneyDiv} />
          <View style={styles.moneyCol}>
            <Text style={styles.moneyVal}>{client.jobCount}</Text>
            <Text style={styles.moneyLbl}>Jobs</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.actions}>
          <Action icon="phone" label="Call" />
          <Action icon="message-circle" label="Text" />
          <Action icon="calendar" label="Schedule" />
          <Action icon="file-text" label="Invoice" />
        </View>

        {stageIdx >= 0 && (
          <>
            <SectionLabel>Pipeline</SectionLabel>
            <View style={styles.stepper}>
              {STAGES.map((s, i) => {
                const done = i <= stageIdx;
                return (
                  <React.Fragment key={s}>
                    <View style={styles.stepItem}>
                      <View style={[styles.stepDot, done && styles.stepDotDone]}>
                        {done && <Feather name="check" size={12} color="#FFF" />}
                      </View>
                      <Text style={[styles.stepLabel, done && { color: colors.ink, fontFamily: font.semi }]}>{s}</Text>
                    </View>
                    {i < STAGES.length - 1 && <View style={[styles.stepLine, i < stageIdx && { backgroundColor: colors.accent }]} />}
                  </React.Fragment>
                );
              })}
            </View>
          </>
        )}

        <SectionLabel>Contact</SectionLabel>
        <View style={styles.infoCard}>
          <Info icon="phone" text={client.phone} />
          <Info icon="mail" text={client.email} />
          <Info icon="map-pin" text={`${client.street}, ${client.city}, ${client.state} ${client.zip}`} last />
        </View>

        <SectionLabel right={<Text style={styles.jobCount}>{client.jobCount} total</Text>}>Job history</SectionLabel>
        {client.jobs.map((j) => {
          const m = statusMeta[j.status];
          return (
            <View key={j.id} style={styles.jobCard}>
              <View style={styles.jobTop}>
                <Text style={styles.jobTitle}>{j.brand} {j.appliance}</Text>
                <Text style={styles.jobAmt}>{j.amount ? money(j.amount) : '—'}</Text>
              </View>
              <Text style={styles.jobDesc} numberOfLines={2}>{j.description}</Text>
              <View style={styles.jobFoot}>
                <Pill label={m.label} fg={m.fg} bg={m.bg} small />
                <View style={styles.jobFootRight}>
                  {j.rating ? (
                    <View style={styles.ratingRow}>
                      {Array.from({ length: j.rating }).map((_, k) => (
                        <Feather key={k} name="star" size={11} color={colors.warn} />
                      ))}
                    </View>
                  ) : null}
                  {j.tech && <Text style={styles.jobTech}>{j.tech}</Text>}
                  {j.outstanding > 0 && <Text style={styles.jobDue}>{money(j.outstanding)} due</Text>}
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function Info({ icon, text, last }: { icon: any; text: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoBorder]}>
      <Feather name={icon} size={16} color={colors.accent} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { paddingTop: 8, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headBar: { flexDirection: 'row', justifyContent: 'space-between' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headMain: { alignItems: 'center', marginTop: 6 },
  bigAvatar: { width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontFamily: font.display, fontSize: 24, color: '#FFF', letterSpacing: -0.4 },
  meta: { fontFamily: font.med, fontSize: 12.5, color: '#C9B69F', marginTop: 4 },
  leadTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, marginTop: 10, gap: 5 },
  leadTagText: { fontFamily: font.semi, fontSize: 12, color: '#F4C89E' },
  moneyRow: { flexDirection: 'row', marginTop: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 18, paddingVertical: 14 },
  moneyCol: { flex: 1, alignItems: 'center' },
  moneyVal: { fontFamily: font.display, fontSize: 19, color: '#FFF' },
  moneyLbl: { fontFamily: font.med, fontSize: 11, color: '#C9B69F', marginTop: 2 },
  moneyDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 4 },

  body: { padding: 20, paddingTop: 18 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  action: { alignItems: 'center', gap: 7 },
  actionIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
  actionLabel: { fontFamily: font.med, fontSize: 12, color: colors.inkSoft },

  stepper: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24, paddingHorizontal: 4 },
  stepItem: { alignItems: 'center', width: 62 },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.paperDeep, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.line },
  stepDotDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  stepLabel: { fontFamily: font.med, fontSize: 11, color: colors.muted, marginTop: 6, textAlign: 'center' },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.line, marginTop: 12 },

  infoCard: { backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: 16, marginBottom: 24, ...shadow.soft },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  infoBorder: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  infoText: { fontFamily: font.med, fontSize: 14, color: colors.inkSoft, flex: 1 },

  jobCount: { fontFamily: font.med, fontSize: 12.5, color: colors.muted },
  jobCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, marginBottom: 10, ...shadow.soft },
  jobTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobTitle: { fontFamily: font.bold, fontSize: 15, color: colors.ink },
  jobAmt: { fontFamily: font.display, fontSize: 15, color: colors.ink },
  jobDesc: { fontFamily: font.reg, fontSize: 13, color: colors.muted, marginTop: 4, lineHeight: 18 },
  jobFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  jobFootRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ratingRow: { flexDirection: 'row', gap: 1 },
  jobTech: { fontFamily: font.med, fontSize: 12, color: colors.inkSoft },
  jobDue: { fontFamily: font.bold, fontSize: 12, color: colors.danger },
});
