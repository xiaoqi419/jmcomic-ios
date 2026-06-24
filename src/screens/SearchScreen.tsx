// 搜索页 - 支持车号直达
// @author Jason

import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { ComicCard } from '../components/ComicCard';
import { searchAlbums } from '../api/mobile';
import { Colors, Radius, Spacing, FontSize } from '../theme';

const TAGS = ['全彩', '无修正', '同人', 'CG', '韩漫', '纯爱', 'NTR', '后宫', '姐系', '母系'];

export function SearchScreen({ navigation }: any) {
  const [kw, setKw] = useState(''); const [res, setRes] = useState<any[]>([]); const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); const [page, setPage] = useState(1); const [more, setMore] = useState(true);

  const search = useCallback(async (p: number, refresh = false) => {
    const keyword = kw.trim();
    if (!keyword) return;
    setLoading(true);

    // 检测是否为车号（纯数字）
    if (/^\d{4,}$/.test(keyword)) {
      // 直接跳转到漫画详情
      setLoading(false);
      setSearched(true);
      navigation.navigate('AlbumDetail', { albumId: keyword });
      return;
    }

    try {
      const r = await searchAlbums({ keyword, page: p, sort: 'mv' });
      if (refresh || p === 1) setRes(r.content); else setRes(prev => [...prev, ...r.content]);
      setMore(r.content.length >= 20); setSearched(true);
    } catch {} finally { setLoading(false); }
  }, [kw, navigation]);

  const onSearch = () => { setPage(1); search(1, true); };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <FlatList data={res} numColumns={2} keyExtractor={i => i.id} columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingHorizontal: Spacing.marginEdge, paddingBottom: Spacing.xl }}
        ListHeaderComponent={
          <View>
            <View style={{ flexDirection: 'row', paddingVertical: Spacing.md, gap: Spacing.sm, alignItems: 'center' }}>
              <View style={{ flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border }}>
                <TextInput style={{ height: 44, paddingHorizontal: Spacing.md, color: Colors.textPrimary, fontSize: FontSize.bodyLarge }}
                  placeholder="搜索漫画、作者、标签，或输入车号直达..." placeholderTextColor={Colors.textTertiary} value={kw}
                  onChangeText={setKw} onSubmitEditing={onSearch} returnKeyType="search" />
              </View>
              <TouchableOpacity style={{ height: 44, paddingHorizontal: Spacing.lg, backgroundColor: Colors.primary, borderRadius: Radius.xl, justifyContent: 'center', alignItems: 'center' }}
                onPress={onSearch} activeOpacity={0.8}>
                <Text style={{ color: Colors.textOnPrimary, fontWeight: '700', fontSize: FontSize.bodyLarge }}>搜索</Text>
              </TouchableOpacity>
            </View>
            {!searched ? (
              <View>
                <Text style={styles.sectionTitle}>热门搜索</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
                  {TAGS.map(t => (
                    <TouchableOpacity key={t} style={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.chip, backgroundColor: Colors.surfaceLowest, borderWidth: 1, borderColor: Colors.border }}
                      onPress={() => { setKw(t); setTimeout(onSearch, 100); }} activeOpacity={0.7}>
                      <Text style={{ fontSize: FontSize.label, color: Colors.textSecondary }}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={{ fontSize: FontSize.caption, color: Colors.textTertiary, marginTop: Spacing.sm, textAlign: 'center' }}>
                  提示：输入纯数字车号（如 480715）直达漫画
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={!loading && searched ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <MaterialIcons name="search-off" size={48} color={Colors.textTertiary} />
            <Text style={{ fontSize: FontSize.bodyLarge, color: Colors.textSecondary, marginTop: Spacing.md }}>未找到相关结果</Text>
          </View>
        ) : null}
        renderItem={({ item }) => <ComicCard id={item.id} title={item.name} coverUrl={item.coverUrl} tags={item.tags} onPress={id => navigation.navigate('AlbumDetail', { albumId: id })} />}
        ListFooterComponent={loading ? <ActivityIndicator style={{ paddingVertical: Spacing.lg }} color={Colors.primary} /> : null}
        onEndReached={async () => { if (!more || loading) return; const np = page + 1; setPage(np); search(np); }}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  sectionTitle: { fontSize: FontSize.headline, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
});
