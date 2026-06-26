// 工具函数
// @author nyx

import { useCallback, useRef } from 'react';

/**
 * 格式化数字 (10000 -> 1万)
 */
export function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return String(n || 0);
}

/**
 * 格式化时间
 */
export function formatTime(ts: string | number): string {
  if (!ts) return '';
  const d = new Date(typeof ts === 'number' ? ts : ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/**
 * 从数组随机取 N 个
 */
export function getRandomItems<T>(arr: T[], n: number = 1): { items: T[]; indexes: number[] } {
  if (!arr?.length) return { items: [], indexes: [] };
  const count = Math.min(n, arr.length);
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  const indexes = selected.map((item) => arr.indexOf(item));
  return { items: selected, indexes };
}

/**
 * 数组分块
 */
export function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}

/**
 * 截断文本
 */
export function truncate(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text || '';
  return text.slice(0, maxLen) + '...';
}
