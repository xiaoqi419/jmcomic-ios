// 骨架屏加载
// @author nyx

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Colors, Radius } from '../theme';

const { width: W } = Dimensions.get('window');
const PAD = 14, GAP = 6;
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
      <Shimmer style={S.banner} />
      <View style={S.chipRow}>
        {[1, 2, 3, 4, 5].map(i => <Shimmer key={i} style={S.chip} />)}
      </View>
      <View style={S.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={S.card}>
            <Shimmer style={S.cover} />
            <View style={S.info}>
              <Shimmer style={S.titleLine} />
              <Shimmer style={S.tagLine} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  cont: { paddingHorizontal: PAD, paddingTop: 8 },
  banner: { height: 190, borderRadius: Radius.lg, backgroundColor: Colors.surfaceLight, marginBottom: 16 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { width: 70, height: 40, borderRadius: Radius.xl, backgroundColor: Colors.surfaceLight },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  card: { width: CARD_W, marginBottom: 12, borderRadius: Radius.card, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  cover: { width: '100%', aspectRatio: 0.72, backgroundColor: Colors.surfaceLight },
  info: { padding: 8, gap: 4 },
  titleLine: { height: 14, borderRadius: 4, backgroundColor: Colors.surfaceLight },
  tagLine: { height: 10, width: '60%', borderRadius: 3, backgroundColor: Colors.surfaceLight },
});
