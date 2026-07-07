// 日志查看页面 — 参照 haka_comic logs.dart
// @author Jason

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator,
  Clipboard, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { logger, LogEntry } from '../utils/HaKaLogger';
import { useLegacyColors, Radius, Spacing, FontSize } from '../theme';

const LEVEL_CONFIG: Record<string, { color: string; icon: string }> = {
  fatal: { color: '#e74c3c', icon: 'error' },
  error: { color: '#e74c3c', icon: 'bug-report' },
  warn: { color: '#f39c12', icon: 'warning' },
  ok: { color: '#2ecc71', icon: 'check-circle' },
  info: { color: '#3498db', icon: 'info' },
  debug: { color: '#9895A0', icon: 'code' },
  trace: { color: '#6B6873', icon: 'more-horiz' },
};

export function LogsScreen() {
  const C = useLegacyColors();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const fileLogs = await logger.loadFromFile();
      const memLogs = logger.getEntries();
      setEntries([...fileLogs, ...memLogs].sort((a, b) => b.time - a.time));
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadLogs(); }, []);

  const filtered = filter ? entries.filter((e) => e.level === filter) : entries;

  const copyLog = (entry: LogEntry) => {
    const text = `[${entry.level.toUpperCase()}] ${new Date(entry.time).toLocaleString()}\n${entry.msg}${entry.error ? '\nError: ' + entry.error : ''}${entry.stackTrace ? '\nStack: ' + entry.stackTrace : ''}`;
    try {
      Clipboard.setString(text);
      Alert.alert('', '已复制到剪贴板');
    } catch {}
  };

  const levels = Object.keys(LEVEL_CONFIG);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: C.background }}>
      {/* 顶栏 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.marginEdge }}>
        <Text style={{ color: C.textPrimary, fontSize: FontSize.title, fontWeight: '700' }}>日志</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={loadLogs} style={{ padding: 6 }}>
            <MaterialIcons name="refresh" size={22} color={C.primary} />
          </Pressable>
          <Pressable onPress={async () => { await logger.clear(); setEntries([]); }} style={{ padding: 6 }}>
            <MaterialIcons name="delete-sweep" size={22} color={C.error} />
          </Pressable>
        </View>
      </View>

      {/* 分级过滤 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: Spacing.marginEdge, marginBottom: 8 }}>
        <Pressable onPress={() => setFilter(null)} style={[s.filterChip, !filter && s.filterChipActive]}>
          <Text style={[s.filterText, !filter && s.filterTextActive]}>全部</Text>
        </Pressable>
        {levels.map((lvl) => (
          <Pressable key={lvl} onPress={() => setFilter(filter === lvl ? null : lvl)} style={[s.filterChip, filter === lvl && s.filterChipActive]}>
            <MaterialIcons name={(LEVEL_CONFIG[lvl]?.icon || 'info') as any} size={14} color={filter === lvl ? '#fff' : LEVEL_CONFIG[lvl]?.color} />
            <Text style={[s.filterText, filter === lvl && s.filterTextActive]}>{lvl}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* 日志列表 */}
      {loading ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 60 }}>
          <MaterialIcons name="inbox" size={48} color={C.textTertiary} />
          <Text style={{ color: C.textSecondary, marginTop: 12 }}>暂无日志</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, paddingHorizontal: Spacing.marginEdge }}>
          {filtered.map((entry, i) => {
            const cfg = LEVEL_CONFIG[entry.level] || LEVEL_CONFIG.info;
            return (
              <Pressable key={i} onPress={() => copyLog(entry)} style={s.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialIcons name={cfg.icon as any} size={18} color={cfg.color} />
                  <View style={[s.levelBadge, { backgroundColor: cfg.color + '20' }]}>
                    <Text style={{ color: cfg.color, fontSize: 10, fontWeight: '700' }}>{entry.level.toUpperCase()}</Text>
                  </View>
                  <Text style={{ color: C.textTertiary, fontSize: 11 }}>
                    {new Date(entry.time).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={{ color: C.textPrimary, fontSize: 13, marginTop: 4, lineHeight: 18 }}>{entry.msg}</Text>
                {entry.error && <Text style={{ color: C.error, fontSize: 12, marginTop: 4 }}>{entry.error}</Text>}
                {entry.stackTrace && (
                  <View style={{ backgroundColor: C.surface, borderRadius: 6, padding: 8, marginTop: 6 }}>
                    <Text style={{ color: C.textSecondary, fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }} numberOfLines={5}>{entry.stackTrace}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)', marginRight: 6,
  },
  filterChipActive: { backgroundColor: '#E85D3A' },
  filterText: { color: '#9895A0', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#12121E', borderRadius: 10, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  levelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
});
