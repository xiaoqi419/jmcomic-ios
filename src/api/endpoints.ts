// 禁漫天堂 API 封装 — 完整 25+ 端点（从 APK 源码提取）
// @author nyx

import { apiClient, setGlobalAvs } from './client';
import { decryptAndParse, nowTs, generateToken } from './crypto';
import type {
  ApiResponse, SettingData, PromoteItem, LatestItem,
  SearchData, MoreListData, AlbumDetail, ComicReadData,
  CommentItem, CommentReply, FavoriteData, FavoriteFolder,
  LoginData, MemberData, SignData, AchievementData,
  MovieItem, VideoDetailData,
  NovelItem, NovelChapter, NovelContent,
  BlogItem, ForumPost, GameItem, GameData,
  NotificationItem,
} from './types';

// ===================== 通用 =====================

async function encryptedGet<T>(path: string, q?: Record<string, string | number>): Promise<T> {
  const ts = nowTs();
  const data = await apiClient.get<string>(path, q);
  return decryptAndParse<T>(ts, data);
}

async function encryptedPost<T>(path: string, f?: Record<string, string | number>): Promise<T> {
  const ts = nowTs();
  const data = await apiClient.post<string>(path, f);
  return decryptAndParse<T>(ts, data);
}

// ===================== 配置 =====================

export async function fetchSetting(): Promise<SettingData> {
  // 尝试加密 API → 降级明文
  try {
    return await encryptedGet<SettingData>('/api/setting');
  } catch {}
  const res = await apiClient.getWeb('/api/setting');
  return JSON.parse(res).data;
}

// ===================== 首页 =====================

export async function fetchMainPromote(): Promise<PromoteItem[]> {
  return encryptedGet<PromoteItem[]>('/api/promote');
}

export async function fetchLatest(page = 1): Promise<LatestItem[]> {
  return encryptedGet<LatestItem[]>('/api/latest', { page });
}

export async function fetchWeekData(): Promise<{
  categories: { id: string; title: string; time: string }[];
  type: { id: string; title: string }[];
}> {
  return encryptedGet('/api/week');
}

// ===================== 横幅广告 =====================

export async function fetchBanners(): Promise<{ adv: { link: string; image: string; adv_type: number }[] }> {
  return encryptedGet('/api/banner');
}

// ===================== 搜索 =====================

export async function searchComics(params: {
  search_query: string;
  page?: number;
  o?: string;
}): Promise<SearchData> {
  return encryptedGet<SearchData>('/api/search', {
    search_query: params.search_query,
    page: params.page || 1,
    o: params.o || 'tf',
  });
}

export async function fetchHotTags(): Promise<{ name: string; value: string }[]> {
  return encryptedGet('/api/hot_tags');
}

export async function fetchRandomRecommend(): Promise<ComicItem[]> {
  return encryptedGet('/api/random_recommend');
}

// ===================== 分类 =====================

export async function fetchMoreList(id: string, page = 1): Promise<MoreListData> {
  return encryptedGet<MoreListData>('/api/more_list', { id, page });
}

// ===================== 漫画详情 =====================

export async function fetchAlbumDetail(albumId: string): Promise<AlbumDetail> {
  return encryptedGet<AlbumDetail>('/api/detail', { id: albumId });
}

export async function fetchComicRead(chapterId: string): Promise<ComicReadData> {
  return encryptedGet<ComicReadData>('/api/comic_read', { id: chapterId });
}

