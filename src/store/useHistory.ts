// 阅读历史 — 本地存储
// @author Jason

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HistoryItem {
  id: string;
  title: string;
  coverUrl: string;
  chapterId: string;
  chapterTitle: string;
  page: number;
  readAt: number;
}

interface HistoryState {
  items: HistoryItem[];
  addHistory: (item: HistoryItem) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadHistory: () => Promise<void>;
}

const KEY = '@jmcomic.history';

export const useHistoryStore = create<HistoryState>((set, get) => ({
  items: [],

  addHistory: async (item) => {
    let items = [...get().items];
    // 去重
    items = items.filter(i => i.id !== item.id);
    items.unshift(item);
    // 最多保留 50 条
    if (items.length > 50) items = items.slice(0, 50);
    set({ items });
    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  },

  clearHistory: async () => {
    set({ items: [] });
    await AsyncStorage.removeItem(KEY);
  },

  loadHistory: async () => {
    try {
      const json = await AsyncStorage.getItem(KEY);
      if (json) set({ items: JSON.parse(json) });
    } catch {}
  },
}));
