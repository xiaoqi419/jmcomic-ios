// ScrambledImage — WebView Canvas 解码
// 仅在 EAS Build / Expo Go native 中使用
// @author nyx

import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Image } from 'expo-image';

interface Props {
  imageUrl: string;
  scrambleId: number;
  albumId: string;
  style?: any;
}

export function ScrambledImage({ imageUrl, scrambleId, albumId, style }: Props) {
  const [decoded, setDecoded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  // 默认 scrambleId 不处理
  if (scrambleId === 0 || scrambleId === 220980) {
    return <Image source={{ uri: imageUrl }} style={[{ flex: 1, width: '100%' }, style]} contentFit="contain" />;
  }

  if (failed) {
    return <Image source={{ uri: imageUrl }} style={[{ flex: 1, width: '100%' }, style]} contentFit="contain" />;
  }

  if (decoded) {
    return <Image source={{ uri: `data:image/webp;base64,${decoded}` }} style={[{ flex: 1, width: '100%' }, style]} contentFit="contain" />;
  }

  const html = `
<!DOCTYPE html>
<html><body>
<script>
  var img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = function() {
    var w = img.naturalWidth, h = img.naturalHeight;
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');

    // 计算 grid size (简化版)
    var sc = ${scrambleId}, aid = '${albumId}';
    var combined = btoa(String(sc)) + btoa(aid);
    var hash = 0;
    for (var i = 0; i < combined.length; i++) { hash = ((hash << 5) - hash) + combined.charCodeAt(i); hash |= 0; }
    var r = Math.abs(hash).toString(16).charCodeAt(0);
    if (sc >= 268850 && sc <= 421925) r %= 10;
    else if (sc >= 421926) r %= 8;
    var gridMap = {0:2,1:4,2:6,3:8,4:10,5:12,6:14,7:16,8:18,9:20};
    var n = gridMap[r] || 10;

    var stripH = Math.floor(h / n), rem = h % n;
    for (var c = 0; c < n; c++) {
      var sy = h - stripH*(c+1) - (c===0?0:rem);
      var dy = stripH * c;
      var ch = stripH + (c===0?rem:0);
      ctx.drawImage(img, 0, sy, w, ch, 0, dy, w, ch);
    }
    var b64 = canvas.toDataURL('image/webp', 0.85).split(',')[1];
    window.ReactNativeWebView.postMessage(b64);
  };
  img.onerror = function() { window.ReactNativeWebView.postMessage('ERROR'); };
  img.src = '${imageUrl}';
</script>
</body></html>
`;

  return (
    <View style={[{ flex: 1, width: '100%' }, style]}>
      {loading && (
        <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
          <ActivityIndicator size="small" color="#F59E0B" />
        </View>
      )}
      <WebView
        source={{ html }}
        style={{ flex: 1, opacity: 0, width: 1, height: 1 }}
        javaScriptEnabled
        originWhitelist={['*']}
        onMessage={(e) => {
          const data = e.nativeEvent.data;
          if (data === 'ERROR') { setFailed(true); setLoading(false); }
          else { setDecoded(data); setLoading(false); }
        }}
      />
    </View>
  );
}
