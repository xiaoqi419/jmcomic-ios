// Pica 创作者漫画列表 — 接收 creatorId 并分页查询
// @author Jason

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useLegacyColors, LegacyColors, FontSize, Radius, Spacing } from '../theme';
import { comicsByCreator } from '../pica/endpoints';
import { thumbUrl } from '../pica/types';
import type { PicaComicBrief } from '../pica/types';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - Spacing.marginEdge * 2 - 10 * 2) / 3;

export function PicaCreatorResultScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { creatorId, creatorName } = route.params as { creatorId: string; creatorName: string };
  const C = useLegacyColors();

  const [comics, setComics] = useState<PicaComicBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = async (p: number, refresh = false) => {
    setLoading(true);
    try {
      const res = await comicsByCreator(creatorId, p);
      const data = (res as any).comics || res;
      const docs = data.docs || [];
      if (refresh || p === 1) setComics(docs);
      else setComics((prev) => [...prev, ...docs]);
      setHasMore(docs.length >= 20);
      setPage(p);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(1, true); }, [creatorId]);

  const renderItem = ({ item }: { item: PicaComicBrief }) => (
    <Pressable onPress={() => nav.navigate('PicaDetail', { comicId: item._id })} style={{ width: CARD_W, marginBottom: 14 }}>
      <View style={{ width: '100%', aspectRatio: 0.7, borderRadius: Radius.card, overflow: 'hidden', backgroundColor: C.surfaceContainer }}>
        <Image source={{ uri: thumbUrl(item.thumb) }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      </View>
      <Text style={{ fontSize: FontSize.label, fontWeight: '600', color: C.textPrimary, marginTop: 6 }} numberOfLines={2}>{item.title}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <FlatList
        data={comics}
        renderItem={renderItem}
        keyExtractor={(i) => i._id}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingHorizontal: Spacing.marginEdge, paddingVertical: 12 }}
        onEndReached={() => { if (hasMore && !loading) load(page + 1); }}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={<Text style={{ fontSize: FontSize.headline, fontWeight: '700', color: C.textPrimary }}>{creatorName} 的作品</Text>}
        ListEmptyComponent={loading ? <ActivityIndicator color={C.primary} style={{ marginTop: 40 }} /> : <View style={{ alignItems: 'center', marginTop: 40 }}><MaterialIcons name="info-outline" size={48} color={C.textTertiary} /><Text style={{ color: C.textSecondary, marginTop: 8 }}>暂无漫画</Text></View>}
      />
    </View>
  );
}
