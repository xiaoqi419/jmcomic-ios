// Pica 阅读器 v2 — 连续无缝纵向滚动，自适应图片高度
// @author Jason

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, StyleSheet, ActivityIndicator, Dimensions,
  FlatList, Text, Pressable, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize } from '../theme';
import { picaSource } from '../sources/pica';
import type { SourceImage } from '../sources/types';

const { width: W, height: H } = Dimensions.get('window');

export function PicaReaderScreen() {
  const nav = useNavigation<any>();
  const { comicId, chapterOrder, chapterId, title } = useRoute<any>().params;

  const [images, setImages] = useState<SourceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUI, setShowUI] = useState(false);
  const [imgLayout, setImgLayout] = useState<'contain' | 'fitWidth'>('fitWidth');
  const [imgHeights, setImgHeights] = useState<Record<number, number>>({});
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    picaSource.fetchImages(comicId, chapterOrder ?? 1)
      .then(setImages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [comicId, chapterOrder]);

  // 图片加载完成时获取自然宽高，计算容器高度
  const handleLoad = useCallback((index: number, w: number, h: number) => {
    if (w > 0 && h > 0) {
      const containerH = (W * h) / w;
      setImgHeights((prev) => {
        if (prev[index] === containerH) return prev;
        return { ...prev, [index]: containerH };
      });
    }
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const pageStr = images.length > 0 ? `${currentIndex + 1} / ${images.length}` : '';

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={styles.cont}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.cont}>
      <StatusBar style="light" />

      {/* 主体：连续滚动 FlatList */}
      <FlatList
        ref={flatRef}
        data={images}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => {
          const imgH = imgHeights[index];
          return (
            <Pressable onPress={() => setShowUI(!showUI)}>
              <View style={{ width: W, height: imgH || W * 1.4, backgroundColor: '#000' }}>
                <Image
                  source={{ uri: item.url }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit={imgLayout === 'fitWidth' ? 'contain' : 'cover'}
                  cachePolicy="memory-disk"
                  placeholder={null}
                  onLoad={(e) => {
                    const { width: nw, height: nh } = e.source;
                    if (nw && nh) handleLoad(index, nw, nh);
                  }}
                />
              </View>
            </Pressable>
          );
        }}
        horizontal={false}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 30 }}
        removeClippedSubviews={Platform.OS === 'android'}
        windowSize={5}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
      />

      {/* 顶栏 */}
      {showUI && (
        <SafeAreaView edges={["top"]} style={styles.topBar}>
          <Pressable onPress={() => nav.goBack()} hitSlop={12} style={styles.topBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.pageInfo} numberOfLines={1}>{title} — {pageStr}</Text>
          <Pressable onPress={() => setImgLayout(imgLayout === 'contain' ? 'fitWidth' : 'contain')} hitSlop={8} style={styles.topBtn}>
            <MaterialIcons name={imgLayout === 'contain' ? 'fullscreen' : 'fullscreen-exit'} size={22} color="#fff" />
          </Pressable>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cont: { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  topBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pageInfo: {
    flex: 1, color: '#fff', fontSize: FontSize.body,
    textAlign: 'center', fontWeight: '500',
  },
});
