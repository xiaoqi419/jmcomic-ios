// 小说 v2
// @author nyx

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useLegacyColors, LegacyColors, Radius, Spacing, FontSize } from '../theme';
import { fetchNovels, fetchNovelDetail, fetchNovelContent } from '../api/endpoints';
import type { NovelItem, NovelChapter, NovelContent } from '../api/types';

export function NovelsScreen() {
  const nav = useNavigation<any>();
  const { t } = useTranslation();
  const C = useLegacyColors();
  const styles = useMemo(() => getStyles(C), [C]);
  const [list, setList] = useState<NovelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const d = await fetchNovels();
    setList(d.list || []);
  }, []);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return (
    <SafeAreaView edges={["top"]} style={styles.cont}>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />}
        contentContainerStyle={{ padding: Spacing.marginEdge, paddingBottom: 100 }}
        ListHeaderComponent={<Text style={styles.pageTitle}>{t('novels.title')}</Text>}
        renderItem={({ item }) => (
          <Pressable onPress={() => nav.navigate('NovelDetail' as never, { novelId: item.id } as never)} style={styles.card}>
            <Image source={{ uri: item.photo }} style={styles.cardCover} contentFit="cover" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardAuthor}>{item.author}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={loading ? <ActivityIndicator color={C.primary} /> : <Text style={styles.empty}>{t('common.empty')}</Text>}
      />
    </SafeAreaView>
  );
}

export function NovelDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { novelId } = route.params;
  const { t } = useTranslation();
  const C = useLegacyColors();
  const styles = useMemo(() => getStyles(C), [C]);
  const [novel, setNovel] = useState<NovelItem | null>(null);
  const [chapters, setChapters] = useState<NovelChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNovelDetail(novelId).then((d) => {
      setNovel(d.novel);
      setChapters(d.chapters || []);
    }).finally(() => setLoading(false));
  }, [novelId]);

  if (loading) return <SafeAreaView edges={["top"]} style={styles.cont}><View style={styles.center}><ActivityIndicator color={C.primary} /></View></SafeAreaView>;
  if (!novel) return null;

  return (
    <SafeAreaView edges={["top"]} style={styles.cont}>
      <ScrollView contentContainerStyle={{ padding: Spacing.marginEdge }}>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <Image source={{ uri: novel.photo }} style={styles.novelCover} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={styles.novelTitle}>{novel.title}</Text>
            <Text style={styles.novelAuthor}>{novel.author}</Text>
            <Text style={styles.novelDesc} numberOfLines={3}>{novel.description}</Text>
          </View>
        </View>
        <Text style={styles.chapterHeader}>
          {t('novels.chapters')} ({chapters.length})
        </Text>
        {chapters.map((ch) => (
          <Pressable
            key={ch.id}
            onPress={() => nav.navigate('NovelReader' as never, { novelId, chapterId: ch.id, title: ch.title } as never)}
            style={styles.chapterItem}
          >
            <Text style={styles.chapterText} numberOfLines={1}>{ch.title}</Text>
            <MaterialIcons name="chevron-right" size={20} color={C.textTertiary} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export function NovelReaderScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const { novelId, chapterId } = route.params;
  const C = useLegacyColors();
  const styles = useMemo(() => getStyles(C), [C]);
  const [content, setContent] = useState<NovelContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNovelContent(chapterId).then(setContent).finally(() => setLoading(false));
  }, [chapterId]);

  if (loading) return <SafeAreaView edges={["top"]} style={styles.cont}><View style={styles.center}><ActivityIndicator color={C.primary} /></View></SafeAreaView>;
  if (!content) return null;

  return (
    <SafeAreaView edges={["top"]} style={styles.cont}>
      <View style={styles.readerHeader}>
        <Pressable onPress={() => nav.goBack()}><MaterialIcons name="arrow-back" size={24} color={C.textPrimary} /></Pressable>
        <Text style={styles.readerTitle} numberOfLines={1}>{content.title}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.marginEdge, paddingBottom: 60 }}>
        <Text style={styles.readerContent}>{content.content}</Text>
      </ScrollView>
      <View style={styles.readerNav}>
        {content.prev_id ? (
          <Pressable onPress={() => { nav.replace('NovelReader' as never, { novelId, chapterId: content.prev_id } as never); }}>
            <Text style={styles.navBtn}>{t('novels.prev')}</Text>
          </Pressable>
        ) : <View />}
        {content.next_id ? (
          <Pressable onPress={() => { nav.replace('NovelReader' as never, { novelId, chapterId: content.next_id } as never); }}>
            <Text style={styles.navBtn}>{t('novels.next')}</Text>
          </Pressable>
        ) : <View />}
      </View>
    </SafeAreaView>
  );
}

function getStyles(C: LegacyColors) {
  return StyleSheet.create({
    cont: { flex: 1, backgroundColor: C.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    pageTitle: { fontSize: FontSize.largeTitle, fontWeight: '800', color: C.textPrimary, marginBottom: 14 },
    empty: { color: C.textTertiary, textAlign: 'center', marginTop: 40 },

    card: {
      flexDirection: 'row',
      backgroundColor: C.surface, borderRadius: Radius.card,
      padding: 12, marginBottom: 10,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
    },
    cardCover: { width: 60, height: 80, borderRadius: Radius.sm, backgroundColor: C.surfaceContainer },
    cardTitle: { fontWeight: '600', color: C.textPrimary, fontSize: FontSize.bodyLarge },
    cardAuthor: { color: C.primary, fontSize: FontSize.body, marginTop: 2 },
    cardDesc: { color: C.textTertiary, fontSize: FontSize.body, marginTop: 4, lineHeight: 18 },

    novelCover: { width: 100, height: 140, borderRadius: Radius.card, backgroundColor: C.surfaceContainer },
    novelTitle: { fontSize: FontSize.title, fontWeight: '700', color: C.textPrimary },
    novelAuthor: { color: C.primary, fontSize: FontSize.body, marginTop: 4 },
    novelDesc: { color: C.textTertiary, fontSize: FontSize.body, marginTop: 6, lineHeight: 20 },
    chapterHeader: { fontSize: FontSize.headline, fontWeight: '700', color: C.textPrimary, marginTop: 20, marginBottom: 10 },
    chapterItem: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 12, paddingHorizontal: 14,
      backgroundColor: C.surface, borderRadius: Radius.card,
      marginBottom: 6,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15, shadowRadius: 3, elevation: 1,
    },
    chapterText: { color: C.textPrimary, flex: 1, fontSize: FontSize.body },

    readerHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.surface,
    },
    readerTitle: { color: C.textPrimary, fontSize: FontSize.headline, fontWeight: '600', flex: 1, textAlign: 'center' },
    readerContent: { color: C.textPrimary, fontSize: FontSize.bodyLarge, lineHeight: 26 },
    readerNav: {
      flexDirection: 'row', justifyContent: 'space-between',
      padding: Spacing.marginEdge, backgroundColor: C.surface,
    },
    navBtn: { color: C.primary, fontSize: FontSize.body, fontWeight: '600' },
  });
}
