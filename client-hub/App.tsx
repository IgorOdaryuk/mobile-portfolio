import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import {
  useFonts,
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
} from '@expo-google-fonts/archivo';
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

import { colors, font } from './src/theme';
import { Seed } from './src/types';
import { StoreProvider, useStore } from './src/store';
import Dashboard from './src/screens/Dashboard';
import Clients from './src/screens/Clients';
import ClientDetail from './src/screens/ClientDetail';
import Board from './src/screens/Board';
import Tasks from './src/screens/Tasks';

const TABS = [
  { key: 'Home', icon: 'grid' },
  { key: 'Clients', icon: 'users' },
  { key: 'Board', icon: 'columns' },
  { key: 'Tasks', icon: 'check-square' },
] as const;

const isWeb = Platform.OS === 'web';

function Shell() {
  const store = useStore();
  // On web, allow ?tab= / ?client= to set the initial screen (for deterministic screenshots).
  const params = isWeb && typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [tab, setTab] = useState<string>(params?.get('tab') || 'Home');
  const [clientId, setClientId] = useState<string | null>(params?.get('client') || null);

  const client = clientId ? store.clients.find((c) => c.id === clientId) || null : null;
  const openClient = (id: string) => setClientId(id);
  const data: Seed = {
    clients: store.clients,
    tasks: store.tasks,
    kpis: store.kpis,
    jobs: store.clients.flatMap((c) => c.jobs),
  };

  return (
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
          <ClientDetail client={client} onBack={() => setClientId(null)} onAdvanceStage={store.advanceStage} />
        ) : tab === 'Home' ? (
          <Dashboard data={data} go={setTab} onOpenClient={openClient} />
        ) : tab === 'Clients' ? (
          <Clients data={data} onOpenClient={openClient} onAddClient={store.addClient} />
        ) : tab === 'Board' ? (
          <Board data={data} onOpenClient={openClient} />
        ) : (
          <Tasks data={data} onOpenClient={openClient} done={store.done} onToggle={store.toggleTask} />
        )}
      </View>

      {/* tab bar */}
      {!client && (
        <View style={styles.tabbar}>
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tab}>
                <Feather name={t.icon as any} size={21} color={active ? colors.accent : colors.muted} />
                <Text style={[styles.tabLabel, active && { color: colors.accent, fontFamily: font.monoBold }]}>{t.key}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      <View style={styles.homeIndicator} />
      <StatusBar style={client ? 'light' : 'dark'} />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
  });
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.paper }} />;

  const app = (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );

  if (!isWeb) return app;

  // Web: render inside an iPhone frame on a transparent backdrop for clean screenshots.
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
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', padding: 56 },
  phone: {
    width: 393,
    height: 852,
    borderRadius: 54,
    backgroundColor: colors.paper,
    overflow: 'hidden',
    borderWidth: 11,
    borderColor: '#0B0B0D',
    ...(isWeb ? ({ boxShadow: '0 28px 70px rgba(20,14,8,0.30)' } as any) : {}),
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
  clock: { fontFamily: font.monoBold, fontSize: 14, color: colors.ink, letterSpacing: 0.5 },
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
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  tabLabel: { fontFamily: font.mono, fontSize: 9.5, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  homeIndicator: { alignSelf: 'center', width: 134, height: 5, borderRadius: 3, backgroundColor: colors.ink, opacity: 0.85, marginVertical: 8 },
});
