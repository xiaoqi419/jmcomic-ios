// 下载管理 — 下载列表、进度、暂停/恢复、删除
// @author Jason

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLegacyColors, Radius, Spacing, FontSize } from '../theme';
import { downloadManager, type DownloadItem } from '../utils/DownloadManager';

export function DownloadListScreen() {
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
          <View style={styles.item}>
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
              {(item.status === 'completed' || item.status === 'failed') && (
                <Pressable onPress={() => handleRemove(item.comicId)} hitSlop={8} style={styles.actionBtn}>
                  <MaterialIcons name="delete-outline" size={20} color={C.error} />
                </Pressable>
              )}
            </View>
          </View>
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
