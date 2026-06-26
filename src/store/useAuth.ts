// 用户认证存储
// @author nyx

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

interface AuthState {
  username: string;
  avs: string;
  photo: string;
  loggedIn: boolean;

  login: (username: string, avs: string, photo: string) => Promise<void>;
  logout: () => Promise<void>;
  load: () => Promise<void>;
}

const KEY = '@jmcomic.auth';

export const useAuthStore = create<AuthState>((set) => ({
  username: '',
  avs: '',
  photo: '',
  loggedIn: false,

  login: async (username, avs, photo) => {
    set({ username, avs, photo, loggedIn: true });
    apiClient.setAvs(avs);
    await AsyncStorage.setItem(KEY, JSON.stringify({ username, avs, photo }));
  },

  logout: async () => {
    set({ username: '', avs: '', photo: '', loggedIn: false });
    apiClient.setAvs('');
    await AsyncStorage.removeItem(KEY);
  },

  load: async () => {
    try {
      const json = await AsyncStorage.getItem(KEY);
      if (json) {
        const d = JSON.parse(json);
        if (d.avs) {
          apiClient.setAvs(d.avs);
          set({ username: d.username || '', avs: d.avs, photo: d.photo || '', loggedIn: true });
        }
      }
    } catch {}
  },
}));
