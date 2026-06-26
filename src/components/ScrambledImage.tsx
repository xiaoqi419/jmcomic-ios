// ScrambledImage — 简化版，直接显示图片
// IPA 直链 CDN，不需要解码
// @author nyx

import React from 'react';
import { Platform } from 'react-native';
import { Image } from 'expo-image';

interface Props {
  imageUrl: string;
  scrambleId: number;
  style?: any;
  onLoad?: () => void;
}

export function ScrambledImage({ imageUrl, style, onLoad }: Props) {
  return <Image source={{ uri: imageUrl }} style={[{flex:1,width:"100%"}, style]} contentFit="contain" onLoad={onLoad} />;
}
