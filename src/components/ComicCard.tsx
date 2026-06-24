// 漫画卡片 — Flat Design
// @author Jason

import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Radius, FontSize, Shadow } from '../theme';

const W = Dimensions.get('window').width;
const PAD = 10, GAP = 6;
const CARD_W = (W - PAD * 2 - GAP * 2) / 3;

interface Props { id: string; title: string; coverUrl: string; tags?: string[]; onPress: (id: string) => void; }

function Inner({ id, title, coverUrl, tags, onPress }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.card, Shadow.card, { opacity: pressed ? 0.85 : 1 }]}
      onPress={() => onPress(id)}>
      <Image source={{ uri: coverUrl }} style={styles.cover} contentFit="cover" transition={200}
        placeholder={require('../../assets/icon.png')} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {tags?.length ? <Text style={styles.tags} numberOfLines={1}>{tags[0]}</Text> : null}
      </View>
    </Pressable>
  );
}

export const ComicCard = memo(Inner);

const styles = StyleSheet.create({
  card: { width: CARD_W, margin: 3, marginBottom: 6, borderRadius: Radius.card, overflow: 'hidden', backgroundColor: Colors.surface },
  cover: { width: '100%', aspectRatio: 0.72, backgroundColor: Colors.surfaceVariant },
  info: { padding: 6 },
  title: { fontSize: FontSize.body, fontWeight: '600', color: Colors.textPrimary, lineHeight: 17 },
  tags: { fontSize: FontSize.label, color: Colors.textTertiary, marginTop: 2 },
});
