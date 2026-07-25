/**
 * Screen-level render tests — mount whole screens inside the real theme + store
 * providers and assert they render live store data and wire navigation / cart.
 *
 * Kept in their own file: React 19 + RTL v14 render async, and AsyncStorage-
 * hydrating providers don't compose cleanly with many sibling component tests in
 * one file (overlapping act()). One file = one module registry → deterministic.
 * Interactions use `userEvent` (async, wraps updates in act).
 */
import React from 'react';
import { render, userEvent } from '@testing-library/react-native';

import { ThemeProvider } from '../theme-context';
import { StoreProvider } from '../store';
import Shop from '../screens/Shop';
import Cart from '../screens/Cart';
import Category from '../screens/Category';
import ProductDetail from '../screens/ProductDetail';
import type { Product } from '../types';
import seed from '../data/seed.json';

const products = (seed as unknown as { products: Product[] }).products;

const mount = (ui: React.ReactElement) =>
  render(
    <ThemeProvider>
      <StoreProvider>{ui}</StoreProvider>
    </ThemeProvider>,
  );

describe('Shop screen', () => {
  it('renders the brand and its bestsellers from the store', async () => {
    const { findByText, getAllByText } = await mount(<Shop onOpenProduct={jest.fn()} onOpenCategory={jest.fn()} />);
    expect(await findByText('Solva')).toBeTruthy();
    const bestseller = products.find((p) => p.bestseller)!;
    expect(getAllByText(bestseller.name).length).toBeGreaterThan(0);
  });

  it('opens a product when a bestseller card is pressed', async () => {
    const user = userEvent.setup();
    const onOpenProduct = jest.fn();
    const { findAllByText } = await mount(<Shop onOpenProduct={onOpenProduct} onOpenCategory={jest.fn()} />);
    const bestseller = products.find((p) => p.bestseller)!;
    const cards = await findAllByText(bestseller.name);
    await user.press(cards[0]);
    expect(onOpenProduct).toHaveBeenCalled();
  });
});

describe('Cart screen', () => {
  it('shows the empty state when the bag has no lines', async () => {
    const { findByText } = await mount(
      <Cart onBack={jest.fn()} onCheckout={jest.fn()} onOpenProduct={jest.fn()} />,
    );
    // Store hydrates to an empty cart under jest (no ?seedcart param).
    expect(await findByText('Your bag is empty')).toBeTruthy();
  });

  it('"Browse shop" from the empty state calls onBack', async () => {
    const user = userEvent.setup();
    const onBack = jest.fn();
    const { findByText } = await mount(
      <Cart onBack={onBack} onCheckout={jest.fn()} onOpenProduct={jest.fn()} />,
    );
    await user.press(await findByText('Browse shop'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

describe('Category screen', () => {
  it('lists products and opens one on press', async () => {
    const user = userEvent.setup();
    const onOpenProduct = jest.fn();
    const { findAllByText } = await mount(
      <Category initial="all" onBack={jest.fn()} onOpenProduct={onOpenProduct} />,
    );
    const anyProduct = products.find((p) => p.id !== 'p00')!;
    const cards = await findAllByText(anyProduct.name);
    await user.press(cards[0]);
    expect(onOpenProduct).toHaveBeenCalled();
  });
});

describe('ProductDetail screen', () => {
  const product = products.find((p) => p.id === 'p01')!;

  it('renders the product and adds it to the bag', async () => {
    const user = userEvent.setup();
    const { findByText, getByText } = await mount(
      <ProductDetail productId={product.id} onBack={jest.fn()} onOpenCart={jest.fn()} onOpenProduct={jest.fn()} />,
    );
    expect(await findByText(product.name)).toBeTruthy();
    await user.press(getByText(/^Add ·/)); // "Add · $52"
    expect(await findByText('✓ Added to bag')).toBeTruthy();
  });
});
