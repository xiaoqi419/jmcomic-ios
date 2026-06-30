// 收藏管理 — 本地 + 在线同步
// @author nyx

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FavoriteItem, FavoriteFolder } from '../api/types';
import { fetchFavorites, toggleFavorite as apiToggle, createFolder as apiCreateFolder, deleteFolder as apiDeleteFolder, renameFolder as apiRenameFolder, moveToFolder as apiMoveToFolder } from '../api/endpoints';

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
  createFolder: (name: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  renameFolder: (folderId: string, name: string) => Promise<void>;
  moveToFolder: (folderId: string, albumId: string) => Promise<void>;
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

  createFolder: async (name) => {
    try {
      await apiCreateFolder(name);
      const { folders } = get();
      set({ folders: [...folders, { folder_id: String(Date.now()), name, count: '0' }] });
      await get().loadOnline();
    } catch {}
  },

  deleteFolder: async (folderId) => {
    try {
      await apiDeleteFolder(folderId);
      set({ folders: get().folders.filter((f) => f.folder_id !== folderId) });
    } catch {}
  },

  renameFolder: async (folderId, name) => {
    try {
      await apiRenameFolder(folderId, name);
      set({ folders: get().folders.map((f) => f.folder_id === folderId ? { ...f, name } : f) });
    } catch {}
  },

  moveToFolder: async (folderId, albumId) => {
    try {
      await apiMoveToFolder(folderId, albumId);
    } catch {}
  },
}));
