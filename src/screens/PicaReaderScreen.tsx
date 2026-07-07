// Pica 阅读器 — PicaComic 风格 UI（竖向连续滚动 + 工具栏）
// @author Jason

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, useWindowDimensions,
  Pressable, ActivityIndicator, Alert, Animated, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { picaSource } from '../sources/pica';
import { useReaderStore } from '../store/useReader';
import * as MediaLibrary from 'expo-media-library';
import * as Brightness from 'expo-brightness';
import * as FileSystem from 'expo-file-system';

const { width: W } = Dimensions.get('window');
const TOOLBAR_ANIM = 150;
const TAP_ZONE = 0.2;

export function PicaReaderScreen() {
  const { height: H } = useWindowDimensions();
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { comicId, chapterOrder, chapterId, title } = route.params || {};
  const isVertical = useReaderStore((s) => s.isVertical);
  const setVertical = useReaderStore((s) => s.setVertical);

  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<{ url: string; index: number }[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const [imageHeights, setImageHeights] = useState<Record<number, number>>({});

  const topAnim = useRef(new Animated.Value(0)).current;
  const bottomAnim = useRef(new Animated.Value(0)).current;
  const [showUI, setShowUI] = useState(true);

  const toggleUI = useCallback(() => {
    const to = showUI ? 0 : 1;
    Animated.parallel([
      Animated.timing(topAnim, { toValue: to, duration: TOOLBAR_ANIM, useNativeDriver: true }),
      Animated.timing(bottomAnim, { toValue: to, duration: TOOLBAR_ANIM, useNativeDriver: true }),
    ]).start();
    setShowUI(!showUI);
  }, [showUI, topAnim, bottomAnim]);

  useEffect(() => {
    Brightness.getBrightnessAsync().catch(() => {});
    topAnim.setValue(1);
    bottomAnim.setValue(1);
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const imgs = await picaSource.fetchImages(comicId, chapterOrder || 0);
      setPages(imgs || []);
    } catch {}
    setLoading(false);
  };

  const handleSaveImage = async () => {
    const img = pages[currentIdx];
    if (!img) return;
    try {
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) { Alert.alert('需要权限', '请允许访问相册'); return; }
      const local = FileSystem.cacheDirectory + 'pica_save.jpg';
      await FileSystem.downloadAsync(img.url, local);
      await MediaLibrary.saveToLibraryAsync(local);
      Alert.alert('', '已保存到相册');
    } catch {}
  };

  const handleTap = useCallback((evt: any) => {
    const x = evt.nativeEvent.locationX;
    const left = W * TAP_ZONE;
    const right = W * (1 - TAP_ZONE);
    if (isVertical) {
      const y = evt.nativeEvent.locationY;
      if (y < H * 0.3) { /* top zone - ignore or prev chapter */ }
      else if (y > H * 0.7) { /* bottom zone - ignore */ }
      else toggleUI();
    } else {
      if (x < left && currentIdx > 0) {
        flatRef.current?.scrollToIndex({ index: currentIdx - 1, animated: true });
        setCurrentIdx(currentIdx - 1);
      } else if (x > right && currentIdx < pages.length - 1) {
        flatRef.current?.scrollToIndex({ index: currentIdx + 1, animated: true });
        setCurrentIdx(currentIdx + 1);
      } else toggleUI();
    }
  }, [currentIdx, pages.length, isVertical, toggleUI, H]);

  const renderItem = ({ item, index }: { item: { url: string }; index: number }) => (
    <View style={{ width: isVertical ? W : W }}>
      <Image
        source={{ uri: item.url }}
        style={{ width: W, height: isVertical ? (imageHeights[index] || W * 1.4) : H }}
        contentFit={isVertical ? 'contain' : 'contain'}
        onLoad={(e) => {
          const src = (e as any).source || {};
          const h = src.height || H;
          const w = src.width || W;
          const ratio = Math.min(h / w, 3);
          const calcH = W * ratio;
          if (calcH > H * 0.3) {
            setImageHeights((prev) => ({ ...prev, [index]: calcH }));
          }
        }}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      <StatusBar hidden={!showUI} />

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#E85D3A" />
        </View>
      ) : pages.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#9895A0' }}>暂无内容</Text>
        </View>
      ) : (
        <Pressable style={{ flex: 1 }} onPress={handleTap}>
          <FlatList
            ref={flatRef}
            data={pages}
            keyExtractor={(_, i) => String(i)}
            renderItem={renderItem}
            {...(isVertical
              ? { vertical: true, showsVerticalScrollIndicator: false, pagingEnabled: false }
              : { horizontal: true, pagingEnabled: true, showsHorizontalScrollIndicator: false }
            )}
            onMomentumScrollEnd={(e) => {
              const offset = isVertical ? e.nativeEvent.contentOffset.y : e.nativeEvent.contentOffset.x;
              const dim = isVertical ? H : W;
              const idx = Math.round(offset / dim);
              setCurrentIdx(Math.min(idx, pages.length - 1));
            }}
            getItemLayout={(_, index) => ({
              length: isVertical ? (imageHeights[index] || W * 1.4) : W,
              offset: isVertical ? (imageHeights[index] || W * 1.4) * index : W * index,
              index,
            })}
          />
        </Pressable>
      )}

      {/* 顶部栏 — offset -120 防止 SafeArea 漏出 */}
      <Animated.View style={[{
        position: 'absolute', top: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
      }, { transform: [{ translateY: topAnim.interpolate({ inputRange: [0, 1], outputRange: [-200, 0] }) }] }]}>
        <SafeAreaView edges={['top']} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
          <TouchableOpacity onPress={() => nav.goBack()} style={{ padding: 8 }}>
            <MaterialIcons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }} numberOfLines={1}>{title || '阅读'}</Text>
          </View>
          <View style={{ width: 38 }} />
        </SafeAreaView>
      </Animated.View>

      {/* 底部栏 */}
      <Animated.View style={[{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 4,
      }, { transform: [{ translateY: bottomAnim.interpolate({ inputRange: [0, 1], outputRange: [130, 0] }) }] }]}>
        <SafeAreaView edges={['bottom']}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8, paddingTop: 8 }}>
            <TouchableOpacity onPress={() => { flatRef.current?.scrollToIndex({ index: 0, animated: true }); setCurrentIdx(0); }} disabled={currentIdx === 0}>
              <MaterialIcons name="first-page" size={20} color={currentIdx === 0 ? 'rgba(255,255,255,0.3)' : '#fff'} />
            </TouchableOpacity>
            <View style={{ flex: 1, height: 24, justifyContent: 'center' }}>
              <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                <View style={{ width: `${pages.length > 1 ? (currentIdx / (pages.length - 1)) * 100 : 0}%`, height: 4, backgroundColor: '#E85D3A', borderRadius: 2 }} />
              </View>
            </View>
            <TouchableOpacity onPress={() => { flatRef.current?.scrollToIndex({ index: pages.length - 1, animated: true }); setCurrentIdx(pages.length - 1); }} disabled={currentIdx === pages.length - 1}>
              <MaterialIcons name="last-page" size={20} color={currentIdx === pages.length - 1 ? 'rgba(255,255,255,0.3)' : '#fff'} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>P{currentIdx + 1}/{pages.length}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={handleSaveImage}><MaterialIcons name="save-alt" size={22} color="#fff" /></TouchableOpacity>
              <TouchableOpacity onPress={() => setVertical(!isVertical)}>
                <MaterialIcons name={isVertical ? 'view-carousel' : 'view-stream'} size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={loadPages}><MaterialIcons name="refresh" size={22} color="#fff" /></TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}
