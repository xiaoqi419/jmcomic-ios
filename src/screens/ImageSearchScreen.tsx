// 以图搜图 — SauceNAO API + soutubot WebView
// @author Jason

import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView,
  Image, Linking, Alert, Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../theme';

const API_KEY = 'YOUR_API_KEY_HERE'; // 需要用户自己在 SauceNAO 注册获取
const W = Dimensions.get('window').width;

interface SauceResult {
  header: { similarity: string; thumbnail: string; index_name: string };
  data: { ext_urls?: string[]; title?: string; author_name?: string; pixiv_id?: string; member_name?: string; creator?: string };
}

export function ImageSearchScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [results, setResults] = useState<SauceResult[]>([]);
  const [loading, setLoading] = useState(false);

  // SauceNAO 搜索
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('需要权限', '请允许访问相册'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setImage(asset.uri);
    await doSauceNAO(asset);
  };

  // 拍照搜索
  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('需要权限', '请允许使用相机'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setImage(asset.uri);
    await doSauceNAO(asset);
  };

  const doSauceNAO = async (asset: ImagePicker.ImagePickerAsset) => {
    setLoading(true); setResults([]);
    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: `upload.${asset.uri.split('.').pop() || 'jpg'}`,
    } as any);

    try {
      const res = await fetch(
        `https://saucenao.com/search.php?output_type=2&numres=6&api_key=${API_KEY}`,
        { method: 'POST', body: formData }
      );
      const json = await res.json();
      if (json.results?.length) setResults(json.results);
      else Alert.alert('', '未找到匹配结果');
    } catch (e: any) {
      Alert.alert('搜索失败', e.message || '网络错误');
    }
    setLoading(false);
  };

  // 打开 soutubot
  const openSoutubot = () => {
    WebBrowser.openBrowserAsync('https://soutubot.moe/');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A0A0F' }} contentContainerStyle={{ padding: 16 }}>
      {/* 操作按钮 */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <Pressable onPress={pickImage} style={styles.btn}>
          <MaterialIcons name="photo-library" size={20} color="#fff" />
          <Text style={styles.btnText}>相册选图</Text>
        </Pressable>
        <Pressable onPress={takePhoto} style={styles.btn}>
          <MaterialIcons name="camera-alt" size={20} color="#fff" />
          <Text style={styles.btnText}>拍照</Text>
        </Pressable>
        <Pressable onPress={openSoutubot} style={[styles.btn, { backgroundColor: '#1A1A24', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]}>
          <MaterialIcons name="open-in-browser" size={20} color="#E85D3A" />
          <Text style={[styles.btnText, { color: '#E85D3A' }]}>soutubot</Text>
        </Pressable>
      </View>

      {/* 预览图 */}
      {image && <Image source={{ uri: image }} style={{ width: W - 32, height: 200, borderRadius: 10, marginBottom: 16 }} resizeMode="contain" />}

      {loading && <ActivityIndicator color="#E85D3A" style={{ marginVertical: 30 }} />}

      {/* 结果列表 */}
      {results.map((r, i) => {
        const sim = parseFloat(r.header.similarity);
        const urls = r.data.ext_urls || [];
        return (
          <View key={i} style={styles.resultCard}>
            {r.header.thumbnail && (
              <Image source={{ uri: r.header.thumbnail }} style={{ width: 80, height: 80, borderRadius: 6, backgroundColor: '#1A1A24' }} />
            )}
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: sim > 80 ? '#4CAF50' : '#FF9800', fontWeight: '700', fontSize: 14 }}>
                相似度 {sim.toFixed(1)}%
              </Text>
              <Text style={{ color: '#9895A0', fontSize: 12, marginTop: 2 }}>{r.header.index_name}</Text>
              {r.data.title && <Text style={{ color: '#F0EDE8', fontSize: 13, marginTop: 4 }} numberOfLines={2}>{r.data.title}</Text>}
              {r.data.author_name && <Text style={{ color: '#E85D3A', fontSize: 12, marginTop: 2 }}>作者: {r.data.author_name}</Text>}
              {urls.map((u, j) => (
                <Text key={j} style={{ color: '#64B5F6', fontSize: 12, marginTop: 2 }} onPress={() => Linking.openURL(u)} numberOfLines={1}>
                  {u}
                </Text>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14, borderRadius: 12, backgroundColor: '#E85D3A',
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  resultCard: {
    flexDirection: 'row', backgroundColor: '#12121E', borderRadius: 10,
    padding: 12, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
});
