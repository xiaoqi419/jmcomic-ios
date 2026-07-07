// PicaComic 风格阅读设置弹窗 — 共享组件
// 参照 PicaComic reading_settings.dart
// @author Jason

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, Pressable, StyleSheet,
  Switch, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  isVertical: boolean;
  onSetVertical: (v: boolean) => void;
  readingMode: 'scroll' | 'page';
  onSetReadingMode: (m: 'scroll' | 'page') => void;
  autoInterval: number;
  onSetAutoInterval: (v: number) => void;
}

export function ReaderSettingsModal({ visible, onClose, isVertical, onSetVertical, readingMode, onSetReadingMode, autoInterval, onSetAutoInterval }: Props) {
  const [page, setPage] = useState(0); // 0-设置列表, 1-阅读模式选择

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />
        <View style={s.container}>
          <Text style={s.title}>阅读设置</Text>

          {page === 0 ? (
            <Page0
              isVertical={isVertical} onSetVertical={onSetVertical}
              readingMode={readingMode} onSetReadingMode={onSetReadingMode}
              onOpenPage1={() => setPage(1)}
              autoInterval={autoInterval} onSetAutoInterval={onSetAutoInterval}
            />
          ) : (
            <Page1
              currentReadingMode={readingMode}
              onSelect={(m) => { onSetReadingMode(m); setPage(0); }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

function Page0({ isVertical, onSetVertical, readingMode, onSetReadingMode, onOpenPage1, autoInterval, onSetAutoInterval }: {
  isVertical: boolean; onSetVertical: (v: boolean) => void;
  readingMode: string; onSetReadingMode: (m: 'scroll' | 'page') => void;
  onOpenPage1: () => void;
  autoInterval: number;
  onSetAutoInterval: (v: number) => void;
}) {
  const [tapFlip, setTapFlip] = useState(true);
  const [tapRange, setTapRange] = useState(20);

  return (
    <>
      {/* 阅读模式 */}
      <TouchableOpacity style={s.row} onPress={onOpenPage1}>
        <MaterialIcons name="chrome-reader-mode" size={20} color="#fff" />
        <Text style={s.rowLabel}>阅读模式</Text>
        <Text style={s.rowValue}>{isVertical ? '连续滚动' : '分页'}</Text>
        <MaterialIcons name="arrow-right" size={20} color="#666" />
      </TouchableOpacity>

      {/* 点按翻页 */}
      <TouchableOpacity style={s.row} onPress={() => setTapFlip(!tapFlip)}>
        <MaterialIcons name="touch-app" size={20} color="#fff" />
        <Text style={s.rowLabel}>点按翻页</Text>
        <Switch value={tapFlip} onValueChange={setTapFlip} trackColor={{ false: '#333', true: '#E85D3A' }} thumbColor="#fff" />
      </TouchableOpacity>

      {tapFlip && (
        <View style={s.rowSub}>
          <Text style={s.rowSubLabel}>翻页识别范围 {tapRange}%</Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setTapRange(Math.max(5, tapRange - 5))}><Text style={{ color: '#E85D3A', fontSize: 18 }}>{'−'}</Text></TouchableOpacity>
            <View style={{ flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3 }}>
              <View style={{ width: `${(tapRange / 40) * 100}%`, height: 6, backgroundColor: '#E85D3A', borderRadius: 3 }} />
            </View>
            <TouchableOpacity onPress={() => setTapRange(Math.min(40, tapRange + 5))}><Text style={{ color: '#E85D3A', fontSize: 18 }}>+</Text></TouchableOpacity>
          </View>
        </View>
      )}

      {/* 滚动模式 */}
      <TouchableOpacity style={s.row} onPress={() => { onSetVertical(!isVertical); onSetReadingMode(!isVertical ? 'scroll' : 'page'); }}>
        <MaterialIcons name="swap-vert" size={20} color="#fff" />
        <Text style={s.rowLabel}>滚动模式</Text>
        <Text style={s.rowValue}>{isVertical ? '竖滑' : '分页'}</Text>
      </TouchableOpacity>

      {/* 自动翻页间隔 */}
      <View style={s.rowSub}>
        <Text style={s.rowSubLabel}>自动翻页 {autoInterval}s</Text>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => onSetAutoInterval(Math.max(1, autoInterval - 1))} onPressIn={(e) => e.stopPropagation?.()}><Text style={{ color: '#E85D3A', fontSize: 18 }}>{'−'}</Text></TouchableOpacity>
          <View style={{ flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3 }}>
            <View style={{ width: `${(autoInterval / 20) * 100}%`, height: 6, backgroundColor: '#E85D3A', borderRadius: 3 }} />
          </View>
          <TouchableOpacity onPress={() => onSetAutoInterval(Math.min(20, autoInterval + 1))} onPressIn={(e) => e.stopPropagation?.()}><Text style={{ color: '#E85D3A', fontSize: 18 }}>+</Text></TouchableOpacity>
        </View>
      </View>

      {/* 图片缩放 */}
      <TouchableOpacity style={s.row} onPress={() => Alert.alert('提示', '缩放功能在触摸交互中实现')}>
        <MaterialIcons name="fit-screen" size={20} color="#fff" />
        <Text style={s.rowLabel}>图片缩放</Text>
        <Text style={s.rowValue}>双击/捏合</Text>
      </TouchableOpacity>
    </>
  );
}

function Page1({ currentReadingMode, onSelect }: { currentReadingMode: string; onSelect: (m: 'scroll' | 'page') => void }) {
  const options = [
    { value: 'page' as const, label: '从左至右（分页）' },
    { value: 'scroll' as const, label: '连续滚动' },
  ];

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity onPress={() => onSelect(currentReadingMode as 'scroll' | 'page')} style={{ padding: 6 }}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', lineHeight: 24 }}>阅读模式</Text>
      </View>
      {options.map((opt) => (
        <TouchableOpacity key={opt.value} style={s.row} onPress={() => onSelect(opt.value)}>
          <Text style={[s.rowLabel, { flex: 1 }]}>{opt.label}</Text>
          {currentReadingMode === opt.value && <MaterialIcons name="radio-button-checked" size={20} color="#E85D3A" />}
          {currentReadingMode !== opt.value && <MaterialIcons name="radio-button-unchecked" size={20} color="#666" />}
        </TouchableOpacity>
      ))}
    </>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#1C1C24', borderTopLeftRadius: 16, borderTopRightRadius: 16,
    padding: 20, paddingBottom: 40, maxHeight: '80%',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  rowLabel: { color: '#fff', fontSize: 15, flex: 1 },
  rowValue: { color: '#999', fontSize: 14, marginRight: 4 },
  rowSub: {
    paddingVertical: 10, paddingLeft: 32,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowSubLabel: { color: '#999', fontSize: 13, marginBottom: 4 },
});
