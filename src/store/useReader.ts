// 阅读器状态管理
// @author nyx

import { create } from 'zustand';

interface ReaderState {
  albumId: string;
  chapterId: string;
  chapterTitle: string;
  imageUrls: string[];
  currentPage: number;
  direction: 'ltr' | 'rtl';
  isVertical: boolean;

  startReading: (albumId: string, chapterId: string, chapterTitle: string, images: string[]) => void;
  setPage: (p: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setVertical: (v: boolean) => void;
  clear: () => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  albumId: '',
  chapterId: '',
  chapterTitle: '',
  imageUrls: [],
  currentPage: 0,
  direction: 'ltr',
  isVertical: true,

  startReading: (albumId, chapterId, chapterTitle, images) => {
    set({ albumId, chapterId, chapterTitle, imageUrls: images, currentPage: 0 });
  },

  setPage: (p) => {
    const { imageUrls } = get();
    if (p >= 0 && p < imageUrls.length) set({ currentPage: p });
  },

  nextPage: () => {
    const { currentPage, imageUrls } = get();
    if (currentPage < imageUrls.length - 1) set({ currentPage: currentPage + 1 });
  },

  prevPage: () => {
    const { currentPage } = get();
    if (currentPage > 0) set({ currentPage: currentPage - 1 });
  },

  setVertical: (v) => set({ isVertical: v }),

  clear: () => {
    set({ albumId: '', chapterId: '', chapterTitle: '', imageUrls: [], currentPage: 0 });
  },
}));
