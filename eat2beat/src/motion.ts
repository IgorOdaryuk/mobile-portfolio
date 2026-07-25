import { Platform } from 'react-native';

/**
 * Whether entrance animations should actually run.
 *
 * In a real browser / on device they do. During the headless-Chrome screenshot
 * pass we pass `?static=1`, because Chrome's virtual-time clock doesn't advance
 * `Animated`'s rAF loop — without this the shots would freeze at the animation's
 * first frame (empty ring, empty bars). Evaluated once at module load.
 */
export const ANIMATE: boolean = !(
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('static')
);
