// 收藏库 v2
// @author nyx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, FontSize, Shadow } from '../theme';
import { useAuthStore } from '../store/useAuth';
import { useFavoritesStore } from '../store/useFavorites';
import { fetchFavorites, getCoverUrl as getCover } from '../api/endpoints';
import type { FavoriteItem, FavoriteFolder } from '../api/types';

export function LibraryScreen() {
  const nav = useNavigation<any>();
  const { t } = useTranslation();
  const { loggedIn } = useAuthStore();
  const { local, loadLocal } = useFavoritesStore();
  const [online, setOnline] = useState<FavoriteItem[]>([]);
  const [folders, setFolders] = useState<FavoriteFolder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocal();
    if (loggedIn) {
      fetchFavorites().then((d) => {
        setOnline(d.list || []);
        setFolders(d.folder_list || []);
        setTotal(parseInt(d.total) || 0);
      }).finally(() => setLoading(false));
    } else setLoading(false);
  }, [loggedIn]);

  const items: any[] = loggedIn && online.length > 0 ? online : local;

  return (
    <SafeAreaView edges={["top"]} style={S.cont}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: Spacing.marginEdge, paddingBottom: 100 }}
        ListHeaderComponent={
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={S.title}>{t('library.title')}</Text>
              <Text style={S.total}>{t('library.total', { n: total || items.length })}</Text>
            </View>
            {folders.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {folders.map((f) => (
                  <Pressable key={f.FID} style={S.folderChip}>
                    <MaterialIcons name="folder" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
                    <Text style={S.folderChipText}>{f.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => nav.navigate('ComicDetail', { albumId: item.id })} style={S.item}>
            <Image
              source={{ uri: (item as any).image || (item as any).coverUrl || getCover(item.id) }}
              style={S.itemCover}
              contentFit="cover"
            />
            <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
              <Text style={S.itemTitle} numberOfLines={2}>{(item as any).name || (item as any).title}</Text>
              {(item as any).author && <Text style={S.itemAuthor}>{(item as any).author}</Text>}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <MaterialIcons name="bookmark-border" size={48} color={Colors.textTertiary} />
            <Text style={{ color: Colors.textSecondary, marginTop: 12, fontSize: FontSize.body }}>{t('library.empty')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  cont: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: FontSize.largeTitle, fontWeight: '800', color: Colors.textPrimary },
  total: { color: Colors.textSecondary, fontSize: FontSize.body },
  folderChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.xl,
    backgroundColor: Colors.surface, marginRight: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  folderChipText: { fontSize: FontSize.label, color: Colors.textSecondary },
  item: {
    flexDirection: 'row',
    backgroundColor: Colors.surface, borderRadius: Radius.card,
    padding: 12, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
  },
  itemCover: { width: 60, height: 80, borderRadius: Radius.sm, backgroundColor: Colors.surfaceContainer },
  itemTitle: { fontWeight: '600', color: Colors.textPrimary, fontSize: FontSize.body },
  itemAuthor: { fontSize: FontSize.label, color: Colors.textSecondary, marginTop: 4 },
});
