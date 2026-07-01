// DownloadManager — 增强版下载管理器
// 支持状态追踪（等待/下载中/暂停/完成/失败）、进度回调、暂停/恢复/取消
// 下载记录持久化到 AsyncStorage
// @author Jason

import AsyncStorage from '@react-native-async-storage/async-storage';
import { downloadQueue } from './DownloadQueue';

/** 下载状态枚举 */
export type DownloadStatus = 'waiting' | 'downloading' | 'paused' | 'completed' | 'failed';

/** 下载项 */
export interface DownloadItem {
  comicId: string;
  title: string;
  coverUrl: string;
  status: DownloadStatus;
  progress: number;       // 0-100
  totalSize: number;      // 总大小（字节）
  downloadedSize: number; // 已下载大小（字节）
  addedAt: number;        // 添加时间戳
  chapterCount: number;   // 总章节数
  completedChapters: number; // 已完成章节数
  error?: string;         // 错误信息
}

type DownloadListener = (items: DownloadItem[]) => void;

const STORAGE_KEY = '@jmcomic.downloads';
const MAX_CONCURRENT = 2;

class DownloadManager {
  private items: DownloadItem[] = [];
  private listeners: Set<DownloadListener> = new Set();
  private loaded = false;

  /** 初始化：从存储加载 */
  async init(): Promise<void> {
    if (this.loaded) return;
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        this.items = JSON.parse(json);
      }
    } catch {}
    this.loaded = true;
    this.notify();
  }

  /** 保存到存储 */
  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch {}
  }

  /** 通知所有监听器 */
  private notify(): void {
    const snapshot = [...this.items];
    this.listeners.forEach((fn) => fn(snapshot));
  }

  /** 订阅更新 */
  subscribe(listener: DownloadListener): () => void {
    this.listeners.add(listener);
    listener([...this.items]);
    return () => { this.listeners.delete(listener); };
  }

  /** 获取所有下载项 */
  getAll(): DownloadItem[] {
    return [...this.items];
  }

  /** 获取指定漫画的下载项 */
  get(comicId: string): DownloadItem | undefined {
    return this.items.find((i) => i.comicId === comicId);
  }

  /** 添加下载 */
  async addDownload(params: {
    comicId: string;
    title: string;
    coverUrl: string;
    chapterCount: number;
    /** 实际下载函数，接收进度回调 */
    downloadFn: (onProgress: (downloaded: number, total: number) => void) => Promise<void>;
  }): Promise<void> {
    const existing = this.get(params.comicId);
    if (existing && (existing.status === 'downloading' || existing.status === 'waiting')) {
      return; // 已在队列中
    }
    if (existing) {
      // 重新下载（之前暂停/失败）
      this.removeItem(params.comicId);
    }

    const item: DownloadItem = {
      comicId: params.comicId,
      title: params.title,
      coverUrl: params.coverUrl,
      status: 'waiting',
      progress: 0,
      totalSize: 0,
      downloadedSize: 0,
      addedAt: Date.now(),
      chapterCount: params.chapterCount,
      completedChapters: 0,
    };

    this.items.push(item);
    this.notify();
    await this.persist();

    // 入队下载
    this.enqueueDownload(item, params.downloadFn);
  }

  /** 将下载项入队 */
  private enqueueDownload(
    item: DownloadItem,
    downloadFn: (onProgress: (downloaded: number, total: number) => void) => Promise<void>,
  ): void {
    downloadQueue.enqueue(async () => {
      const idx = this.items.findIndex((i) => i.comicId === item.comicId);
      if (idx === -1) return; // 已移除
      if (this.items[idx].status === 'paused') return; // 已暂停

      this.items[idx] = { ...this.items[idx], status: 'downloading' };
      this.notify();
      await this.persist();

      try {
        await downloadFn((downloaded, total) => {
          const idx2 = this.items.findIndex((i) => i.comicId === item.comicId);
          if (idx2 === -1) return;
          if (this.items[idx2].status === 'paused') {
            throw new PauseError();
          }
          const progress = total > 0 ? Math.round((downloaded / total) * 100) : 0;
          this.items[idx2] = {
            ...this.items[idx2],
            progress,
            downloadedSize: downloaded,
            totalSize: total,
          };
          this.notify();
        });

        // 完成
        const idx3 = this.items.findIndex((i) => i.comicId === item.comicId);
        if (idx3 !== -1) {
          this.items[idx3] = {
            ...this.items[idx3],
            status: 'completed',
            progress: 100,
          };
          this.notify();
          await this.persist();
        }
      } catch (e: any) {
        const idx4 = this.items.findIndex((i) => i.comicId === item.comicId);
        if (idx4 === -1) return;

        if (e instanceof PauseError) {
          // 暂停：保留进度，下次 resume 重新排队
          this.items[idx4] = { ...this.items[idx4], status: 'paused' };
        } else {
          // 失败
          this.items[idx4] = {
            ...this.items[idx4],
            status: 'failed',
            error: e.message || '下载失败',
          };
        }
        this.notify();
        await this.persist();
      }
    });
  }

  /** 暂停下载 */
  async pause(comicId: string): Promise<void> {
    const idx = this.items.findIndex((i) => i.comicId === comicId);
    if (idx === -1) return;
    if (this.items[idx].status !== 'downloading' && this.items[idx].status !== 'waiting') return;
    this.items[idx] = { ...this.items[idx], status: 'paused' };
    this.notify();
    await this.persist();
    // 注意：实际可能需要 AbortController 来中止正在进行的网络请求
  }

  /** 恢复下载 */
  async resume(
    comicId: string,
    downloadFn: (onProgress: (downloaded: number, total: number) => void) => Promise<void>,
  ): Promise<void> {
    const idx = this.items.findIndex((i) => i.comicId === comicId);
    if (idx === -1) return;
    if (this.items[idx].status !== 'paused' && this.items[idx].status !== 'failed') return;

    this.items[idx] = { ...this.items[idx], status: 'waiting' };
    this.notify();
    await this.persist();

    this.enqueueDownload(this.items[idx], downloadFn);
  }

  /** 移除下载 */
  async remove(comicId: string): Promise<void> {
    this.removeItem(comicId);
    this.notify();
    await this.persist();
  }

  private removeItem(comicId: string): void {
    this.items = this.items.filter((i) => i.comicId !== comicId);
  }

  /** 清除所有已完成/失败的下载 */
  async clearCompleted(): Promise<void> {
    this.items = this.items.filter(
      (i) => i.status === 'downloading' || i.status === 'waiting' || i.status === 'paused',
    );
    this.notify();
    await this.persist();
  }
}

/** 暂停信号错误 */
class PauseError extends Error {
  constructor() {
    super('Paused');
    this.name = 'PauseError';
  }
}

export const downloadManager = new DownloadManager();
