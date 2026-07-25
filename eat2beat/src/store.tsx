import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Entry, Food, MealKey, Profile } from './types';
import { foodMap } from './selectors';
import seed from './data/seed.json';

const STORAGE_KEY = 'eat2beat_state_v1';

const base = seed as unknown as {
  today: string;
  profile: Profile;
  foods: Food[];
  entries: Entry[];
};

type State = {
  entries: Entry[];
  water: Record<string, number>;
  hydrated: boolean;
};

type Action =
  | { type: 'HYDRATE'; payload: Partial<State> }
  | { type: 'ADD_ENTRY'; entry: Entry }
  | { type: 'REMOVE_ENTRY'; id: string }
  | { type: 'ADD_WATER'; date: string; ml: number };

const initial: State = {
  entries: base.entries,
  water: base.profile.waterByDate,
  hydrated: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true };
    case 'ADD_ENTRY':
      return { ...state, entries: [action.entry, ...state.entries] };
    case 'REMOVE_ENTRY':
      return { ...state, entries: state.entries.filter((e) => e.id !== action.id) };
    case 'ADD_WATER': {
      const current = state.water[action.date] ?? 0;
      const next = Math.max(0, current + action.ml);
      return { ...state, water: { ...state.water, [action.date]: next } };
    }
    default:
      return state;
  }
}

export type AddEntryInput = { date: string; meal: MealKey; foodId: string; servings: number };

type StoreValue = {
  today: string;
  profile: Profile;
  foods: Food[];
  foodsById: Record<string, Food>;
  entries: Entry[];
  water: Record<string, number>;
  hydrated: boolean;
  addEntry: (input: AddEntryInput) => void;
  removeEntry: (id: string) => void;
  addWater: (date: string, ml: number) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (alive && raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) });
        else if (alive) dispatch({ type: 'HYDRATE', payload: {} });
      })
      .catch(() => alive && dispatch({ type: 'HYDRATE', payload: {} }));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ entries: state.entries, water: state.water }),
    ).catch(() => {});
  }, [state.entries, state.water, state.hydrated]);

  const value = useMemo<StoreValue>(() => {
    return {
      today: base.today,
      profile: base.profile,
      foods: base.foods,
      foodsById: foodMap(base.foods),
      entries: state.entries,
      water: state.water,
      hydrated: state.hydrated,
      addEntry: (input) =>
        dispatch({
          type: 'ADD_ENTRY',
          entry: { id: 'e_' + Date.now().toString(36), ...input },
        }),
      removeEntry: (id) => dispatch({ type: 'REMOVE_ENTRY', id }),
      addWater: (date, ml) => dispatch({ type: 'ADD_WATER', date, ml }),
    };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
