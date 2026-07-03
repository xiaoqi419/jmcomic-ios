// Pica 漫画详情页 — 参照 haka_comic 设计
// @author Jason

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator,
  Dimensions, Platform, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useLegacyColors, LegacyColors, FontSize, Radius, Spacing } from '../theme';
import { picaSource } from '../sources/pica';
import { comicComments, sendComment, likeComment, replyComment } from '../pica/endpoints';
import { thumbUrl } from '../pica/types';
import type { SourceDetail } from '../sources/types';

const { width: W } = Dimensions.get('window');
const COVER_W = 115;
const COVER_H = 170;

interface PicaComment {
  _id: string;
  content: string;
  _user?: { name: string; avatar?: any };
  user?: { name: string; avatar?: any };
  likesCount: number;
  isLiked?: boolean;
  created_at: string;
}

export function PicaDetailScreen() {
  const nav = useNavigation<any>();
  const p = useRoute<any>().params;
  const comicId = p?.comicId || p?.albumId || p?.id || '';

  const [detail, setDetail] = useState<SourceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // 评论
  const [comments, setComments] = useState<PicaComment[]>([]);
  const [commLoading, setCommLoading] = useState(false);
  const [commPage, setCommPage] = useState(1);
  const [hasMoreComm, setHasMoreComm] = useState(true);
  const [commText, setCommText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);

  // 章节排序
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    picaSource.fetchDetail(comicId).then(setDetail).catch(() => {}).finally(() => setLoading(false));
  }, [comicId]);

  // 加载评论
  const loadComments = useCallback(async (page = 1, refresh = false) => {
    if (commLoading) return;
    setCommLoading(true);
    try {
      const raw = await comicComments(comicId, page);
      const data = (raw as any).comments || raw;
      const docs: PicaComment[] = data.docs || [];
      if (refresh || page === 1) setComments(docs);
      else setComments((prev) => [...prev, ...docs]);
      setHasMoreComm(docs.length >= 20);
      setCommPage(page);
    } catch {}
    setCommLoading(false);
  }, [comicId, commLoading]);

  useEffect(() => {
    if (detail && comments.length === 0) loadComments(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  const handleSend = async () => {
    const text = commText.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      if (replyTo) await replyComment(replyTo.id, text);
      else await sendComment(comicId, text);
      setCommText('');
      setReplyTo(null);
      loadComments(1, true);
    } catch {}
    setSending(false);
  };

  const handleLike = async (cid: string) => {
    try {
      await likeComment(cid);
      setComments((prev) => prev.map((c) =>
        c._id === cid ? { ...c, isLiked: !c.isLiked, likesCount: c.likesCount + (c.isLiked ? -1 : 1) } : c
      ));
    } catch {}
  };

  const fmtTime = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <ActivityIndicator size="large" color="#E85D3A" style={{ marginTop: 100 }} />
      </View>
    );
  }
  if (!detail) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <View style={{ alignItems: 'center', marginTop: 100 }}>
          <MaterialIcons name="error-outline" size={48} color="#6B6873" />
          <Text style={{ color: '#9895A0', marginTop: 12 }}>加载失败</Text>
        </View>
      </View>
    );
  }

  const chs = detail.chapters || [];
  const sortedChs = sortAsc ? [...chs].sort((a, b) => a.order - b.order) : [...chs].sort((a, b) => b.order - a.order);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ===== 头部：封面 + 基本信息 ===== */}
        <View style={styles.headerRow}>
          <Image source={{ uri: detail.coverUrl }} style={styles.coverThumb} contentFit="cover" />
          <View style={styles.headerInfo}>
            <Text style={styles.title} numberOfLines={2}>{detail.title}</Text>
            {/* 作者（可点击搜索） */}
            {detail.author ? (
              <Pressable onPress={() => nav.navigate('Main', { screen: 'Search', params: { query: detail.author } })}>
                <Text style={styles.author}>{detail.author}</Text>
              </Pressable>
            ) : null}
            {/* 分类 */}
            {Array.isArray(detail.categories) && detail.categories.length > 0 && (
              <View style={styles.tagRow}>
                {detail.categories.slice(0, 4).map((cat) => (
                  <Pressable key={cat} onPress={() => nav.navigate('Main', { screen: 'Search', params: { query: cat } })}>
                    <View style={styles.catTag}><Text style={styles.catText}>{cat}</Text></View>
                  </Pressable>
                ))}
              </View>
            )}
            {/* 标签 */}
            {Array.isArray(detail.tags) && detail.tags.length > 0 && (
              <View style={styles.tagRow}>
                {detail.tags.slice(0, 4).map((tag) => (
                  <Pressable key={tag} onPress={() => nav.navigate('Main', { screen: 'Search', params: { query: tag } })}>
                    <View style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ===== 统计行 ===== */}
        <View style={styles.statRow}>
          <View style={styles.statItem}><MaterialIcons name="favorite-border" size={15} color="#6B6873" /><Text style={styles.statLabel}>0</Text></View>
          <View style={styles.statDot} />
          <View style={styles.statItem}><MaterialIcons name="visibility" size={15} color="#6B6873" /><Text style={styles.statLabel}>0</Text></View>
          <View style={styles.statDot} />
          <View style={styles.statItem}><MaterialIcons name="collections" size={15} color="#6B6873" /><Text style={styles.statLabel}>{chs.length || 0}</Text></View>
          <View style={styles.statDot} />
          <View style={styles.statItem}><MaterialIcons name="chat-bubble-outline" size={15} color="#6B6873" /><Text style={styles.statLabel}>{comments.length || 0}</Text></View>
        </View>

        {/* ===== 操作按钮行 ===== */}
        <View style={styles.actionRow}>
          <Pressable style={styles.actionBtn}>
            <MaterialIcons name="favorite-outline" size={20} color="#E85D3A" />
            <Text style={styles.actionText}>点赞</Text>
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <MaterialIcons name="bookmark-outline" size={20} color="#E85D3A" />
            <Text style={styles.actionText}>收藏</Text>
          </Pressable>
        </View>

        {/* ===== 开始阅读 ===== */}
        {chs.length > 0 && (
          <Pressable
            onPress={() => nav.navigate('PicaReader', {
              comicId: detail.id,
              chapterOrder: chs[chs.length - 1].order,
              chapterId: chs[chs.length - 1].id,
              title: detail.title,
            })}
            style={styles.readBtn}
          >
            <MaterialIcons name="play-arrow" size={22} color="#fff" />
            <Text style={styles.readBtnText}>开始阅读</Text>
          </Pressable>
        )}

        {/* ===== 简介 ===== */}
        {detail.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>简介</Text>
            <Text style={styles.descText} numberOfLines={6}>{detail.description}</Text>
          </View>
        ) : null}

        {/* ===== 章节列表 ===== */}
        {chs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>章节 ({chs.length})</Text>
              <Pressable onPress={() => setSortAsc(!sortAsc)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialIcons name="sort" size={16} color="#9895A0" />
                <Text style={{ color: '#9895A0', fontSize: FontSize.label }}>{sortAsc ? '正序' : '倒序'}</Text>
              </Pressable>
            </View>
            {sortedChs.slice(0, 40).map((ch) => (
              <Pressable
                key={ch.id}
                onPress={() => nav.navigate('PicaReader', {
                  comicId: detail.id, chapterOrder: ch.order, chapterId: ch.id, title: detail.title,
                })}
                style={styles.epCard}
              >
                <MaterialIcons name="book" size={16} color="#6B6873" style={{ marginRight: 8 }} />
                <Text style={styles.epTitle} numberOfLines={1}>{ch.title}</Text>
                <MaterialIcons name="chevron-right" size={18} color="#6B6873" />
              </Pressable>
            ))}
            {chs.length > 40 && (
              <Text style={{ color: '#E85D3A', fontSize: FontSize.label, textAlign: 'center', marginTop: 8 }}>
                还有 {chs.length - 40} 话
              </Text>
            )}
          </View>
        )}

        {/* ===== 评论 ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>评论 ({comments.length || 0})</Text>
          {/* 输入框 */}
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              {replyTo && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ color: '#E85D3A', fontSize: FontSize.label, flex: 1 }}>
                    回复 @{replyTo.name}
                  </Text>
                  <Pressable onPress={() => setReplyTo(null)} hitSlop={8}>
                    <MaterialIcons name="close" size={14} color="#6B6873" />
                  </Pressable>
                </View>
              )}
              <TextInput
                style={styles.commentInput}
                placeholder={replyTo ? `回复 @${replyTo.name}...` : '说点什么...'}
                placeholderTextColor="#6B6873"
                value={commText}
                onChangeText={setCommText}
                multiline
              />
            </View>
            <Pressable onPress={handleSend} style={[styles.sendBtn, { opacity: sending || !commText.trim() ? 0.5 : 1 }]} disabled={sending || !commText.trim()}>
              <MaterialIcons name="send" size={16} color="#fff" />
            </Pressable>
          </View>

          {commLoading && comments.length === 0 ? (
            <ActivityIndicator color="#E85D3A" style={{ marginVertical: 20 }} />
          ) : comments.length === 0 ? (
            <Text style={{ color: '#6B6873', fontSize: FontSize.body, textAlign: 'center', marginVertical: 20 }}>暂无评论</Text>
          ) : (
            comments.map((c) => {
              const user: any = c._user || c.user || {};
              const uname = user?.name || '匿名';
              return (
                <View key={c._id} style={styles.commentItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={styles.avatar}><Text style={styles.avatarText}>{(uname[0] || '?').toUpperCase()}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600', color: '#F0EDE8', fontSize: FontSize.body }}>{uname}</Text>
                      <Text style={{ fontSize: FontSize.caption, color: '#6B6873', marginTop: 1 }}>{fmtTime(c.created_at)}</Text>
                    </View>
                    <Pressable onPress={() => handleLike(c._id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <MaterialIcons name={c.isLiked ? 'favorite' : 'favorite-border'} size={14} color={c.isLiked ? '#e74c3c' : '#6B6873'} />
                      <Text style={{ fontSize: FontSize.caption, color: c.isLiked ? '#e74c3c' : '#6B6873' }}>{c.likesCount || 0}</Text>
                    </Pressable>
                  </View>
                  <Text style={{ color: '#9895A0', fontSize: FontSize.body, marginTop: 4, lineHeight: 20 }}>{c.content}</Text>
                  <Pressable onPress={() => setReplyTo({ id: c._id, name: uname })} style={{ marginTop: 4 }}>
                    <Text style={{ color: '#E85D3A', fontSize: FontSize.label, fontWeight: '600' }}>回复</Text>
                  </Pressable>
                </View>
              );
            })
          )}
          {hasMoreComm && comments.length > 0 && (
            <Pressable onPress={() => loadComments(commPage + 1)} style={{ paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ color: '#E85D3A', fontSize: FontSize.body }}>加载更多</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 14 },
  coverThumb: { width: COVER_W, height: COVER_H, borderRadius: 10, backgroundColor: '#1A1A24' },
  headerInfo: { flex: 1, justifyContent: 'flex-start' },
  title: { fontSize: 18, fontWeight: '800', color: '#F0EDE8', lineHeight: 24 },
  author: { fontSize: FontSize.body, color: '#E85D3A', marginTop: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  catTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, backgroundColor: 'rgba(232,93,58,0.12)', borderWidth: 1, borderColor: 'rgba(232,93,58,0.2)' },
  catText: { fontSize: FontSize.caption, color: '#E85D3A', fontWeight: '600' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, backgroundColor: '#1A1A24', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  tagText: { fontSize: FontSize.caption, color: '#9895A0' },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, paddingHorizontal: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statLabel: { fontSize: FontSize.caption, color: '#6B6873' },
  statDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#3A3A45' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 12, paddingHorizontal: 16 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(232,93,58,0.08)',
    borderWidth: 1, borderColor: 'rgba(232,93,58,0.15)',
  },
  actionText: { color: '#E85D3A', fontSize: FontSize.body, fontWeight: '600' },
  readBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginTop: 12,
    height: 48, borderRadius: 14, backgroundColor: '#E85D3A', gap: 6,
  },
  readBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.body },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#F0EDE8', marginBottom: 10 },
  descText: { fontSize: FontSize.body, color: '#9895A0', lineHeight: 22 },
  epCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 12,
    backgroundColor: '#12121E', borderRadius: 10,
    marginBottom: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  epTitle: { flex: 1, fontSize: FontSize.body, color: '#F0EDE8', fontWeight: '500' },
  // 评论
  commentInput: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8, fontSize: FontSize.body,
    color: '#F0EDE8', backgroundColor: '#12121E', maxHeight: 60,
  },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E85D3A', alignItems: 'center', justifyContent: 'center' },
  commentItem: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.05)' },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(232,93,58,0.3)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 11 },
});
