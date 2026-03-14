import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { MD3LightTheme, configureFonts } from 'react-native-paper';

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing helpers
export const SIZES = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
};

export const wp = (percent: number) => (percent * SCREEN_WIDTH) / 100;
export const hp = (percent: number) => (percent * SCREEN_HEIGHT) / 100;

export const COLORS = {
  primary: '#059669', // Deep Emerald Green (More professional)
  secondary: '#0d9488', // Deep Teal
  accent: '#ea580c', // Deeper Orange
  background: '#f1f5f9', // Slate 100 (Cooler background)
  surface: '#ffffff',
  text: '#0f172a', // Slate 900
  textLight: '#475569', // Slate 600
  border: '#cbd5e1', // Slate 300
  error: '#dc2626',
  success: '#16a34a',
  white: '#ffffff',
  black: '#000000',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
};

const fontConfig = {
  displayLarge: { fontFamily: 'System', fontWeight: 'bold' as const },
  displayMedium: { fontFamily: 'System', fontWeight: 'bold' as const },
  displaySmall: { fontFamily: 'System', fontWeight: 'bold' as const },
  headlineLarge: { fontFamily: 'System', fontWeight: '600' as const },
  headlineMedium: { fontFamily: 'System', fontWeight: '600' as const },
  headlineSmall: { fontFamily: 'System', fontWeight: '600' as const },
  titleLarge: { fontFamily: 'System', fontWeight: '600' as const },
  titleMedium: { fontFamily: 'System', fontWeight: '500' as const },
  titleSmall: { fontFamily: 'System', fontWeight: '500' as const },
  labelLarge: { fontFamily: 'System', fontWeight: '500' as const },
  labelMedium: { fontFamily: 'System', fontWeight: '500' as const },
  labelSmall: { fontFamily: 'System', fontWeight: '500' as const },
  bodyLarge: { fontFamily: 'System', fontWeight: '400' as const },
  bodyMedium: { fontFamily: 'System', fontWeight: '400' as const },
  bodySmall: { fontFamily: 'System', fontWeight: '400' as const },
};

export const PaperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    error: COLORS.error,
    background: COLORS.background,
    surface: COLORS.surface,
  },
  fonts: configureFonts({config: fontConfig}),
};

export const NavigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
  },
};
