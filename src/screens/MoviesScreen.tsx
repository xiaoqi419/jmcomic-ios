// 视频 v3 — WebView 内嵌播放，不再跳转 Safari
// @author Jason

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Pressable, ActivityIndicator, Dimensions,
  Linking, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, FontSize } from '../theme';
import { fetchMovies, fetchVideoDetail } from '../api/endpoints';
import { fetchImageAsDataUri } from '../utils/fetchImage';
import type { MovieItem } from '../api/types';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - Spacing.marginEdge * 2 - 10) / 2;

function AuthImage({ uri }: { uri: string }) {
  const [dataUri, setDataUri] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchImageAsDataUri(uri).then((d) => { if (!cancelled) setDataUri(d); }).catch(() => {});
    return () => { cancelled = true; };
  }, [uri]);
  if (!dataUri) return <View style={{ width: CARD_W, height: CARD_W * 0.75, borderRadius: Radius.sm, backgroundColor: Colors.surfaceContainer }} />;
  return (
    <Image source={{ uri: dataUri }} style={{ width: CARD_W, height: CARD_W * 0.75, borderRadius: Radius.sm, backgroundColor: Colors.surfaceContainer }} contentFit="cover" />
  );
}

export function MoviesScreen() {
  const nav = useNavigation<any>();
  const { t } = useTranslation();
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies().then((d) => setMovies(d.list || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: Colors.background }}>
      <FlatList
        data={movies}
        numColumns={2}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: Spacing.marginEdge, paddingBottom: 100 }}
        ListHeaderComponent={<Text style={{ fontSize: FontSize.largeTitle, fontWeight: '800', color: Colors.textPrimary, marginBottom: 14 }}>{t('movies.title')}</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => nav.navigate('MoviePlayer' as never, { vid: item.id } as never)}
            style={{ width: CARD_W, margin: 4, marginBottom: 14 }}
          >
            <AuthImage uri={item.photo} />
            <Text style={{ fontSize: FontSize.body, fontWeight: '600', color: Colors.text, marginTop: 6 }} numberOfLines={2}>{item.title}</Text>
            {item.tags?.length > 0 && (
              <Text style={{ fontSize: FontSize.caption, color: Colors.textTertiary, marginTop: 2 }}>{item.tags.slice(0, 3).join(', ')}</Text>
            )}
          </Pressable>
        )}
        ListEmptyComponent={loading ? <ActivityIndicator color={Colors.primary} /> : null}
      />
    </SafeAreaView>
  );
}

export function MoviePlayerScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { vid } = route.params;
  const { t } = useTranslation();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetchVideoDetail(vid).then((d) => {
      setVideo(d.video);
    }).catch((e: any) => {
      setErr(e.message || '加载失败');
    }).finally(() => setLoading(false));
  }, [vid]);

  if (loading) return <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={Colors.primary} /></SafeAreaView>;
  if (err) return <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#666' }}>{err}</Text></SafeAreaView>;
  if (!video) return <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#666' }}>{t('common.error')}</Text></SafeAreaView>;

  const videoUrl = video.full_url || video.video_src || `https://18comic.vip/video/${vid}`;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: '#000' }}>
      {/* 顶栏 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#111' }}>
        <Pressable onPress={() => nav.goBack()}><MaterialIcons name="arrow-back" size={24} color="#fff" /></Pressable>
        <Text style={{ color: '#fff', fontSize: FontSize.headline, fontWeight: '600', marginLeft: 12, flex: 1 }} numberOfLines={1}>{video.title}</Text>
        <Pressable onPress={() => Linking.openURL(videoUrl)} hitSlop={8}>
          <MaterialIcons name="open-in-new" size={22} color={Colors.primary} />
        </Pressable>
      </View>

      {/* WebView 播放 */}
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: videoUrl }}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState
          renderLoading={() => (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' }}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          )}
        />
      </View>

      {/* 信息 */}
      <View style={{ padding: Spacing.marginEdge }}>
        <Text style={{ color: '#fff', fontSize: FontSize.headline, fontWeight: '700', marginBottom: 6 }}>{video.title}</Text>
        {video.view ? <Text style={{ color: '#aaa', fontSize: FontSize.body }}>{t('movies.views', { count: video.view })}</Text> : null}
        {video.factory ? <Text style={{ color: '#aaa', fontSize: FontSize.body }}>{t('movies.studio')}: {video.factory}</Text> : null}
        {video.girls?.length > 0 ? <Text style={{ color: '#aaa', fontSize: FontSize.body }}>{t('movies.actress')}: {video.girls.join(', ')}</Text> : null}
      </View>
    </SafeAreaView>
  );
}
