# JOYComic 技术设计文档

> 版本：1.0 | 最后更新：2026-07-09

## 一、架构总览

```
App.tsx (导航 + 全局错误捕获)
 └── Stack.Navigator (NativeStack)
      ├── Main (Tab.Navigator)
      │    ├── Home (MainScreen)
      │    ├── Categories (CategoriesScreen)
      │    ├── Search (SearchScreen)
      │    ├── Movies (MoviesScreen)
      │    └── Member (MemberScreen)
      ├── ComicDetail (ComicDetailScreen + ErrorBoundary)
      ├── PicaDetail (PicaDetailScreen + ErrorBoundary)
      ├── Reader (ReaderScreen + ErrorBoundary) ← JM + Pica 统一
      ├── Search (SearchScreen)
      ├── Library (LibraryScreen)
      ├── WeekRank (WeekRankScreen)
      ├── + 15 个子页面
      └── Modal Routes (评论/登录/注册/以图搜图等)
```

**核心设计原则**：
1. **双源统一抽象** — `sources/types.ts` 定义了 `ComicSource` 接口，JM 和 Pica 分别实现
2. **三明治架构** — `api`(基础设施) → `store`(状态) → `screens`(UI)
3. **日志全覆盖** — API 调用、渲染错误、未捕获异常全部自动记录

---

## 二、src/api/ — JMComic API 层

### 文件清单

| 文件 | 职责 |
|:-----|:------|
| `client.ts` | HTTP 客户端 — 自动重试(3次) + 域名切换 + AVS 认证 + 超时 15s |
| `crypto.ts` | 加密工具 — `generateToken()` (MD5) + `nowTs()` + `decryptData()` (AES-256-ECB) |
| `endpoints.ts` | 约 40 个 API 函数，按功能分类 |
| `types.ts` | JM API 响应类型定义 |

### HTTP 客户端 (`client.ts`)

```typescript
class ApiClient {
  domains: string[]     // CDN 域名列表
  domainIdx: number     // 当前域名索引
  avsToken: string      // 登录后的 AVS 认证 token
  request<T>(path, config, retry?): Promise<T>  // 核心请求方法
  setAvs(token)         // 设置 AVS token
  setImgHost(host)      // 设置图片域名
  getDomains()          // 获取域名列表
}
```

**请求流程**：
1. 构建请求 URL = `https://{domain}/{path}`
2. 生成 Token + TokenParam 放入请求头
3. 设置超时 15s（`AbortController`）
4. 发送 fetch 请求
5. 非 200 响应抛 `ApiError`（401 自动清除 AVS token）
6. 超时/失败 3 次内切换域名重试
7. 所有结果自动记录日志（成功→ok，失败→error）

### 核心 API 函数 (`endpoints.ts`)

