// Pica — 所有 API 端点
// @author Jason

import { picaClient as c } from './client';
import type {
  PicaComics,
  PicaComic,
  PicaChapter,
  PicaChapterImage,
  PicaUser,
} from './types';

const PAGE_LIMIT = 20;

// POST /auth/sign-in — 登录
export function login(username: string, password: string) {
  return c.post<{ token: string }>('auth/sign-in', { email: username, password });
}

// GET /comics — 搜索
export function searchComics(keyword: string, page = 1) {
  return c.get<PicaComics>('comics', {
    s: keyword,
    page,
    sort: 'ua',  // 默认按更新时间
  });
}

// GET /comics/:id — 漫画详情
export function comicDetail(id: string) {
  return c.get<PicaComic>(`comics/${id}`);
}

// GET /comics/:id/eps — 章节列表
export function comicEps(id: string, page = 1) {
  return c.get<{ docs: PicaChapter[]; total: number; page: number; pages: number }>(
    `comics/${id}/eps`,
    { page }
  );
}

// GET /eps/:epId/pages — 章节图片
export function epPages(epId: string, page = 1) {
  return c.get<{ docs: PicaChapterImage[]; total: number; page: number; pages: number }>(
    `eps/${epId}/pages`,
    { page }
  );
}

// GET /categories — 分类列表
export function categories() {
  return c.get<{ categories: { title: string; thumb: any }[] }>('categories');
}

// GET /comics — 分类筛选
export function comicsByCategory(category: string, page = 1, sort: 'ua' | 'dd' | 'da' | 'ld' = 'ua') {
  return c.get<PicaComics>('comics', {
    c: category,
    page,
    s: sort,
  });
}

// GET /users/profile — 用户信息
export function userProfile() {
  return c.get<PicaUser>('users/profile');
}

// 漫画收藏
export function myFavourites(page = 1) {
  return c.get<PicaComics>('users/favourite', { page });
}

// 喜欢列表
export function myLikes(page = 1) {
  return c.get<PicaComics>('users/likes', { page });
}

// 排行榜
export function leaderboard(tt: 'H24' | 'D7' | 'D30' = 'H24', page = 1) {
  return c.get<PicaComics>('comics/leaderboard', { tt, page });
}
