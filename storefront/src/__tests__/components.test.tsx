/**
 * Component (render) tests — React Testing Library on top of the existing pure
 * logic tests. These mount real components in the theme context and assert what
 * a shopper actually sees + that presses fire the right callbacks.
 *
 * Note: RTL v14 (React 19) `render` is async — always `await` it. Interactions
 * use `userEvent` (also async), which wraps updates in act() so no "overlapping
 * act()" warnings leak into the output.
 */
import React from 'react';
import { render, userEvent } from '@testing-library/react-native';

import { ThemeProvider } from '../theme-context';
import { ProductCard } from '../components/ProductCard';
import { Stars, Tag, SampleBadge, HeartButton } from '../ui';
import { money, isOnSale, discountPct } from '../selectors';
import type { Product } from '../types';
import seed from '../data/seed.json';

const products = (seed as unknown as { products: Product[] }).products;
const byId = (id: string) => products.find((p) => p.id === id)!;

const withTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ProductCard', () => {
  const product = byId('p01'); // Midnight Repair — bestseller, not on sale

  it('renders name, tagline, price and review count', async () => {
    const { getByText } = await withTheme(
      <ProductCard product={product} onPress={jest.fn()} wished={false} onWish={jest.fn()} />,
    );
    expect(getByText(product.name)).toBeTruthy();
    expect(getByText(product.tagline)).toBeTruthy();
    expect(getByText(money(product.priceCents))).toBeTruthy();
    expect(getByText(String(product.reviewCount))).toBeTruthy();
  });

  it('fires onPress when the card is tapped', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    const { getByText } = await withTheme(
      <ProductCard product={product} onPress={onPress} wished={false} onWish={jest.fn()} />,
    );
    await user.press(getByText(product.name));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('fires onWish from the heart button', async () => {
    const user = userEvent.setup();
    const onWish = jest.fn();
    const { getByLabelText } = await withTheme(
      <ProductCard product={product} onPress={jest.fn()} wished={false} onWish={onWish} />,
    );
    await user.press(getByLabelText('Save for later'));
    expect(onWish).toHaveBeenCalledTimes(1);
  });

  it('quick-add calls back and flips the label to "Added"', async () => {
    const user = userEvent.setup();
    const onQuickAdd = jest.fn();
    const { getByText, getByLabelText, queryByText } = await withTheme(
      <ProductCard product={product} onPress={jest.fn()} wished={false} onWish={jest.fn()} onQuickAdd={onQuickAdd} />,
    );
    expect(getByText('Add to bag')).toBeTruthy();
    await user.press(getByLabelText(`Add ${product.name} to bag`));
    expect(onQuickAdd).toHaveBeenCalledTimes(1);
    expect(getByText('✓ Added')).toBeTruthy();
    expect(queryByText('Add to bag')).toBeNull();
  });

  it('shows the discount tag and struck-through compare-at price for a sale item', async () => {
    const sale = byId('p02'); // Calm Balm — on sale
    expect(isOnSale(sale)).toBe(true);
    const { getByText } = await withTheme(
      <ProductCard product={sale} onPress={jest.fn()} wished={false} onWish={jest.fn()} />,
    );
    expect(getByText(`-${discountPct(sale)}%`)).toBeTruthy();
    expect(getByText(money(sale.compareAtCents!))).toBeTruthy();
  });
});

describe('UI primitives', () => {
  it('Stars exposes an accessible rating label', async () => {
    const { getByLabelText } = await withTheme(<Stars rating={4.5} />);
    expect(getByLabelText('Rated 4.5 out of 5 stars')).toBeTruthy();
  });

  it('Tag renders its label', async () => {
    const { getByText } = await withTheme(<Tag label="New" />);
    expect(getByText('New')).toBeTruthy();
  });

  it('SampleBadge marks the demo as synthetic', async () => {
    const { getByText } = await withTheme(<SampleBadge />);
    expect(getByText('SAMPLE STORE')).toBeTruthy();
  });

  it('HeartButton reflects active state via accessibility label', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    const { getByLabelText, findByLabelText, rerender } = await withTheme(
      <HeartButton active={false} onPress={onPress} />,
    );
    await user.press(getByLabelText('Save for later'));
    expect(onPress).toHaveBeenCalledTimes(1);
    rerender(
      <ThemeProvider>
        <HeartButton active onPress={onPress} />
      </ThemeProvider>,
    );
    expect(await findByLabelText('Remove from saved')).toBeTruthy();
  });
});
