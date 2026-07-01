// 主题色板 — 适配 jmcomic-next Material 3 配色方案
// 提供 Light / Dark 两套完整颜色令牌
// @author nyx

export interface ColorTokens {
  // Primary
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  // Secondary
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  // Tertiary
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  // Error
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  // Background / Surface
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;

  // Outline
  outline: string;
  outlineVariant: string;

  // Scrim
  scrim: string;

  // Inverse
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;

  // Surface Dim / Bright
  surfaceDim: string;
  surfaceBright: string;

  // Surface Container levels
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
}

export interface ColorFamily {
  color: string;
  onColor: string;
  colorContainer: string;
  onColorContainer: string;
}

export interface ExtendedColorTokens {
  contentTag: ColorFamily;
  roleTag: ColorFamily;
  workTag: ColorFamily;
}

export interface ThemeColors {
  colors: ColorTokens;
  extended: ExtendedColorTokens;
}

/** 向后兼容：旧版 Colors 属性名 + 新 M3 名 */
export type LegacyColors = ColorTokens & {
  primaryLight: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textOnPrimary: string;
  border: string;
  divider: string;
  surfaceLight: string;
  success: string;
  text: string;
};

export function buildLegacyColors(c: ColorTokens): LegacyColors {
  return {
    ...c,
    primaryLight: c.primaryContainer,
    textPrimary: c.onSurface,
    textSecondary: c.onSurfaceVariant,
    textTertiary: c.outline,
    textOnPrimary: c.onPrimary,
    border: c.outlineVariant,
    divider: c.outlineVariant,
    surfaceLight: c.surfaceContainerHigh,
    success: '#4CAF50',
    text: c.onSurface,
  };
}

// ============ Light Scheme ============

export const lightColors: ColorTokens = {
  primary: '#4F5F7F',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D8E2FF',
  onPrimaryContainer: '#0A1B35',
  secondary: '#5A5D72',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#DEE1F9',
  onSecondaryContainer: '#171B2C',
  tertiary: '#75546F',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD7F4',
  onTertiaryContainer: '#2C1229',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  background: '#FAF8FF',
  onBackground: '#1A1B20',
  surface: '#FAF8FF',
  onSurface: '#1A1B20',
  surfaceVariant: '#E1E2EC',
  onSurfaceVariant: '#44474F',
  outline: '#747780',
  outlineVariant: '#C4C6D0',
  scrim: '#000000',
  inverseSurface: '#2F3036',
  inverseOnSurface: '#F1F0F7',
  inversePrimary: '#B8C7EF',
  surfaceDim: '#DAD9E0',
  surfaceBright: '#FAF8FF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F4F2FA',
  surfaceContainer: '#EEECF4',
  surfaceContainerHigh: '#E8E7EF',
  surfaceContainerHighest: '#E2E1E9',
};

export const lightExtended: ExtendedColorTokens = {
  contentTag: {
    color: '#3F5F8F',
    onColor: '#FFFFFF',
    colorContainer: '#D5E3FF',
    onColorContainer: '#001B3D',
  },
  roleTag: {
    color: '#28656F',
    onColor: '#FFFFFF',
    colorContainer: '#B8EAF3',
    onColorContainer: '#001F25',
  },
  workTag: {
    color: '#7A5265',
    onColor: '#FFFFFF',
    colorContainer: '#FFD8E7',
    onColorContainer: '#30111F',
  },
};

// ============ Dark Scheme ============

export const darkColors: ColorTokens = {
  primary: '#B8C7EF',
  onPrimary: '#20304F',
  primaryContainer: '#374766',
  onPrimaryContainer: '#D8E2FF',
  secondary: '#C2C5DD',
  onSecondary: '#2C3042',
  secondaryContainer: '#434659',
  onSecondaryContainer: '#DEE1F9',
  tertiary: '#D4BAD8',
  onTertiary: '#43263F',
  tertiaryContainer: '#5B3C56',
  onTertiaryContainer: '#FFD7F4',
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  background: '#121318',
  onBackground: '#E2E1E9',
  surface: '#121318',
  onSurface: '#E2E1E9',
  surfaceVariant: '#44474F',
  onSurfaceVariant: '#C4C6D0',
  outline: '#8E9099',
  outlineVariant: '#44474F',
  scrim: '#000000',
  inverseSurface: '#E2E1E9',
  inverseOnSurface: '#2F3036',
  inversePrimary: '#4F5F7F',
  surfaceDim: '#121318',
  surfaceBright: '#38393F',
  surfaceContainerLowest: '#0D0E13',
  surfaceContainerLow: '#1A1B20',
  surfaceContainer: '#1E1F25',
  surfaceContainerHigh: '#292A2F',
  surfaceContainerHighest: '#34343A',
};

export const darkExtended: ExtendedColorTokens = {
  contentTag: {
    color: '#A7C8FF',
    onColor: '#07305F',
    colorContainer: '#254775',
    onColorContainer: '#D5E3FF',
  },
  roleTag: {
    color: '#9CD0D9',
    onColor: '#00363E',
    colorContainer: '#074D56',
    onColorContainer: '#B8EAF3',
  },
  workTag: {
    color: '#E9B9CF',
    onColor: '#472638',
    colorContainer: '#603C4D',
    onColorContainer: '#FFD8E7',
  },
};
