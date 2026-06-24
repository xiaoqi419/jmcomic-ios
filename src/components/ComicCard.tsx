// 漫画卡片 - 官方 App 风格 3 列紧凑布局
// @author Jason

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Radius, Spacing, FontSize, Shadow } from '../theme';

const W = Dimensions.get('window').width;
const PADDING = 12;
const GAP = 8;
const CARD_W = (W - PADDING * 2 - GAP * 2) / 3;
const CARD_H = CARD_W * 1.4;

interface Props {
  id: string; title: string; coverUrl: string;
  tags?: string[]; onPress: (id: string) => void;
}

function Inner({ id, title, coverUrl, tags, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.card, Shadow.card]} onPress={() => onPress(id)} activeOpacity={0.85}>
      <Image source={{ uri: coverUrl }} style={styles.cover} contentFit="cover" transition={200} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {tags?.length ? <Text style={styles.tags} numberOfLines={1}>{tags.slice(0, 1).join(' · ')}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

export const ComicCard = memo(Inner);

const styles = StyleSheet.create({
  card: {
    width: CARD_W, marginBottom: Spacing.xs + 2, borderRadius: 6,
    overflow: 'hidden', backgroundColor: Colors.surfaceLowest,
  },
  cover: { width: '100%', height: CARD_H, backgroundColor: Colors.surfaceContainer },
  info: { padding: 6, paddingTop: 4 },
  title: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, lineHeight: 16 },
  tags: { fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
});
