// 漫画卡片 v2
// @author nyx

import { memo } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, FontSize } from '../theme';

const { width: W } = Dimensions.get('window');
const PAD = 16, GAP = 10;
const CARD_W = (W - PAD * 2 - GAP * 2) / 3;

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
      style={({ pressed }) => [
        css.shadowBox,
        pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
      ]}
    >
      <View style={css.card}>
        <View style={css.inner}>
          <Image source={{ uri: coverUrl }} style={css.cover} contentFit="cover" transition={300} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.25)']}
            style={css.gradient}
            pointerEvents="none"
          />
        </View>
        <View style={css.info}>
          <Text style={css.title} numberOfLines={2}>{title}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export const ComicCard = memo(Inner);

const css = StyleSheet.create({
  shadowBox: {
    width: CARD_W,
    margin: 0,
    marginBottom: 16,
    borderRadius: Radius.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  inner: {
    position: 'relative',
    width: '100%',
    aspectRatio: 0.7,
    backgroundColor: Colors.surfaceContainer,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  info: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  title: {
    fontSize: FontSize.label,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
});
