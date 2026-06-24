// 搜索页 — React Native Paper Searchbar
// @author Jason

import React, { useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { Searchbar, Chip, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ComicCard } from '../components/ComicCard';
import { searchAlbums } from '../api/mobile';
import { Colors, Spacing } from '../theme';

const TAGS = ['全彩', '无修正', '同人', 'CG', '韩漫', '纯爱', 'NTR', '后宫', '姐系', '母系'];

export function SearchScreen() {
  const navigation = useNavigation<any>();
  const [kw, setKw] = useState(''); const [res, setRes] = useState<any[]>([]); const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); const [page, setPage] = useState(1); const [more, setMore] = useState(true);

  const search = useCallback(async (p: number, refresh = false) => {
    const q = kw.trim(); if (!q) return; setLoading(true);
    if (/^\d{4,}$/.test(q)) { setLoading(false); setSearched(true); navigation.navigate('AlbumDetail', { albumId: q }); return; }
    try { const r = await searchAlbums({ keyword: q, page: p, sort: 'mv' }); if (refresh || p === 1) setRes(r.content); else setRes(prev => [...prev, ...r.content]); setMore(r.content.length >= 20); setSearched(true); } catch {} finally { setLoading(false); }
  }, [kw, navigation]);

  const onSearch = () => { setPage(1); search(1, true); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar style="dark" />
      <FlatList data={res} numColumns={3} keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: Spacing.xl }}
        ListHeaderComponent={
          <View style={{ paddingTop: 8, gap: 6 }}>
            <Searchbar placeholder="搜索漫画、作者、车号..." onChangeText={setKw} value={kw}
              onSubmitEditing={onSearch} onIconPress={onSearch}
              style={{ backgroundColor: Colors.surfaceLowest, borderRadius: 12, elevation: 0 }}
              inputStyle={{ fontSize: 15 }}
              right={() => kw.length > 0 ? (
                <MaterialIcons name="close" size={20} color={Colors.textTertiary}
                  onPress={() => { setKw(''); setSearched(false); setRes([]); }} />
              ) : null}
            />
            {!searched && (
              <View>
                <Text variant="titleMedium" style={{ fontWeight: '700', marginTop: 4 }}>
                  <MaterialIcons name="local-fire-department" size={16} color={Colors.accent} /> 热门搜索
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {TAGS.map(t => (
                    <Chip key={t} mode="outlined" onPress={() => { setKw(t); setTimeout(onSearch, 100); }}
                      textStyle={{ fontSize: 12 }}>{t}</Chip>
                  ))}
                </View>
              </View>
            )}
            {searched && !loading && res.length === 0 && (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <MaterialIcons name="search-off" size={48} color={Colors.textTertiary} />
                <Text style={{ color: Colors.textSecondary, marginTop: 8 }}>未找到相关结果</Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => <ComicCard id={item.id} title={item.name} coverUrl={item.coverUrl} tags={item.tags} onPress={id => navigation.navigate('AlbumDetail', { albumId: id })} />}
        ListFooterComponent={loading ? <ActivityIndicator style={{ paddingVertical: Spacing.lg }} color={Colors.primary} /> : null}
        onEndReached={async () => { if (!more || loading) return; const np = page + 1; setPage(np); search(np); }}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}
