// 每周必看 → 重定向到分类的 mv_w（本周热门）
// 原版 APK 的 /week 页面依赖后端特定数据
// @author nyx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, FontSize, Radius } from '../theme';
import { ComicCard } from '../components/ComicCard';
import { fetchLatest, getCoverUrl } from '../api/endpoints';
import type { ComicItem } from '../api/types';

export function WeekRankScreen() {
  const nav = useNavigation<any>();
  const { t } = useTranslation();
  const [data, setData] = useState<ComicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 加载最新漫画作为每周推荐（直接用最新数据）
    fetchLatest(1).then((l) => {
      setData((l || []).map((c) => ({
        id: c.id, name: c.name, image: c.image, author: c.author,
        category: c.category, category_sub: c.category_sub,
        update_at: c.update_at, liked: c.liked, is_favorite: c.is_favorite,
      })));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <Text style={{ fontSize: FontSize.largeTitle, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12, paddingHorizontal: Spacing.marginEdge, paddingTop: 8 }}>
        本周热门
      </Text>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={data}
          numColumns={3}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: Spacing.marginEdge, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <ComicCard
              id={item.id}
              title={item.name}
              coverUrl={getCoverUrl(item.id)}
              onPress={(id) => nav.navigate('ComicDetail', { albumId: id })}
            />
          )}
          ListEmptyComponent={<Text style={{ color: Colors.textTertiary, textAlign: 'center', marginTop: 40 }}>暂无数据</Text>}
        />
      )}
    </SafeAreaView>
  );
}
