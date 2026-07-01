// 分类浏览 v2
// @author nyx

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useLegacyColors, LegacyColors, Spacing, FontSize, Radius } from '../theme';
import { ComicCard } from '../components/ComicCard';
import { fetchCategoriesFilter, getCoverUrl as getCover } from '../api/endpoints';
import type { ComicItem } from '../api/types';

const SORTS = [
  { id: 'tf', labelKey: 'search.sort_tf' },
  { id: 'mv', labelKey: 'search.sort_mv' },
  { id: 'mp', labelKey: 'search.sort_mp' },
  { id: 'mr', labelKey: 'search.sort_mr' },
];

const CATS = [
  { id: 'doujin', label: '同人' },
  { id: 'single', label: '单行本' },
  { id: 'cg', label: 'CG' },
  { id: 'comic', label: '漫画' },
  { id: 'hanman', label: '韩漫' },
  { id: 'meiman', label: '美漫' },
];

export function CategoriesScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const C = useLegacyColors();
  const styles = useMemo(() => getStyles(C), [C]);
  const [list, setList] = useState<ComicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [slug, setSlug] = useState(route.params?.slug || 'doujin');
  const [sort, setSort] = useState(route.params?.sort || 'tf');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (p: number, refresh = false) => {
    try {
      const data = await fetchCategoriesFilter({ page: p, o: sort });
      const items = data.content || data.list || [];
      if (refresh || p === 1) setList(items);
      else setList((prev) => [...prev, ...items]);
      setHasMore(items.length >= 30);
    } catch {}
  }, [slug, sort]);

  useEffect(() => {
    setLoading(true);
    load(1, true).finally(() => setLoading(false));
  }, [slug, sort]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(1, true);
    setRefreshing(false);
  }, [load]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const np = page + 1;
    setPage(np);
    load(np);
  }, [page, hasMore, loading, load]);

  const getCoverUrl = (id: string) => getCover(id);

  return (
    <SafeAreaView edges={["top"]} style={styles.cont}>
      <FlatList
        data={list}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: Spacing.marginEdge, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />}
        ListHeaderComponent={
          <View style={{ paddingBottom: Spacing.md }}>
            <Text style={styles.title}>分类</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {CATS.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => { setSlug(c.id); setPage(1); }}
                  style={[styles.chip, slug === c.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, slug === c.id && styles.chipTextActive]}>{c.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
              {SORTS.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => { setSort(s.id); setPage(1); }}
                  style={[styles.sortBtn, sort === s.id && styles.sortBtnActive]}
                >
                  <Text style={[styles.sortText, sort === s.id && styles.sortTextActive]}>{t(s.labelKey)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ComicCard id={item.id} title={item.name} coverUrl={getCoverUrl(item.id)} onPress={(id) => nav.navigate('ComicDetail', { albumId: id })} />
        )}
        ListFooterComponent={hasMore ? <ActivityIndicator style={{ padding: 20 }} color={C.primary} /> : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}

function getStyles(C: LegacyColors) {
  return StyleSheet.create({
    cont: { flex: 1, backgroundColor: C.background },
    title: { fontSize: FontSize.largeTitle, fontWeight: '800', color: C.textPrimary, marginBottom: 14, marginTop: 4 },
    chip: {
      paddingHorizontal: 18, paddingVertical: 9, borderRadius: Radius.xl,
      backgroundColor: C.surface, marginRight: 8,
      borderWidth: 1, borderColor: C.border,
    },
    chipActive: { backgroundColor: C.primary, borderColor: C.primary },
    chipText: { fontSize: FontSize.label, fontWeight: '600', color: C.textSecondary },
    chipTextActive: { color: C.textOnPrimary },
    sortBtn: {
      paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.xl,
      backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    },
    sortBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
    sortText: { fontSize: FontSize.label, color: C.textSecondary },
    sortTextActive: { color: C.textOnPrimary, fontWeight: '600' },
  });
}
