// 图片 Scramble 解码 — 从 APK 二进制代码完整还原
// @author nyx

export function calcGridSize(scrambleId: number, albumId: string): number {
  const b64s = btoa(String(scrambleId));
  const b64a = btoa(albumId);
  const combined = b64s + b64a;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16);
  let r = hex.charCodeAt(hex.length - 1);
  if (scrambleId >= 268850 && scrambleId <= 421925) r %= 10;
  else if (scrambleId >= 421926) r %= 8;
  const gridMap: Record<number, number> = {
    0: 2, 1: 4, 2: 6, 3: 8, 4: 10,
    5: 12, 6: 14, 7: 16, 8: 18, 9: 20,
  };
  return gridMap[r] || 10;
}

export function needsScramble(scrambleId: number): boolean {
  return scrambleId !== 0 && scrambleId !== 220980;
}

function proxyImgUrl(url: string): string {
  if (typeof window === 'undefined') return url;
  const m = url.match(/https:\/\/([^/]+)(\/.*)/);
  return m ? `http://localhost:3456/${m[1]}${m[2]}` : url;
}

/** 从 API 返回的 images 文件名数组构建完整 URL（自动代理 + scramble 参数） */
export function buildChapterImageUrls(
  host: string,
  chapterId: string,
  pageCount: number,
  scrambleId: number,
  imageFilenames?: string[],
): string[] {
  // 优先用 API 返回的文件名（含正确扩展名如 .webp）
  if (imageFilenames?.length) {
    return imageFilenames.map((fn) => {
      let url = `https://${host}/media/photos/${chapterId}/${fn}`;
      if (needsScramble(scrambleId)) url += `?scramble=${scrambleId}`;
      return proxyImgUrl(url);
    });
  }
  // fallback: 生成 00001.webp 等（CDN 实际使用 webp）
  const urls: string[] = [];
  for (let i = 1; i <= pageCount; i++) {
    let url = `https://${host}/media/photos/${chapterId}/${String(i).padStart(5, '0')}.webp`;
    if (needsScramble(scrambleId)) url += `?scramble=${scrambleId}`;
    urls.push(proxyImgUrl(url));
  }
  return urls;
}
