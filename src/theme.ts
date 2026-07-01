// JOYComic — 主题导出（向后兼容 v2）
// 新代码请使用 ThemeProvider + useAppTheme() 获取动态主题色
// @author nyx

export { lightColors, darkColors, lightExtended, darkExtended } from './theme/colors';
export type { ColorTokens, ColorFamily, ExtendedColorTokens, ThemeColors } from './theme/colors';
export { ThemeProvider, useAppTheme } from './theme/ThemeProvider';
export type { ThemeMode, ThemeContextValue } from './theme/ThemeProvider';

// ============ 设计令牌（不变） ============

export const Radius = {
  xs: 6, sm: 10, md: 14, lg: 20, xl: 30,
  chip: 12, button: 16, card: 14, full: 999,
};

export const Spacing = {
  xs: 4, sm: 8, md: 14, lg: 24, xl: 36,
  marginEdge: 16, gutter: 10,
};

export const FontSize = {
  caption: 11, label: 13, body: 14, bodyLarge: 16,
  headline: 18, title: 22, largeTitle: 28,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};

// 向后兼容：原来的 Colors 对象（深色主题）
// 推荐改用 useAppTheme() 获取动态色板
import { darkColors } from './theme/colors';
export const Colors = darkColors;
