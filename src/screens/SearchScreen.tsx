// 搜索页 — 动态热门标签 + 车号直达
// @author Jason

import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ComicCard } from '../components/ComicCard';
import { searchAlbums, getHotTags } from '../api/mobile';
import { Colors, Spacing, FontSize } from '../theme';
import { Text, TextInput, Pressable, StyleSheet } from 'react-native';

const FALLBACK_TAGS = ['全彩', '无修正', '同人', 'CG', '韩漫', '纯爱', 'NTR'];

export function SearchScreen() {
  const nav = useNavigation<any>();
  const [kw, setKw] = useState('');
  const [res, setRes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(true);
  const [tags, setTags] = useState<string[]>(FALLBACK_TAGS);

  useEffect(() => { getHotTags().then(t => { if (t.length > 0) setTags(t); }); }, []);

  const search = useCallback(async (p: number, refresh = false) => {
    const q = kw.trim(); if (!q) return; setLoading(true);
    if (/^\d{4,}$/.test(q)) { setLoading(false); setSearched(true); nav.navigate('AlbumDetail', { albumId: q }); return; }
    try { const r = await searchAlbums({ keyword: q, page: p, sort: 'mv' }); if (refresh || p === 1) setRes(r.content); else setRes(p => [...p, ...r.content]); setMore(r.content.length >= 20); setSearched(true); } catch {} finally { setLoading(false); }
  }, [kw]);

  const onSearch = () => { setPage(1); search(1, true); };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <FlatList data={res} numColumns={3} keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: Spacing.xl }}
        ListHeaderComponent={
          <View style={{ paddingTop: 8, gap: 6 }}>
            <View style={styles.searchWrap}>
              <MaterialIcons name="search" size={20} color={Colors.textTertiary} style={{ marginLeft: 10 }} />
              <TextInput style={styles.input} placeholder="搜索漫画、车号..." placeholderTextColor={Colors.textTertiary}
                value={kw} onChangeText={setKw} onSubmitEditing={onSearch} returnKeyType="search" />
              {kw.length > 0 && (
                <Pressable onPress={() => { setKw(''); setSearched(false); setRes([]); }}
                  hitSlop={8}>
                  <MaterialIcons name="close" size={18} color={Colors.textTertiary} style={{ marginRight: 8 }} />
                </Pressable>
              )}
            </View>
            <Pressable onPress={onSearch} style={({ pressed }) => [styles.searchBtn, { opacity: pressed ? 0.7 : 1 }]}>
              <MaterialIcons name="search" size={18} color="#fff" />
              <Text style={styles.searchBtnText}>搜索</Text>
            </Pressable>
            {!searched && (
              <View>
                <Text style={styles.sectionTitle}>热门搜索</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {tags.slice(0, 12).map(t => (
                    <Pressable key={t} onPress={() => { setKw(t); setTimeout(onSearch, 100); }}
                      style={({ pressed }) => [styles.tag, { opacity: pressed ? 0.6 : 1 }]}>
                      <Text style={styles.tagText}>{t}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={!loading && searched ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <MaterialIcons name="search-off" size={48} color={Colors.textTertiary} />
            <Text style={{ fontSize: 15, color: Colors.textSecondary, marginTop: 12 }}>未找到相关结果</Text>
          </View>
        ) : null}
        renderItem={({ item }) => <ComicCard id={item.id} title={item.name} coverUrl={item.coverUrl} tags={item.tags} onPress={id => nav.navigate('AlbumDetail', { albumId: id })} />}
        ListFooterComponent={loading ? <ActivityIndicator style={{ paddingVertical: Spacing.lg }} color={Colors.primary} /> : null}
        onEndReached={async () => { if (!more || loading) return; const np = page + 1; setPage(np); search(np); }}
        onEndReachedThreshold={0.3}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  sectionTitle: { fontSize: FontSize.headline, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border },
  input: { flex: 1, height: 40, paddingHorizontal: 8, color: Colors.textPrimary, fontSize: 15 },
  searchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4, height: 40, borderRadius: 10, backgroundColor: Colors.primary, gap: 6 },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  tagText: { fontSize: 12, color: Colors.textSecondary },
});
