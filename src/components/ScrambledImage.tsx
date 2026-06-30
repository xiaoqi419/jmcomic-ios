// ScrambledImage — 原生下载 + base64 DataURL + Canvas 解扰
// 先通过 expo-file-system 原生 HTTP 下载图片（绕过 CORS），
// 转为 base64 data URL（同源），再传给 WebView Canvas 解扰
// @author Jason

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { Colors } from '../theme';
import { buildDescrambleHtml, buildSimpleImageHtml, extractFilenameWithoutExt } from '../utils/scramble';

const JM_DEBUG = true;

/**
 * 图片请求头 — 完全对齐 PicaComic 的 getImgHeaders
 * referer 使用实际 JM API 域名（不能用 localhost，部分 CDN 会检查）
 * x-requested-with 使用 com.jiaohua_browser（JM 官方浏览器包名）
 */
const IMG_HEADERS: Record<string, string> = {
  Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  Referer: 'https://www.jmapibranch2.cc/',
  'Sec-Fetch-Mode': 'no-cors',
  'Sec-Fetch-Site': 'cross-site',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 13; WD5DDE5 Build/TQ1A.230205.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.196 Safari/537.36',
  'X-Requested-With': 'com.jiaohua_browser',
};

interface Props {
  /** 原始图片 URL */
  imageUrl: string;
  /** 章节 ID (epsId) */
  epsId: string;
  /** scramble_id (从 API 获取, 回退 220980) */
  scrambleId: number | string;
  /** 图片文件名 (extracted from URL if not provided) */
  pictureName?: string;
  style?: any;
  onLoad?: () => void;
}

export function ScrambledImage({
  imageUrl,
  epsId,
  scrambleId,
  pictureName,
  style,
  onLoad,
}: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState(false);
  const webRef = useRef<any>(null);

  // pictureName 必须是无扩展名的纯文件名（如 "00001"），不能带 .webp
  // 因为 getSegmentationNum 中 MD5(epsId + pictureName) 使用纯数字
  const scId = String(scrambleId);
  const picName = (pictureName || extractFilenameWithoutExt(imageUrl)).replace(/\.\w+$/, '');
  if (JM_DEBUG) console.log(`[JM] ScrambledImage picName="${picName}" epsId="${epsId}" scId="${scId}"`);

  // Step 1: 通过 expo-file-system 原生 HTTP 下载图片 — 完全绕过浏览器 CORS
  useEffect(() => {
    let cancelled = false;
    setDataUrl(null);
    setDownloadError(false);

    const ext = (imageUrl.split('.').pop()?.split('?')[0] || 'webp').replace(/[^a-zA-Z0-9]/g, '');
    const dest = `${FileSystem.cacheDirectory}jm_${Date.now()}.${ext}`;

    (async () => {
      try {
        if (JM_DEBUG) console.log(`[JM] download start: ${imageUrl} -> ${dest}`);
        const dl = await FileSystem.downloadAsync(imageUrl, dest, { headers: IMG_HEADERS });
        if (cancelled) return;
        if (JM_DEBUG) console.log(`[JM] download done: status=${dl.status} uri=${dl.uri}`);
        if (dl.status !== 200) throw new Error(`HTTP ${dl.status}`);

        const base64 = await FileSystem.readAsStringAsync(dl.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (cancelled) return;
        const uri = `data:image/${ext.replace('jpg', 'jpeg')};base64,${base64}`;
        if (JM_DEBUG) console.log(`[JM] dataUrl len=${base64.length} ext=${ext}`);
        setDataUrl(uri);
      } catch (e) {
        if (!cancelled) {
          if (JM_DEBUG) console.log(`[JM] download FAILED:`, e instanceof Error ? e.message : String(e));
          setDownloadError(true);
          setDataUrl(imageUrl);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [imageUrl]);

  // Step 2: 生成解扰 HTML
  const html = useMemo(() => {
    if (!dataUrl) return '';
    if (downloadError) {
      if (JM_DEBUG) console.log(`[JM] buildSimpleImageHtml (download failed, using raw URL)`);
      return buildSimpleImageHtml(dataUrl);
    }
    try {
      const h = buildDescrambleHtml(dataUrl, epsId, scId, picName);
      if (JM_DEBUG) console.log(`[JM] buildDescrambleHtml OK segments from getSegmentationNum`);
      return h;
    } catch (e) {
      if (JM_DEBUG) console.log(`[JM] buildDescrambleHtml FAILED:`, e);
      return buildSimpleImageHtml(dataUrl);
    }
  }, [dataUrl, epsId, scId, picName, downloadError]);

  const handleMessage = useCallback((event: any) => {
    const msg = event.nativeEvent?.data;
    if (JM_DEBUG) console.log(`[JM] WebView:`, msg);
    if (msg === 'loaded' && onLoad) {
      onLoad();
    }
  }, [onLoad]);

  // 还在下载中 → 显示 loading
  if (!dataUrl) {
    return (
      <View style={[{ flex: 1, width: '100%', backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }, style]}>
        <ActivityIndicator color={Colors.primary} size="small" />
      </View>
    );
  }

  return (
    <View style={[{ flex: 1, width: '100%', backgroundColor: '#000' }, style]}>
      <WebView
        ref={webRef}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        source={{ html }}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        onLoad={onLoad}
        onMessage={handleMessage}
        allowFileAccess={true}
      />
    </View>
  );
}
