// 阅读器 — 使用原生 iOS PagerView 翻页
// @author Jason

import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { useReaderStore } from '../store/useReader';
import { useSettingsStore } from '../store/useSettings';
import { Colors, Spacing, FontSize } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

export function ReaderScreen({ route, navigation }: any) {
  const { imageUrls, currentPage, setPage } = useReaderStore();
  const readingMode = useSettingsStore(s => s.readingMode);
  const [showUI, setShowUI] = useState(true);
  const pagerRef = useRef<PagerView>(null);
  const toggle = () => setShowUI(p => !p);

  const overlay = (
    <SafeAreaView style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: Spacing.md, paddingTop: Spacing.sm + 4, paddingBottom: Spacing.xs,
      backgroundColor: 'rgba(0,0,0,0.55)',
    }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>返回</Text>
      </TouchableOpacity>
      <Text style={{ color: '#ccc', fontSize: 15 }}>
        {currentPage + 1} / {imageUrls.length}
      </Text>
    </SafeAreaView>
  );

  const bottomBar = (
    <SafeAreaView style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100,
      paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg, paddingTop: Spacing.xs,
      backgroundColor: 'rgba(0,0,0,0.55)',
    }}>
      <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' }}>
        <View style={{
          height: '100%', backgroundColor: Colors.primary, borderRadius: 2,
          width: `${((currentPage + 1) / Math.max(1, imageUrls.length)) * 100}%`,
        }} />
      </View>
    </SafeAreaView>
  );

  // 翻页模式
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar hidden={!showUI} />

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={currentPage}
        orientation="horizontal"
        onPageSelected={e => setPage(e.nativeEvent.position)}
        pageMargin={0}
      >
        {imageUrls.map((url, i) => (
          <View key={i} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={toggle}>
              <Image
                source={{ uri: url }}
                style={{ width: W, height: H }}
                contentFit="contain"
                placeholder={require('../../assets/icon.png')}
                transition={200}
              />
            </TouchableOpacity>
          </View>
        ))}
      </PagerView>

      {showUI && overlay}
      {showUI && bottomBar}
    </View>
  );
}
