// 骨架屏加载 v2
// @author nyx

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Colors, Radius } from '../theme';

const { width: W } = Dimensions.get('window');
const PAD = 16, GAP = 10;
const CARD_W = (W - PAD * 2 - GAP * 2) / 3;

function Shimmer({ style }: { style?: any }) {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[style, anim]} />;
}

export function LoadingSkeleton() {
  return (
    <View style={S.cont}>
      <Shimmer style={S.headerTitle} />
      <Shimmer style={S.quickGrid} />
      <Shimmer style={S.banner} />
      <View style={S.secHeader}>
        <Shimmer style={S.secTitle} />
        <Shimmer style={S.secMore} />
      </View>
      <View style={S.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={S.card}>
            <Shimmer style={S.cover} />
            <Shimmer style={S.titleLine} />
          </View>
        ))}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  cont: { paddingHorizontal: PAD, paddingTop: 8 },
  headerTitle: { width: 120, height: 28, borderRadius: 6, backgroundColor: Colors.surfaceLight, marginBottom: 14 },
  quickGrid: { height: 80, borderRadius: Radius.card, backgroundColor: Colors.surfaceLight, marginBottom: 16 },
  banner: { height: 210, borderRadius: Radius.lg, backgroundColor: Colors.surfaceLight, marginBottom: 20 },
  secHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  secTitle: { width: 100, height: 22, borderRadius: 6, backgroundColor: Colors.surfaceLight },
  secMore: { width: 60, height: 22, borderRadius: 6, backgroundColor: Colors.surfaceLight },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  card: { width: CARD_W, marginBottom: 14, borderRadius: Radius.card, overflow: 'hidden', backgroundColor: Colors.surface },
  cover: { width: '100%', aspectRatio: 0.7, backgroundColor: Colors.surfaceLight },
  titleLine: { height: 14, width: '80%', borderRadius: 4, backgroundColor: Colors.surfaceLight, margin: 10 },
});
