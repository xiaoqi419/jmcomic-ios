// 设置页 — React Native Paper
// @author Jason

import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Text, SegmentedButtons, Switch, Divider, Button, List, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSettingsStore, saveSettings } from '../store/useSettings';
import { detectServers } from '../utils/serverDetect';
import { Colors, Spacing } from '../theme';

export function SettingsScreen() {
  const { readingMode, setReadingMode, readingDirection, setReadingDirection,
    selectedServer, setSelectedServer, autoSelectServer, setAutoSelectServer,
    servers, setServers, setDetectingServers, detectingServers } = useSettingsStore();
  const [testing, setTesting] = useState(false);
  useEffect(() => { useSettingsStore.getState().loadSettings(); }, []);

  const testNow = async () => {
    setTesting(true); setDetectingServers(true);
    const s = await detectServers(); setServers(s); setDetectingServers(false); setTesting(false);
    const f = s.find(x => x.available);
    if (f && autoSelectServer) { setSelectedServer(f.domain); saveSettings({ selectedServer: f.domain }); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <Text variant="headlineMedium" style={{ fontWeight: '800', marginBottom: 20, color: Colors.textPrimary }}>设置</Text>

        {/* 阅读设置 */}
        <Text variant="labelLarge" style={{ color: Colors.primary, marginBottom: 8 }}>阅读模式</Text>
        <SegmentedButtons value={readingMode}
          onValueChange={v => { setReadingMode(v as any); saveSettings({ readingMode: v as any }); }}
          buttons={[{ value: 'page', label: '翻页', icon: 'book-open-page-variant' as any }, { value: 'scroll', label: '滚动', icon: 'arrow-down-bold' as any }]} />
        <View style={{ height: 12 }} />
        <SegmentedButtons value={readingDirection}
          onValueChange={v => { setReadingDirection(v as any); saveSettings({ readingDirection: v as any }); }}
          buttons={[{ value: 'ltr', label: '从左到右' }, { value: 'rtl', label: '从右到左' }]} />

        <View style={{ height: 20 }} />

        {/* 线路选择 */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="labelLarge" style={{ color: Colors.primary }}>线路选择</Text>
          <Button compact mode="text" onPress={testNow} loading={testing || detectingServers}>重新检测</Button>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
          <Text variant="bodyMedium">自动选择最快线路</Text>
          <View style={{ flex: 1 }} />
          <Switch value={autoSelectServer}
            onValueChange={v => { setAutoSelectServer(v); saveSettings({ autoSelectServer: v }); if (v) testNow(); }} />
        </View>
        {(detectingServers || testing) ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={{ marginLeft: 8, color: Colors.textSecondary }}>检测中...</Text>
          </View>
        ) : !autoSelectServer && servers.map(s => (
          <Chip key={s.domain} mode={selectedServer === s.domain ? 'flat' : 'outlined'}
            selected={selectedServer === s.domain}
            onPress={() => { setSelectedServer(s.domain); saveSettings({ selectedServer: s.domain }); }}
            style={{ marginBottom: 4 }}
            icon={s.available ? 'check-circle' : 'alert-circle'}>
            {s.name} {s.available ? `${s.latency}ms` : '超时'}
          </Chip>
        ))}

        <View style={{ height: 20 }} />

        <Text variant="labelLarge" style={{ color: Colors.primary, marginBottom: 8 }}>关于</Text>
        <List.Item title="应用名称" right={() => <Text>JMComic</Text>} />
        <Divider />
        <List.Item title="版本" right={() => <Text>1.0.0</Text>} />
        <Divider />
        <List.Item title="数据来源" right={() => <Text>18comic.vip</Text>} />

        <Text style={{ marginTop: 20, fontSize: 12, color: Colors.textTertiary, textAlign: 'center' }}>
          本应用为第三方客户端，仅供学习交流使用。
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
