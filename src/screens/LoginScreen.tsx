// 登录/注册页面
// @author Jason

import React, { useState } from 'react';
import { View, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { login, register, forgotPassword } from '../api/mobile';
import { useSettingsStore, saveSettings } from '../store/useSettings';
import { Colors, Radius, Spacing, FontSize } from '../theme';
import { Text, StyleSheet } from 'react-native';

export function LoginScreen() {
  const nav = useNavigation<any>();
  const { username: savedUser, setUsername } = useSettingsStore();
  const [username, setUname] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // 已登录 → 显示用户信息
  if (savedUser) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#fff', fontSize: 32, fontWeight: '700' }}>{savedUser[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.title}>{savedUser}</Text>
          <Text style={{ color: Colors.textSecondary, marginBottom: 24 }}>已登录</Text>

          <Pressable onPress={() => { setUsername(''); }}
            style={({ pressed }) => [styles.btn, { backgroundColor: Colors.error, opacity: pressed ? 0.7 : 1 }]}>
            <Text style={styles.btnText}>退出登录</Text>
          </Pressable>
          <Pressable onPress={() => nav.goBack()} style={{ marginTop: 16 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 15 }}>返回</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (!username.trim() || (!password.trim() && mode !== 'forgot')) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        const r = await login(username.trim(), password.trim());
        if (r.success) {
          setUsername(r.username || username);
          saveSettings({ username: r.username || username });
          nav.goBack();
        } else Alert.alert('登录失败', r.error);
      } else if (mode === 'register') {
        const r = await register(username.trim(), password.trim(), email.trim());
        if (r.success) { Alert.alert('注册成功', '请返回登录'); setMode('login'); }
        else Alert.alert('注册失败', r.error);
      } else {
        const r = await forgotPassword(username.trim());
        if (r.success) Alert.alert('已发送', '请查看邮箱');
        else Alert.alert('失败', r.error);
      }
    } catch (e: any) { Alert.alert('错误', e.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <MaterialIcons name="person" size={48} color={Colors.primary} style={{ alignSelf: 'center', marginBottom: 16 }} />
        <Text style={styles.title}>{mode === 'login' ? '登录' : mode === 'register' ? '注册' : '找回密码'}</Text>

        {mode === 'register' && (
          <TextInput style={styles.input} placeholder="邮箱（选填）" placeholderTextColor={Colors.textTertiary}
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        )}
        <TextInput style={styles.input} placeholder="用户名" placeholderTextColor={Colors.textTertiary}
          value={username} onChangeText={setUname} autoCapitalize="none" />
        {mode !== 'forgot' && (
          <TextInput style={styles.input} placeholder="密码" placeholderTextColor={Colors.textTertiary}
            value={password} onChangeText={setPassword} secureTextEntry />
        )}

        <Pressable onPress={handleSubmit} disabled={loading}
          style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.7 : 1 }]}>
          <Text style={styles.btnText}>{loading ? '处理中...' : mode === 'login' ? '登录' : mode === 'register' ? '注册' : '找回'}</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 }}>
          <Pressable onPress={() => setMode(m => m === 'login' ? 'register' : 'login')}>
            <Text style={styles.link}>{mode === 'login' ? '注册' : '登录'}</Text>
          </Pressable>
          <Pressable onPress={() => setMode(m => m === 'forgot' ? 'login' : 'forgot')}>
            <Text style={styles.link}>{mode === 'forgot' ? '登录' : '忘记密码'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: FontSize.largeTitle, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: 20 },
  input: { height: 48, backgroundColor: Colors.surface, borderRadius: Radius.button, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, color: Colors.textPrimary, fontSize: 15, marginBottom: 12 },
  btn: { height: 48, backgroundColor: Colors.primary, borderRadius: Radius.button, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnText: { color: Colors.textOnPrimary, fontSize: 16, fontWeight: '700' },
  link: { color: Colors.primary, fontSize: 14 },
});
