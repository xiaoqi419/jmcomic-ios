// 首页 — 完整复刻 APK Main.tsx
// Banner轮播 + 8快捷入口 + 分类推荐轮播 + 最新更新无限滚动
// @author nyx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, RefreshControl, Dimensions, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Colors, Radius, Spacing, FontSize, Shadow } from '../theme';
import { ComicCard } from '../components/ComicCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { fetchMainPromote, fetchLatest, getCoverUrl as getCover } from '../api/endpoints';
import type { PromoteItem, LatestItem } from '../api/types';

const { width: W } = Dimensions.get('window');
const BANNER_W = W - Spacing.marginEdge * 2;
const BANNER_H = 200;

// 8 个快捷图标
const QUICK_LINKS = [
  { icon: 'flash-on', labelKey: 'banner.latest', route: 'Categories', params: {} },
  { icon: 'whatshot', labelKey: 'banner.hot_ranking', route: 'Categories', params: { sort: 'mv' } },
  { icon: 'phone-android', labelKey: 'banner.hanman', route: 'Categories', params: { slug: 'hanman' } },
  { icon: 'import-contacts', labelKey: 'banner.single_book', route: 'Categories', params: { slug: 'single' } },
  { icon: 'auto-stories', labelKey: 'banner.novels', route: 'Novels', params: {} },
  { icon: 'sports-esports', labelKey: 'banner.games', route: 'Games', params: {} },
  { icon: 'video-library', labelKey: 'banner.movies', route: 'Movies', params: {} },
  { icon: 'inventory', labelKey: 'banner.library', route: 'Library', params: {} },
];

export function MainScreen() {
  const nav = useNavigation<any>();
  const { t } = useTranslation();
  const [promote, setPromote] = useState<PromoteItem[]>([]);
  const [latest, setLatest] = useState<LatestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [bannerAdvs, setBannerAdvs] = useState<{ image: string; link: string }[]>([]);

  const loadData = useCallback(async (refresh = false) => {
    try {
      const [p, l] = await Promise.all([fetchMainPromote(), fetchLatest(1)]);
      setPromote(p || []);
      setLatest(l || []);
      setPage(1);
      setHasMore(true);
      // 从 promote 中取前5个作为轮播
      const allItems = p?.flatMap((pi) => pi.content || []) || [];
      const advs = allItems.slice(0, 5).map((item) => ({
        image: item.image,
        link: item.id,
      }));
      setBannerAdvs(advs);
    } catch {}
  }, []);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    try {
      const next = page + 1;
      const l = await fetchLatest(next);
      if (l?.length) {
        setLatest((prev) => [...prev, ...l]);
        setPage(next);
      } else setHasMore(false);
    } catch {}
  }, [page, hasMore]);

  const getCoverUrl = (id: string) => getCover(id);

  // 分类推荐轮播（每组最多10个）
  const carouselData = promote.filter((p) => p.content?.length > 0).slice(0, 4);

  const renderCarousel = ({ item }: { item: PromoteItem }) => (
    <View style={{ marginBottom: Spacing.lg }}>
      <Text style={S.sectionTitle}>{item.title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: Spacing.marginEdge, gap: 10 }}>
        {(item.content || []).slice(0, 10).map((comic) => (
          <Pressable
            key={comic.id}
            onPress={() => nav.navigate('ComicDetail', { albumId: comic.id })}
            style={{ width: 110 }}
          >
            <Image source={{ uri: getCoverUrl(comic.id) }} style={{ width: 110, height: 150, borderRadius: Radius.sm, backgroundColor: Colors.surfaceContainer }} contentFit="cover" />
            <Text style={{ fontSize: FontSize.label, color: Colors.text, marginTop: 4 }} numberOfLines={2}>{comic.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={S.cont}>
        <StatusBar style="light" />
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={S.cont}>
      <StatusBar style="light" />
      <FlatList
        data={latest}
        numColumns={3}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: Spacing.marginEdge, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} progressBackgroundColor={Colors.surface} />}
        ListHeaderComponent={
          <View>
            {/* Banner 轮播 */}
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ height: BANNER_H, marginBottom: 8 }}>
              {(bannerAdvs.length > 0 ? bannerAdvs : promote.flatMap(p => p.content || []).slice(0, 5).map(c => ({ image: getCoverUrl(c.id), link: c.id }))).map((adv, i) => (
                <Pressable key={i} onPress={() => adv.link && nav.navigate('ComicDetail', { albumId: adv.link })} style={{ width: BANNER_W, height: BANNER_H }}>
                  <Image source={{ uri: adv.image }} style={{ width: BANNER_W, height: BANNER_H, borderRadius: Radius.lg }} contentFit="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', borderRadius: Radius.lg }} />
                </Pressable>
              ))}
            </ScrollView>

            {/* 8 快捷入口 */}
            <View style={S.quickGrid}>
              {QUICK_LINKS.map((link, i) => (
                <Pressable key={i} onPress={() => nav.navigate(link.route, link.params)} style={S.quickItem}>
                  <View style={S.quickIcon}>
                    <MaterialIcons name={link.icon as any} size={24} color={Colors.primary} />
                  </View>
                  <Text style={S.quickLabel}>{t(link.labelKey)}</Text>
                </Pressable>
              ))}
            </View>

            {/* 每周必看入口 */}
            <Pressable onPress={() => nav.navigate('WeekRank')} style={{ marginBottom: Spacing.md }}>
              <Image source={{ uri: 'https://18comic.vip/images/week.gif' }} style={{ width: '100%', height: 80, borderRadius: Radius.sm }} contentFit="contain" />
            </Pressable>

            {/* 分类推荐轮播 */}
            {carouselData.map((item) => (
              <View key={item.id}>{renderCarousel({ item })}</View>
            ))}

            {/* 最新更新标题 */}
            <Text style={[S.sectionTitle, { marginTop: 0 }]}>{t('home.new_update')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ComicCard id={item.id} title={item.name} coverUrl={getCoverUrl(item.id)} onPress={(id) => nav.navigate('ComicDetail', { albumId: id })} />
        )}
        ListFooterComponent={hasMore ? <ActivityIndicator style={{ padding: 20 }} color={Colors.primary} /> : <Text style={{ textAlign: 'center', color: Colors.textTertiary, padding: 10 }}>{t('common.no_more')}</Text>}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  cont: { flex: 1, backgroundColor: Colors.background },
  sectionTitle: { fontSize: FontSize.headline, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8, marginTop: Spacing.md },
  quickGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    backgroundColor: Colors.surface, borderRadius: Radius.card,
    marginBottom: Spacing.md, padding: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  quickItem: { width: '25%', alignItems: 'center', paddingVertical: 8 },
  quickIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  quickLabel: { fontSize: FontSize.label, color: Colors.textSecondary },
});
