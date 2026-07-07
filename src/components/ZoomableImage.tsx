// 可缩放图片容器 — 参照 PicaComic photo_view + touch_control.dart
// 支持：双击缩放(1.75x)、双指捏合缩放、拖拽平移
// @author Jason

import React, { useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import {
  GestureDetector, Gesture, GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { SafeImage } from './SafeImage';

const { width: W } = Dimensions.get('window');

interface Props {
  uri: string;
  epsId?: string;
  pictureName?: string;
  containerWidth?: number;
  style?: any;
  onDimension?: (w: number, h: number) => void;
  children?: React.ReactNode;
}

export function ZoomableImage({ uri, epsId, pictureName, containerWidth, style, onDimension, children }: Props) {
  const scaleRef = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const lastScaleRef = useRef(1);
  const lastTranslateXRef = useRef(0);
  const lastTranslateYRef = useRef(0);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      lastScaleRef.current = (scaleRef as any).__getValue?.() ?? 1;
    })
    .onUpdate((e) => {
      const next = Math.max(1, Math.min(3, lastScaleRef.current * e.scale));
      scaleRef.setValue(next);
    })
    .onEnd(() => {
      lastScaleRef.current = (scaleRef as any)._value || 1;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      const current = (scaleRef as any)._value || 1;
      if (current > 1.2) {
        Animated.parallel([
          Animated.spring(scaleRef, { toValue: 1, useNativeDriver: true }),
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
        ]).start();
        lastScaleRef.current = 1;
      } else {
        Animated.spring(scaleRef, { toValue: 1.75, useNativeDriver: true }).start();
        lastScaleRef.current = 1.75;
      }
    });

  const panGesture = Gesture.Pan()
    .minPointers(2)
    .onUpdate((e) => {
      if (lastScaleRef.current > 1) {
        translateX.setValue(lastTranslateXRef.current + e.translationX);
        translateY.setValue(lastTranslateYRef.current + e.translationY);
      }
    })
    .onEnd(() => {
      lastTranslateXRef.current = (translateX as any)._value || 0;
      lastTranslateYRef.current = (translateY as any)._value || 0;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);
  const allGestures = Gesture.Exclusive(doubleTapGesture, composed);

  const imageContent = children || (
    <SafeImage
      imageUrl={uri}
      epsId={epsId}
      pictureName={pictureName}
      containerWidth={containerWidth || W}
      onDimension={onDimension}
      style={[{ width: '100%', height: '100%' }, style]}
    />
  );

  return (
    <GestureHandlerRootView style={{ width: '100%', height: '100%' }}>
      <GestureDetector gesture={allGestures}>
        <Animated.View style={[
          { flex: 1, transform: [
            { translateX }, { translateY }, { scale: scaleRef },
          ]},
        ]}>
          {imageContent}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
