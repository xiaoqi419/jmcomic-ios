// 阅读器 — 单页翻页模式
// @author Jason

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReaderStore } from '../store/useReader';
import { useSettingsStore } from '../store/useSettings';
import { Colors, Spacing, FontSize } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

export function ReaderScreen({ route, navigation }: any) {
  const { imageUrls, currentPage, setPage, nextPage, prevPage } = useReaderStore();
  const readingMode = useSettingsStore(s => s.readingMode);
  const [showUI, setShowUI] = useState(true);
  const toggle = () => { setShowUI(p => !p); StatusBar.setHidden(!showUI); };

  // 翻页模式（默认）
  if (readingMode !== 'scroll') {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a2e' }}>
        <StatusBar hidden={!showUI} />
        <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={toggle}>
          {/* 左翻页 */}
          <TouchableOpacity style={{ position: 'absolute', left: 0, top: 0, width: '30%', height: '100%', zIndex: 10 }} onPress={prevPage} />
          {/* 右翻页 */}
          <TouchableOpacity style={{ position: 'absolute', right: 0, top: 0, width: '30%', height: '100%', zIndex: 10 }} onPress={nextPage} />

          <Image
            source={{ uri: imageUrls[currentPage] || '' }}
            style={{ width: W, height: H }}
            contentFit="contain"
            placeholder={require('../../assets/icon.png')}
            transition={200}
          />
        </TouchableOpacity>

        {showUI && (
          <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ color: '#fff', fontSize: FontSize.bodyLarge, fontWeight: '600' }}>返回</Text>
            </TouchableOpacity>
            <Text style={{ color: '#ccc', fontSize: FontSize.body }}>{currentPage + 1} / {imageUrls.length}</Text>
          </SafeAreaView>
        )}

        {showUI && (
          <SafeAreaView style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100, paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl, paddingTop: Spacing.sm, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' }}>
              <View style={{ height: '100%', backgroundColor: Colors.primary, borderRadius: 2, width: `${((currentPage + 1) / Math.max(1, imageUrls.length)) * 100}%` }} />
            </View>
          </SafeAreaView>
        )}
      </View>
    );
  }

  // 滚动模式
  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a2e' }}>
      <StatusBar hidden={!showUI} />
      {showUI && (
        <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: '#fff', fontSize: FontSize.bodyLarge, fontWeight: '600' }}>返回</Text>
          </TouchableOpacity>
          <Text style={{ color: '#ccc', fontSize: FontSize.body }}>{currentPage + 1} / {imageUrls.length}</Text>
        </SafeAreaView>
      )}

      <FlatList
        data={imageUrls}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        onScroll={e => {
          const o = e.nativeEvent.contentOffset.y;
          const p = Math.max(0, Math.round(o / H));
          if (p !== currentPage && p < imageUrls.length) setPage(p);
        }}
        scrollEventThrottle={100}
        renderItem={({ item, index }) => (
          <TouchableOpacity activeOpacity={1} onPress={toggle}>
            <Image source={{ uri: item }} style={{ width: W, height: H, backgroundColor: '#0a0a1e' }} contentFit="contain" />
          </TouchableOpacity>
        )}
      />

      {showUI && (
        <SafeAreaView style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100, paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl, paddingTop: Spacing.sm, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: Colors.primary, borderRadius: 2, width: `${((currentPage + 1) / Math.max(1, imageUrls.length)) * 100}%` }} />
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
