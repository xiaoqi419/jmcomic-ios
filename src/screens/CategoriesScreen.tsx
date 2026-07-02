// 分类浏览 v3 — 从 API 获取分类和热搜词
// @author nyx

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useLegacyColors, LegacyColors, Spacing, FontSize, Radius } from '../theme';
import { ComicCard } from '../components/ComicCard';
import { fetchCategoriesFilter, fetchCategories, fetchHotTags, getCoverUrl as getCover } from '../api/endpoints';
import type { ComicItem } from '../api/types';

const SORTS = [
  { id: 'tf', labelKey: 'search.sort_tf' },
  { id: 'mv', labelKey: 'search.sort_mv' },
  { id: 'mp', labelKey: 'search.sort_mp' },
  { id: 'mr', labelKey: 'search.sort_mr' },
];

interface CatItem {
  name: string;
  slug: string;
}

interface SubCatItem {
  CID: string;
  name: string;
  slug: string;
}

export function CategoriesScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const C = useLegacyColors();
  const styles = useMemo(() => getStyles(C), [C]);
  const [list, setList] = useState<ComicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cats, setCats] = useState<CatItem[]>([]);
  const [subCats, setSubCats] = useState<SubCatItem[]>([]);
  const [slug, setSlug] = useState(route.params?.slug || '');
  const [sort, setSort] = useState(route.params?.sort || 'tf');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hotTags, setHotTags] = useState<string[]>([]);

  // 加载分类列表
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCategories();
        const categories = data.categories || [];
        const mainCats: CatItem[] = categories.map((c: any) => ({
          name: c.name || c.title || '',
          slug: c.slug || '',
        }));
        // 收集所有子分类
        const subs: SubCatItem[] = [];
        categories.forEach((c: any) => {
          (c.sub_categories || []).forEach((sc: any) => {
            subs.push({ CID: sc.CID || sc.id || '', name: sc.name || '', slug: sc.slug || '' });
          });
        });
        setCats(mainCats);
        setSubCats(subs);
        if (!slug && mainCats.length > 0) setSlug(mainCats[0].slug);
      } catch {}
    })();
  }, []);

  // 加载热搜词
  useEffect(() => {
    fetchHotTags().then(setHotTags).catch(() => {});
  }, []);

  const load = useCallback(async (p: number, refresh = false) => {
    try {
      const params: any = { page: p, o: sort };
      if (slug) params.c = slug;
      const data = await fetchCategoriesFilter(params);
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
            <Text style={styles.title}>{t('nav.categories')}</Text>

            {/* 主分类 */}
            {cats.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {cats.map((c) => (
                  <Pressable
                    key={c.slug}
                    onPress={() => { setSlug(c.slug); setPage(1); }}
                    style={[styles.chip, slug === c.slug && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, slug === c.slug && styles.chipTextActive]}>{c.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* 子分类 */}
            {subCats.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {subCats.map((sc) => (
                  <Pressable
                    key={sc.slug || sc.CID}
                    onPress={() => { setSlug(sc.slug); setPage(1); }}
                    style={[styles.subChip, slug === sc.slug && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, slug === sc.slug && styles.chipTextActive]}>{sc.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* 排序 */}
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

            {/* 热搜词 */}
            {hotTags.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: FontSize.label, color: C.textSecondary, marginBottom: 6 }}>🔥 热搜</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {hotTags.slice(0, 10).map((tag, i) => (
                    <Pressable
                      key={i}
                      onPress={() => nav.navigate('Search', { query: tag })}
                      style={styles.tagChip}
                    >
                      <Text style={styles.tagText}>{tag}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <ComicCard id={item.id} title={item.name} coverUrl={getCover(item.id)} onPress={(id) => nav.navigate('ComicDetail', { albumId: id })} />
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
    subChip: {
      paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.xl,
      backgroundColor: C.surfaceLight, marginRight: 6,
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
    tagChip: {
      paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.xl,
      backgroundColor: C.surfaceLight,
    },
    tagText: { fontSize: FontSize.caption, color: C.primary, fontWeight: '500' },
  });
}
