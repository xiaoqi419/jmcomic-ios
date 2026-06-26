// 阅读历史
// @author nyx

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
  add: (item: HistoryItem) => Promise<void>;
  clear: () => Promise<void>;
  load: () => Promise<void>;
}

const KEY = '@jmcomic.history';

export const useHistoryStore = create<HistoryState>((set, get) => ({
  items: [],

  add: async (item) => {
    let items = get().items.filter((i) => i.id !== item.id);
    items.unshift(item);
    if (items.length > 100) items = items.slice(0, 100);
    set({ items });
    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  },

  clear: async () => {
    set({ items: [] });
    await AsyncStorage.removeItem(KEY);
  },

  load: async () => {
    try {
      const json = await AsyncStorage.getItem(KEY);
      if (json) set({ items: JSON.parse(json) });
    } catch {}
  },
}));
