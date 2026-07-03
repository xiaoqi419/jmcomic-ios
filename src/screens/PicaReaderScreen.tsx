// Pica 阅读器 — 无 scramble，直接 expo-image FlatList 纵向滚动
// @author Jason

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, StyleSheet, ActivityIndicator, Dimensions,
  FlatList, Text, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize } from '../theme';
import { picaSource } from '../sources/pica';
import type { SourceImage } from '../sources/types';

const { width: W } = Dimensions.get('window');

export function PicaReaderScreen() {
  const nav = useNavigation<any>();
  const { comicId, chapterOrder, chapterId, title } = useRoute<any>().params;

  const [images, setImages] = useState<SourceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);

  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    picaSource.fetchImages(comicId, chapterOrder ?? 1)
      .then(setImages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [comicId, chapterOrder]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const pageStr = images.length > 0 ? `${currentIndex + 1} / ${images.length}` : '';

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={S.cont}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <View style={S.cont}>
      <StatusBar style="light" />

      {/* 轻点切换顶栏 */}
      <Pressable onPress={() => setShowOverlay(!showOverlay)} style={{ flex: 1 }}>
        <FlatList
          ref={flatRef}
          data={images}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item.url }}
              style={S.img}
              contentFit="contain"
              cachePolicy="memory-disk"
              placeholder={null}
            />
          )}
          pagingEnabled
          horizontal={false}
          showsVerticalScrollIndicator={false}
          snapToInterval={Dimensions.get('window').height}
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          removeClippedSubviews
        />
      </Pressable>

      {/* 顶栏 */}
      {showOverlay && (
        <SafeAreaView edges={["top"]} style={S.topBar}>
          <Pressable onPress={() => nav.goBack()} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={S.pageInfo} numberOfLines={1}>{title} — {pageStr}</Text>
          <View style={{ width: 24 }} />
        </SafeAreaView>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  cont: { flex: 1, backgroundColor: '#000' },
  img: { width: W, height: Dimensions.get('window').height },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  pageInfo: {
    flex: 1, color: '#fff', fontSize: FontSize.body,
    textAlign: 'center', fontWeight: '500',
  },
});
