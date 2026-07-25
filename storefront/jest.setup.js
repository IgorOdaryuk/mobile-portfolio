// Jest runtime setup for component (RTL) tests.

// AsyncStorage has no native module under jest — swap in the official mock so
// ThemeProvider / StoreProvider hydration effects resolve instead of throwing.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// @expo/vector-icons pulls in expo-font -> expo-asset, which isn't resolvable
// under jest. Icons are decorative here, so stub every icon set with a plain
// host view (any set name -> a component) via a Proxy.
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Icon = (props) => React.createElement(View, props);
  return new Proxy({}, { get: () => Icon });
});

// jest-expo exposes a partial `window` but no `window.location`. The store and
// theme-context read `window.location.search` for their ?seedcart= / ?theme=
// screenshot params (guarded only by `typeof window`). Give it an empty search
// so those default to the normal (unseeded, light) runtime under test.
if (typeof window !== 'undefined' && !window.location) {
  window.location = { search: '', href: 'http://localhost/', pathname: '/' };
}
