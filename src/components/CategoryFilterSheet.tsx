// 分类筛选 BottomSheet — 使用 @gorhom/bottom-sheet + 动态主题 + 双列网格
// @author Jason

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import { useLegacyColors, LegacyColors, FontSize, Radius } from '../theme';
import { fetchCategories } from '../api/endpoints';
import { picaCategories } from '../pica/endpoints';
import { usePicaStore } from '../store/usePica';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selected: { jm?: string[]; pica?: string[] }) => void;
  initialSelected?: { jm?: string[]; pica?: string[] };
  source?: 'jm' | 'pica' | 'all';
}

interface CatNode {
  id: string;
  name: string;
  slug: string;
  children?: CatNode[];
}

export function CategoryFilterSheet({ visible, onClose, onConfirm, initialSelected, source = 'all' }: Props) {
  const C = useLegacyColors();
  const sheetRef = useRef<BottomSheet>(null);
  const [jmCats, setJmCats] = useState<CatNode[]>([]);
  const [picaCats, setPicaCats] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJm, setSelectedJm] = useState<Set<string>>(new Set(initialSelected?.jm || []));
  const [selectedPica, setSelectedPica] = useState<Set<string>>(new Set(initialSelected?.pica || []));
  const picaLoggedIn = usePicaStore((s) => s.loggedIn);

  useEffect(() => {
    if (visible) sheetRef.current?.expand();
    else sheetRef.current?.close();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setLoading(true);
    const promises: Promise<void>[] = [];
    if (source === 'all' || source === 'jm') {
      promises.push(
        fetchCategories().then((d) => {
          if (cancelled) return;
          setJmCats((d.categories || []).map((c: any) => ({
            id: c.slug || c.name, name: c.name || c.title || '', slug: c.slug || '0',
            children: (c.sub_categories || []).map((sc: any) => ({ id: sc.slug || sc.CID || sc.name, name: sc.name || '', slug: sc.slug || '0' })),
          })));
        }).catch(() => {})
      );
    }
    if ((source === 'all' || source === 'pica') && picaLoggedIn) {
      promises.push(
        picaCategories().then((d) => {
          if (cancelled) return;
          const all = ((d as any).categories || []).filter((c: any) => c.isWeb !== true);
          setPicaCats(all.map((c: any) => ({ id: c._id || c.title, name: c.title })));
        }).catch(() => {})
      );
    }
    Promise.all(promises).then(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [visible, source, picaLoggedIn]);

  const toggleJm = (slug: string) => {
    setSelectedJm((prev) => { const next = new Set(prev); if (next.has(slug)) next.delete(slug); else next.add(slug); return next; });
  };
  const togglePica = (name: string) => {
    setSelectedPica((prev) => { const next = new Set(prev); if (next.has(name)) next.delete(name); else next.add(name); return next; });
  };
  const handleConfirm = () => { onConfirm({ jm: Array.from(selectedJm), pica: Array.from(selectedPica) }); onClose(); };
  const handleClear = () => { setSelectedJm(new Set()); setSelectedPica(new Set()); };
  const hasSelection = selectedJm.size > 0 || selectedPica.size > 0;
  const hasAnyCats = jmCats.length > 0 || (picaLoggedIn && picaCats.length > 0);

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={['55%', '85%']}
      index={visible ? 0 : -1}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: C.surface }}
      handleIndicatorStyle={{ backgroundColor: C.textTertiary, width: 36 }}
    >
      <BottomSheetView style={{ flex: 1 }}>
        {/* Header — sticky */}
        <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.divider }]}>
          <Pressable onPress={onClose} hitSlop={8}><Text style={{ color: C.textSecondary, fontSize: 14 }}>取消</Text></Pressable>
          <Text style={{ fontSize: 17, fontWeight: '700', color: C.textPrimary }}>分类筛选</Text>
          <Pressable onPress={handleClear} hitSlop={8}><Text style={{ color: hasSelection ? C.primary : C.textTertiary, fontSize: 14 }}>清除</Text></Pressable>
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={{ color: C.textSecondary, marginTop: 12, fontSize: 14 }}>加载分类中…</Text>
          </View>
        ) : !hasAnyCats ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name="info-outline" size={48} color={C.textTertiary} />
            <Text style={{ color: C.textSecondary, marginTop: 12, fontSize: 14 }}>暂无分类数据</Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 12 }}>
            {/* JM 分类（双列网格） */}
            {(source === 'all' || source === 'jm') && jmCats.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 8 }}>JM 分类</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {jmCats.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => toggleJm(cat.slug)}
                      style={[styles.chip, selectedJm.has(cat.slug) && { backgroundColor: C.primary, borderColor: C.primary }]}
                    >
                      <Text style={[styles.chipText, { color: selectedJm.has(cat.slug) ? '#fff' : C.textSecondary }]}>{cat.name}</Text>
                      {selectedJm.has(cat.slug) && <MaterialIcons name="check" size={14} color="#fff" style={{ marginLeft: 2 }} />}
                    </Pressable>
                  ))}
                </View>
                {/* 子分类（可展开，展示选中数量） */}
                {jmCats.filter((c) => c.children && c.children.length > 0).map((cat) => (
                  <View key={`sub-${cat.id}`} style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 12, color: C.textTertiary, marginBottom: 6 }}>{cat.name} 子分类</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {(cat.children || []).slice(0, 8).map((sub) => (
                        <Pressable
                          key={sub.id}
                          onPress={() => toggleJm(sub.slug)}
                          style={[styles.chipSmall, selectedJm.has(sub.slug) && { backgroundColor: C.primary, borderColor: C.primary }]}
                        >
                          <Text style={[styles.chipSmallText, { color: selectedJm.has(sub.slug) ? '#fff' : C.textTertiary }]}>{sub.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Pica 分类（双列网格） */}
            {(source === 'all' || source === 'pica') && picaLoggedIn && picaCats.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 8 }}>Pica 分类</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {picaCats.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => togglePica(cat.name)}
                      style={[styles.chip, selectedPica.has(cat.name) && { backgroundColor: C.primary, borderColor: C.primary }]}
                    >
                      <Text style={[styles.chipText, { color: selectedPica.has(cat.name) ? '#fff' : C.textSecondary }]}>{cat.name}</Text>
                      {selectedPica.has(cat.name) && <MaterialIcons name="check" size={14} color="#fff" style={{ marginLeft: 2 }} />}
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* 底部确认按钮 — 固定 */}
        {!loading && (
          <View style={[styles.footer, { backgroundColor: C.surface, borderTopColor: C.divider }]}>
            <Pressable onPress={handleConfirm} style={[styles.confirmBtn, { backgroundColor: C.primary }]}>
              <Text style={styles.confirmText}>确定 ({selectedJm.size + selectedPica.size})</Text>
            </Pressable>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  chipSmall: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  chipSmallText: { fontSize: 11, fontWeight: '500' },
  footer: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1,
  },
  confirmBtn: {
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
  },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
