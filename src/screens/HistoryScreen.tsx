// 阅读历史页面
// @author Jason

import React, { useEffect } from 'react';
import { View, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, Button, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useHistoryStore } from '../store/useHistory';
import { Colors, Spacing, FontSize, Radius } from '../theme';

export function HistoryScreen() {
  const nav = useNavigation<any>();
  const { items, loadHistory, clearHistory } = useHistoryStore();

  useEffect(() => { loadHistory(); }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <FlatList data={items} keyExtractor={i => i.id + i.chapterId}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={styles.title}>阅读历史 ({items.length})</Text>
            {items.length > 0 && (
              <Pressable onPress={clearHistory} style={{ padding: 6 }}>
                <Text style={{ color: Colors.error, fontSize: 14 }}>清空</Text>
              </Pressable>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <MaterialIcons name="history" size={64} color={Colors.textTertiary} />
            <Text style={{ color: Colors.textSecondary, marginTop: 12, fontSize: 16 }}>暂无阅读记录</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.coverUrl }} style={styles.cover} contentFit="cover" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.chapter}>{item.chapterTitle}</Text>
              <Text style={styles.time}>{new Date(item.readAt).toLocaleDateString()}</Text>
            </View>
            <Pressable onPress={() => nav.navigate('AlbumDetail', { albumId: item.id })}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, paddingHorizontal: 12, paddingVertical: 6 })}>
              <MaterialIcons name="play-arrow" size={24} color={Colors.primary} />
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: FontSize.title, fontWeight: '800', color: Colors.textPrimary },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.sm, padding: 8, marginBottom: 8 },
  cover: { width: 48, height: 64, borderRadius: 4, backgroundColor: Colors.surfaceVariant },
  name: { fontSize: FontSize.bodyLarge, fontWeight: '600', color: Colors.textPrimary },
  chapter: { fontSize: FontSize.body, color: Colors.textSecondary, marginTop: 2 },
  time: { fontSize: FontSize.caption, color: Colors.textTertiary, marginTop: 2 },
});
