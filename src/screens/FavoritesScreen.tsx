// 收藏页 — React Native Paper
// @author Jason

import React, { useEffect } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { Text, Button, List, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFavoritesStore } from '../store/useFavorites';
import { Colors, Spacing } from '../theme';

export function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const { items, isLoading, loadFavorites, removeFavorite } = useFavoritesStore();
  useEffect(() => { loadFavorites(); }, []);

  if (isLoading) return <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}><View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={Colors.primary} /></View></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar style="dark" />
      <FlatList data={items} keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        ListHeaderComponent={
          <Text variant="headlineMedium" style={{ fontWeight: '800', marginBottom: 16, color: Colors.textPrimary }}>
            我的收藏 ({items.length})
          </Text>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <MaterialIcons name="bookmark-border" size={64} color={Colors.textTertiary} />
            <Text style={{ color: Colors.textSecondary, marginTop: 12, fontSize: 16 }}>还没有收藏</Text>
            <Text style={{ color: Colors.textTertiary, fontSize: 13, marginTop: 4 }}>在漫画详情页点击收藏按钮即可添加</Text>
          </View>
        }
        renderItem={({ item }) => (
          <List.Item
            title={item.title} description={item.author}
            titleNumberOfLines={2}
            left={() => (
              <Image source={{ uri: item.coverUrl }} style={{ width: 48, height: 64, borderRadius: 4, backgroundColor: Colors.surfaceContainer }}
                contentFit="cover" />
            )}
            right={() => (
              <Button mode="text" textColor={Colors.error} compact onPress={() => removeFavorite(item.id)}>删除</Button>
            )}
            onPress={() => navigation.navigate('AlbumDetail', { albumId: item.id })}
            style={{ backgroundColor: Colors.surfaceLowest, borderRadius: 8, marginBottom: 4, paddingVertical: 4 }}
          />
        )}
      />
    </SafeAreaView>
  );
}
