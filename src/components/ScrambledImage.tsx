// ScrambledImage — WebView Canvas 方式解码 scramble 图片
// EAS Build (IPA) 可用，Expo Go 显示原始图片
// @author nyx

import React, { useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';

interface Props {
  imageUrl: string;
  scrambleId: number;
  albumId?: string;
  style?: any;
  onLoad?: () => void;
}

// Canvas 解码脚本
const SCRAMBLE_HTML = `
<!DOCTYPE html>
<html>
<body>
<script>
(function(){
  var img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = function(){
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');
    var w = img.naturalWidth, h = img.naturalHeight;
    c.width = w; c.height = h;
    var n = 10;
    var sh = Math.floor(h / n);
    var r = h % n;
    for(var i=0; i<n; i++){
      var sy = h - sh*(i+1) - (i===0?0:r);
      var dy = sh * i;
      var ch = sh + (i===0?r:0);
      ctx.drawImage(img, 0, sy, w, ch, 0, dy, w, ch);
    }
    window.ReactNativeWebView.postMessage(c.toDataURL('image/jpeg',0.85));
  };
  img.onerror = function(){ window.ReactNativeWebView.postMessage('ERR'); };
  img.src = '__URL__';
})();
<\/script>
</body>
</html>`;

export function ScrambledImage({ imageUrl, scrambleId, style, onLoad }: Props) {
  const [decoded, setDecoded] = useState<string | null>(null);
  const needsScramble = scrambleId !== 0 && scrambleId !== 220980;

  // 不需要 scramble 或不是 EAS Build → 直接显示
  if (!needsScramble || Platform.OS === 'web') {
    return <Image source={{ uri: imageUrl }} style={[{ flex: 1, width: '100%' }, style]} contentFit="contain" onLoad={onLoad} />;
  }

  // iOS EAS Build: 用 WebView Canvas 解码
  if (decoded) {
    return <Image source={{ uri: decoded }} style={[{ flex: 1, width: '100%' }, style]} contentFit="contain" onLoad={onLoad} />;
  }

  // 用 WebView 执行 canvas 解码
  const html = SCRAMBLE_HTML.replace('__URL__', imageUrl);
  try {
    const WebView = require('react-native-webview').WebView;
    return (
      <View style={[{ flex: 1, width: '100%' }, style]}>
        <WebView
          source={{ html }}
          style={{ flex: 1, opacity: 0, height: 0 }}
          onMessage={(e: any) => {
            if (e.nativeEvent.data === 'ERR') { setDecoded(imageUrl); onLoad?.(); }
            else { setDecoded(e.nativeEvent.data); onLoad?.(); }
          }}
          javaScriptEnabled
          domStorageEnabled
        />
        <View style={StyleSheet.absoluteFill}>
          <ActivityIndicator size="small" color="#F59E0B" />
        </View>
      </View>
    );
  } catch {
    // WebView not available (Expo Go) → fallback to raw image
    return <Image source={{ uri: imageUrl }} style={[{ flex: 1, width: '100%' }, style]} contentFit="contain" onLoad={onLoad} />;
  }
}
