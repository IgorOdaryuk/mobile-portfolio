import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartLine, Product, Review } from './types';
import { productMap } from './selectors';
import seed from './data/seed.json';

const STORAGE_KEY = 'solva_state_v1';

const base = seed as unknown as { products: Product[]; reviews: Review[] };

type State = { lines: CartLine[]; wishlist: string[]; promo: string; hydrated: boolean };

type Action =
  | { type: 'HYDRATE'; payload: Partial<State> }
  | { type: 'ADD'; line: CartLine }
  | { type: 'SET_QTY'; productId: string; variantId: string; qty: number }
  | { type: 'REMOVE'; productId: string; variantId: string }
  | { type: 'TOGGLE_SUB'; productId: string; variantId: string }
  | { type: 'CLEAR' }
  | { type: 'SET_PROMO'; code: string }
  | { type: 'TOGGLE_WISH'; productId: string };

/** For deterministic Cart/Checkout screenshots: ?seedcart=1 pre-fills a bag. */
function demoLines(): CartLine[] {
  if (typeof window === 'undefined') return [];
  const p = new URLSearchParams(window.location.search);
  if (p.get('seedcart') !== '1') return [];
  return [
    { productId: 'p01', variantId: 'p01v1', qty: 1, subscribe: true },
    { productId: 'p06', variantId: 'p06v0', qty: 2, subscribe: false },
    { productId: 'p14', variantId: 'p14v0', qty: 1, subscribe: true },
  ];
}

const demoWishlist = (): string[] =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('seedwish') === '1'
    ? ['p02', 'p07', 'p11', 'p04']
    : [];

const initial: State = { lines: demoLines(), wishlist: demoWishlist(), promo: '', hydrated: false };

const sameLine = (l: CartLine, productId: string, variantId: string) =>
  l.productId === productId && l.variantId === variantId;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true };
    case 'ADD': {
      const existing = state.lines.find((l) => sameLine(l, action.line.productId, action.line.variantId));
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            sameLine(l, action.line.productId, action.line.variantId)
              ? { ...l, qty: l.qty + action.line.qty, subscribe: l.subscribe || action.line.subscribe }
              : l,
          ),
        };
      }
      return { ...state, lines: [action.line, ...state.lines] };
    }
    case 'SET_QTY': {
      if (action.qty <= 0) {
        return { ...state, lines: state.lines.filter((l) => !sameLine(l, action.productId, action.variantId)) };
      }
      return {
        ...state,
        lines: state.lines.map((l) =>
          sameLine(l, action.productId, action.variantId) ? { ...l, qty: action.qty } : l,
        ),
      };
    }
    case 'REMOVE':
      return { ...state, lines: state.lines.filter((l) => !sameLine(l, action.productId, action.variantId)) };
    case 'TOGGLE_SUB':
      return {
        ...state,
        lines: state.lines.map((l) =>
          sameLine(l, action.productId, action.variantId) ? { ...l, subscribe: !l.subscribe } : l,
        ),
      };
    case 'CLEAR':
      return { ...state, lines: [], promo: '' };
    case 'SET_PROMO':
      return { ...state, promo: action.code };
    case 'TOGGLE_WISH':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.productId)
          ? state.wishlist.filter((id) => id !== action.productId)
          : [action.productId, ...state.wishlist],
      };
    default:
      return state;
  }
}

type StoreValue = {
  products: Product[];
  reviews: Review[];
  productsById: Record<string, Product>;
  lines: CartLine[];
  wishlist: string[];
  promo: string;
  hydrated: boolean;
  addToCart: (line: CartLine) => void;
  setQty: (productId: string, variantId: string, qty: number) => void;
  removeLine: (productId: string, variantId: string) => void;
  toggleSubscribe: (productId: string, variantId: string) => void;
  clearCart: () => void;
  setPromo: (code: string) => void;
  toggleWish: (productId: string) => void;
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
      JSON.stringify({ lines: state.lines, wishlist: state.wishlist, promo: state.promo }),
    ).catch(() => {});
  }, [state.lines, state.wishlist, state.promo, state.hydrated]);

  const value = useMemo<StoreValue>(
    () => ({
      products: base.products,
      reviews: base.reviews,
      productsById: productMap(base.products),
      lines: state.lines,
      wishlist: state.wishlist,
      promo: state.promo,
      hydrated: state.hydrated,
      addToCart: (line) => dispatch({ type: 'ADD', line }),
      setQty: (productId, variantId, qty) => dispatch({ type: 'SET_QTY', productId, variantId, qty }),
      removeLine: (productId, variantId) => dispatch({ type: 'REMOVE', productId, variantId }),
      toggleSubscribe: (productId, variantId) => dispatch({ type: 'TOGGLE_SUB', productId, variantId }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
      setPromo: (code) => dispatch({ type: 'SET_PROMO', code }),
      toggleWish: (productId) => dispatch({ type: 'TOGGLE_WISH', productId }),
    }),
    [state],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
