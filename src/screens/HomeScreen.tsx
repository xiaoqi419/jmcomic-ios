// Home — Guidelines 合规重构
// @author Jason

import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ComicCard } from '../components/ComicCard';
import { getCategoryAlbums } from '../api/mobile';
import { webCategory } from '../api/web';
import { CATEGORIES, SORT_OPTIONS } from '../constants';
import { Colors, Radius, FontSize, Touch } from '../theme';

export function HomeScreen() {
  const nav = useNavigation<any>();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState('mv');

  const fetch = useCallback(async (p: number, refresh = false) => {
    try { setErr(''); const r = await getCategoryAlbums({ page: p, category: cat, sort }); setData(refresh || p === 1 ? r.content : d => [...d, ...r.content]); } catch { try { const r = await webCategory(p); if (r.length > 0) setData(refresh || p === 1 ? r : d => [...d, ...r]); } catch (e: any) { setErr(e.message || '加载失败'); } }
  }, [cat, sort]);

  useEffect(() => { setLoading(true); fetch(1, true).finally(() => setLoading(false)); }, [fetch]);

  if (loading) return <SafeAreaView style={S.cont}><StatusBar style="dark" /><View style={S.center}><ActivityIndicator size="large" color={Colors.primary} /></View></SafeAreaView>;

  return (
    <SafeAreaView style={S.cont}>
      <StatusBar style="dark" />
      <FlatList data={data} numColumns={3} keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 80 }}
        ListHeaderComponent={
          <View style={{ paddingTop: 6, gap: 2 }}>
            <Label icon="explore" text="分类" />
            <Chips items={CATEGORIES} active={cat} onPress={id => { setCat(id); fetch(1, true); }} />
            <Label icon="trending-up" text="排序" />
            <Chips items={SORT_OPTIONS} active={sort} onPress={id => { setSort(id); fetch(1, true); }} />
            {err ? <Text style={S.err}>{err}</Text> : null}
          </View>
        }
        renderItem={({ item }) => <ComicCard id={item.id} title={item.name} coverUrl={item.coverUrl} tags={item.tags} onPress={id => nav.navigate('AlbumDetail', { albumId: id })} />}
        onEndReached={() => fetch(data.length / 20 + 1)}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<Text style={S.empty}>暂无数据</Text>}
      />
    </SafeAreaView>
  );
}

function Label({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 6 }}>
      <MaterialIcons name={icon as any} size={18} color={Colors.primary} aria-hidden={true} />
      <Text style={{ fontSize: FontSize.headline, fontWeight: '700', color: Colors.text }}>{text}</Text>
    </View>
  );
}

function Chips({ items, active, onPress }: { items: readonly { id: string; label: string }[]; active: string; onPress: (id: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {items.map(item => (
        <Pressable key={item.id}
          onPress={() => onPress(item.id)}
          accessibilityLabel={`${item.label}`}
          accessibilityRole="button"
          accessibilityState={{ selected: active === item.id }}
          style={({ pressed }) => [
            {
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.xl,
              backgroundColor: active === item.id ? Colors.primary : Colors.surface,
              borderWidth: 1, borderColor: active === item.id ? Colors.primary : Colors.border,
              minHeight: Touch.min,
            },
            pressed && { opacity: 0.8 },
          ]}>
          <Text style={{
            fontSize: FontSize.label, fontWeight: '600',
            color: active === item.id ? Colors.textOnPrimary : Colors.textSecondary,
          }}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const S = StyleSheet.create({
  cont: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  err: { color: Colors.error, textAlign: 'center', fontSize: FontSize.body, padding: 12 },
  empty: { color: Colors.textTertiary, textAlign: 'center', padding: 40, fontSize: FontSize.body },
});
