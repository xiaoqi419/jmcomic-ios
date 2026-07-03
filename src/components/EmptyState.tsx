// 空页面反馈组件 — 支持 onRefresh 回调
// 参考 haka_comic dev 版 empty.dart

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLegacyColors, FontSize } from '../theme';

interface Props {
  icon?: string;
  title?: string;
  message?: string;
  onRefresh?: () => void;
  refreshLabel?: string;
}

export function EmptyState({
  icon = 'inbox-outline',
  title = '暂无内容',
  message,
  onRefresh,
  refreshLabel = '刷新',
}: Props) {
  const C = useLegacyColors();

  return (
    <View style={styles.container}>
      <MaterialIcons name={icon as any} size={56} color={C.textTertiary} />
      <Text style={[styles.title, { color: C.textSecondary }]}>{title}</Text>
      {message && <Text style={[styles.message, { color: C.textTertiary }]}>{message}</Text>}
      {onRefresh && (
        <Pressable onPress={onRefresh} style={[styles.btn, { backgroundColor: C.surfaceContainer, borderColor: C.border }]}>
          <MaterialIcons name="refresh" size={16} color={C.primary} />
          <Text style={[styles.btnText, { color: C.primary }]}>{refreshLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  title: { fontSize: FontSize.body, fontWeight: '600', marginTop: 12 },
  message: { fontSize: FontSize.label, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1 },
  btnText: { fontSize: FontSize.body, fontWeight: '600' },
});
