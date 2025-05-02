// /**
//  * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
//  * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
//  */

// const tintColorLight = '#0a7ea4';
// const tintColorDark = '#fff';

// export const Colors = {
//   light: {
//     text: '#11181C',
//     background: '#fff',
//     tint: tintColorLight,
//     icon: '#687076',
//     tabIconDefault: '#687076',
//     tabIconSelected: tintColorLight,
//   },
//   dark: {
//     text: '#ECEDEE',
//     background: '#151718',
//     tint: tintColorDark,
//     icon: '#9BA1A6',
//     tabIconDefault: '#9BA1A6',
//     tabIconSelected: tintColorDark,
//   },
// };

import { DarkTheme, DefaultTheme } from '@react-navigation/native';
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

const LightColors = {
  ...DefaultTheme.colors,
  primary: '#3b82f6',       // Your brand color (blue-500)
  secondary: '#f43f5e',     // Your accent color (rose-500)
  background: '#ffffff',
  card: '#f9fafb',          // Slightly off-white for cards
  text: '#111827',
  border: '#e5e7eb',
  notification: '#ef4444',
  success: '#10b981',
  danger: '#ef4444',
  tint: tintColorLight,
  icon: '#687076',
  tabIconDefault: '#687076',
  tabIconSelected: tintColorLight,
};

const DarkColors = {
  ...DarkTheme.colors,
  primary: '#60a5fa',       // Lighter blue for dark mode
  secondary: '#fb7185',     // Lighter rose for dark mode
  background: '#1a1a1a',
  card: '#2d2d2d',          // Dark gray for cards
  text: '#f9fafb',
  border: '#374151',
  notification: '#f87171',
  success: '#34d399',
  danger: '#f87171',
  tint: tintColorDark,
  icon: '#9BA1A6',
  tabIconDefault: '#9BA1A6',
  tabIconSelected: tintColorDark,
};

export const Colors = {
  light: LightColors,
  dark: DarkColors,
};