<div align="center">
  <img src="website/public/logo.svg" width="96" height="96" alt="JOYComic Logo"/>
  <h1 align="center">JOYComic</h1>
  <p align="center">聚合 JMComic + Pica 双源的漫画阅读器</p>
  <p align="center">
    <a href="https://joycomic.ojason.top">官网</a> ·
    <a href="https://github.com/xiaoqi419/joycomic-ios/releases">下载 IPA</a> ·
    <a href="#功能">功能</a> ·
    <a href="#截图">截图</a>
  </p>
</div>

---

JOYComic 是一个基于 **React Native (Expo SDK 54)** + **TypeScript** 的 iOS 漫画阅读 App，聚合 **JMComic（禁漫天堂）** 和 **Pica（哔咔漫画）** 双源，提供统一的搜索、阅读、收藏体验。

## 功能

### 📚 双源聚合
- **JMComic** — 分类浏览、搜索、周榜、热门标签、小说（部分支持）
- **Pica** — 分类浏览、搜索、创作者筛选、收藏、喜欢、评论
- **双源同时搜索** — 一次输入，两个源的结果并行展示

### 🎨 阅读体验
- **竖滑模式** — 连续滚动，自适应图片高度
- **分页模式** — 左右翻页，仿真书感
- **布局切换** — 图片自适应宽度/高度/全屏
- **阅读进度** — 自动记录，继续阅读跳转
- **图片去混淆** — 自动解密 JMComic 加密图片
- **预加载** — 提前加载相邻章节

### 🔍 搜索系统
- **双源并行搜索** — JM + Pica 同时搜索
- **分类筛选** — 按源/类型过滤结果
- **布尔搜索** — `+` 包含 / `-` 排除 / `"` 精确匹配
- **排序** — 最多点击 / 最新发布 / 最多喜欢
- **搜索历史** — 本地持久化
- **以图搜图** — SauceNAO API 图片搜索 + soutubot WebView

### 📥 下载管理
- **单话下载** — 下载当前章节
- **全本下载** — 一键下载整本漫画
- **下载位置** — 图库 / 应用文件夹 可选

### ❤️ 收藏与历史
- **收藏夹** — 创建/重命名/删除文件夹，移动漫画
- **阅读历史** — 自动记录阅读进度
- **JM 收藏** — 同步 JMComic 在线收藏
- **Pica 收藏** — 同步 Pica 收藏/喜欢

### 💬 评论系统
- **JMComic** — 查看/发送评论
- **Pica** — 查看/发送/回复/点赞评论
- **无限滚动** — 自动加载更多评论

### 🎬 影视模块
- **视频浏览** — 分类列表
- **搜索** — 搜索视频资源
- **播放器** — 内置播放

### 📄 其他
- **公告/博客** — 浏览官方公告
- **深色主题** — Material 3 设计，全程深色
- **动画系统** — Moti 驱动的入场/列表/交互动画
- **自动更新检测** — GitHub Releases 检测新版本
- **国际化** — 中文/日文/英文

## 截图

> *截图待添加*

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发（Expo Go 扫码预览）
npx expo start

# Web 预览
npx expo start --web

# 云端编译 IPA
npx eas build --platform ios --profile production
```

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React Native 0.81, Expo SDK 54 |
| 语言 | TypeScript |
| 导航 | React Navigation (Native Stack + Bottom Tabs) |
| 状态管理 | Zustand |
| 国际化 | react-i18next |
| 动画 | Moti (Reanimated 4) |
| 列表优化 | @shopify/flash-list |
| 图片 | expo-image |
| 存储 | AsyncStorage, expo-sqlite |

## 项目结构

```
joycomic-ios/
├── App.tsx                   # 主入口 + 导航
├── src/
│   ├── api/                  # JM API 层（AES 加解密）
│   ├── pica/                 # Pica API 层（HMAC 签名）
│   ├── sources/              # 统一数据源抽象层
│   ├── screens/              # 所有页面
│   ├── components/           # 通用组件
│   ├── store/                # Zustand 状态管理
│   ├── utils/                # 工具函数
│   └── theme/                # 主题系统
├── website/                  # 官网（Vite + React 19 + HeroUI）
├── apk_analysis/             # 逆向分析资源
└── eas.json                  # EAS Build 配置
```

## API 说明

### JMComic
- **加密**: AES-256-ECB (PKCS7)
- **Token**: `MD5("{timestamp}18comicAPP")`
- **TokenParam**: `"{timestamp},2.0.13"`

### Pica
- **加密**: HMAC-SHA256 签名
- **路径**: 所有 API 路径参数参与签名
- **代理**: 默认使用 `go2778` 中转

## 自签安装

1. `npx eas build --platform ios --profile production`
2. 下载 `.ipa` 文件
3. 使用 AltStore / SideStore / Sideloadly / TrollStore 自签安装
4. 仅限个人使用

## 免责声明

本应用为第三方客户端，仅供学习交流使用。所有内容版权归原作者及对应平台所有。

使用 24 小时内请删除。请支持正版。
