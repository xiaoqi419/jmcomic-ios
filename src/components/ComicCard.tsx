// ComicCard — Guidelines 合规
// @author Jason

import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Radius, FontSize, Shadow } from '../theme';

const { width: W } = Dimensions.get('window');
const GAP = 6, PAD = 12;
const CW = (W - PAD * 2 - GAP * 2) / 3;

interface Props { id: string; title: string; coverUrl: string; tags?: string[]; onPress: (id: string) => void; }

function Inner({ id, title, coverUrl, tags, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(id)}
      accessibilityLabel={title}
      accessibilityRole="button"
      style={({ pressed }) => [S.card, Shadow.card, pressed && { opacity: 0.85 }]}>
      <Image source={{ uri: coverUrl }} style={S.cover} contentFit="cover"
        placeholder={require('../../assets/icon.png')} transition={200} />
      <View style={S.info}>
        <Text style={S.title} numberOfLines={2}>{title}</Text>
        {tags?.length ? <Text style={S.tag} numberOfLines={1}>{tags[0]}</Text> : null}
      </View>
    </Pressable>
  );
}

export const ComicCard = memo(Inner);

const S = StyleSheet.create({
  card: { width: CW, margin: 3, marginBottom: 8, borderRadius: Radius.card, overflow: 'hidden', backgroundColor: Colors.surface },
  cover: { width: '100%', aspectRatio: 0.72, backgroundColor: Colors.surfaceContainer },
  info: { padding: 6 },
  title: { fontSize: FontSize.body, fontWeight: '600', color: Colors.text, lineHeight: 17 },
  tag: { fontSize: FontSize.label, color: Colors.textTertiary, marginTop: 2 },
});
