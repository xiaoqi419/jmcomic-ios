// JMComic — 统一设计系统（兼容全部旧代码）
// @author Jason

export const Colors = {
  primary: '#DC4270',
  primaryLight: '#F9E5EB',
  primaryDark: '#B8305D',
  accent: '#E8803A',

  background: '#FAFAFB',
  surface: '#FFFFFF',
  surfaceLight: '#F8F8FA',
  surfaceContainer: '#F3F3F6',

  text: '#1C1C22',
  textPrimary: '#1C1C22',  // 兼容
  textSecondary: '#6E6E79',
  textTertiary: '#9A9AA4',
  textOnPrimary: '#FFFFFF',

  error: '#DC2B2B',
  success: '#0A8754',

  border: '#E4E4EC',
  divider: '#F0F0F4',
  outline: '#D0D0D8',

  tabActive: '#DC4270',
  tabInactive: '#B4B4C0',
  tabBar: '#FAFAFB',
  tabBarBorder: '#E4E4EC',

  // 旧代码兼容
  surfaceLowest: '#FFFFFF',
  surfaceContainerLow: '#F8F8FA',
  surfaceVariant: '#F3F3F6',
  shadow: '#1C1C22',
} as const;

export const Radius = {
  xs: 4, sm: 6, md: 10, lg: 16, xl: 24,
  chip: 8, button: 10, card: 6, full: 999,
} as const;

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 20, xl: 32,
  marginEdge: 12, gutter: 6,
} as const;

export const FontSize = {
  caption: 11, label: 12, body: 13, bodyLarge: 15,
  headline: 17, title: 20, largeTitle: 26,
} as const;

export const Shadow = {
  card: { shadowColor: '#1C1C22', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
} as const;

export const Touch = { min: 44 } as const;
