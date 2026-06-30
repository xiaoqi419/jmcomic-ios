// SourceSelectModal — 启动时选择最快源
// @author Jason

import React, { useEffect, useState } from 'react';
import {
  View, Text, Modal, Pressable, ActivityIndicator, StyleSheet, FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius } from '../theme';
import { useSettingsStore } from '../store/useSettings';
import { testAllShunts, pickFastest, saveSelectedShunt, ShuntInfo } from '../utils/SourceSelector';

interface Props {
  visible: boolean;
  onDone: () => void;
}

export function SourceSelectModal({ visible, onDone }: Props) {
  const { shunts, selectShunt } = useSettingsStore();
  const [results, setResults] = useState<ShuntInfo[]>([]);
  const [testing, setTesting] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (!visible || shunts.length === 0) return;
    (async () => {
      setTesting(true);
      const r = await testAllShunts(shunts);
      setResults(r);
      setTesting(false);
      const fastest = pickFastest(r);
      if (fastest) {
        setSelected(fastest.key);
      }
    })();
  }, [visible, shunts]);

  const handleSelect = async (key: number) => {
    setSelected(key);
    selectShunt(key);
    await saveSelectedShunt(key);
    onDone();
  };

  const handleAutoSelect = async () => {
    const fastest = pickFastest(results);
    if (fastest) {
      await handleSelect(fastest.key);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <MaterialIcons name="wifi-tethering" size={40} color={Colors.primary} style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text style={styles.title}>选择最快源</Text>
          <Text style={styles.subtitle}>正在测试可用源的延迟...</Text>

          {testing ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 24 }} />
          ) : results.length === 0 ? (
            <Text style={{ color: Colors.error, textAlign: 'center', marginVertical: 20 }}>无可用源</Text>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => String(item.key)}
              style={{ maxHeight: 260 }}
              renderItem={({ item }) => {
                const isFastest = item === pickFastest(results);
                return (
                  <Pressable
                    onPress={() => handleSelect(item.key)}
                    style={[styles.item, selected === item.key && styles.itemSelected]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        {isFastest && (
                          <MaterialIcons name="flash-on" size={14} color={Colors.success} />
                        )}
                      </View>
                      {item.imgHost ? (
                        <Text style={styles.itemHost}>{item.imgHost}</Text>
                      ) : null}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      {item.latency >= 0 ? (
                        <Text style={[styles.latency, isFastest && { color: Colors.success }]}>
                          {item.latency}ms
                        </Text>
                      ) : (
                        <Text style={{ color: Colors.error, fontSize: FontSize.label }}>超时</Text>
                      )}
                    </View>
                  </Pressable>
                );
              }}
            />
          )}

          {!testing && results.length > 0 && (
            <Pressable onPress={handleAutoSelect} style={styles.autoBtn}>
              <MaterialIcons name="auto-awesome" size={18} color="#fff" />
              <Text style={styles.autoBtnText}>自动选择最快</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  dialog: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  title: {
    fontSize: FontSize.headline,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    marginBottom: 4,
    backgroundColor: Colors.surfaceLight,
  },
  itemSelected: {
    backgroundColor: Colors.primary + '20',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  itemTitle: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  itemHost: {
    fontSize: FontSize.label,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  latency: {
    fontSize: FontSize.body,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  autoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: Radius.button,
    marginTop: 12,
  },
  autoBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSize.body,
  },
});