| 分类 | 函数 | 路径 | 说明 |
|:-----|:-----|:-----|:------|
| **系统** | `fetchSetting()` | `GET /setting` | 获取配置（CDN 优先 + JM 回退） |
| | `fetchMainPromote()` | `GET /promote` | 首页轮播推荐 |
| | `getImgHost()` | — | 获取当前图片域名 |
| **漫画** | `fetchAlbumDetail(id)` | `GET /album/{id}` | 漫画详情 |
| | `fetchComicRead(albumId, epId)` | `GET /comic_read?album_id={}&ep_id={}` | 章节图片列表 |
| | `fetchLatest()` | `GET /latest` | 最新更新 |
| | `searchComics()` | `GET /search` | 搜索 |
| | `fetchCategories()` | `GET /categories` | 分类列表 |
| | `fetchCategoriesFilter()` | `GET /categories/filter` | 分类筛选（含子分类+排序） |
| | `fetchTags()` | `GET /tags` | 热门标签 |
| | `selectTag()` | `GET /select_tag` | 标签搜索 |
| | `fetchWeekData()` | `GET /week` | 周榜 |
| | `fetchWeekFilter()` | `GET /week/filter` | 周榜筛选 |
| **收藏** | `fetchFavorites()` | `GET /favorite` | 收藏列表 |
| | `toggleFavorite(albumId)` | `GET /favorite?aid=` | 切换收藏 |
| | `createFolder(name)` | `POST /favorite_folder` | 创建文件夹 |
| | `deleteFolder(id)` | `POST /favorite_folder_del` | 删除文件夹 |
| | `renameFolder(id, name)` | `POST /favorite_folder_name` | 重命名文件夹 |
| | `moveToFolder(id, fid)` | `POST /favorite_folder_move` | 移动到文件夹 |
| **评论** | `fetchComments(albumId, page)` | `GET /forum` | 评论列表 |
| | `postComment(albumId, content)` | `POST /comment` | 发布评论 |
| **用户** | `fetchForumPosts()` | `GET /forum_post` | 论坛帖子 |
| | `fetchUserProfile()` | `GET /member` | 用户信息 |
| | `fetchSign()` | `GET /sign` | 签到数据 |
| | `doSign()` | `POST /sign` | 签到 |
| | `fetchAchievements()` | `GET /achievement` | 成就 |
| | `fetchNotifications()` | `GET /notification` | 通知列表 |
| **其他** | `fetchGames()` | `GET /game` | 游戏 |
| | `fetchBlogs()` | `GET /blog` | 博客列表 |
| | `fetchBlogDetail(id)` | `GET /blog?nid=` | 博客详情 |
| | `fetchHotTags()` | `GET /hot_search` | 热搜标签 |
| | `fetchRandomRecommend()` | `GET /random_recommend` | 随机推荐 |
| | `buyAlbum(albumId)` | `POST /coin_buy_nc` | 购买漫画 |
| | `fetchMovies()` | `GET /video` | 视频列表 |
| | `fetchVideoDetail(id)` | `GET /video_detail` | 视频详情 |
| | `fetchMoreList(id)` | `GET /serialization` | 相关推荐 |

### 加密与认证

```
headers['Token'] = MD5("{timestamp}18comicAPP").substring(0, 8)
headers['Tokenparam'] = "{timestamp},2.0.13"
// 登录后:
headers['AVS'] = avsToken
```

### 响应解密

```typescript
// 加密响应格式: { code: 200, message: "success", data: "<AES加密的base64字符串>" }
// 解密: AES-256-ECB (PKCS7) → 密钥 = MD5(ts + "18comicAPP")
function decryptAndParse<T>(ts: number, encryptedBase64: string): T
```

---

## 三、src/pica/ — Pica API 层

### 文件清单

| 文件 | 职责 |
|:-----|:------|
| `client.ts` | HTTP 客户端 — API key + 签名 + 重试(3次)|
| `crypto.ts` | 签名工具 — `signPath()` (HMAC-SHA256) |
| `endpoints.ts` | 约 20 个 API 函数 |
| `types.ts` | Pica API 类型定义 |

### API 基础信息

```typescript
const API_HOSTS = {
  go2778: 'https://picaapi.go2778.com/',
  picacomic: 'https://picaapi.picacomic.com/',
};
const API_KEY = 'C69BAF41DA5ABD1FFEDC6D2FEA56B';
const SIGN_KEY = '~n}$iCX2N)R2G$FiJ2E$3Lc%$#!@';
```

### 签名算法

```typescript
// 所有 API 路径保留 query string，参与签名
const signStr = `${time}/${apiKey}/${nonce}/path?query` || `${time}/${apiKey}/${nonce}/path`
const signature = HMAC-SHA256(signStr, SIGN_KEY).toString('hex').toUpperCase()
```

### 核心 API 函数 (`endpoints.ts`)

