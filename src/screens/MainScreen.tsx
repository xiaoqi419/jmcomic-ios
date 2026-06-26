// 首页 — 只保留可用功能
// @author nyx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, RefreshControl, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../theme';
import { ComicCard } from '../components/ComicCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { fetchMainPromote, fetchLatest } from '../api/endpoints';
import type { ComicItem } from '../api/types';

const QUICK_LINKS = [
  { icon: 'flash-on', labelKey: 'banner.latest', route: 'Categories', params: { slug: 'all', sort: 'tf' } },
  { icon: 'whatshot', labelKey: 'banner.hot_ranking', route: 'Categories', params: { slug: 'doujin', sort: 'mv' } },
  { icon: 'auto-stories', labelKey: 'banner.novels', route: 'Novels', params: {} },
  { icon: 'video-library', labelKey: 'banner.movies', route: 'Movies', params: {} },
  { icon: 'search', label: '搜索', route: 'Search', params: {} },
  { icon: 'bookmark', labelKey: 'banner.library', route: 'Library', params: {} },
];

export function MainScreen() {
  const nav = useNavigation<any>();
  const { t } = useTranslation();
  const [data, setData] = useState<ComicItem[]>([]);
  const [latest, setLatest] = useState<ComicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (refresh = false) => {
    try {
      const p = await fetchMainPromote();
      const items: ComicItem[] = [];
      p?.forEach((section) => {
        (section.content || []).forEach((c) => {
          if (!items.find((x) => x.id === c.id)) items.push(c);
        });
      });
      setData(items.slice(0, 30));
      const l = await fetchLatest(1);
      setLatest(l || []);
      setPage(1);
      setHasMore(true);
    } catch {}
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    try {
      const np = page + 1;
      const l = await fetchLatest(np);
      if (l?.length) { setLatest((p) => [...p, ...l]); setPage(np); }
      else setHasMore(false);
    } catch {}
  }, [page, hasMore]);

  if (loading) {
    return (
      <SafeAreaView style={S.cont}>
        <StatusBar style="light" />
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={S.cont} edges={['top']}>
      <StatusBar style="light" />
      <FlatList
        data={latest}
        numColumns={3}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: Spacing.marginEdge, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <View style={{ paddingBottom: Spacing.md }}>
            {/* 快捷入口 */}
            <View style={S.quickGrid}>
              {QUICK_LINKS.map((link, i) => (
                <Pressable key={i} onPress={() => nav.navigate(link.route, link.params)} style={S.quickItem}>
                  <View style={S.quickIcon}>
                    <MaterialIcons name={link.icon as any} size={22} color={Colors.primary} />
                  </View>
                  <Text style={S.quickLabel}>{link.label || t(link.labelKey || '')}</Text>
                </Pressable>
              ))}
            </View>

            {/* 推荐 */}
            {data.length > 0 && (
              <View>
                <Text style={S.sectionTitle}>推荐</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {data.slice(0, 6).map((item) => (
                    <Pressable key={item.id} onPress={() => nav.navigate('ComicDetail', { albumId: item.id })} style={{ width: (W - 28 - 16) / 3 }}>
                      <Image source={{ uri: `https://${getImgHost()}/media/albums/${item.id}_3x4.jpg` }} style={{ width: '100%', aspectRatio: 0.72, borderRadius: Radius.sm, backgroundColor: Colors.surfaceContainer }} contentFit="cover" />
                      <Text style={{ fontSize: FontSize.label, color: Colors.text, marginTop: 4 }} numberOfLines={2}>{item.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* 最新更新 */}
            <Text style={[S.sectionTitle, { marginTop: 16 }]}>最新更新</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ComicCard
            id={item.id}
            title={item.name}
            coverUrl={`https://${getImgHost()}/media/albums/${item.id}_3x4.jpg`}
            onPress={(id) => nav.navigate('ComicDetail', { albumId: id })}
          />
        )}
        ListFooterComponent={hasMore ? <ActivityIndicator style={{ padding: 20 }} color={Colors.primary} /> : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}

import { Image } from 'expo-image';
import { getImgHost } from '../api/endpoints';

const { width: W } = Dimensions.get('window');

const S = StyleSheet.create({
  cont: { flex: 1, backgroundColor: Colors.background },
  sectionTitle: { fontSize: FontSize.headline, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  quickGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    backgroundColor: Colors.surface, borderRadius: Radius.card,
    marginBottom: 16, padding: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  quickItem: { width: '16.66%', alignItems: 'center', paddingVertical: 8 },
  quickIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  quickLabel: { fontSize: FontSize.caption, color: Colors.textSecondary, textAlign: 'center' },
});
