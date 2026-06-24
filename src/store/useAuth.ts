// 用户认证存储 — 统一管理登录状态
// @author Jason

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  username: string;
  avs: string;
  photo: string;
  loggedIn: boolean;

  login: (username: string, avs: string, photo: string) => Promise<void>;
  logout: () => Promise<void>;
  load: () => Promise<void>;
}

const AUTH_KEY = '@jmcomic.auth';

export const useAuthStore = create<AuthState>((set) => ({
  username: '',
  avs: '',
  photo: '',
  loggedIn: false,

  login: async (username, avs, photo) => {
    set({ username, avs, photo, loggedIn: true });
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ username, avs, photo }));
  },

  logout: async () => {
    set({ username: '', avs: '', photo: '', loggedIn: false });
    await AsyncStorage.removeItem(AUTH_KEY);
  },

  load: async () => {
    try {
      const json = await AsyncStorage.getItem(AUTH_KEY);
      if (json) {
        const data = JSON.parse(json);
        set({ username: data.username || '', avs: data.avs || '', photo: data.photo || '', loggedIn: !!data.avs });
      }
    } catch {}
  },
}));

export { AUTH_KEY };