export async function fetchScrambleId(photoId: string | number): Promise<number> {
  try {
    const ts = nowTs();
    const { token, tokenparam } = generateToken(ts, true);
    const resp = await fetch(
      `https://18comic.vip/api/chapter_view_template?id=${photoId}&v=${ts}&mode=vertical&page=0&app_img_shunt=1&express=off`,
      { headers: { token, tokenparam, 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)' } },
    );
    const text = await resp.text();
    const match = text.match(/var scramble_id\s*=\s*(\d+);/);
    if (match) return parseInt(match[1], 10);
  } catch {}
  return 220980;
}

// ===================== 购买/去码 =====================

export async function buyAlbum(albumId: string): Promise<{ status: string; msg: string }> {
  return encryptedPost('/api/coin_buy', { id: albumId });
}

// ===================== 评论 =====================

export async function fetchComments(albumId: string, page = 1, mode = 'manhua'): Promise<{
  list: CommentItem[];
  total: string;
}> {
  return encryptedGet('/api/forum', { mode, aid: albumId, page });
}

export async function postComment(albumId: string, content: string): Promise<any> {
  return encryptedPost('/api/comment', { video_id: albumId, comment: content, status: 'true' });
}

// ===================== 收藏 =====================

export async function fetchFavorites(params: {
  page?: number;
  o?: string;
  folder_id?: string;
} = {}): Promise<FavoriteData> {
  return encryptedGet<FavoriteData>('/api/favorite', {
    page: params.page || 1,
    o: params.o || 'mr',
    folder_id: params.folder_id || '0',
  });
}

export async function toggleFavorite(albumId: string): Promise<any> {
  return encryptedGet('/api/favorite', { aid: Number(albumId) });
}

export async function createFolder(name: string): Promise<any> {
  return encryptedPost('/api/favorite_folder', { name });
}

// ===================== 用户 =====================

export async function login(username: string, password: string): Promise<LoginData> {
  const data = await encryptedPost<LoginData>('/api/login', { username, password });
  if (data.s) {
    apiClient.setAvs(data.s);
    setGlobalAvs(data.s);
  }
  return data;
}

export async function register(params: {
  username: string;
  password: string;
  password_confirm: string;
  email: string;
  gender: string;
  adult: boolean;
}): Promise<any> {
  return encryptedPost('/api/sign_up', params as any);
}

export async function forgotPassword(email: string): Promise<any> {
  return encryptedPost('/api/forgot', { email });
}

// ===================== 会员 =====================

export async function fetchMemberInfo(): Promise<MemberData> {
  return encryptedGet<MemberData>('/api/member');
}

export async function fetchSignData(): Promise<SignData> {
  return encryptedGet<SignData>('/api/sign');
}

export async function doSign(): Promise<SignData> {
  return encryptedPost<SignData>('/api/sign');
}

export async function fetchAchievements(): Promise<AchievementData[]> {
  return encryptedGet<AchievementData[]>('/api/achievement');
}

export async function fetchNotifications(page = 1): Promise<{
  list: NotificationItem[];
  total: string;
  unread: { comic_follow: number; site_notice: number };
}> {
  return encryptedGet('/api/notification', { page });
}

// ===================== 视频 =====================

export async function fetchMovies(params: {
  page?: number;
  videoType?: string;
  searchQuery?: string;
} = {}): Promise<{ list: MovieItem[]; total: string }> {
  return encryptedGet('/api/movie', {
    page: params.page || 1,
    video_type: params.videoType || '',
    search_query: params.searchQuery || '',
  });
}

export async function fetchLatestHanime(): Promise<{ id: string; photo: string; title: string }[]> {
  return encryptedGet('/api/latest_hanime');
}

export async function fetchVideoDetail(vid: string): Promise<VideoDetailData> {
  return encryptedGet<VideoDetailData>('/api/video_detail', { vid });
}

// ===================== 小说 =====================

export async function fetchNovels(page = 1): Promise<{ list: NovelItem[]; total: string }> {
  return encryptedGet('/api/novel', { page });
}

export async function fetchNovelDetail(novelId: string): Promise<{
  novel: NovelItem;
  chapters: NovelChapter[];
}> {
  return encryptedGet('/api/novel_detail', { id: novelId });
}

export async function fetchNovelContent(chapterId: string): Promise<NovelContent> {
  return encryptedGet<NovelContent>('/api/novel_content', { id: chapterId });
}

// ===================== 博客 =====================

export async function fetchBlogs(page = 1): Promise<{ list: BlogItem[]; total: string }> {
  return encryptedGet('/api/blog', { page });
}

export async function fetchBlogDetail(blogId: string): Promise<{
  blog: BlogItem;
  content: string;
  related_comics: ComicItem[];
  related_blogs: BlogItem[];
}> {
  return encryptedGet('/api/blog_detail', { id: blogId });
}

// ===================== 论坛 =====================

export async function fetchForumPosts(page = 1): Promise<{ list: ForumPost[]; total: string }> {
  return encryptedGet('/api/forum', { mode: 'forum', page });
}

// ===================== 游戏 =====================

export async function fetchGames(): Promise<GameData> {
  return encryptedGet<GameData>('/api/game');
}

// ===================== 下载 =====================

export async function fetchDownloadInfo(albumId: string): Promise<{
  download_url: string;
  quality: string;
  size: string;
}> {
  return encryptedGet('/api/download', { id: albumId });
}

// ===================== 图片 URL 工具（动态域名） =====================

/** 获取当前图片 CDN 域名（从 /api/setting 动态获取） */
export function getImgHost(): string {
  return apiClient.getImgHost();
}

/** 获取当前 API 主域名 */
export function getMainHost(): string {
  return apiClient.getMainHost();
}

export function getCoverUrl(albumId: string, host?: string): string {
  const h = host || apiClient.getImgHost();
  return `https://${h}/media/albums/${albumId}_3x4.jpg`;
}

export function getChapterImageUrl(chapterId: string, pageNum: number, host?: string): string {
  const h = host || apiClient.getImgHost();
  return `https://${h}/media/photos/${chapterId}/${String(pageNum).padStart(5, '0')}.jpg`;
}

export function getPhotoUrl(chapterId: string, filename: string, host?: string): string {
  const h = host || apiClient.getImgHost();
  return `https://${h}/media/photos/${chapterId}/${filename}`;
}


