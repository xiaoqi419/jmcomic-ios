// 可缩放图片容器 — 双击缩放 + 双指捏合
// @author Jason

import React, { useRef, useMemo } from 'react';
import { View, Animated } from 'react-native';
import {
  GestureDetector, Gesture,
} from 'react-native-gesture-handler';

interface Props {
  children?: React.ReactNode;
}

export function ZoomableImage({ children }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const baseScale = useRef(1);
  const baseX = useRef(0);
  const baseY = useRef(0);

  const pinch = Gesture.Pinch()
    .onStart(() => {
      baseScale.current = (scale as any)._value || 1;
    })
    .onUpdate((e) => {
      scale.setValue(Math.max(1, Math.min(3, baseScale.current * e.scale)));
    })
    .onEnd(() => {
      baseScale.current = (scale as any)._value || 1;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      const cur = (scale as any)._value || 1;
      if (cur > 1.2) {
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
        baseScale.current = 1;
        baseX.current = 0;
        baseY.current = 0;
      } else {
        Animated.timing(scale, { toValue: 1.75, duration: 200, useNativeDriver: true }).start();
        baseScale.current = 1.75;
      }
    });

  const pan = Gesture.Pan()
    .minPointers(2)
    .onUpdate((e) => {
      if (baseScale.current > 1) {
        translateX.setValue(baseX.current + e.translationX);
        translateY.setValue(baseY.current + e.translationY);
      }
    })
    .onEnd(() => {
      baseX.current = (translateX as any)._value || 0;
      baseY.current = (translateY as any)._value || 0;
    });

  const composed = Gesture.Simultaneous(pinch, pan);
  const all = Gesture.Exclusive(doubleTap, composed);

  return (
    <GestureDetector gesture={all}>
      <Animated.View style={{
        flex: 1,
        transform: [{ translateX }, { translateY }, { scale }],
      }}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