| 分类 | 函数 | 路径 | 说明 |
|:-----|:-----|:-----|:------|
| **认证** | `picaLogin(email, password)` | `POST /auth/sign-in` | 登录 |
| | `punchIn()` | `POST /users/punch-in` | 签到 |
| **漫画** | `comicInfo(id)` | `GET /comics/{id}` | 漫画详情 |
| | `comicEps(id)` | `GET /comics/{id}/eps` | 章节列表 |
| | `comicPages(comicId, order)` | `GET /comics/{id}/order/{order}/pages` | 章节图片 |
| | `recommendation(id)` | `GET /comics/{id}/recommendation` | 相关推荐 |
| | `searchComics(keyword)` | `GET /comics/advanced-search` | 搜索 |
| | `comicsByCategory(category)` | `GET /comics?c=` | 分类过滤 |
| | `comicsByCreator(creatorId)` | `GET /comics?ca=` | 创作者漫画 |
| **交互** | `likeComic(id)` | `POST /comics/{id}/like` | 点赞/取消 |
| | `favouriteComic(id)` | `POST /comics/{id}/favourite` | 收藏/取消 |
| **收藏** | `myFavourites()` | `GET /users/favourite` | 我的收藏 |
| | `myLikes()` | `POST /users/favourite?s=` | 我的喜欢 |
| **评论** | `comicComments(comicId, page)` | `GET /comics/{id}/comments` | 评论列表 |
| | `sendComment(comicId, content)` | `POST /comics/{id}/comments` | 发布评论 |
| | `likeComment(commentId)` | `POST /comments/{id}/like` | 点赞评论 |
| | `replyComment(commentId, content)` | `POST /comments/{id}/reply` | 回复评论 |
| **分类** | `picaCategories()` | `GET /categories` | 分类列表 |
| **其他** | `userProfile()` | `GET /users/profile` | 用户信息 |

---

## 四、src/sources/ — 统一数据源抽象层

### ComicSource 接口 (`types.ts`)

```typescript
interface ComicSource {
  search(query: string, page: number, filters?): Promise<SearchResult>
  fetchDetail(id: string): Promise<SourceDetail>
  fetchChapters(detail: SourceDetail): Promise<SourceChapter[]>
  fetchImages(comicId: string, chapterOrder: number): Promise<{ url: string; index: number }[]>
}
```

| 实现 | SourceDetail 扩展字段 |
|:-----|:---------------------|
| JM (`sources/jm.ts` — 内联) | `scrambleId` |
| Pica (`sources/pica.ts`) | `isFavourite`, `isLiked`, `totalLikes`, `totalViews` |

### 聚合搜索 (`aggregateSearch`)

```typescript
async function aggregateSearch(query: string, page: number): Promise<{
  items: SourceItem[];   // 合并后的结果（JM + Pica 交替）
  total: number;
  redirect_aid?: number; // 纯数字 ID 命中时直接跳转
}>
```

---

## 五、src/store/ — Zustand 状态管理

### 7 个 Store 一览

| Store | 文件 | 核心状态 | 持久化 |
|:------|:-----|:---------|:-------|
| `useAuthStore` | `useAuth.ts` | `loggedIn`, `avs`, `username`, `photo` | ✅ AsyncStorage |
| `useSettingsStore` | `useSettings.ts` | `readingMode`, `theme`, `shunts`, `customConfigUrl` 等 ~30 个字段 | ✅ AsyncStorage |
| `useFavoritesStore` | `useFavorites.ts` | `local`, `online`, `folders` | ✅ AsyncStorage |
| `useHistoryStore` | `useHistory.ts` | `items` (最多 100 条) | ✅ AsyncStorage |
| `useReaderStore` | `useReader.ts` | `imageUrls`, `currentPage`, `isVertical`, `scrambleId` | ❌ 内存 |
| `usePicaStore` | `usePica.ts` | `token`, `loggedIn`, `apiSource` | ✅ AsyncStorage |
| `useMemberStore` | `useMember.ts` | `info`, `signData`, `achievements`, `notifications` | ❌ 每次加载 |

---

## 六、src/screens/ — 页面详情

### 页面清单（~25 个）

