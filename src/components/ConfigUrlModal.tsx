// 自定义配置地址弹窗 — 隔离重渲染
// @author Jason

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLegacyColors } from '../theme';
import { useSettingsStore } from '../store/useSettings';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ConfigUrlModal({ visible, onClose }: Props) {
  const C = useLegacyColors();
  const customConfigUrl = useSettingsStore((s) => s.customConfigUrl);
  const setCustomConfigUrl = useSettingsStore((s) => s.setCustomConfigUrl);
  const [draft, setDraft] = useState(customConfigUrl);

  // 每次打开时重置草稿
  useEffect(() => { if (visible) setDraft(customConfigUrl); }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} onPress={onClose} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: C.textPrimary, fontSize: 18, fontWeight: '700' }}>自定义配置地址</Text>
          <Pressable onPress={onClose}><MaterialIcons name="close" size={22} color={C.textTertiary} /></Pressable>
        </View>
        <Text style={{ color: C.textTertiary, fontSize: 12, marginBottom: 8, lineHeight: 18 }}>
          填入 CDN 地址后，配置将从你的 CDN 加载。留空则使用默认线路。{'\n'}
          推荐配合 crontab 定时同步 JM 配置到 CDN。
        </Text>
        <TextInput
          style={{ borderWidth: 1, borderColor: C.divider, borderRadius: 10, padding: 12, color: C.textPrimary, backgroundColor: C.background, fontSize: 14 }}
          placeholder="http://comic.ojason.top/jm-config.json" placeholderTextColor={C.textTertiary}
          value={draft} onChangeText={setDraft}
          autoCapitalize="none" autoCorrect={false}
        />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Pressable onPress={onClose} style={{ flex: 1, borderRadius: 10, padding: 12, alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.divider }}>
            <Text style={{ color: C.textPrimary, fontWeight: '600' }}>取消</Text>
          </Pressable>
          <Pressable onPress={() => {
            setCustomConfigUrl(draft);
            onClose();
          }} style={{ flex: 1, borderRadius: 10, padding: 12, alignItems: 'center', backgroundColor: C.primary }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>保存</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
