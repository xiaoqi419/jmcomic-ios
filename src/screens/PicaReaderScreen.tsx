// Pica 阅读器 — PicaComic 风格 UI（平滑滚动 + 工具栏）
// @author Jason

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, useWindowDimensions,
  Pressable, ActivityIndicator, Modal, Alert, StyleSheet,
  Animated, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { picaSource } from '../sources/pica';
import { comicComments } from '../pica/endpoints';
import * as MediaLibrary from 'expo-media-library';
import * as Brightness from 'expo-brightness';
import * as FileSystem from 'expo-file-system';

const { width: W } = Dimensions.get('window');
const TOOLBAR_ANIM_DURATION = 150;
const TAP_ZONE_RATIO = 0.2;

export function PicaReaderScreen() {
  const { height: H } = useWindowDimensions();
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { comicId, chapterOrder, chapterId, title } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<{ url: string; index: number }[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const [imageHeights, setImageHeights] = useState<Record<number, number>>({});
  const [brightness, setBrightnessVal] = useState(1);

  // 工具栏动画
  const topAnim = useRef(new Animated.Value(0)).current;
  const bottomAnim = useRef(new Animated.Value(0)).current;
  const [showUI, setShowUI] = useState(true);

  const toggleUI = useCallback(() => {
    const to = showUI ? 0 : 1;
    Animated.parallel([
      Animated.timing(topAnim, { toValue: to, duration: TOOLBAR_ANIM_DURATION, useNativeDriver: true }),
      Animated.timing(bottomAnim, { toValue: to, duration: TOOLBAR_ANIM_DURATION, useNativeDriver: true }),
    ]).start();
    setShowUI(!showUI);
  }, [showUI, topAnim, bottomAnim]);

  useEffect(() => {
    Brightness.getBrightnessAsync().then(setBrightnessVal).catch(() => {});
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

  // 保存当前图片
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
    const leftZone = W * TAP_ZONE_RATIO;
    const rightZone = W * (1 - TAP_ZONE_RATIO);
    if (x < leftZone && currentIdx > 0) {
      flatRef.current?.scrollToIndex({ index: currentIdx - 1, animated: true });
      setCurrentIdx(currentIdx - 1);
    } else if (x > rightZone && currentIdx < pages.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIdx + 1, animated: true });
      setCurrentIdx(currentIdx + 1);
    } else {
      toggleUI();
    }
  }, [currentIdx, pages.length, toggleUI]);

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
            renderItem={({ item, index }) => (
              <View style={{ width: W }}>
                <Image
                  source={{ uri: item.url }}
                  style={{ width: W, height: imageHeights[index] || H }}
                  contentFit="contain"
                  onLoad={(e) => {
                    const h = (e as any).source?.height || H;
                    const w = (e as any).source?.width || W;
                    const ratio = Math.min(h / w, 3);
                    const calcH = W * ratio;
                    if (calcH > H * 0.5) {
                      setImageHeights((prev) => ({ ...prev, [index]: calcH }));
                    }
                  }}
                />
              </View>
            )}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / W);
              setCurrentIdx(idx);
            }}
            getItemLayout={(_, index) => ({ length: W, offset: W * index, index })}
          />
        </Pressable>
      )}

      {/* 顶部栏 */}
      <Animated.View style={[{
        position: 'absolute', top: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
      }, { transform: [{ translateY: topAnim.interpolate({ inputRange: [0, 1], outputRange: [-80, 0] }) }] }]}>
        <SafeAreaView edges={['top']} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
          <TouchableOpacity onPress={() => nav.goBack()} style={{ padding: 8 }}>
            <MaterialIcons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }} numberOfLines={1}>{title || '阅读'}</Text>
          </View>
          <TouchableOpacity style={{ padding: 8, opacity: 0 }}><MaterialIcons name="settings" size={22} color="#fff" /></TouchableOpacity>
        </SafeAreaView>
      </Animated.View>

      {/* 底部栏 */}
      <Animated.View style={[{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 4,
      }, { transform: [{ translateY: bottomAnim.interpolate({ inputRange: [0, 1], outputRange: [120, 0] }) }] }]}>
        <SafeAreaView edges={['bottom']}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8, paddingTop: 8 }}>
            <TouchableOpacity
              onPress={() => { flatRef.current?.scrollToIndex({ index: 0, animated: true }); setCurrentIdx(0); }}
              disabled={currentIdx === 0}
            >
              <MaterialIcons name="first-page" size={20} color={currentIdx === 0 ? 'rgba(255,255,255,0.3)' : '#fff'} />
            </TouchableOpacity>
            <View style={{ flex: 1, height: 24, justifyContent: 'center' }}>
              <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                <View style={{ width: `${pages.length > 1 ? (currentIdx / (pages.length - 1)) * 100 : 0}%`, height: 4, backgroundColor: '#E85D3A', borderRadius: 2 }} />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => { flatRef.current?.scrollToIndex({ index: pages.length - 1, animated: true }); setCurrentIdx(pages.length - 1); }}
              disabled={currentIdx === pages.length - 1}
            >
              <MaterialIcons name="last-page" size={20} color={currentIdx === pages.length - 1 ? 'rgba(255,255,255,0.3)' : '#fff'} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>P{currentIdx + 1}/{pages.length}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={handleSaveImage}><MaterialIcons name="save-alt" size={22} color="#fff" /></TouchableOpacity>
              <TouchableOpacity onPress={loadPages}><MaterialIcons name="refresh" size={22} color="#fff" /></TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}
