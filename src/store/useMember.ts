// 会员状态 — 签到/成就/通知
// @author nyx

import { create } from 'zustand';
import type { MemberData, SignData, AchievementData, NotificationItem } from '../api/types';
import {
  fetchMemberInfo, fetchSignData, doSign,
  fetchAchievements, fetchNotifications,
} from '../api/endpoints';

interface MemberState {
  info: MemberData | null;
  signData: SignData | null;
  signed: boolean;
  achievements: AchievementData[];
  notifications: NotificationItem[];
  unread: { comic_follow: number; site_notice: number };
  notifTotal: number;
  loading: boolean;

  loadInfo: () => Promise<void>;
  loadSign: () => Promise<void>;
  doSignIn: () => Promise<SignData>;
  loadAchievements: () => Promise<void>;
  loadNotifications: (page?: number) => Promise<void>;
}

export const useMemberStore = create<MemberState>((set) => ({
  info: null,
  signData: null,
  signed: false,
  achievements: [],
  notifications: [],
  unread: { comic_follow: 0, site_notice: 0 },
  notifTotal: 0,
  loading: false,

  loadInfo: async () => {
    try {
      const info = await fetchMemberInfo();
      set({ info });
    } catch {}
  },

  loadSign: async () => {
    try {
      const signData = await fetchSignData();
      set({ signData, signed: true });
    } catch { set({ signed: false }); }
  },

  doSignIn: async () => {
    const data = await doSign();
    set({ signData: data, signed: true });
    return data;
  },

  loadAchievements: async () => {
    try {
      const achievements = await fetchAchievements();
      set({ achievements });
    } catch {}
  },

  loadNotifications: async (page = 1) => {
    set({ loading: true });
    try {
      const data = await fetchNotifications(page);
      set({
        notifications: data.list || [],
        unread: data.unread || { comic_follow: 0, site_notice: 0 },
        notifTotal: parseInt(data.total) || 0,
      });
    } catch {}
    set({ loading: false });
  },
}));
