// 论坛 v2
// @author nyx

import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useLegacyColors, LegacyColors, Radius, Spacing, FontSize } from '../theme';
import { fetchForumPosts } from '../api/endpoints';
import type { ForumPost } from '../api/types';
import { formatTime } from '../utils/helpers';

export function ForumScreen() {
  const nav = useNavigation<any>();
  const { t } = useTranslation();
  const C = useLegacyColors();
  const styles = useMemo(() => getStyles(C), [C]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForumPosts().then((d) => setPosts(d.list || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={styles.cont}>
      <FlashList
        data={posts}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: Spacing.marginEdge, paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={styles.pageTitle}>{t('forum.title')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(item.username || '?')[0]}</Text>
              </View>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.time}>{formatTime(item.addtime)}</Text>
            </View>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postContent} numberOfLines={3}>{item.content}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
              <MaterialIcons name="chat-bubble-outline" size={14} color={C.textTertiary} />
              <Text style={styles.replyCount}>{item.reply_count || 0}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={loading ? null : <Text style={{ color: C.textTertiary, textAlign: 'center', marginTop: 40 }}>{t('common.empty')}</Text>}
      />
    </SafeAreaView>
  );
}

function getStyles(C: LegacyColors) {
  return StyleSheet.create({
    cont: { flex: 1, backgroundColor: C.background },
    pageTitle: { fontSize: FontSize.largeTitle, fontWeight: '800', color: C.textPrimary },
    card: {
      backgroundColor: C.surface, borderRadius: Radius.card, padding: 14, marginBottom: 10,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
    },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    username: { fontWeight: '600', color: C.textPrimary, fontSize: FontSize.body },
    time: { fontSize: FontSize.caption, color: C.textTertiary },
    postTitle: { fontSize: FontSize.bodyLarge, fontWeight: '600', color: C.text, marginBottom: 4 },
    postContent: { color: C.textSecondary, lineHeight: 20, fontSize: FontSize.body },
    replyCount: { fontSize: FontSize.caption, color: C.textTertiary },
  });
}
