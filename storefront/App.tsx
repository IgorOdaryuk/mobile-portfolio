import React, { useState, useEffect, useRef } from 'react';
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
import { Fraunces_500Medium, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';

import { FONT, LIGHT, type Palette } from './src/theme';
import { ThemeProvider, useTheme, useStyles } from './src/theme-context';
import { StoreProvider, useStore } from './src/store';
import { cartCount } from './src/selectors';
import { Category as Cat } from './src/types';
import Shop from './src/screens/Shop';
import CategoryScreen from './src/screens/Category';
import ProductDetail from './src/screens/ProductDetail';
import Cart from './src/screens/Cart';
import Checkout from './src/screens/Checkout';
import Wishlist from './src/screens/Wishlist';

const isWeb = Platform.OS === 'web';

const TABS = [
  { key: 'Shop', icon: 'home' },
  { key: 'Search', icon: 'search' },
  { key: 'Saved', icon: 'heart' },
  { key: 'Bag', icon: 'shopping-bag' },
] as const;

function Shell() {
  const { C, mode } = useTheme();
  const styles = useStyles(makeStyles);
  const store = useStore();
  const params = isWeb && typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [tab, setTab] = useState<string>(params?.get('tab') || 'Shop');
  const [productId, setProductId] = useState<string | null>(params?.get('product') || null);
  const [checkout, setCheckout] = useState<boolean>(params?.get('checkout') === '1');
  const [catInitial, setCatInitial] = useState<Cat | 'all'>((params?.get('cat') as Cat) || 'all');

  const count = cartCount(store.lines);
  const openProduct = (id: string) => setProductId(id);
  const openCategory = (c: Cat | 'all') => {
    setCatInitial(c);
    setTab('Search');
  };

  // Web: mirror nav state into browser history so Back/Forward actually work.
  const skipFirst = useRef(true);
  useEffect(() => {
    if (!isWeb || typeof window === 'undefined') return;
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const p = new URLSearchParams(window.location.search);
    ['tab', 'product', 'checkout', 'cat'].forEach((k) => p.delete(k));
    if (checkout) p.set('checkout', '1');
    else if (productId) p.set('product', productId);
    else {
      p.set('tab', tab);
      if (tab === 'Search' && catInitial !== 'all') p.set('cat', catInitial);
    }
    const qs = p.toString();
    window.history.pushState({}, '', qs ? `?${qs}` : window.location.pathname);
  }, [tab, productId, checkout, catInitial]);

  useEffect(() => {
    if (!isWeb || typeof window === 'undefined') return;
    const onPop = () => {
      const p = new URLSearchParams(window.location.search);
      setCheckout(p.get('checkout') === '1');
      setProductId(p.get('product'));
      setTab(p.get('tab') || 'Shop');
      setCatInitial((p.get('cat') as Cat) || 'all');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  let content: React.ReactNode;
  if (checkout) {
    content = <Checkout onBack={() => setCheckout(false)} onDone={() => { setCheckout(false); setTab('Shop'); }} />;
  } else if (productId) {
    content = <ProductDetail key={productId} productId={productId} onBack={() => setProductId(null)} onOpenCart={() => { setProductId(null); setTab('Bag'); }} onOpenProduct={setProductId} />;
  } else if (tab === 'Shop') {
    content = <Shop onOpenProduct={openProduct} onOpenCategory={openCategory} />;
  } else if (tab === 'Search') {
    content = <CategoryScreen initial={catInitial} onBack={() => setTab('Shop')} onOpenProduct={openProduct} />;
  } else if (tab === 'Saved') {
    content = <Wishlist onOpenProduct={openProduct} onBrowse={() => setTab('Shop')} />;
  } else {
    content = <Cart onBack={() => setTab('Shop')} onCheckout={() => setCheckout(true)} onOpenProduct={openProduct} />;
  }

  const showTabs = !checkout && !productId;

  return (
    <View style={styles.app}>
      <View style={styles.statusBar}>
        <Text style={styles.clock}>9:41</Text>
        <View style={styles.statusIcons}>
          <Feather name="wifi" size={15} color={C.ink} />
          <View style={styles.battery}><View style={styles.batteryFill} /></View>
        </View>
      </View>

      <View style={styles.content}>{content}</View>

      {showTabs && (
        <View style={styles.tabbar}>
          {TABS.map((t) => {
            const active = t.key === tab;
            const isBag = t.key === 'Bag';
            return (
              <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tab} accessibilityRole="button" accessibilityLabel={t.key}>
                <View>
                  <Feather name={t.icon as any} size={22} color={active ? C.sage : C.inkFaint} />
                  {isBag && count > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View> : null}
                </View>
                <Text style={[styles.tabLabel, active && { color: C.sage, fontFamily: FONT.bodyBold }]}>{t.key}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      <View style={styles.homeIndicator} />
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}

function Root() {
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
    Fraunces_500Medium,
    Fraunces_600SemiBold,
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
      ...(isWeb ? ({ boxShadow: '0 28px 70px rgba(38,34,29,0.28)' } as any) : {}),
    },
    island: { position: 'absolute', top: 11, alignSelf: 'center', width: 118, height: 34, borderRadius: 20, backgroundColor: '#000', zIndex: 50 },
    app: { flex: 1, backgroundColor: C.bg },
    statusBar: { height: 54, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 30, paddingBottom: 8 },
    clock: { fontFamily: FONT.bodyBold, fontSize: 15, color: C.ink },
    statusIcons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    battery: { width: 24, height: 12, borderRadius: 3, borderWidth: 1, borderColor: C.ink, opacity: 0.9, padding: 1.5, justifyContent: 'center' },
    batteryFill: { width: '75%', height: '100%', borderRadius: 1, backgroundColor: C.ink },

    content: { flex: 1 },
    tabbar: { flexDirection: 'row', backgroundColor: C.barBg, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 10, paddingBottom: 6 },
    tab: { flex: 1, alignItems: 'center', gap: 3 },
    tabLabel: { fontFamily: FONT.body, fontSize: 11, color: C.inkFaint },
    badge: { position: 'absolute', top: -6, right: -10, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: C.terra, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
    badgeText: { fontFamily: FONT.bodyBold, fontSize: 10, color: '#FFFFFF' },
    homeIndicator: { alignSelf: 'center', width: 134, height: 5, borderRadius: 3, backgroundColor: C.ink, opacity: 0.85, marginVertical: 8 },
  });
