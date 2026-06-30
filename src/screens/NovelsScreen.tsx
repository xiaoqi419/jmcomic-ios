// 小说 v2
// @author nyx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, FontSize } from '../theme';
import { fetchNovels, fetchNovelDetail, fetchNovelContent } from '../api/endpoints';
import type { NovelItem, NovelChapter, NovelContent } from '../api/types';

export function NovelsScreen() {
  const nav = useNavigation<any>();
  const { t } = useTranslation();
  const [list, setList] = useState<NovelItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNovels().then((d) => setList(d.list || [])).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={S.cont}>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: Spacing.marginEdge, paddingBottom: 100 }}
        ListHeaderComponent={<Text style={S.pageTitle}>{t('novels.title')}</Text>}
        renderItem={({ item }) => (
          <Pressable onPress={() => nav.navigate('NovelDetail' as never, { novelId: item.id } as never)} style={S.card}>
            <Image source={{ uri: item.photo }} style={S.cardCover} contentFit="cover" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={S.cardTitle}>{item.title}</Text>
              <Text style={S.cardAuthor}>{item.author}</Text>
              <Text style={S.cardDesc} numberOfLines={2}>{item.description}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={loading ? <ActivityIndicator color={Colors.primary} /> : <Text style={S.empty}>{t('common.empty')}</Text>}
      />
    </SafeAreaView>
  );
}

export function NovelDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { novelId } = route.params;
  const { t } = useTranslation();
  const [novel, setNovel] = useState<NovelItem | null>(null);
  const [chapters, setChapters] = useState<NovelChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNovelDetail(novelId).then((d) => {
      setNovel(d.novel);
      setChapters(d.chapters || []);
    }).finally(() => setLoading(false));
  }, [novelId]);

  if (loading) return <SafeAreaView edges={["top"]} style={S.cont}><View style={S.center}><ActivityIndicator color={Colors.primary} /></View></SafeAreaView>;
  if (!novel) return null;

  return (
    <SafeAreaView edges={["top"]} style={S.cont}>
      <ScrollView contentContainerStyle={{ padding: Spacing.marginEdge }}>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <Image source={{ uri: novel.photo }} style={S.novelCover} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={S.novelTitle}>{novel.title}</Text>
            <Text style={S.novelAuthor}>{novel.author}</Text>
            <Text style={S.novelDesc} numberOfLines={3}>{novel.description}</Text>
          </View>
        </View>
        <Text style={S.chapterHeader}>
          {t('novels.chapters')} ({chapters.length})
        </Text>
        {chapters.map((ch) => (
          <Pressable
            key={ch.id}
            onPress={() => nav.navigate('NovelReader' as never, { novelId, chapterId: ch.id, title: ch.title } as never)}
            style={S.chapterItem}
          >
            <Text style={S.chapterText} numberOfLines={1}>{ch.title}</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textTertiary} />
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
  const [content, setContent] = useState<NovelContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNovelContent(chapterId).then(setContent).finally(() => setLoading(false));
  }, [chapterId]);

  if (loading) return <SafeAreaView edges={["top"]} style={S.cont}><View style={S.center}><ActivityIndicator color={Colors.primary} /></View></SafeAreaView>;
  if (!content) return null;

  return (
    <SafeAreaView edges={["top"]} style={S.cont}>
      <View style={S.readerHeader}>
        <Pressable onPress={() => nav.goBack()}><MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} /></Pressable>
        <Text style={S.readerTitle} numberOfLines={1}>{content.title}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.marginEdge, paddingBottom: 60 }}>
        <Text style={S.readerContent}>{content.content}</Text>
      </ScrollView>
      <View style={S.readerNav}>
        {content.prev_id ? (
          <Pressable onPress={() => { nav.replace('NovelReader' as never, { novelId, chapterId: content.prev_id } as never); }}>
            <Text style={S.navBtn}>{t('novels.prev')}</Text>
          </Pressable>
        ) : <View />}
        {content.next_id ? (
          <Pressable onPress={() => { nav.replace('NovelReader' as never, { novelId, chapterId: content.next_id } as never); }}>
            <Text style={S.navBtn}>{t('novels.next')}</Text>
          </Pressable>
        ) : <View />}
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  cont: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageTitle: { fontSize: FontSize.largeTitle, fontWeight: '800', color: Colors.textPrimary, marginBottom: 14 },
  empty: { color: Colors.textTertiary, textAlign: 'center', marginTop: 40 },

  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface, borderRadius: Radius.card,
    padding: 12, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
  },
  cardCover: { width: 60, height: 80, borderRadius: Radius.sm, backgroundColor: Colors.surfaceContainer },
  cardTitle: { fontWeight: '600', color: Colors.textPrimary, fontSize: FontSize.bodyLarge },
  cardAuthor: { color: Colors.primary, fontSize: FontSize.body, marginTop: 2 },
  cardDesc: { color: Colors.textTertiary, fontSize: FontSize.body, marginTop: 4, lineHeight: 18 },

  novelCover: { width: 100, height: 140, borderRadius: Radius.card, backgroundColor: Colors.surfaceContainer },
  novelTitle: { fontSize: FontSize.title, fontWeight: '700', color: Colors.textPrimary },
  novelAuthor: { color: Colors.primary, fontSize: FontSize.body, marginTop: 4 },
  novelDesc: { color: Colors.textTertiary, fontSize: FontSize.body, marginTop: 6, lineHeight: 20 },
  chapterHeader: { fontSize: FontSize.headline, fontWeight: '700', color: Colors.textPrimary, marginTop: 20, marginBottom: 10 },
  chapterItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    backgroundColor: Colors.surface, borderRadius: Radius.card,
    marginBottom: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 3, elevation: 1,
  },
  chapterText: { color: Colors.textPrimary, flex: 1, fontSize: FontSize.body },

  readerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10, backgroundColor: Colors.surface,
  },
  readerTitle: { color: Colors.textPrimary, fontSize: FontSize.headline, fontWeight: '600', flex: 1, textAlign: 'center' },
  readerContent: { color: Colors.textPrimary, fontSize: FontSize.bodyLarge, lineHeight: 26 },
  readerNav: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: Spacing.marginEdge, backgroundColor: Colors.surface,
  },
  navBtn: { color: Colors.primary, fontSize: FontSize.body, fontWeight: '600' },
});
