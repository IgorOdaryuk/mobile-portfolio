import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, font, radius, shadow, hero, statusMeta, money, avatarColor } from '../theme';
import { Pill, SectionLabel } from '../ui';
import { Client } from '../types';

const STAGES = ['New Lead', 'Scheduled', 'In Progress', 'Completed'];

function Action({ icon, label, onPress }: { icon: any; label: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.action} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Feather name={icon} size={18} color={colors.ink} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

export default function ClientDetail({
  client,
  onBack,
  onAdvanceStage,
}: {
  client: Client;
  onBack: () => void;
  onAdvanceStage: (clientId: string) => void;
}) {
  const [abg, afg] = avatarColor(client.name);
  const stageIdx = STAGES.indexOf(client.stage);
  const tel = client.phone.replace(/[^0-9+]/g, '');
  const openUrl = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={hero.detailGrad} style={styles.head}>
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
            <Text style={{ color: afg, fontFamily: font.monoBold, fontSize: 23 }}>
              {client.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </Text>
          </View>
          <Text style={styles.name}>{client.name}</Text>
          <Text style={styles.meta}>{client.kind} · {client.city}, {client.state} · since {client.since}</Text>
          <View style={styles.leadTag}>
            <Feather name="radio" size={11} color={hero.accent} />
            <Text style={styles.leadTagText}>{client.leadSource}</Text>
          </View>
        </View>
        <View style={styles.moneyRow}>
          <View style={styles.moneyCol}>
            <Text style={styles.moneyVal}>{money(client.lifetimeValue)}</Text>
            <Text style={styles.moneyLbl}>LIFETIME VALUE</Text>
          </View>
          <View style={styles.moneyDiv} />
          <View style={styles.moneyCol}>
            <Text style={[styles.moneyVal, client.outstanding > 0 && { color: '#FF9E8A' }]}>{money(client.outstanding)}</Text>
            <Text style={styles.moneyLbl}>OUTSTANDING</Text>
          </View>
          <View style={styles.moneyDiv} />
          <View style={styles.moneyCol}>
            <Text style={styles.moneyVal}>{client.jobCount}</Text>
            <Text style={styles.moneyLbl}>JOBS</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.actions}>
          <Action icon="phone" label="CALL" onPress={() => openUrl(`tel:${tel}`)} />
          <Action icon="message-circle" label="TEXT" onPress={() => openUrl(`sms:${tel}`)} />
          <Action icon="calendar" label="SCHEDULE" onPress={() => onAdvanceStage(client.id)} />
          <Action icon="file-text" label="INVOICE" onPress={() => openUrl(`mailto:${client.email}`)} />
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

        <SectionLabel right={<Text style={styles.jobCount}>{client.jobCount} TOTAL</Text>}>Job history</SectionLabel>
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
                  {j.outstanding > 0 && <Text style={styles.jobDue}>{money(j.outstanding)} DUE</Text>}
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
  head: { paddingTop: 8, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  headBar: { flexDirection: 'row', justifyContent: 'space-between' },
  iconBtn: { width: 38, height: 38, borderRadius: radius.sm, backgroundColor: hero.fill, alignItems: 'center', justifyContent: 'center' },
  headMain: { alignItems: 'center', marginTop: 6 },
  bigAvatar: { width: 68, height: 68, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontFamily: font.display, fontSize: 23, color: '#FFF', letterSpacing: -0.4 },
  meta: { fontFamily: font.med, fontSize: 12, color: hero.muted, marginTop: 5 },
  leadTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: hero.fill, paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.sm, marginTop: 10, gap: 5 },
  leadTagText: { fontFamily: font.monoSemi, fontSize: 10.5, color: hero.accent, textTransform: 'uppercase', letterSpacing: 0.3 },
  moneyRow: { flexDirection: 'row', marginTop: 20, backgroundColor: hero.fill, borderRadius: radius.md, borderWidth: 1, borderColor: hero.line, paddingVertical: 14 },
  moneyCol: { flex: 1, alignItems: 'center' },
  moneyVal: { fontFamily: font.monoBold, fontSize: 17, color: '#FFF' },
  moneyLbl: { fontFamily: font.mono, fontSize: 9.5, color: hero.muted, marginTop: 4, letterSpacing: 0.4 },
  moneyDiv: { width: 1, backgroundColor: hero.line, marginVertical: 4 },

  body: { padding: 20, paddingTop: 18 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  action: { alignItems: 'center', gap: 8 },
  actionIcon: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
  actionLabel: { fontFamily: font.mono, fontSize: 10, color: colors.inkSoft, letterSpacing: 0.4 },

  stepper: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24, paddingHorizontal: 4 },
  stepItem: { alignItems: 'center', width: 62 },
  stepDot: { width: 24, height: 24, borderRadius: radius.sm, backgroundColor: colors.paperDeep, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.line },
  stepDotDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  stepLabel: { fontFamily: font.med, fontSize: 10.5, color: colors.muted, marginTop: 7, textAlign: 'center' },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.line, marginTop: 11 },

  infoCard: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 15, marginBottom: 24, ...shadow.soft },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 12 },
  infoBorder: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  infoText: { fontFamily: font.med, fontSize: 13.5, color: colors.inkSoft, flex: 1 },

  jobCount: { fontFamily: font.mono, fontSize: 10, color: colors.muted, letterSpacing: 0.5 },
  jobCard: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 15, marginBottom: 9, ...shadow.soft },
  jobTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobTitle: { fontFamily: font.bold, fontSize: 14.5, color: colors.ink },
  jobAmt: { fontFamily: font.monoBold, fontSize: 14, color: colors.ink },
  jobDesc: { fontFamily: font.reg, fontSize: 12.5, color: colors.muted, marginTop: 5, lineHeight: 18 },
  jobFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  jobFootRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ratingRow: { flexDirection: 'row', gap: 1 },
  jobTech: { fontFamily: font.med, fontSize: 11.5, color: colors.inkSoft },
  jobDue: { fontFamily: font.monoSemi, fontSize: 11, color: colors.danger, letterSpacing: 0.2 },
});
