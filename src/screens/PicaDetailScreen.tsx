// Pica 漫画详情页
// @author Jason

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator,
  Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../theme';
import { picaSource } from '../sources/pica';
import type { SourceDetail, SourceChapter } from '../sources/types';

const { width: W } = Dimensions.get('window');
const COVER_H = W * 0.65;
const TABS = ['详情', '章节'];

export function PicaDetailScreen() {
  const nav = useNavigation<any>();
  const { comicId } = useRoute<any>().params;

  const [detail, setDetail] = useState<SourceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    picaSource.fetchDetail(comicId).then(setDetail).catch(() => {}).finally(() => setLoading(false));
  }, [comicId]);

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={S.cont}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView edges={["top"]} style={S.cont}>
        <View style={{ alignItems: 'center', marginTop: 100 }}>
          <MaterialIcons name="error-outline" size={48} color={Colors.textTertiary} />
          <Text style={{ color: Colors.textSecondary, marginTop: 12 }}>加载失败</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={S.cont}>
      <StatusBar style="light" />

      {/* 顶部渐变封面 */}
      <View style={S.coverWrap}>
        <Image source={{ uri: detail.coverUrl }} style={S.cover} contentFit="cover" />
        <LinearGradient colors={['transparent', Colors.background]} style={S.coverGradient} pointerEvents="none" />
        <Pressable onPress={() => nav.goBack()} style={S.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 标题区 */}
        <View style={S.infoWrap}>
          <Text style={S.title}>{detail.title}</Text>
          <Text style={S.author}>{detail.author}</Text>

          {/* 开始阅读按钮 */}
          {detail.chapters.length > 0 && (
            <Pressable
              onPress={() => nav.navigate('PicaReader', {
                comicId: detail.id,
                chapterOrder: detail.chapters[detail.chapters.length - 1].order,
                chapterId: detail.chapters[detail.chapters.length - 1].id,
                title: detail.title,
              })}
              style={({ pressed }) => [S.readBtn, { opacity: pressed ? 0.8 : 1 }]}
            >
              <MaterialIcons name="play-arrow" size={22} color="#fff" />
              <Text style={S.readBtnText}>开始阅读</Text>
            </Pressable>
          )}

          {/* 标签 */}
          {detail.tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {detail.tags.map((tag) => (
                <Pressable key={tag} onPress={() => nav.navigate('Main', { screen: 'Search', params: { query: tag } })}>
                  <View style={S.tag}><Text style={S.tagText}>{tag}</Text></View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Tab 栏 */}
        <View style={S.tabBar}>
          {TABS.map((label, i) => (
            <Pressable key={label} onPress={() => setActiveTab(i)} style={[S.tab, activeTab === i && S.tabActive]}>
              <Text style={[S.tabText, activeTab === i && S.tabTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 0 && (
          <View style={{ paddingHorizontal: Spacing.marginEdge, marginTop: 12 }}>
            <Text style={S.descText}>{detail.description || '暂无简介'}</Text>
          </View>
        )}

        {activeTab === 1 && (
          <View style={{ paddingHorizontal: Spacing.marginEdge, marginTop: 8 }}>
            {detail.chapters
              .slice()
              .reverse()
              .map((ch) => (
                <Pressable
                  key={ch.id}
                  onPress={() => nav.navigate('PicaReader', {
                    comicId: detail.id,
                    chapterOrder: ch.order,
                    chapterId: ch.id,
                    title: detail.title,
                  })}
                  style={({ pressed }) => [S.epCard, pressed && { opacity: 0.7 }]}
                >
                  <MaterialIcons name="book" size={18} color={Colors.textTertiary} style={{ marginRight: 8 }} />
                  <Text style={S.epTitle} numberOfLines={1}>{ch.title}</Text>
                  <MaterialIcons name="chevron-right" size={20} color={Colors.textTertiary} />
                </Pressable>
              ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  cont: { flex: 1, backgroundColor: Colors.background },
  coverWrap: { height: COVER_H, position: 'relative' },
  cover: { width: '100%', height: '100%' },
  coverGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
  backBtn: {
    position: 'absolute', top: Platform.OS === 'ios' ? 0 : 8, left: 8,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  infoWrap: { paddingHorizontal: Spacing.marginEdge, marginTop: -40 },
  title: { fontSize: FontSize.title, fontWeight: '800', color: Colors.textPrimary },
  author: { fontSize: FontSize.body, color: Colors.textSecondary, marginTop: 4 },
  readBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 48, borderRadius: Radius.button, backgroundColor: Colors.primary,
    marginTop: 16, gap: 6,
  },
  readBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.body },
  tag: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.xl,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  tagText: { fontSize: FontSize.label, color: Colors.textSecondary },
  tabBar: {
    flexDirection: 'row', marginHorizontal: Spacing.marginEdge, marginTop: 20,
    borderRadius: Radius.card, backgroundColor: Colors.surface, padding: 4,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: Radius.card - 2 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.body, color: Colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: Colors.textOnPrimary },
  descText: { fontSize: FontSize.body, color: Colors.textSecondary, lineHeight: 22 },
  epCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 14,
    backgroundColor: Colors.surface, borderRadius: Radius.card,
    marginBottom: 8, borderWidth: 1, borderColor: Colors.border,
  },
  epTitle: { flex: 1, fontSize: FontSize.body, color: Colors.textPrimary, fontWeight: '500' },
});
