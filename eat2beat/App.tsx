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

import { FONT, LIGHT, type Palette } from './src/theme';
import { ThemeProvider, useTheme, useStyles } from './src/theme-context';
import { StoreProvider } from './src/store';
import Today from './src/screens/Today';
import Diary from './src/screens/Diary';
import Trends from './src/screens/Trends';
import Weight from './src/screens/Weight';
import AddFood from './src/screens/AddFood';
import FoodDetail from './src/screens/FoodDetail';
import Goals from './src/screens/Goals';
import { MealKey } from './src/types';

const isWeb = Platform.OS === 'web';

const TABS = [
  { key: 'Today', icon: 'sun' },
  { key: 'Diary', icon: 'book-open' },
  { key: 'Trends', icon: 'trending-up' },
  { key: 'Weight', icon: 'activity' },
] as const;

type AddState = { meal: MealKey; foodId: string | null } | null;

function Shell() {
  const styles = useStyles(makeStyles);
  const { C } = useTheme();
  const params = isWeb && typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [tab, setTab] = useState<string>(params?.get('tab') || 'Today');
  const [foodId, setFoodId] = useState<string | null>(params?.get('food') || null);
  const [goalsOpen, setGoalsOpen] = useState<boolean>(params?.get('screen') === 'goals');
  const [add, setAdd] = useState<AddState>(
    params?.get('modal') === 'add'
      ? { meal: (params.get('meal') as MealKey) || 'breakfast', foodId: params.get('addfood') || null }
      : null,
  );

  // full-screen overlays take priority over the tab content
  if (goalsOpen) {
    return (
      <Screen>
        <Goals onClose={() => setGoalsOpen(false)} />
      </Screen>
    );
  }
  if (add) {
    return (
      <Screen>
        <AddFood
          initialMeal={add.meal}
          initialFoodId={add.foodId}
          onClose={() => setAdd(null)}
        />
      </Screen>
    );
  }
  if (foodId) {
    return (
      <Screen>
        <FoodDetail
          foodId={foodId}
          onBack={() => setFoodId(null)}
          onAdd={(id) => {
            setFoodId(null);
            setAdd({ meal: 'breakfast', foodId: id });
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.content}>
        {tab === 'Today' ? (
          <Today
            onAdd={(meal) => setAdd({ meal, foodId: null })}
            onOpenFood={setFoodId}
            onOpenGoals={() => setGoalsOpen(true)}
          />
        ) : tab === 'Diary' ? (
          <Diary onOpenFood={setFoodId} />
        ) : tab === 'Trends' ? (
          <Trends />
        ) : (
          <Weight />
        )}
      </View>

      {/* tab bar with a raised center Add button */}
      <View style={styles.tabbar}>
        {TABS.slice(0, 2).map((t) => (
          <TabButton key={t.key} t={t} active={t.key === tab} onPress={() => setTab(t.key)} />
        ))}
        <View style={styles.tab}>
          <Pressable style={styles.fab} onPress={() => setAdd({ meal: 'breakfast', foodId: null })}>
            <Feather name="plus" size={26} color="#fff" />
          </Pressable>
        </View>
        {TABS.slice(2).map((t) => (
          <TabButton key={t.key} t={t} active={t.key === tab} onPress={() => setTab(t.key)} />
        ))}
      </View>
      <View style={styles.homeIndicator} />
    </Screen>
  );
}

function TabButton({
  t,
  active,
  onPress,
}: {
  t: { key: string; icon: string };
  active: boolean;
  onPress: () => void;
}) {
  const { C } = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <Feather name={t.icon as any} size={22} color={active ? C.primary : C.textFaint} />
      <Text style={[styles.tabLabel, active && { color: C.primary, fontFamily: FONT.bodyBold }]}>{t.key}</Text>
    </Pressable>
  );
}

/** faux-iOS chrome around whatever content is passed in */
function Screen({ children }: { children: React.ReactNode }) {
  const { C, mode } = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.app}>
      <View style={styles.statusBar}>
        <Text style={styles.clock}>9:41</Text>
        <View style={styles.statusIcons}>
          <Feather name="wifi" size={15} color={C.text} />
          <View style={styles.battery}>
            <View style={styles.batteryFill} />
          </View>
        </View>
      </View>
      {children}
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}

function Root() {
  const { C } = useTheme();
  const styles = useStyles(makeStyles);
  const app = (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );

  if (!isWeb) return app;

  return (
    <View style={styles.backdrop}>
      <View style={styles.phone}>
        <View style={styles.island} />
        {app}
      </View>
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: LIGHT.bg }} />;

  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', padding: 56 },
    phone: {
      width: 393,
      height: 852,
      borderRadius: 54,
      backgroundColor: C.bg,
      overflow: 'hidden',
      borderWidth: 11,
      borderColor: '#0B0B0D',
      ...(isWeb ? ({ boxShadow: '0 28px 70px rgba(11,45,34,0.28)' } as any) : {}),
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
    app: { flex: 1, backgroundColor: C.bg },
    statusBar: {
      height: 54,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: 30,
      paddingBottom: 8,
    },
    clock: { fontFamily: FONT.bodyBold, fontSize: 15, color: C.text },
    statusIcons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    battery: { width: 24, height: 12, borderRadius: 3, borderWidth: 1, borderColor: C.text, opacity: 0.9, padding: 1.5, justifyContent: 'center' },
    batteryFill: { width: '75%', height: '100%', borderRadius: 1, backgroundColor: C.text },

    content: { flex: 1 },
    tabbar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.card,
      borderTopWidth: 1,
      borderTopColor: C.cardBorder,
      paddingTop: 10,
      paddingBottom: 6,
    },
    tab: { flex: 1, alignItems: 'center', gap: 3 },
    tabLabel: { fontFamily: FONT.body, fontSize: 11, color: C.textFaint },
    fab: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: C.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -30,
      ...(isWeb
        ? ({
            backgroundImage: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
            boxShadow: '0 10px 22px rgba(15,158,110,0.42)',
          } as any)
        : {}),
    },
    homeIndicator: { alignSelf: 'center', width: 134, height: 5, borderRadius: 3, backgroundColor: C.text, opacity: 0.85, marginVertical: 8 },
  });