| 页面 | 文件 | 导航 | 核心功能 |
|:-----|:-----|:-----|:---------|
| 首页 | `MainScreen.tsx` | Tab Home | 轮播 / 快捷链接 / 继续阅读 / 最新更新 |
| 分类 | `CategoriesScreen.tsx` | Tab Categories | JM 分类筛选 + Pica 分类网格 |
| 搜索 | `SearchScreen.tsx` | Stack | 双源并行搜索 / 布尔语法 / 缓存 |
| 影视 | `MoviesScreen.tsx` | Tab Movies | 视频分类 / 搜索 / 播放器 |
| 个人 | `MemberScreen.tsx` | Tab Member | 双源登录 / 设置 / 签到 / 成就 |
| JM 详情 | `ComicDetailScreen.tsx` | Stack | 简介 / 章节 / 评论 / 收藏 / 分享 |
| Pica 详情 | `PicaDetailScreen.tsx` | Stack | 详情 / 章节 / 评论 / 点赞/收藏 |
| 阅读器 | `ReaderScreen.tsx` | Stack | **双源统一** 竖滑/分页 / 自动翻页 / 下载 |
| 收藏库 | `LibraryScreen.tsx` | Stack | 云端+本地合并 / 文件夹管理 |
| 周榜 | `WeekRankScreen.tsx` | Stack | 类型+分类筛选 / 分页 |
| 源选择 | `ShuntSelectorScreen.tsx` | Stack | 测速 / 切换域名 |
| 日志 | `LogsScreen.tsx` | Stack | 7 级筛选 / 复制 / 导出 |
| 下载 | `DownloadListScreen.tsx` | Stack | 进度 / 暂停恢复 / PDF |
| 以图搜图 | `ImageSearchScreen.tsx` | Modal | SauceNAO / soutubot |
| 博客 | `BlogsScreen.tsx` | Stack | 公告列表 / 详情 |
| 论坛 | `ForumScreen.tsx` | Stack | 帖子列表 |
| 游戏 | `GamesScreen.tsx` | Stack | 热门游戏 / 全部游戏 |
| 关于 | `AboutScreen.tsx` | Stack | 版本 / 更新检测 |
| 注册 | `AuthScreens.tsx` | Modal | JM 注册 / 忘记密码 |
| Pica 分类结果 | `PicaCategoryResultScreen.tsx` | Stack | 分类漫画网格 |
| Pica 创作者 | `PicaCreatorResultScreen.tsx` | Stack | 创作者漫画 |

---

## 七、src/components/ — 可复用组件

| 组件 | 文件 | 说明 |
|:-----|:-----|:------|
| `ComicCard` | `ComicCard.tsx` | memo 优化的漫画卡片 |
| `LoadingSkeleton` | `LoadingSkeleton.tsx` | Reanimated 骨架屏 |
| `SafeImage` | `SafeImage.tsx` | JM 图片安全加载 (WebView Canvas 解扰) |
| `ScrambledImage` | `ScrambledImage.tsx` | JM 图片解扰组件 |
| `HtmlText` | `HtmlText.tsx` | 轻量 HTML 渲染 |
| `ReaderSettingsModal` | `ReaderSettingsModal.tsx` | 阅读设置弹窗 |
| `ConfigUrlModal` | `ConfigUrlModal.tsx` | 自定义 CDN 地址弹窗 |
| `CategoryFilterSheet` | `CategoryFilterSheet.tsx` | @gorhom/bottom-sheet 筛选 |
| `AnimateEntrance` | `AnimatedWrappers.tsx` | 入场动画 |
| `AnimateListItem` | `AnimatedWrappers.tsx` | 列表错开动画 |
| `AnimatePressable` | `AnimatedWrappers.tsx` | 按键缩放动画 |
| `ErrorBoundary` | `ErrorBoundary.tsx` | 错误边界（复制信息） |
| `SimpleErrorBoundary` | `SimpleErrorBoundary.tsx` | 极简错误边界 |
| `SourceSelectModal` | `SourceSelectModal.tsx` | 启动源选择 |
| `EmptyState` | `EmptyState.tsx` | 空状态反馈 |
| `SortAndFilterToolbar` | `SortAndFilterToolbar.tsx` | 搜索排序筛选 |
| `DebugOverlay` | `DebugOverlay.tsx` | 调试日志悬浮球 |
| `ZoomableImage` | `ZoomableImage.tsx` | 双击/捏合缩放 |

---

## 八、src/utils/ — 工具函数

