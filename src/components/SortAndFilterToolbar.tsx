// 排序+筛选工具栏 — 参考 haka_comic dev sort_and_filter_toolbar.dart

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLegacyColors, FontSize, Radius } from '../theme';

export type SortOrder = 'tf' | 'mr' | 'mv' | 'tr' | 'da' | 'dd' | 'ua' | 'ld';

interface Props {
  sort: SortOrder;
  onSortChange: (s: SortOrder) => void;
  onFilterPress: () => void;
  hasFilter?: boolean;
  /** JM 排序选项 */
  jmSorts?: { key: SortOrder; label: string }[];
  /** Pica 排序选项 */
  picaSorts?: { key: SortOrder; label: string }[];
  source?: 'jm' | 'pica';
}

const JM_SORTS: { key: SortOrder; label: string }[] = [
  { key: 'tf', label: '全部' },
  { key: 'mr', label: '最相关' },
  { key: 'mv', label: '最多观看' },
  { key: 'tr', label: '最新' },
];

const PICA_SORTS: { key: SortOrder; label: string }[] = [
  { key: 'ua', label: '最新' },
  { key: 'dd', label: '最多点赞' },
  { key: 'da', label: '最多阅读' },
  { key: 'ld', label: '最多收藏' },
];

export function SortAndFilterToolbar({
  sort,
  onSortChange,
  onFilterPress,
  hasFilter = false,
  jmSorts = JM_SORTS,
  picaSorts = PICA_SORTS,
  source = 'jm',
}: Props) {
  const C = useLegacyColors();
  const sorts = source === 'jm' ? jmSorts : picaSorts;

  return (
    <View style={[styles.container, { borderBottomColor: C.divider }]}>
      <View style={styles.sorts}>
        {sorts.map((s) => (
          <Pressable
            key={s.key}
            onPress={() => onSortChange(s.key)}
            style={[styles.chip, sort === s.key && { backgroundColor: C.primary }]}
          >
            <Text style={[styles.chipText, { color: sort === s.key ? '#fff' : C.textSecondary }]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={onFilterPress} style={[styles.filterBtn, { borderColor: C.border }, hasFilter && { borderColor: C.primary, backgroundColor: C.primary + '15' }]}>
        <MaterialIcons name="filter-list" size={18} color={hasFilter ? C.primary : C.textSecondary} />
        <Text style={{ color: hasFilter ? C.primary : C.textSecondary, fontSize: FontSize.label, fontWeight: '600' }}>筛选</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  sorts: { flexDirection: 'row', gap: 6, flex: 1 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.sm },
  chipText: { fontSize: FontSize.label, fontWeight: '600' },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Radius.sm, borderWidth: 1,
  },
});
