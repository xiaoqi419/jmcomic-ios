// JMComic iOS — 暖琥珀暗色主题
// @author nyx

export const Colors = {
  // 主色 — Tailwind Amber
  primary: '#F59E0B',
  primaryLight: '#FDE68A',
  primaryDark: '#D97706',

  accent: '#EF4444',

  // 背景层级
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceLight: '#262626',
  surfaceContainer: '#2B2B2B',

  // 文字
  text: '#FAFAF9',
  textPrimary: '#FAFAF9',
  textSecondary: '#A8A29E',
  textTertiary: '#78716C',
  textOnPrimary: '#1C1917',

  // 功能色
  error: '#DC2626',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#38BDF8',

  // 边框
  border: '#292524',
  divider: '#1C1917',
  outline: '#44403C',

  // Tab
  tabActive: '#F59E0B',
  tabInactive: '#57534E',
  tabBar: '#0A0A0A',
  tabBarBorder: '#1C1917',

  surfaceLowest: '#1A1A1A',
  surfaceContainerLow: '#262626',
  surfaceVariant: '#292524',
  shadow: '#000000',
};

export const Radius = {
  xs: 4, sm: 8, md: 12, lg: 18, xl: 28,
  chip: 10, button: 14, card: 12, full: 999,
};

export const Spacing = {
  xs: 4, sm: 8, md: 14, lg: 22, xl: 34,
  marginEdge: 14, gutter: 8,
};

export const FontSize = {
  caption: 11, label: 12, body: 13, bodyLarge: 15,
  headline: 17, title: 20, largeTitle: 26,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
};
