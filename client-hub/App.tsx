import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';

import { colors, font } from './src/theme';
import seed from './src/data/seed.json';
import { Seed } from './src/types';
import Dashboard from './src/screens/Dashboard';
import Clients from './src/screens/Clients';
import ClientDetail from './src/screens/ClientDetail';
import Board from './src/screens/Board';
import Tasks from './src/screens/Tasks';

const data = seed as unknown as Seed;

const TABS = [
  { key: 'Home', icon: 'grid' },
  { key: 'Clients', icon: 'users' },
  { key: 'Board', icon: 'columns' },
  { key: 'Tasks', icon: 'check-square' },
] as const;

const isWeb = Platform.OS === 'web';

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
  // On web, allow ?tab= / ?client= to set the initial screen (for deterministic screenshots).
  const params = isWeb && typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [tab, setTab] = useState<string>(params?.get('tab') || 'Home');
  const [clientId, setClientId] = useState<string | null>(params?.get('client') || null);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.paper }} />;

  const client = clientId ? data.clients.find((c) => c.id === clientId) || null : null;
  const openClient = (id: string) => setClientId(id);

  const app = (
    <View style={styles.app}>
      {/* faux iOS status bar */}
      <View style={styles.statusBar}>
        <Text style={styles.clock}>9:41</Text>
        <View style={styles.statusIcons}>
          <Feather name="wifi" size={15} color={client ? '#fff' : colors.ink} />
          <View style={[styles.battery, { borderColor: client ? '#fff' : colors.ink }]}>
            <View style={[styles.batteryFill, { backgroundColor: client ? '#fff' : colors.ink }]} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {client ? (
          <ClientDetail client={client} onBack={() => setClientId(null)} />
        ) : tab === 'Home' ? (
          <Dashboard data={data} go={setTab} onOpenClient={openClient} />
        ) : tab === 'Clients' ? (
          <Clients data={data} onOpenClient={openClient} />
        ) : tab === 'Board' ? (
          <Board data={data} onOpenClient={openClient} />
        ) : (
          <Tasks data={data} onOpenClient={openClient} />
        )}
      </View>

      {/* tab bar */}
      {!client && (
        <View style={styles.tabbar}>
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tab}>
                <Feather name={t.icon as any} size={22} color={active ? colors.accent : colors.muted} />
                <Text style={[styles.tabLabel, active && { color: colors.accent, fontFamily: font.bold }]}>{t.key}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      <View style={styles.homeIndicator} />
      <StatusBar style={client ? 'light' : 'dark'} />
    </View>
  );

  if (!isWeb) return app;

  // Web: render inside an iPhone frame on a neutral backdrop for clean screenshots.
  return (
    <View style={styles.backdrop}>
      <View style={styles.phone}>
        <View style={styles.island} />
        {app}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D9D2C7', padding: 24 },
  phone: {
    width: 393,
    height: 852,
    borderRadius: 54,
    backgroundColor: colors.paper,
    overflow: 'hidden',
    borderWidth: 11,
    borderColor: '#0B0B0D',
    ...(isWeb ? ({ boxShadow: '0 40px 120px rgba(30,20,10,0.35)' } as any) : {}),
  },
  island: {
    position: 'absolute',
    top: 11,
    alignSelf: 'center',
    width: 118,
    height: 34,
    borderRadius: 20,
    backgroundColor: '#000',
    zIndex: 50,
  },
  app: { flex: 1, backgroundColor: colors.paper },
  statusBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingBottom: 8,
  },
  clock: { fontFamily: font.bold, fontSize: 15, color: colors.ink },
  statusIcons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  battery: { width: 24, height: 12, borderRadius: 3, borderWidth: 1, opacity: 0.9, padding: 1.5, justifyContent: 'center' },
  batteryFill: { width: '75%', height: '100%', borderRadius: 1 },
  content: { flex: 1 },
  tabbar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 10,
    paddingBottom: 6,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  tabLabel: { fontFamily: font.med, fontSize: 11, color: colors.muted },
  homeIndicator: { alignSelf: 'center', width: 134, height: 5, borderRadius: 3, backgroundColor: colors.ink, opacity: 0.85, marginVertical: 8 },
});
