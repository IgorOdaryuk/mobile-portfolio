/**
 * Screen-level render test — mounts the Shop screen inside the real theme +
 * store providers and asserts it renders live store data and wires navigation.
 *
 * Kept in its own file: React 19 + RTL v14 render async, and a screen's
 * AsyncStorage-hydrating providers don't compose cleanly with many sibling
 * component tests in one file (overlapping act()). One file = one module
 * registry, so this stays isolated and deterministic.
 *
 * Note: RTL v14 (React 19) `render` is async — always `await` it.
 */
import React from 'react';
import { render, userEvent } from '@testing-library/react-native';

import { ThemeProvider } from '../theme-context';
import { StoreProvider } from '../store';
import Shop from '../screens/Shop';
import type { Product } from '../types';
import seed from '../data/seed.json';

const products = (seed as unknown as { products: Product[] }).products;

const renderShop = (props: React.ComponentProps<typeof Shop>) =>
  render(
    <ThemeProvider>
      <StoreProvider>
        <Shop {...props} />
      </StoreProvider>
    </ThemeProvider>,
  );

describe('Shop screen', () => {
  it('renders the brand and its bestsellers from the store', async () => {
    const { findByText, getAllByText } = await renderShop({
      onOpenProduct: jest.fn(),
      onOpenCategory: jest.fn(),
    });
    expect(await findByText('Solva')).toBeTruthy();
    const bestseller = products.find((p) => p.bestseller)!;
    expect(getAllByText(bestseller.name).length).toBeGreaterThan(0);
  });

  it('opens a product when a bestseller card is pressed', async () => {
    const user = userEvent.setup();
    const onOpenProduct = jest.fn();
    const { findAllByText } = await renderShop({ onOpenProduct, onOpenCategory: jest.fn() });
    const bestseller = products.find((p) => p.bestseller)!;
    const cards = await findAllByText(bestseller.name);
    await user.press(cards[0]);
    expect(onOpenProduct).toHaveBeenCalled();
  });
});
