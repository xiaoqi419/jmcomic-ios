// 通用内存缓存（Map + TTL）
// 参考 haka_comic dev 版 Cache 实现

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<any>>();

/** 设置缓存 */
export function setCache<T>(key: string, value: T, ttlMs = 60_000): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/** 获取缓存，过期返回 null */
export function getCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

/** 删除缓存 */
export function delCache(key: string): void {
  store.delete(key);
}

/** 清空所有缓存 */
export function clearCache(): void {
  store.clear();
}

/** 清理过期条目 */
export function pruneCache(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) store.delete(key);
  }
}
