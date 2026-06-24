// 设置存储
// @author Jason

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ServerInfo } from '../utils/serverDetect';

interface SettingsState {
  readingDirection: 'ltr' | 'rtl';
  readingMode: 'scroll' | 'page';
  imageDomainIndex: number;
  username: string;
  darkMode: boolean;
  /** 当前选中的 API 服务器 */
  selectedServer: string;
  /** 是否自动选择最快服务器 */
  autoSelectServer: boolean;
  /** 所有可用的服务器列表 */
  servers: ServerInfo[];
  /** 正在检测服务器 */
  detectingServers: boolean;

  setReadingDirection: (d: 'ltr' | 'rtl') => void;
  setReadingMode: (m: 'scroll' | 'page') => void;
  setImageDomainIndex: (i: number) => void;
  setUsername: (name: string) => void;
  setDarkMode: (v: boolean) => void;
  setSelectedServer: (domain: string) => void;
  setAutoSelectServer: (v: boolean) => void;
  setServers: (servers: ServerInfo[]) => void;
  setDetectingServers: (v: boolean) => void;
  loadSettings: () => Promise<void>;
}

const SETTINGS_KEY = '@jmcomic.settings';

const defaultSettings = {
  readingDirection: 'ltr' as const,
  readingMode: 'scroll' as const,
  imageDomainIndex: 0,
  username: '',
  darkMode: false,
  selectedServer: '',
  autoSelectServer: true,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  ...defaultSettings,
  servers: [],
  detectingServers: false,

  setReadingDirection: (v) => set({ readingDirection: v }),
  setReadingMode: (v) => set({ readingMode: v }),
  setImageDomainIndex: (v) => set({ imageDomainIndex: v }),
  setUsername: (v) => set({ username: v }),
  setDarkMode: (v) => set({ darkMode: v }),
  setSelectedServer: (v) => set({ selectedServer: v }),
  setAutoSelectServer: (v) => set({ autoSelectServer: v }),
  setServers: (v) => set({ servers: v }),
  setDetectingServers: (v) => set({ detectingServers: v }),

  loadSettings: async () => {
    try {
      const json = await AsyncStorage.getItem(SETTINGS_KEY);
      if (json) {
        const saved = JSON.parse(json);
        set({ ...defaultSettings, ...saved });
      }
    } catch {}
  },
}));

export async function saveSettings(settings: Partial<SettingsState>): Promise<void> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    const current = json ? JSON.parse(json) : {};
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
  } catch {}
}
