// 漫画详情 v2 — 暖琥珀暗色重设计
// 3-Tab: 简介 | 章节（分组） | 评论 + 购买 + 分享 + 阅读历史
// @author nyx

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator,
  Alert, TextInput, Modal, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, Radius, Spacing, FontSize } from '../theme';
import { fetchAlbumDetail, fetchComicRead, fetchComments, postComment, buyAlbum, getCoverUrl, getImgHost } from '../api/endpoints';
import { jmLogger } from '../utils/JmLogger';
import { useFavoritesStore } from '../store/useFavorites';
import { useReaderStore } from '../store/useReader';
import { useHistoryStore } from '../store/useHistory';
import { useAuthStore } from '../store/useAuth';
import { chunkArray } from '../utils/helpers';
// DebugOverlay moved to App.tsx
import type { AlbumDetail, Episode, CommentItem as ApiComment } from '../api/types';

export function ComicDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { albumId } = route.params;
  const { t } = useTranslation();
  const { loggedIn } = useAuthStore();

  const [detail, setDetail] = useState<AlbumDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(1);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [seriesGroups, setSeriesGroups] = useState<Episode[][]>([]);
  const [groupIdx, setGroupIdx] = useState(0);
  const { isFav, addLocal, removeLocal, folders, createFolder, deleteFolder, renameFolder, moveToFolder, loadOnline } = useFavoritesStore();
  const fav = isFav(albumId);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderRename, setFolderRename] = useState<{ id: string; name: string } | null>(null);

  const [readEp, setReadEp] = useState<{ readId: string; episode: string } | null>(null);

  useEffect(() => {
    load();
    if (loggedIn) loadOnline();
    try {
      const { default: AsyncStorage } = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem(`@jmcomic.readEp.${albumId}`).then((json: string | null) => {
        if (json) setReadEp(JSON.parse(json));
      });
    } catch {}
  }, [albumId]);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetchAlbumDetail(albumId);
      setDetail(d);
      const keys = Object.keys(d as any);
      const hasSeries = d.series?.length;
      jmLogger.log(`【详情】albumId=${albumId} keys=${keys.join(',')} hasSeries=${!!hasSeries} seriesLen=${d.series?.length || 0}`);
      if (hasSeries) {
        jmLogger.log(`【详情】第一条章节: ${JSON.stringify(d.series![0])}`);
      } else {
        const sample: Record<string, any> = {};
        for (const k of keys) {
          const v = (d as any)[k];
          if (Array.isArray(v)) sample[k] = `Array(${v.length})`;
          else if (v && typeof v === 'object') sample[k] = Object.keys(v).join(',');
          else if (typeof v === 'string' && v.length > 100) sample[k] = v.slice(0, 60) + '...';
          else sample[k] = v;
        }
        jmLogger.log(`【详情】字段快照: ${JSON.stringify(sample)}`);
      }
      if (d.series?.length) {
        setSeriesGroups(chunkArray(d.series, 10));
      }
      loadComments();
    } catch (e: any) {
      jmLogger.err(`【详情】加载失败 albumId=${albumId}: ${e.message}`);
    }
    setLoading(false);
  };

  const loadComments = async () => {
    try {
      const data = await fetchComments(albumId);
      setComments(data.list || []);
      setCommentTotal(parseInt(data.total) || 0);
    } catch {}
  };

  const openChapter = async (chId: string, chName: string) => {
    try {
      const data = await fetchComicRead(chId);
      const host = getImgHost();
      let images: string[];
      if (data.images?.length) {
        images = data.images.map((item) => item.image);
      } else {
        const count = data.page_count || 20;
        images = [];
        for (let i = 1; i <= count; i++) {
          const fn = String(i).padStart(5, '0') + '.webp';
          images.push(`https://${host}/media/photos/${chId}/${fn}`);
        }
      }
      useReaderStore.getState().startReading(albumId, chId, chName, images, 220980);
      useHistoryStore.getState().add({
        id: albumId, title: detail?.name || '', coverUrl: getCoverUrl(albumId),
        chapterId: chId, chapterTitle: chName, page: 0, readAt: Date.now(),
      });
      try {
        const { default: AsyncStorage } = require('@react-native-async-storage/async-storage');
        AsyncStorage.setItem(`@jmcomic.readEp.${albumId}`, JSON.stringify({ readId: chId, episode: chName }));
      } catch {}
      nav.navigate('Reader', { chapterId: chId, albumId, chapterTitle: chName });
    } catch (e: any) {
      Alert.alert('错误', e.message || '加载失败');
    }
  };

  const handleStartReading = () => {
    if (!detail?.series?.length) return;
    if (readEp?.readId) {
      const ep = detail.series.find((s) => s.id === readEp.readId);
      openChapter(readEp.readId, ep?.name || readEp.episode);
    } else {
      openChapter(detail.series[0].id, detail.series[0].name);
    }
  };

  const handleBuy = async () => {
    if (!loggedIn) { Alert.alert('提示', t('error.login_required')); return; }
    try {
      const res = await buyAlbum(albumId);
      if (res.status === 'ok') {
        Alert.alert('', res.msg || '购买成功');
        load();
      } else {
        Alert.alert('', res.msg || '购买失败');
      }
    } catch (e: any) {
      Alert.alert('错误', e.message);
    }
    setShowBuy(false);
  };

  const handleToggleFav = () => {
    if (fav) {
      removeLocal(albumId);
    } else if (loggedIn && folders.length > 0) {
      setShowFolderPicker(true);
    } else if (loggedIn) {
      setShowFolderPicker(true);
    } else {
      addLocal({
        id: albumId, title: detail?.name || '', coverUrl: getCoverUrl(albumId),
        author: detail?.author?.join(', ') || '', addedAt: Date.now(),
      });
    }
  };

  const handleFolderSelect = async (folderId?: string) => {
    if (folderId) {
      await moveToFolder(folderId, albumId);
    }
    addLocal({
      id: albumId, title: detail?.name || '', coverUrl: getCoverUrl(albumId),
      author: detail?.author?.join(', ') || '', addedAt: Date.now(),
    });
    setShowFolderPicker(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim());
    setNewFolderName('');
  };

  const handleDeleteFolder = async (id: string) => {
    Alert.alert('删除文件夹', '确定删除？收藏不会丢失', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => deleteFolder(id) },
    ]);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await postComment(albumId, commentText.trim());
      setCommentText('');
      loadComments();
    } catch {}
  };

  const handleShare = async () => {
    try {
      await Share.share({ title: detail?.name || '', url: `https://18comic.vip/album/${albumId}/` });
    } catch {}
    setShowShare(false);
  };

  const fmt = (n: number | string) => { const v = Number(n); return v >= 10000 ? (v / 10000).toFixed(1) + '万' : String(v || 0); };

  if (loading) {
    return (
      <SafeAreaView style={S.cont}>
        <StatusBar style="light" />
        <View style={S.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }
  if (!detail) {
    return (
      <SafeAreaView style={S.cont}>
        <StatusBar style="light" />
        <View style={S.center}>
          <Text style={{ color: Colors.error }}>{t('common.error')}</Text>
          <Pressable onPress={load} style={{ marginTop: 12 }}><Text style={{ color: Colors.primary }}>{t('common.retry')}</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const purchased = detail.purchased !== undefined || detail.bought === true;

  return (
    <SafeAreaView style={S.cont} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* 封面 + 渐变 */}
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: getCoverUrl(albumId) }} style={{ width: '100%', height: 300 }} contentFit="cover" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={S.coverGrad} pointerEvents="none" />
          <View style={S.coverInfo}>
            <Text style={S.title}>{detail.name}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
              {(detail.author || []).map((a, i) => (
                <Text key={i} style={{ color: Colors.primaryLight, fontSize: FontSize.body }}>{a}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* 开始阅读按钮 */}
        <Pressable onPress={handleStartReading} style={S.readBtn}>
          <MaterialIcons name={readEp ? 'play-arrow' : 'play-circle-outline'} size={22} color={Colors.textOnPrimary} />
          <Text style={S.readBtnText}>{readEp ? t('detail.continue_reading') : t('detail.start_reading')}</Text>
        </Pressable>

        {/* 状态栏 */}
        <View style={S.statRow}>
          <View style={S.statItem}><MaterialIcons name="visibility" size={16} color={Colors.textSecondary} /><Text style={S.statLabel}>{fmt(detail.total_views)}</Text></View>
          <View style={S.statDot} />
          <View style={S.statItem}><MaterialIcons name="favorite-border" size={16} color={Colors.textSecondary} /><Text style={S.statLabel}>{fmt(detail.likes)}</Text></View>
          <View style={S.statDot} />
          <View style={S.statItem}><MaterialIcons name="chat-bubble-outline" size={16} color={Colors.textSecondary} /><Text style={S.statLabel}>{fmt(detail.comment_total)}</Text></View>
        </View>

        {/* 3-Tab 导航 */}
        <View style={S.tabBar}>
          {(t('detail.menu_items', { returnObjects: true }) as string[]).map((label: string, i: number) => (
            <Pressable key={i} onPress={() => setTab(i + 1)} style={[S.tab, tab === i + 1 && S.tabActive]}>
              <Text style={[S.tabText, tab === i + 1 && S.tabTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Tab 1: 简介 */}
        {tab === 1 && (
          <View style={{ paddingHorizontal: Spacing.marginEdge, paddingTop: Spacing.md }}>
            {detail.tags?.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {detail.tags.map((tag, i) => (
                  <Pressable key={i} onPress={() => nav.navigate('Main', { screen: 'Search', params: { query: tag } })}>
                    <View style={S.tagChip}><Text style={S.tagText}>{tag}</Text></View>
                  </Pressable>
                ))}
              </View>
            )}
            <Text style={{ color: Colors.textSecondary, fontSize: FontSize.body, lineHeight: 22 }}>{detail.description}</Text>

            {!purchased && (
              <Pressable onPress={() => setShowBuy(true)} style={S.buyBtn}>
                <MaterialIcons name="lock-open" size={18} color={Colors.textOnPrimary} />
                <Text style={S.buyText}>{t('detail.buy')}</Text>
              </Pressable>
            )}

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 20 }}>
              <Pressable onPress={handleToggleFav} style={[S.actionBtn, fav && S.actionBtnActive]}>
                <MaterialIcons name={fav ? 'favorite' : 'favorite-border'} size={18} color={fav ? Colors.textOnPrimary : Colors.primary} />
                <Text style={[S.actionBtnText, fav && { color: Colors.textOnPrimary }]}>
                  {fav ? t('common.unfavorite') : t('common.favorite')}
                </Text>
              </Pressable>
              <Pressable onPress={() => setShowShare(true)} style={S.actionBtn}>
                <MaterialIcons name="share" size={18} color={Colors.primary} />
                <Text style={S.actionBtnText}>{t('detail.share')}</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Tab 2: 章节 */}
        {tab === 2 && (
          <View style={{ paddingHorizontal: Spacing.marginEdge, paddingTop: 8 }}>
            {seriesGroups.length === 0 ? (
              <Text style={{ color: Colors.textTertiary, textAlign: 'center', padding: 20 }}>{t('detail.no_chapter')}</Text>
            ) : (
              <>
                {seriesGroups.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    {seriesGroups.map((_, i) => (
                      <Pressable
                        key={i}
                        onPress={() => setGroupIdx(i)}
                        style={[S.groupTab, groupIdx === i && S.groupTabActive]}
                      >
                        <Text style={[S.groupTabText, groupIdx === i && S.groupTabTextActive]}>
                          {i * 10 + 1}-{Math.min((i + 1) * 10, detail.series.length)}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
                {seriesGroups[groupIdx]?.map((ep) => (
                  <Pressable key={ep.id} onPress={() => openChapter(ep.id, ep.name)} style={S.episodeItem}>
                    <View style={S.epBadge}>
                      <MaterialIcons name="auto-stories" size={16} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={S.epTitle}>{ep.name || "第" + ep.sort + "话"}</Text>
                      {ep.page_count ? <Text style={S.epPage}>{ep.page_count}P</Text> : null}
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={Colors.textTertiary} />
                  </Pressable>
                ))}
              </>
            )}
          </View>
        )}

        {/* Tab 3: 评论 */}
        {tab === 3 && (
          <View style={{ paddingHorizontal: Spacing.marginEdge, paddingTop: 8 }}>
            {loggedIn && (
              <View style={S.commentInputWrap}>
                <TextInput
                  style={S.commentInput}
                  placeholder={t('common.comment_placeholder')}
                  placeholderTextColor={Colors.textTertiary}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <Pressable onPress={handleComment} style={S.sendBtn}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>{t('common.send')}</Text>
                </Pressable>
              </View>
            )}
            {comments.length === 0 ? (
              <Text style={{ color: Colors.textTertiary, textAlign: 'center', padding: 20 }}>{t('common.empty')}</Text>
            ) : (
              comments.map((c, i) => (
                <View key={c.CID || i} style={S.commentItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={S.avatar}><Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{(c.username || '?')[0]}</Text></View>
                    <Text style={{ fontWeight: '600', color: Colors.textPrimary, fontSize: FontSize.body }}>{c.username}</Text>
                    <Text style={{ fontSize: FontSize.caption, color: Colors.textTertiary }}>{c.addtime}</Text>
                  </View>
                  <Text style={{ color: Colors.textSecondary, marginTop: 4, lineHeight: 20 }}>{c.content}</Text>
                  {c.replys?.length > 0 && (
                    <View style={{ marginTop: 6, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: Colors.divider }}>
                      {c.replys.slice(0, 2).map((r, ri) => (
                        <Text key={ri} style={{ fontSize: FontSize.body, color: Colors.textTertiary, marginTop: 2 }}>
                          <Text style={{ color: Colors.primary }}>{r.username}</Text>: {r.content}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <Modal visible={showBuy} transparent animationType="fade">
        <View style={S.modalOverlay}>
          <View style={S.modalDialog}>
            <MaterialIcons name="lock" size={40} color={Colors.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={{ color: Colors.textPrimary, fontSize: FontSize.bodyLarge, textAlign: 'center', marginBottom: 8 }}>{t('detail.buy_confirm')}</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <Pressable onPress={() => setShowBuy(false)} style={[S.dialogBtn, { backgroundColor: Colors.surfaceLight }]}>
                <Text style={{ color: Colors.textSecondary, fontWeight: '600' }}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable onPress={handleBuy} style={[S.dialogBtn, { backgroundColor: Colors.primary }]}>
                <Text style={{ color: Colors.textOnPrimary, fontWeight: '600' }}>{t('common.confirm')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showShare} transparent animationType="fade">
        <View style={S.modalOverlay}>
          <View style={S.modalDialog}>
            <MaterialIcons name="share" size={40} color={Colors.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={{ color: Colors.textPrimary, fontSize: FontSize.bodyLarge, textAlign: 'center', marginBottom: 4 }}>{t('detail.share')}</Text>
            <Text style={{ color: Colors.textTertiary, fontSize: FontSize.body, textAlign: 'center', marginBottom: 12 }}>{detail.name}</Text>
            <Pressable onPress={handleShare} style={[S.dialogBtn, { backgroundColor: Colors.primary }]}>
              <Text style={{ color: Colors.textOnPrimary, fontWeight: '600' }}>分享到...</Text>
            </Pressable>
            <Pressable onPress={() => setShowShare(false)} style={{ marginTop: 8 }}>
              <Text style={{ color: Colors.textSecondary, textAlign: 'center' }}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showFolderPicker} transparent animationType="slide">
        <View style={S.modalOverlay}>
          <View style={[S.modalDialog, { maxWidth: 360 }]}>
            <Text style={{ color: Colors.textPrimary, fontSize: FontSize.bodyLarge, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>收藏到文件夹</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {folders.map((f) => (
                <Pressable
                  key={(f.FID || f.folder_id)}
                  onPress={() => handleFolderSelect((f.FID || f.folder_id))}
                  style={S.folderItem}
                >
                  <MaterialIcons name="folder" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
                  <Text style={{ flex: 1, color: Colors.textPrimary, fontSize: FontSize.body }}>{f.name}</Text>
                  <Text style={{ color: Colors.textTertiary, fontSize: FontSize.caption }}>{f.count || '0'}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TextInput
                style={S.modalInput}
                placeholder="新建文件夹"
                placeholderTextColor={Colors.textTertiary}
                value={newFolderName}
                onChangeText={setNewFolderName}
                onSubmitEditing={handleCreateFolder}
              />
              <Pressable onPress={handleCreateFolder} style={S.modalAddBtn}>
                <MaterialIcons name="add" size={20} color="#fff" />
              </Pressable>
            </View>
            <Pressable onPress={() => setShowFolderManager(true)} style={{ marginTop: 8 }}>
              <Text style={{ color: Colors.textSecondary, fontSize: FontSize.label, textAlign: 'center' }}>管理文件夹</Text>
            </Pressable>
            <Pressable onPress={() => handleFolderSelect()} style={{ marginTop: 4 }}>
              <Text style={{ color: Colors.textTertiary, fontSize: FontSize.label, textAlign: 'center' }}>（不选择，仅本地收藏）</Text>
            </Pressable>
            <Pressable onPress={() => setShowFolderPicker(false)} style={{ marginTop: 8 }}>
              <Text style={{ color: Colors.textSecondary, textAlign: 'center' }}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showFolderManager} transparent animationType="slide">
        <View style={S.modalOverlay}>
          <View style={[S.modalDialog, { maxWidth: 360 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: Colors.textPrimary, fontSize: FontSize.bodyLarge, fontWeight: '700' }}>管理文件夹</Text>
              <Pressable onPress={() => setShowFolderManager(false)}>
                <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {folders.map((f) => (
                <View key={(f.FID || f.folder_id)} style={S.folderRow}>
                  {folderRename?.id === (f.FID || f.folder_id) ? (
                    <TextInput
                      style={S.folderRenameInput}
                      value={folderRename.name}
                      onChangeText={(t) => setFolderRename({ ...folderRename, name: t })}
                      onSubmitEditing={() => { renameFolder((f.FID || f.folder_id), folderRename.name); setFolderRename(null); }}
                      autoFocus
                    />
                  ) : (
                    <>
                      <MaterialIcons name="folder" size={18} color={Colors.primary} style={{ marginRight: 6 }} />
                      <Text style={{ flex: 1, color: Colors.textPrimary, fontSize: FontSize.body }}>{f.name}</Text>
                      <Pressable onPress={() => setFolderRename({ id: (f.FID || f.folder_id), name: f.name })} hitSlop={8} style={{ padding: 4 }}>
                        <MaterialIcons name="edit" size={18} color={Colors.textSecondary} />
                      </Pressable>
                      <Pressable onPress={() => handleDeleteFolder((f.FID || f.folder_id))} hitSlop={8} style={{ padding: 4 }}>
                        <MaterialIcons name="delete-outline" size={18} color={Colors.error} />
                      </Pressable>
                    </>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  cont: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coverGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  coverInfo: { position: 'absolute', bottom: 14, left: Spacing.marginEdge, right: Spacing.marginEdge },
  title: { fontSize: FontSize.title, fontWeight: '700', color: '#fff', marginBottom: 2 },

  readBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingVertical: 14, marginHorizontal: Spacing.marginEdge,
    marginTop: -20, borderRadius: Radius.button,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  readBtnText: { color: Colors.textOnPrimary, fontSize: FontSize.bodyLarge, fontWeight: '700' },

  statRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 8,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statLabel: { fontSize: FontSize.body, color: Colors.textSecondary },
  statDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textTertiary },

  tabBar: {
    flexDirection: 'row', marginHorizontal: Spacing.marginEdge,
    backgroundColor: Colors.surface, borderRadius: Radius.sm,
    padding: 3, marginBottom: 8,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: Radius.sm - 2 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.body, color: Colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: Colors.textOnPrimary, fontWeight: '700' },

  tagChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.chip,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary + '40',
  },
  tagText: { fontSize: FontSize.label, color: Colors.primary, fontWeight: '500' },

  buyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.primary, padding: 12, borderRadius: Radius.button, marginTop: 12,
  },
  buyText: { color: Colors.textOnPrimary, fontWeight: '700' },

  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: Radius.button, borderWidth: 1, borderColor: Colors.primary,
  },
  actionBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  actionBtnText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.body },

  episodeItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 12,
    backgroundColor: Colors.surface, borderRadius: Radius.card,
    marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
  },
  epBadge: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  epTitle: { fontSize: FontSize.body, color: Colors.textPrimary, fontWeight: '500' },
  epPage: { fontSize: FontSize.caption, color: Colors.textTertiary, marginTop: 2 },

  commentInputWrap: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  commentInput: {
    flex: 1, minHeight: 40, maxHeight: 80,
    backgroundColor: Colors.surface, borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, color: Colors.textPrimary, fontSize: FontSize.body,
  },
  sendBtn: { height: 40, paddingHorizontal: 18, backgroundColor: Colors.primary, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  commentItem: { backgroundColor: Colors.surface, borderRadius: Radius.card, padding: 12, marginBottom: 10 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },

  groupTab: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.xl,
    backgroundColor: Colors.surfaceLight, marginRight: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  groupTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  groupTabText: { fontSize: FontSize.label, color: Colors.textSecondary },
  groupTabTextActive: { color: Colors.textOnPrimary, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 40 },
  modalDialog: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: 24, width: '100%', maxWidth: 320,
  },
  dialogBtn: { flex: 1, padding: 12, borderRadius: Radius.button, alignItems: 'center' },

  folderItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8,
    borderBottomWidth: 0.5, borderBottomColor: Colors.divider,
  },
  modalInput: {
    flex: 1, height: 36, backgroundColor: Colors.surfaceLight, borderRadius: Radius.sm,
    paddingHorizontal: 10, color: Colors.textPrimary, fontSize: FontSize.body,
    borderWidth: 1, borderColor: Colors.border,
  },
  modalAddBtn: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  folderRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 0.5, borderBottomColor: Colors.divider,
  },
  folderRenameInput: {
    flex: 1, height: 32, backgroundColor: Colors.surfaceLight, borderRadius: Radius.sm,
    paddingHorizontal: 8, color: Colors.textPrimary, fontSize: FontSize.body,
  },
});
