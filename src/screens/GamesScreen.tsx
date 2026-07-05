// 游戏 v2
// @author nyx

import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Linking, Dimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useLegacyColors, LegacyColors, Radius, Spacing, FontSize } from '../theme';
import { fetchGames } from '../api/endpoints';
import type { GameItem } from '../api/types';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - Spacing.marginEdge * 2 - 10) / 2;

export function GamesScreen() {
  const { t } = useTranslation();
  const C = useLegacyColors();
  const styles = useMemo(() => getStyles(C), [C]);
  const [hot, setHot] = useState<GameItem[]>([]);
  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames().then((d) => {
      setHot(d.hot_games || []);
      setGames(d.games || []);
    }).finally(() => setLoading(false));
  }, []);

  const renderGame = (item: GameItem) => (
    <Pressable
      key={item.gid}
      onPress={() => { if (item.link) Linking.openURL(item.link); }}
      style={styles.gameCard}
    >
      <Image source={{ uri: item.photo }} style={styles.gameCover} contentFit="cover" />
      <Text style={styles.gameTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.gameTag}>{item.tags}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.background }}>
      <FlashList
        data={games}
        numColumns={2}
        keyExtractor={(i) => i.gid}
        contentContainerStyle={{ padding: Spacing.marginEdge, paddingBottom: 100 }}
        ListHeaderComponent={
          <View>
            <Text style={styles.pageTitle}>{t('games.title')}</Text>
            {hot.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <MaterialIcons name="whatshot" size={18} color={C.primary} />
                  <Text style={styles.sectionTitle}>{t('games.hot')}</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {hot.map(renderGame)}
                </View>
              </View>
            )}
            <Text style={styles.sectionTitle}>{t('games.all')}</Text>
          </View>
        }
        renderItem={({ item }) => renderGame(item)}
        ListEmptyComponent={loading ? null : <Text style={{ color: C.textTertiary, textAlign: 'center', marginTop: 40 }}>{t('common.empty')}</Text>}
      />
    </SafeAreaView>
  );
}

function getStyles(C: LegacyColors) {
  return StyleSheet.create({
    pageTitle: { fontSize: FontSize.largeTitle, fontWeight: '800', color: C.textPrimary, marginBottom: 14 },
    sectionTitle: { fontSize: FontSize.headline, fontWeight: '700', color: C.textPrimary },
    gameCard: { width: CARD_W, margin: 4, marginBottom: 14 },
    gameCover: { width: CARD_W, height: CARD_W * 0.75, borderRadius: Radius.card, backgroundColor: C.surfaceContainer },
    gameTitle: { fontSize: FontSize.body, fontWeight: '600', color: C.text, marginTop: 6 },
    gameTag: { fontSize: FontSize.caption, color: C.textTertiary, marginTop: 2 },
  });
}
