// 论坛 v2
// @author nyx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, FontSize } from '../theme';
import { fetchForumPosts } from '../api/endpoints';
import type { ForumPost } from '../api/types';
import { formatTime } from '../utils/helpers';

export function ForumScreen() {
  const nav = useNavigation<any>();
  const { t } = useTranslation();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForumPosts().then((d) => setPosts(d.list || [])).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={S.cont}>
      <FlatList
        data={posts}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: Spacing.marginEdge, paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={S.pageTitle}>{t('forum.title')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={S.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <View style={S.avatar}>
                <Text style={S.avatarText}>{(item.username || '?')[0]}</Text>
              </View>
              <Text style={S.username}>{item.username}</Text>
              <Text style={S.time}>{formatTime(item.addtime)}</Text>
            </View>
            <Text style={S.postTitle}>{item.title}</Text>
            <Text style={S.postContent} numberOfLines={3}>{item.content}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
              <MaterialIcons name="chat-bubble-outline" size={14} color={Colors.textTertiary} />
              <Text style={S.replyCount}>{item.reply_count || 0}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={loading ? null : <Text style={{ color: Colors.textTertiary, textAlign: 'center', marginTop: 40 }}>{t('common.empty')}</Text>}
      />
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  cont: { flex: 1, backgroundColor: Colors.background },
  pageTitle: { fontSize: FontSize.largeTitle, fontWeight: '800', color: Colors.textPrimary },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.card, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
  },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  username: { fontWeight: '600', color: Colors.textPrimary, fontSize: FontSize.body },
  time: { fontSize: FontSize.caption, color: Colors.textTertiary },
  postTitle: { fontSize: FontSize.bodyLarge, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  postContent: { color: Colors.textSecondary, lineHeight: 20, fontSize: FontSize.body },
  replyCount: { fontSize: FontSize.caption, color: Colors.textTertiary },
});
