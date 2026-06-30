// Pica 数据模型
// @author Jason

export interface PicaResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PicaComics {
  docs: PicaComic[];
  total: number;
  limit: number;
  page: number;
  pages: number;
}

export interface PicaComic {
  _id: string;
  title: string;
  author: string;
  description?: string;
  thumb: PicaThumb;
  categories: string[];
  tags: string[];
  pagesCount: number;
  epsCount: number;
  finished: boolean;
  totalViews: number;
  totalLikes: number;
  likesCount: number;
  updated_at: string;
  created_at: string;
  _creator?: PicaCreator;
  chineseTeam?: string;
  allowDownload?: boolean;
  allowComment?: boolean;
  isFavourite?: boolean;
  isLiked?: boolean;
}

export interface PicaThumb {
  path: string;
  fileServer: string;
  originalName?: string;
}

export interface PicaCreator {
  _id: string;
  name: string;
  gender: string;
  exp: number;
  level: number;
  role: string;
  title: string;
  avatar?: PicaThumb;
  characters: string[];
  slogan?: string;
}

export interface PicaChapter {
  _id: string;
  id: string;
  title: string;
  order: number;
  updated_at: string;
}

export interface PicaChapterImage {
  _id: string;
  id?: string;
  media: PicaThumb;
}

export interface PicaUser {
  _id: string;
  name: string;
  email: string;
  gender: string;
  slogan: string;
  title: string;
  verified: boolean;
  exp: number;
  level: number;
  avatar?: PicaThumb;
  isPunched: boolean;
  characters: string[];
  created_at: string;
}

export function thumbUrl(t: PicaThumb): string {
  const base = t.fileServer.includes('static')
    ? `${t.fileServer}/${t.path}`
    : `${t.fileServer}/static/${t.path}`;
  return base.replace('picacomic', 'go2778');
}
