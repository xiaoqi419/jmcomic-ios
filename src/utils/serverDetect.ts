// 源服务器自动检测 — 测速选最快线路
// @author Jason

import { API_DOMAINS } from '../constants';

export interface ServerInfo {
  domain: string;
  name: string;
  latency: number; // ms, -1 = 不可用
  available: boolean;
}

const SERVER_NAMES: Record<string, string> = {
  'www.cdnhjk.net': '线路1',
  'www.cdngwc.cc': '线路2',
  'www.cdngwc.net': '线路3',
  'www.cdngwc.club': '线路4',
  'www.cdnutc.me': '线路5',
};

/**
 * 检测单个服务器的延迟
 */
async function pingServer(domain: string): Promise<number> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const resp = await fetch(`https://${domain}/`, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13) Chrome/120 Mobile',
      },
    });
    clearTimeout(timeout);
    
    if (resp.ok || resp.status === 403) {
      // 403 = CloudFlare, 但服务器本身能连通
      return Date.now() - start;
    }
    return -1;
  } catch {
    return -1;
  }
}

/**
 * 检测所有服务器的延迟并排序
 */
export async function detectServers(): Promise<ServerInfo[]> {
  const results = await Promise.all(
    API_DOMAINS.map(async (domain) => {
      const latency = await pingServer(domain);
      return {
        domain,
        name: SERVER_NAMES[domain] || domain,
        latency,
        available: latency >= 0,
      };
    })
  );

  // 按延迟排序（可用的在前，按速度）
  return results.sort((a, b) => {
    if (a.available && !b.available) return -1;
    if (!a.available && b.available) return 1;
    return a.latency - b.latency;
  });
}

/**
 * 获取最快的可用服务器
 */
export async function getFastestServer(): Promise<string | null> {
  const servers = await detectServers();
  const fastest = servers.find(s => s.available);
  return fastest?.domain || null;
}
