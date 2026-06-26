// 每周必看 — 复刻 APK Week.tsx
// @author nyx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, FontSize, Radius } from '../theme';
import { ComicCard } from '../components/ComicCard';
import { fetchWeekData, getCoverUrl as getCover } from '../api/endpoints';

export function WeekRankScreen() {
  const nav = useNavigation<any>();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<{ id: string; title: string; time: string }[]>([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeekData().then((d) => {
      setCategories(d.categories || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ paddingHorizontal: Spacing.marginEdge, paddingTop: 8 }}>
        <Text style={{ fontSize: FontSize.largeTitle, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 }}>{t('week.title')}</Text>
        {/* 分类选择 */}
        <FlatList
          horizontal
          data={[{ id: 'all', title: t('week.all'), time: '' }, ...categories]}
          keyExtractor={(i) => i.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ marginBottom: 12 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedCat(item.id)}
              style={[styles.chip, selectedCat === item.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, selectedCat === item.id && styles.chipTextActive]}>{item.title}</Text>
            </Pressable>
          )}
        />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={items}
          numColumns={3}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: Spacing.marginEdge, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <ComicCard id={item.id} title={item.name} coverUrl={getCover(item.id)} onPress={(id) => nav.navigate('ComicDetail', { albumId: id })} />
          )}
          ListEmptyComponent={<Text style={{ color: Colors.textTertiary, textAlign: 'center', marginTop: 40 }}>暂无数据</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.xl, backgroundColor: Colors.surfaceLight, marginRight: 6, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.label, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.textOnPrimary },
});
