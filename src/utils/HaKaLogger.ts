// 全局日志系统 — 参照 haka_comic Log 实现
// @author Jason

import * as FileSystem from 'expo-file-system';

export type LogLevel = 'trace' | 'debug' | 'info' | 'ok' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  msg: string;
  error?: string;
  stackTrace?: string;
  time: number;
}

const LOG_DIR = FileSystem.documentDirectory + 'logs/';
const LOG_FILE = LOG_DIR + 'latest.log';
const MAX_FILES = 3;
const MAX_LINES = 1000; // 每个文件最多 1000 行

class HaKaLogger {
  private entries: LogEntry[] = [];
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      await FileSystem.makeDirectoryAsync(LOG_DIR, { intermediates: true }).catch(() => {});
      this.initialized = true;
      // 启动时记录一条
      this.info('Logger initialized');
    } catch {}
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    try {
      const line = JSON.stringify(entry) + '\n';
      // 读取当前行数
      let exists = false;
      try {
        const info = await FileSystem.getInfoAsync(LOG_FILE);
        exists = info.exists;
      } catch {}
      if (!exists) {
        await FileSystem.writeAsStringAsync(LOG_FILE, line);
        return;
      }
      // 追加
      const content = await FileSystem.readAsStringAsync(LOG_FILE);
      const lines = content.split('\n').filter(Boolean);
      if (lines.length >= MAX_LINES) {
        // 备份并清空
        await this.rotate();
        await FileSystem.writeAsStringAsync(LOG_FILE, line);
      } else {
        await FileSystem.writeAsStringAsync(LOG_FILE, content + line);
      }
    } catch {}
  }

  private async rotate(): Promise<void> {
    try {
      // 删除最旧备份
      const lastPath = LOG_DIR + 'latest.log.' + (MAX_FILES - 1);
      try { await FileSystem.deleteAsync(lastPath, { idempotent: true }); } catch {}
      // 轮转
      for (let i = MAX_FILES - 2; i >= 1; i--) {
        const oldPath = LOG_DIR + 'latest.log.' + i;
        const newPath = LOG_DIR + 'latest.log.' + (i + 1);
        try {
          const info = await FileSystem.getInfoAsync(oldPath);
          if (info.exists) await FileSystem.moveAsync({ from: oldPath, to: newPath });
        } catch {}
      }
      // 当前文件 → .1
      try {
        await FileSystem.moveAsync({ from: LOG_FILE, to: LOG_DIR + 'latest.log.1' });
      } catch {}
    } catch {}
  }

  private log(level: LogLevel, msg: string, error?: any, stackTrace?: string): void {
    const entry: LogEntry = {
      level, msg, time: Date.now(),
      error: error?.message || error?.toString?.() || undefined,
      stackTrace: stackTrace || error?.stack || undefined,
    };
    this.entries.push(entry);
    if (this.initialized) this.writeToFile(entry);
    // 同时在控制台输出
    const prefix = `[${level.toUpperCase()}]`;
    if (level === 'error' || level === 'fatal') {
      console.error(prefix, msg, entry.error || '');
    } else if (level === 'warn') {
      console.warn(prefix, msg);
    } else {
      console.log(prefix, msg);
    }
  }

  // 公开方法
  trace(msg: string) { this.log('trace', msg); }
  debug(msg: string) { this.log('debug', msg); }
  info(msg: string) { this.log('info', msg); }
  ok(msg: string) { this.log('ok', msg); }
  warn(msg: string) { this.log('warn', msg); }
  error(msg: string, err?: any) { this.log('error', msg, err); }
  fatal(msg: string, err?: any) { this.log('fatal', msg, err); }

  /** 获取内存中的日志 */
  getEntries(): LogEntry[] { return [...this.entries]; }

  /** 从文件读取日志 */
  async loadFromFile(): Promise<LogEntry[]> {
    try {
      const content = await FileSystem.readAsStringAsync(LOG_FILE);
      return content.split('\n').filter(Boolean).map((l) => {
        try { return JSON.parse(l); } catch { return null; }
      }).filter(Boolean);
    } catch { return []; }
  }

  /** 清除所有日志 */
  async clear(): Promise<void> {
    this.entries = [];
    try {
      await FileSystem.deleteAsync(LOG_DIR, { idempotent: true });
      await FileSystem.makeDirectoryAsync(LOG_DIR, { intermediates: true });
    } catch {}
    this.info('Logs cleared');
  }
}

export const logger = new HaKaLogger();
