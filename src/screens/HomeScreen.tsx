// 首页 — React Native Paper 组件
// @author Jason

import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Chip, Text, Searchbar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { ComicCard } from '../components/ComicCard';
import { getCategoryAlbums } from '../api/mobile';
import { webCategory } from '../api/web';
import type { SearchResult } from '../api/types';
import { CATEGORIES, SORT_OPTIONS } from '../constants';
import { Colors, Spacing } from '../theme';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const [albums, setAlbums] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState('mv');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetch = useCallback(async (p: number, refresh = false) => {
    try { setError(''); const r = await getCategoryAlbums({ page: p, category: cat, sort }); if (refresh || p === 1) setAlbums(r.content); else setAlbums(prev => [...prev, ...r.content]); setHasMore(r.content.length >= 20); } catch (e: any) { try { const results = await webCategory(p); if (results.length > 0) { if (refresh || p === 1) setAlbums(results); else setAlbums(prev => [...prev, ...results]); setHasMore(results.length >= 20); setError(''); } else setError('暂无数据'); } catch (e2: any) { setError('无法连接：' + (e2.message || '')); } }
  }, [cat, sort]);

  useEffect(() => { setLoading(true); setPage(1); fetch(1, true).finally(() => setLoading(false)); }, [fetch]);

  if (loading) return <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}><StatusBar style="dark" /><View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={Colors.primary} /></View></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar style="dark" />
      <FlatList data={albums} numColumns={3} keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: Spacing.xl }}
        ListHeaderComponent={
          <View style={{ paddingTop: 8, gap: 4 }}>
            {/* Paper Chip 分类 */}
            <Text variant="titleMedium" style={{ fontWeight: '700', marginTop: 8 }}>分类</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {CATEGORIES.map(item => (
                <Chip key={item.id} selected={cat === item.id} onPress={() => { setCat(item.id); setPage(1); }}
                  mode={cat === item.id ? 'flat' : 'outlined'} textStyle={{ fontSize: 12 }}
                  style={{ backgroundColor: cat === item.id ? Colors.primary : undefined }}>
                  {item.label}
                </Chip>
              ))}
            </View>

            <Divider style={{ marginVertical: 4 }} />

            {/* Paper Chip 排序 */}
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>排序</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {SORT_OPTIONS.map(item => (
                <Chip key={item.id} selected={sort === item.id} onPress={() => { setSort(item.id); setPage(1); }}
                  mode={sort === item.id ? 'flat' : 'outlined'} textStyle={{ fontSize: 12 }}>
                  {item.label}
                </Chip>
              ))}
            </View>

            {error ? (
              <Text style={{ color: Colors.error, textAlign: 'center', padding: 12 }}>{error}</Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => <ComicCard id={item.id} title={item.name} coverUrl={item.coverUrl} tags={item.tags} onPress={id => navigation.navigate('AlbumDetail', { albumId: id })} />}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ paddingVertical: Spacing.lg }} color={Colors.primary} /> : null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(1, true); setRefreshing(false); }} tintColor={Colors.primary} />}
        onEndReached={async () => { if (!hasMore || loadingMore) return; setLoadingMore(true); const np = page + 1; await fetch(np); setPage(np); setLoadingMore(false); }}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}
