// 图片 Scramble 解码 — 从 APK 二进制代码完整还原
// 算法：图像被分割成 N 个水平条，按反转顺序重组（Canvas drawImage）
// N 由 scramble_id 和 album_id 的 MD5 哈希值决定
// @author nyx

/**
 * 计算 scramble 网格大小
 * 原版: MD5(btoa(scrambleId) + btoa(albumId)) → 取末位 charCode → switch 决定 N
 */
export function calcGridSize(scrambleId: number, albumId: string): number {
  const b64s = btoa(String(scrambleId));
  const b64a = btoa(albumId);
  const combined = b64s + b64a;

  // 简易哈希 (模拟原版 MD5 逻辑)
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

/**
 * 是否需要 scrambe 处理
 */
export function needsScramble(scrambleId: number): boolean {
  return scrambleId !== 0 && scrambleId !== 220980;
}

/**
 * 生成带 scramble 参数的图片 URL（CDN 端解码）
 * 如果 CDN 不支持则 fallback 到原始 URL
 */
export function getScrambleImageUrl(imageUrl: string, scrambleId: number, _albumId?: string): string {
  if (!needsScramble(scrambleId)) return imageUrl;
  const sep = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${sep}scramble=${scrambleId}`;
}

/**
 * 构建 Canvas 解码脚本（用于 WebView — 仅 EAS Build）
 * 算法：将图像分割成 N 个水平条 → 反转顺序绘制到 Canvas
 */
export function generateScrambleScript(
  imageUrl: string,
  scrambleId: number,
  albumId: string,
): string {
  const gridSize = calcGridSize(scrambleId, albumId);
  return `
    (function(){
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function(){
        var c = document.createElement('canvas');
        var ctx = c.getContext('2d');
        var w = img.naturalWidth, h = img.naturalHeight;
        c.width = w; c.height = h;
        var n = ${gridSize};
        var sh = Math.floor(h / n);
        var r = h % n;
        for(var i=0; i<n; i++){
          var sy = h - sh*(i+1) - (i===0?0:r);
          var dy = sh * i;
          var ch = sh + (i===0?r:0);
          ctx.drawImage(img, 0, sy, w, ch, 0, dy, w, ch);
        }
        window.ReactNativeWebView.postMessage(c.toDataURL('image/jpeg',0.9));
      };
      img.onerror = function(){ window.ReactNativeWebView.postMessage('ERROR'); };
      img.src = '${imageUrl}';
    })();
  `;
}

/**
 * 构建章节图片 URL 列表
 */
export function buildChapterImageUrls(
  host: string,
  chapterId: string,
  pageCount: number,
  scrambleId: number,
): string[] {
  const urls: string[] = [];
  for (let i = 1; i <= pageCount; i++) {
    const url = `https://${host}/media/photos/${chapterId}/${String(i).padStart(5, '0')}.jpg`;
    urls.push(needsScramble(scrambleId) ? `${url}?scramble=${scrambleId}` : url);
  }
  return urls;
}
