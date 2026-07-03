// 下载管理 — 下载列表、进度、暂停/恢复、删除
// @author Jason

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLegacyColors, Radius, Spacing, FontSize } from '../theme';
import { downloadManager, type DownloadItem } from '../utils/DownloadManager';

export function DownloadListScreen() {
  const nav = useNavigation<any>();
  const C = useLegacyColors();
  const styles = useMemo(() => getStyles(C), [C]);
  const [items, setItems] = useState<DownloadItem[]>([]);

  useEffect(() => {
    setItems(downloadManager.getAll());
    const unsub = downloadManager.subscribe((all) => {
      setItems([...all]);
    });
    return unsub;
  }, []);

  const handlePause = useCallback((comicId: string) => {
    downloadManager.pause(comicId);
  }, []);

  const handleResume = useCallback(async (item: DownloadItem) => {
    await downloadManager.resume(item.comicId, async (onProgress) => {
      // 简化的下载函数 — 实际使用时需要从 ComicDetailScreen 传入真实逻辑
      onProgress(0, 1);
    });
  }, []);

  const handleRemove = useCallback((comicId: string) => {
    downloadManager.remove(comicId);
  }, []);

  const handleClearCompleted = useCallback(() => {
    downloadManager.clearCompleted();
  }, []);

  const handlePdfExport = useCallback(async (item: DownloadItem) => {
    try {
      const { Share } = await import('react-native');
      // 使用 expo-print 生成 PDF（需先安装: npx expo install expo-print）
      let Print: any;
      try { Print = require('expo-print'); } catch {}
      if (!Print) {
        Alert.alert('提示', 'PDF导出需要安装 expo-print 模块\n请运行: npx expo install expo-print');
        return;
      }
      const html = `
        <html><body style="margin:0;padding:16px;font-family:sans-serif">
          <h1 style="text-align:center">${item.title}</h1>
          <p style="text-align:center;color:#888">漫画ID: ${item.comicId}</p>
          <hr/>
          <p>共 ${item.chapterCount || '?'} 章</p>
          <p>下载完成时间: ${new Date(item.addedAt).toLocaleDateString()}</p>
        </body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      await Share.share({ url: uri, title: `${item.title}.pdf` });
    } catch (e: any) {
      Alert.alert('导出失败', e.message || '未知错误');
    }
  }, []);

  const stateIcon = (s: string) => {
    switch (s) {
      case 'downloading': return 'cloud-download';
      case 'completed': return 'check-circle';
      case 'failed': return 'error';
      case 'paused': return 'pause-circle';
      default: return 'hourglass-empty';
    }
  };

  const stateColor = (s: string) => {
    switch (s) {
      case 'downloading': return C.primary;
      case 'completed': return C.success;
      case 'failed': return C.error;
      case 'paused': return C.textTertiary;
      default: return C.textSecondary;
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.cont}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.comicId}
        contentContainerStyle={{ padding: Spacing.marginEdge, paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
            <Text style={styles.title}>下载管理</Text>
            <Pressable onPress={handleClearCompleted}>
              <Text style={{ color: C.primary, fontSize: FontSize.body }}>清除已完成</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={item.status === 'completed' ? () => nav.navigate('Reader', {
              chapterId: item.comicId,
              albumId: item.comicId,
              chapterTitle: item.title,
              localPath: item.localPath,
            }) : undefined}
            style={styles.item}
          >
            <MaterialIcons name={stateIcon(item.status) as any} size={24} color={stateColor(item.status)} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <View style={[styles.statusBadge, { backgroundColor: stateColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: stateColor(item.status) }]}>{item.status}</Text>
                </View>
                {item.progress > 0 && (
                  <Text style={styles.progress}>{item.progress}%</Text>
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {item.status === 'completed' && (
                <>
                  <Pressable onPress={() => nav.navigate('ComicDetail', { albumId: item.comicId })} hitSlop={8} style={styles.actionBtn}>
                    <MaterialIcons name="visibility" size={20} color={C.primary} />
                  </Pressable>
                  <Pressable onPress={() => handlePdfExport(item)} hitSlop={8} style={styles.actionBtn}>
                    <MaterialIcons name="picture-as-pdf" size={20} color={C.error} />
                  </Pressable>
                  <Pressable onPress={() => handleRemove(item.comicId)} hitSlop={8} style={styles.actionBtn}>
                    <MaterialIcons name="delete-outline" size={20} color={C.error} />
                  </Pressable>
                </>
              )}
              {item.status === 'paused' && (
                <Pressable onPress={() => handleResume(item)} hitSlop={8} style={styles.actionBtn}>
                  <MaterialIcons name="play-arrow" size={20} color={C.primary} />
                </Pressable>
              )}
              {item.status === 'downloading' && (
                <Pressable onPress={() => handlePause(item.comicId)} hitSlop={8} style={styles.actionBtn}>
                  <MaterialIcons name="pause" size={20} color={C.textTertiary} />
                </Pressable>
              )}
              {item.status === 'failed' && (
                <Pressable onPress={() => handleRemove(item.comicId)} hitSlop={8} style={styles.actionBtn}>
                  <MaterialIcons name="delete-outline" size={20} color={C.error} />
                </Pressable>
              )}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <MaterialIcons name="cloud-download" size={48} color={C.textTertiary} />
            <Text style={{ color: C.textSecondary, marginTop: 12, fontSize: FontSize.body }}>暂无下载任务</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function getStyles(C: ReturnType<typeof useLegacyColors>) {
  return StyleSheet.create({
    cont: { flex: 1, backgroundColor: C.background },
    title: { fontSize: FontSize.largeTitle, fontWeight: '800', color: C.textPrimary },
    item: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.surface, borderRadius: Radius.card,
      padding: 14, marginBottom: 10,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
    },
    itemTitle: { fontSize: FontSize.body, fontWeight: '600', color: C.textPrimary },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.xs },
    statusText: { fontSize: FontSize.caption, fontWeight: '600' },
    progress: { fontSize: FontSize.caption, color: C.textSecondary },
    actionBtn: { padding: 6 },
  });
}
