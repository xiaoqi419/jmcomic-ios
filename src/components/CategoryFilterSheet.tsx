// 分类筛选 BottomSheet — 使用 @gorhom/bottom-sheet
// @author Jason

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import { useLegacyColors, FontSize } from '../theme';
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

  // 控制 BottomSheet
  useEffect(() => {
    if (visible) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

  // 加载分类
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
            id: c.slug || c.name,
            name: c.name || c.title || '',
            slug: c.slug || '0',
            children: (c.sub_categories || []).map((sc: any) => ({
              id: sc.slug || sc.CID || sc.name,
              name: sc.name || '',
              slug: sc.slug || '0',
            })),
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
    setSelectedJm((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  };
  const togglePica = (name: string) => {
    setSelectedPica((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };
  const handleConfirm = () => { onConfirm({ jm: Array.from(selectedJm), pica: Array.from(selectedPica) }); onClose(); };
  const handleClear = () => { setSelectedJm(new Set()); setSelectedPica(new Set()); };

  const hasSelection = selectedJm.size > 0 || selectedPica.size > 0;
  const hasAnyCats = jmCats.length > 0 || (picaLoggedIn && picaCats.length > 0);

  const snapPoints = useCallback(() => ['60%', '85%'], []);

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints()}
      index={visible ? 0 : -1}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: '#1A1A24' }}
      handleIndicatorStyle={{ backgroundColor: '#5C5970', width: 40 }}
    >
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* 头部 */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' }}>
          <Pressable onPress={onClose}><Text style={{ color: '#9895A0', fontSize: 14 }}>取消</Text></Pressable>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#F0EDE8' }}>分类筛选</Text>
          <Pressable onPress={handleClear}><Text style={{ color: hasSelection ? '#E85D3A' : '#5C5970', fontSize: 14 }}>清除</Text></Pressable>
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#E85D3A" />
            <Text style={{ color: '#9895A0', marginTop: 12, fontSize: 14 }}>加载分类中…</Text>
          </View>
        ) : !hasAnyCats ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name="info-outline" size={48} color="#5C5970" />
            <Text style={{ color: '#9895A0', marginTop: 12, fontSize: 14 }}>暂无分类数据</Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 60 }}>
            {(source === 'all' || source === 'jm') && jmCats.length > 0 && (
              <View style={{ paddingTop: 12 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: '#F0EDE8', marginBottom: 10 }}>JM 分类</Text>
                {jmCats.map((cat) => (
                  <View key={cat.id}>
                    <Pressable onPress={() => toggleJm(cat.slug)} style={styles.row}>
                      <MaterialIcons name={selectedJm.has(cat.slug) ? 'check-box' : 'check-box-outline-blank'} size={22} color={selectedJm.has(cat.slug) ? '#E85D3A' : '#5C5970'} />
                      <Text style={{ color: '#F0EDE8', fontSize: 14, marginLeft: 10, flex: 1 }}>{cat.name}</Text>
                    </Pressable>
                    {cat.children && cat.children.length > 0 && (
                      <View style={{ paddingLeft: 36 }}>
                        {cat.children.map((sub) => (
                          <Pressable key={sub.id} onPress={() => toggleJm(sub.slug)} style={styles.row}>
                            <MaterialIcons name={selectedJm.has(sub.slug) ? 'check-box' : 'check-box-outline-blank'} size={20} color={selectedJm.has(sub.slug) ? '#E85D3A' : '#5C5970'} />
                            <Text style={{ color: '#9895A0', fontSize: 13, marginLeft: 10, flex: 1 }}>{sub.name}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {(source === 'all' || source === 'pica') && picaLoggedIn && picaCats.length > 0 && (
              <View style={{ paddingTop: 16 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: '#F0EDE8', marginBottom: 10 }}>Pica 分类</Text>
                {picaCats.map((cat) => (
                  <Pressable key={cat.id} onPress={() => togglePica(cat.name)} style={styles.row}>
                    <MaterialIcons name={selectedPica.has(cat.name) ? 'check-box' : 'check-box-outline-blank'} size={22} color={selectedPica.has(cat.name) ? '#E85D3A' : '#5C5970'} />
                    <Text style={{ color: '#F0EDE8', fontSize: 14, marginLeft: 10 }}>{cat.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {!loading && (
          <Pressable onPress={handleConfirm} style={{ marginTop: 8, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#E85D3A' }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>确定 ({selectedJm.size + selectedPica.size})</Text>
          </Pressable>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
});
