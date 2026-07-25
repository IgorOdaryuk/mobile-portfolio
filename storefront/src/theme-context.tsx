/**
 * Runtime theme (light / dark) for Solva.
 *
 * Components read the active palette with `useTheme()` and build their styles
 * with `useStyles(makeStyles)` — a module-level `makeStyles(C)` factory re-run
 * only when the palette changes. The mode is persisted to AsyncStorage and can
 * be forced for screenshots via a `?theme=dark` URL param.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTES, type Palette, type ThemeMode } from './theme';

const STORAGE_KEY = 'solva_theme_v1';

type ThemeValue = {
  C: Palette;
  mode: ThemeMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

function urlMode(): ThemeMode | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const v = new URLSearchParams(window.location.search).get('theme');
  return v === 'dark' || v === 'light' ? v : null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const forced = urlMode();
  const [mode, setModeState] = useState<ThemeMode>(forced ?? 'light');

  useEffect(() => {
    if (forced) return;
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (alive && (raw === 'dark' || raw === 'light')) setModeState(raw);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [forced]);

  const value = useMemo<ThemeValue>(() => {
    const setMode = (m: ThemeMode) => {
      setModeState(m);
      AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
    };
    return {
      C: PALETTES[mode],
      mode,
      setMode,
      toggle: () => setMode(mode === 'light' ? 'dark' : 'light'),
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}

export function useStyles<T>(factory: (C: Palette) => T): T {
  const { C } = useTheme();
  return useMemo(() => factory(C), [C, factory]);
}
