// JMComic - 简洁暖色设计主题
// Flat Design + 44px touch targets + 无障碍对比度
// @author Jason

export const Colors = {
  primary: '#DB2777',           // 粉玫红主色
  primaryLight: '#F472B6',
  primaryDark: '#9D174D',
  accent: '#F97316',            // 橙色强调整

  background: '#FFFBFC',        // 暖白背景
  surface: '#FFFFFF',
  surfaceLowest: '#FFFFFF',
  surfaceVariant: '#FFF5F6',
  surfaceContainer: '#FFF0F2',
  surfaceContainerLow: '#FFF5F6',

  textPrimary: '#1A1118',       // 近黑文字
  textSecondary: '#6B4B59',     // 灰褐次要
  textTertiary: '#9E7B89',      // 浅灰褐辅助
  textOnPrimary: '#FFFFFF',

  error: '#DC2626',
  success: '#059669',
  divider: '#F6E8ED',
  border: '#EBD5DD',
  outline: '#D4B7C3',

  tabActive: '#DB2777',
  tabInactive: '#C4A6B1',
  tabBar: '#FFFBFC',
  tabBarBorder: '#F6E8ED',

  shadow: '#1A1118',
} as const;

// 44px 最小触控目标 (iOS HIG)
export const Touch = { min: 44 } as const;

export const Radius = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24,
  chip: 6, button: 10, card: 6,
} as const;

export const Spacing = {
  xs: 4, sm: 6, md: 12, lg: 20, xl: 32,
  gutter: 6, marginEdge: 10,
} as const;

export const FontSize = {
  caption: 11, label: 12, body: 13, bodyLarge: 15,
  headline: 17, title: 20, largeTitle: 26,
} as const;

// Flat Design — 极淡阴影
export const Shadow = {
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
} as const;
