// 漫画卡片
// @author nyx

import { memo } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Radius, FontSize, Shadow } from '../theme';

const { width: W } = Dimensions.get('window');
const GAP = 6, PAD = 14;
const CW = (W - PAD * 2 - GAP * 2) / 3;

interface Props {
  id: string;
  title: string;
  coverUrl: string;
  onPress: (id: string) => void;
}

function Inner({ id, title, coverUrl, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(id)}
      style={({ pressed }) => [S.card, Shadow.card, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
    >
      <Image source={{ uri: coverUrl }} style={S.cover} contentFit="cover" transition={200} />
      <View style={S.info}>
        <Text style={S.title} numberOfLines={2}>{title}</Text>
      </View>
    </Pressable>
  );
}

export const ComicCard = memo(Inner);

const S = StyleSheet.create({
  card: {
    width: CW, margin: 3, marginBottom: 12,
    borderRadius: Radius.card, overflow: 'hidden',
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  cover: { width: '100%', aspectRatio: 0.72, backgroundColor: Colors.surfaceContainer },
  info: { padding: 8 },
  title: { fontSize: FontSize.body, fontWeight: '600', color: Colors.text, lineHeight: 18 },
});
