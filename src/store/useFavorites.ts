// 收藏管理 — 本地 + 在线同步
// @author nyx

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FavoriteItem, FavoriteFolder } from '../api/types';
import { fetchFavorites, toggleFavorite as apiToggle } from '../api/endpoints';

interface LocalFav {
  id: string;
  title: string;
  coverUrl: string;
  author: string;
  addedAt: number;
}

interface FavoritesState {
  local: LocalFav[];
  online: FavoriteItem[];
  folders: FavoriteFolder[];
  total: number;
  loading: boolean;

  loadLocal: () => Promise<void>;
  addLocal: (item: LocalFav) => Promise<void>;
  removeLocal: (id: string) => Promise<void>;
  isFav: (id: string) => boolean;
  loadOnline: (page?: number, folderId?: string) => Promise<void>;
  toggle: (albumId: string) => Promise<boolean>;
}

const KEY = '@jmcomic.fav';

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  local: [],
  online: [],
  folders: [],
  total: 0,
  loading: false,

  loadLocal: async () => {
    try {
      const json = await AsyncStorage.getItem(KEY);
      if (json) set({ local: JSON.parse(json) });
    } catch {}
  },

  addLocal: async (item) => {
    const local = [...get().local, item];
    set({ local });
    await AsyncStorage.setItem(KEY, JSON.stringify(local));
  },

  removeLocal: async (id) => {
    const local = get().local.filter((f) => f.id !== id);
    set({ local });
    await AsyncStorage.setItem(KEY, JSON.stringify(local));
  },

  isFav: (id) => get().local.some((f) => f.id === id),

  loadOnline: async (page = 1, folderId = '0') => {
    set({ loading: true });
    try {
      const data = await fetchFavorites({ page, folder_id: folderId });
      set({ online: data.list || [], folders: data.folder_list || [], total: parseInt(data.total) || 0 });
    } catch {}
    set({ loading: false });
  },

  toggle: async (albumId) => {
    try {
      await apiToggle(albumId);
      return true;
    } catch { return false; }
  },
}));
