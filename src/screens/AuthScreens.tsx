// 注册 + 忘记密码 — 复刻 APK 登录弹窗
// @author nyx

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useLegacyColors, LegacyColors, Radius, Spacing, FontSize } from '../theme';
import { register as apiRegister, forgotPassword } from '../api/endpoints';

export function RegisterScreen() {
  const nav = useNavigation<any>();
  const { t } = useTranslation();
  const C = useLegacyColors();
  const s = useMemo(() => getStyles(C), [C]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) { Alert.alert('提示', '请填写用户名和密码'); return; }
    if (password !== confirm) { Alert.alert('提示', '两次密码不一致'); return; }
    setLoading(true);
    try {
      await apiRegister({
        username: username.trim(), password: password.trim(),
        password_confirm: confirm.trim(), email: email.trim(),
        gender: '', adult: true, PrivacyPolicy: true,
      } as any);
      Alert.alert('注册成功', '请返回登录', [{ text: '确定', onPress: () => nav.goBack() }]);
    } catch (e: any) { Alert.alert('注册失败', e.message); }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <MaterialIcons name="person-add" size={48} color={C.primary} style={{ alignSelf: 'center', marginBottom: 16 }} />
        <Text style={s.title}>{t('member.register')}</Text>
        <TextInput style={s.input} placeholder="邮箱（选填）" placeholderTextColor={C.textTertiary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={s.input} placeholder="用户名" placeholderTextColor={C.textTertiary} value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput style={s.input} placeholder="密码" placeholderTextColor={C.textTertiary} value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={s.input} placeholder="确认密码" placeholderTextColor={C.textTertiary} value={confirm} onChangeText={setConfirm} secureTextEntry />
        <Pressable onPress={handleRegister} disabled={loading} style={s.btn}>
          <Text style={s.btnText}>{loading ? '...' : t('member.register')}</Text>
        </Pressable>
        <Pressable onPress={() => nav.goBack()} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: C.textSecondary }}>{t('common.back')}</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function ForgotPasswordScreen() {
  const nav = useNavigation<any>();
  const { t } = useTranslation();
  const C = useLegacyColors();
  const s = useMemo(() => getStyles(C), [C]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgot = async () => {
    if (!email.trim()) { Alert.alert('提示', '请输入邮箱'); return; }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      Alert.alert('找回成功', '重置邮件已发送，请查看邮箱', [{ text: '确定', onPress: () => nav.goBack() }]);
    } catch (e: any) { Alert.alert('找回失败', e.message); }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <MaterialIcons name="lock-reset" size={48} color={C.primary} style={{ alignSelf: 'center', marginBottom: 16 }} />
        <Text style={s.title}>{t('member.forgot')}</Text>
        <TextInput style={s.input} placeholder="邮箱" placeholderTextColor={C.textTertiary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Pressable onPress={handleForgot} disabled={loading} style={s.btn}>
          <Text style={s.btnText}>{loading ? '...' : t('member.forgot')}</Text>
        </Pressable>
        <Pressable onPress={() => nav.goBack()} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: C.textSecondary }}>{t('common.back')}</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getStyles(C: LegacyColors) {
  return StyleSheet.create({
    title: { fontSize: FontSize.largeTitle, fontWeight: '800', color: C.textPrimary, textAlign: 'center', marginBottom: 20 },
    input: { height: 48, backgroundColor: C.surface, borderRadius: Radius.button, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, color: C.textPrimary, fontSize: 15, marginBottom: 12 },
    btn: { height: 48, backgroundColor: C.primary, borderRadius: Radius.button, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
    btnText: { color: C.textOnPrimary, fontSize: 16, fontWeight: '700' },
  });
}
