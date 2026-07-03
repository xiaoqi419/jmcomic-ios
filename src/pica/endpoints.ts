// Pica — 所有 API 端点
// 参考 PicaComic (https://github.com/Pacalini/PicaComic) 实现
// @author Jason

import { picaClient as c } from './client';
import type {
  PicaResponse,
  PicaComicsData,
  PicaComicData,
  PicaEpsData,
  PicaPagesData,
  PicaUser,
  PicaCategoriesData,
} from './types';

const PAGE_LIMIT = 20;

// POST /auth/sign-in — 登录
export function login(username: string, password: string) {
  return c.post<{ token: string }>('auth/sign-in', { email: username, password });
}

// POST /comics/advanced-search — 搜索（注意：Pica 搜索是 POST，不是 GET）
export function searchComics(keyword: string, page = 1, sort = 'ua') {
  return c.post<PicaComicsData>(`comics/advanced-search?page=${page}`, {
    keyword,
    sort,
  });
}

// GET /comics/:id — 漫画详情
export function comicDetail(id: string) {
  return c.get<PicaComicData>(`comics/${id}`);
}

// GET /comics/:id/eps?page= — 章节列表
export function comicEps(id: string, page = 1) {
  return c.get<PicaEpsData>(`comics/${id}/eps`, { page });
}

// GET /comics/:id/order/:order/pages?page= — 章节图片
export function epPages(comicId: string, order: number, page = 1) {
  return c.get<PicaPagesData>(`comics/${comicId}/order/${order}/pages`, { page });
}

// GET /categories — 分类列表
export function picaCategories() {
  return c.get<PicaCategoriesData>('categories');
}

// GET /comics — 分类筛选
export function comicsByCategory(category: string, page = 1, sort: 'ua' | 'dd' | 'da' | 'ld' = 'ua') {
  return c.get<PicaComicsData>('comics', {
    c: category,
    page,
    s: sort,
  });
}

// GET /comics?ca=CREATOR_ID — 创作者/上传者的漫画
export function comicsByCreator(creatorId: string, page = 1, sort: 'ua' | 'dd' | 'da' | 'ld' = 'ua') {
  return c.get<PicaComicsData>('comics', {
    ca: creatorId,
    page,
    s: sort,
  });
}

// GET /users/profile — 用户信息
export function userProfile() {
  return c.get<PicaUser>('users/profile');
}

// GET /users/favourite — 漫画收藏
export function myFavourites(page = 1) {
  return c.get<PicaComicsData>('users/favourite', { page });
}

// GET /users/likes — 喜欢列表
export function myLikes(page = 1) {
  return c.get<PicaComicsData>('users/likes', { page });
}

// GET /comics/leaderboard — 排行榜
export function leaderboard(tt: 'H24' | 'D7' | 'D30' = 'H24', page = 1) {
  return c.get<PicaComicsData>('comics/leaderboard', { tt, page });
}

// GET /comics/:id/recommendation — 相关推荐
export function recommendation(id: string) {
  return c.get<{ comics: any[] }>(`comics/${id}/recommendation`);
}

// POST /comics/:id/like — 点赞/取消点赞
export function likeComic(id: string) {
  return c.post(`comics/${id}/like`, {});
}

// POST /comics/:id/favourite — 收藏/取消收藏
export function favouriteComic(id: string) {
  return c.post(`comics/${id}/favourite`, {});
}

// POST /users/punch-in — 签到
export function punchIn() {
  return c.post('users/punch-in', null);
}

// ===== Pica 评论系统 =====

// GET /comics/:id/comments?page= — 获取评论
export function comicComments(comicId: string, page = 1) {
  return c.get(`comics/${comicId}/comments`, { page });
}

// POST /comics/:id/comments — 发表评论
export function sendComment(comicId: string, content: string) {
  return c.post(`comics/${comicId}/comments`, { content });
}

// POST /comments/:id/like — 点赞评论
export function likeComment(commentId: string) {
  return c.post(`comments/${commentId}/like`, {});
}

// GET /comments/:id/childrens?page= — 获取子评论（回复）
export function commentChildrens(commentId: string, page = 1) {
  return c.get(`comments/${commentId}/childrens`, { page });
}

// POST /comments/:id — 回复评论
export function replyComment(commentId: string, content: string) {
  return c.post(`comments/${commentId}`, { content });
}

// ===== 个人资料 =====

// PUT /users/profile — 修改签名
export function updateProfile(slogan: string) {
  return c.put('users/profile', { slogan });
}

// PUT /users/avatar — 上传头像
export function updateAvatar(base64: string) {
  return c.put('users/avatar', { avatar: `data:image/jpeg;base64,${base64}` });
}

// PUT /users/password — 修改密码
export function changePassword(oldPwd: string, newPwd: string) {
  return c.put('users/password', { old_password: oldPwd, new_password: newPwd });
}

// ===== 其他 =====

// GET /comics/random — 随机漫画
export function randomComics() {
  return c.get<PicaComicsData>('comics/random');
}

// GET /comics/knight-leaderboard — 骑士榜
export function knightLeaderboard() {
  return c.get<PicaComicsData>('comics/knight-leaderboard');
}

// GET /users/my-comments?page= — 我的评论历史
export function myComments(page = 1) {
  return c.get('users/my-comments', { page });
}

// GET /keywords — 热搜词
export function picaHotSearchWords() {
  return c.get('keywords');
}
