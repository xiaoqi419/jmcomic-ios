// 主题提供者 — 读取 settings store 的 theme 偏好，注入当前色板
// 支持 auto / light / dark 三种模式，auto 跟随系统
// @author nyx

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, lightExtended, darkExtended, buildLegacyColors } from './colors';
import type { ColorTokens, ExtendedColorTokens, LegacyColors } from './colors';

export type ThemeMode = 'auto' | 'light' | 'dark';

export interface ThemeContextValue {
  /** 当前实际生效的模式（枚举值，auto 已解析） */
  resolvedScheme: 'light' | 'dark';
  /** 用户偏好设置 */
  themeMode: ThemeMode;
  /** Material 3 色板 */
  colors: ColorTokens;
  /** 扩展色族（标签系统用） */
  extended: ExtendedColorTokens;
  /** 向后兼容旧属性名的色板（textPrimary/border 等） */
  legacyColors: LegacyColors;
}

const darkLegacy = buildLegacyColors(darkColors);
const ThemeContext = createContext<ThemeContextValue>({
  resolvedScheme: 'dark',
  themeMode: 'dark',
  colors: darkColors,
  extended: darkExtended,
  legacyColors: darkLegacy,
});

interface ThemeProviderProps {
  themeMode: ThemeMode;
  children: React.ReactNode;
}

export function ThemeProvider({ themeMode, children }: ThemeProviderProps) {
  const systemScheme = useColorScheme() ?? 'dark';
  const resolvedScheme: 'light' | 'dark' =
    themeMode === 'auto' ? systemScheme : themeMode;

  const value = useMemo<ThemeContextValue>(() => {
    const colors = resolvedScheme === 'light' ? lightColors : darkColors;
    return {
      resolvedScheme,
      themeMode,
      colors,
      extended: resolvedScheme === 'light' ? lightExtended : darkExtended,
      legacyColors: buildLegacyColors(colors),
    };
  }, [resolvedScheme, themeMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/** 获取向后兼容的 Colors 对象（含 textPrimary/border 等旧名） */
export function useLegacyColors(): LegacyColors {
  return useAppTheme().legacyColors;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return ctx;
}