| 文件 | 核心导出 | 说明 |
|:-----|:---------|:------|
| `HaKaLogger.ts` | `logger` | 全局日志（7 级 / 文件持久化 / 自动轮转） |
| `DownloadManager.ts` | `downloadManager` | 下载管理（队列 / 状态 / 持久化） |
| `DownloadQueue.ts` | `downloadQueue` | 并发下载队列（最大 2） |
| `ApiCache.ts` | `apiCache`, `CACHE_TTL` | API 内存缓存（Map + TTL） |
| `ImageCache.ts` | `getCachedImageDataUri`, `cleanImageCache` | 图片磁盘缓存（MD5 命名，7 天过期） |
| `SourceSelector.ts` | `getShuntImgHost`, `testAllShunts`, `pickFastest` | 源测速选择 |
| `booleanSearch.ts` | `parseBooleanQuery`, `applyBooleanFilter` | 布尔搜索 |
| `chineseConvert.ts` | `s2t`, `t2s`, `normalizeSearchTerm` | 简繁转换 |
| `cache.ts` | `setCache`, `getCache` | 通用内存缓存 |
| `scramble.ts` | `buildDescrambleHtml`, `extractFilename` | 图片解扰算法 |
| `updateCheck.ts` | `checkForUpdate` | 版本更新检测 |
| `fetchImage.ts` | `fetchImageAsDataUri` | 鉴权图片获取 |
| `ReadingMethod.ts` | `ReadingMethod` 枚举 | 阅读模式（6 种） |
| `JmLogger.ts` | `jmLogger` | JM 调试日志 |
| `helpers.ts` | `formatCount`, `chunkArray`, `truncate` | 通用工具 |

---

## 九、日志系统 (`HaKaLogger.ts`)

| 级别 | 颜色 | 触发场景 |
|:-----|:-----|:---------|
| `fatal` | 红 | JS 未捕获异常 (`ErrorUtils.setGlobalHandler`) |
| `error` | 红 | API 请求失败、Promise rejection、ErrorBoundary 捕获 |
| `warn` | 橙 | API 非 200 响应、所有域名失败 |
| `ok` | 绿 | API 请求成功 |
| `info` | 蓝 | 应用启动、Logger 初始化 |
| `debug` | 灰 | 调试信息 |
| `trace` | 暗灰 | 追踪信息 |

**存储**：`FileSystem.documentDirectory/logs/latest.log`，最多 1000 行后轮转（`latest.log.1`, `latest.log.2`）

**查看路径**：我的 → 日志查看 → 分级筛选 + 复制 JSON + 导出 `.txt`

---

## 十、主题系统 (`src/theme/`)

```
theme/
├── ThemeProvider.tsx   — useAppTheme() / useLegacyColors()
├── colors.ts           — lightColors / darkColors (Material 3 珊瑚橙)
├── index.ts            — 重导出
└── theme.ts            — 向后兼容 (Radius / Spacing / FontSize)
```

**暗色主题色板**：
```
primary: #E85D3A    （珊瑚橙）
background: #07070D  （深黑）
surface: #12121E     （表面）
textPrimary: #F0EDE8 （米白）
textTertiary: #9895A0（中灰）
divider: #2A2A35     （分割线）
```

---

## 十一、国际化 (`src/i18n/`)

- `zh.json` — 中文翻译（~4478 字节）
- `en.json` — 英文翻译（~4405 字节）
- 使用 `react-i18next`，支持运行时切换语言

---

## 十二、性能优化策略

| 策略 | 说明 |
|:-----|:------|
| **FlashList** | 替代 FlatList（`estimatedItemSize`, `windowSize: 7`, `maxToRenderPerBatch: 5`） |
| **React.memo** | `ComicCard`, `ImageItem` 等高频组件 |
| **useCallback** | `renderItem`, `handleTap` 等回调 |
| **图片高度去重** | `prev[index] === h ? prev : {...prev}` 减少 `setImageHeights` 调用 |
| **API 缓存** | `ApiCache` 60s 缓存 search/setting，10min 缓存 promote/album |
| **图片磁盘缓存** | MD5 命名，base64 存储，7 天自动清理 |
| **setImageHeights 引用比较** | 相同值不触发重渲染 |
| **竖滑不包裹 Pressable** | 避免触摸事件拦截 |

---

## 十三、版本更新检测 (`updateCheck.ts`)

```typescript
async function checkForUpdate(): Promise<{ version: string; changelog: string; downloadUrl: string }>
```

**回退链**：jsDelivr CDN → GitHub Raw → GitHub API → ghproxy

当前版本：`1.0.0`（定义在 `latest-version.json`）
