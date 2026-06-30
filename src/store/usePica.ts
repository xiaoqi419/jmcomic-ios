// Pica 认证存储
// @author Jason

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { picaClient } from '../pica/client';
import { login as picaLogin } from '../pica/endpoints';

interface PicaState {
  username: string;
  token: string;
  loggedIn: boolean;

  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  load: () => Promise<void>;
}

const KEY = '@pica.auth';

export const usePicaStore = create<PicaState>((set) => ({
  username: '',
  token: '',
  loggedIn: false,

  login: async (username, password) => {
    const res = await picaLogin(username, password);
    const token = res.token;
    picaClient.setToken(token);
    set({ username, token, loggedIn: true });
    await AsyncStorage.setItem(KEY, JSON.stringify({ username, token }));
  },

  logout: async () => {
    picaClient.setToken('');
    set({ username: '', token: '', loggedIn: false });
    await AsyncStorage.removeItem(KEY);
  },

  load: async () => {
    try {
      const json = await AsyncStorage.getItem(KEY);
      if (json) {
        const d = JSON.parse(json);
        if (d.token) {
          picaClient.setToken(d.token);
          set({ username: d.username || '', token: d.token, loggedIn: true });
        }
      }
    } catch {}
  },
}));
