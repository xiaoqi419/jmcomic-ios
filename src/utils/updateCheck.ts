// 版本更新检测 — GitHub Releases API + 国内 proxy 回退
// @author Jason

import { Platform } from 'react-native';

const REPO = 'xiaoqi419/jmcomic-ios';

const PROXIES = [
  `https://api.github.com/repos/${REPO}/releases/latest`,
  `https://ghproxy.net/https://api.github.com/repos/${REPO}/releases/latest`,
  `https://ghproxy.com/https://api.github.com/repos/${REPO}/releases/latest`,
  `https://mirror.ghproxy.com/https://api.github.com/repos/${REPO}/releases/latest`,
  `https://github.moeyy.xyz/https://api.github.com/repos/${REPO}/releases/latest`,
  `https://gh.api.99988866.xyz/https://api.github.com/repos/${REPO}/releases/latest`,
  `https://gitproxy.click/https://api.github.com/repos/${REPO}/releases/latest`,
  `https://github-proxy.linfeng.xyz/https://api.github.com/repos/${REPO}/releases/latest`,
  `https://slink.ltd/https://api.github.com/repos/${REPO}/releases/latest`,
];

export interface ReleaseInfo {
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
  prerelease: boolean;
}

export interface CheckResult {
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  release: ReleaseInfo | null;
  error?: string;
}

function parseVersion(v: string): number[] {
  return v.replace(/^v/i, '').split('.').map(Number);
}

function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

const FETCH_TIMEOUT = 8000;

export async function checkForUpdate(currentVersion: string): Promise<CheckResult> {
  for (const url of PROXIES) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT);
      const res = await fetch(url, {
        headers: { 'User-Agent': 'JOYComic-iOS/1.0', 'Accept': 'application/json' },
        signal: ctrl.signal,
      });
      clearTimeout(tid);
      if (!res.ok) continue;
      // 手动读 text 再 parse（有些 proxy 返回非标准 content-type 但内容实为 json）
      const text = await res.text();
      let data: ReleaseInfo;
      try { data = JSON.parse(text); } catch { continue; }
      if (!data.tag_name) continue;

      const latest = data.tag_name.replace(/^v/i, '');
      const hasUpdate = compareVersions(latest, currentVersion) > 0;

      return {
        hasUpdate,
        latestVersion: latest,
        currentVersion,
        release: data,
      };
    } catch {
      continue;
    }
  }
  return {
    hasUpdate: false,
    latestVersion: '',
    currentVersion,
    release: null,
    error: '无法连接到更新服务器',
  };
}
