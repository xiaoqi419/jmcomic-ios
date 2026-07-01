// 个人中心 v3 — 双源账号管理
// @author Jason

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, FontSize } from '../theme';
import { useAuthStore } from '../store/useAuth';
import { usePicaStore } from '../store/usePica';
import { useMemberStore } from '../store/useMember';
import { useSettingsStore } from '../store/useSettings';
import { login as jmLogin } from '../api/endpoints';
import { isPicaEnabled } from '../sources/pica';

export function MemberScreen() {
  const nav = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const { username: jmUser, loggedIn: jmLoggedIn, login: jmDoLogin, logout: jmDoLogout } = useAuthStore();
  const { username: picaUser, loggedIn: picaLoggedIn, login: picaDoLogin, logout: picaDoLogout } = usePicaStore();
  const { info, signData, signed, doSignIn, loadInfo, loadSign, loadAchievements, achievements, notifications, loadNotifications, unread } = useMemberStore();
  const { language, setLanguage, readingMode, setReadingMode, showDebugLog, setShowDebugLog, shunts, selectedShuntKey, selectShunt } = useSettingsStore();

  const [showJmLogin, setShowJmLogin] = useState(false);
  const [jmUserInput, setJmUserInput] = useState('');
  const [jmPassInput, setJmPassInput] = useState('');
  const [jmLoginLoading, setJmLoginLoading] = useState(false);

  const [showPicaLogin, setShowPicaLogin] = useState(false);
  const [picaUserInput, setPicaUserInput] = useState('');
  const [picaPassInput, setPicaPassInput] = useState('');
  const [picaLoginLoading, setPicaLoginLoading] = useState(false);

  const dualSearch = isPicaEnabled();

  useEffect(() => {
    if (jmLoggedIn) {
      loadInfo();
      loadSign().then(() => {
        if (!useMemberStore.getState().signed) doSignIn().catch(() => {});
      });
      loadAchievements();
      loadNotifications();
    }
  }, [jmLoggedIn]);

  const handleJmLogin = async () => {
    if (!jmUserInput.trim() || !jmPassInput.trim()) return;
    setJmLoginLoading(true);
    try {
      const data = await jmLogin(jmUserInput.trim(), jmPassInput.trim());
      if (data.s) {
        await jmDoLogin(data.username || jmUserInput, data.s, data.photo || '');
        setShowJmLogin(false);
        setJmUserInput('');
        setJmPassInput('');
        Alert.alert('', `欢迎回来, ${data.username || jmUserInput}`);
      }
    } catch (e: any) {
      Alert.alert('登录失败', e.message || '请检查用户名和密码');
    }
    setJmLoginLoading(false);
  };

  const handlePicaLogin = async () => {
    if (!picaUserInput.trim() || !picaPassInput.trim()) return;
    setPicaLoginLoading(true);
    try {
      await picaDoLogin(picaUserInput.trim(), picaPassInput.trim());
      setShowPicaLogin(false);
      setPicaUserInput('');
      setPicaPassInput('');
      Alert.alert('', 'Pica 账号已绑定');
    } catch (e: any) {
      Alert.alert('Pica 登录失败', e.message || '请检查用户名和密码');
    }
    setPicaLoginLoading(false);
  };

  const handleJmLogout = () => {
    Alert.alert('退出 JMComic', '', [
      { text: '取消', style: 'cancel' },
      { text: '退出', onPress: () => jmDoLogout() },
    ]);
  };

  const handlePicaLogout = () => {
    Alert.alert('解绑 Pica', '', [
      { text: '取消', style: 'cancel' },
      { text: '解绑', onPress: () => picaDoLogout() },
    ]);
  };

  const handleSign = async () => {
    try {
      const data = await doSignIn();
      Alert.alert('签到成功', `+${data.coin} 金币, +${data.exp} 经验`);
    } catch {}
  };

  const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <View style={{ marginBottom: Spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, marginLeft: 4 }}>
        <MaterialIcons name={icon as any} size={18} color={Colors.primary} />
        <Text style={{ fontSize: FontSize.body, fontWeight: '700', color: Colors.primary }}>{title}</Text>
      </View>
      <View style={S.sectionCard}>{children}</View>
    </View>
  );

  const Row = ({ label, right }: { label: string; right: React.ReactNode }) => (
    <View style={S.row}>
      <Text style={S.rowLabel}>{label}</Text>
      {right}
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={S.cont}>
      <ScrollView contentContainerStyle={{ padding: Spacing.marginEdge, paddingBottom: 100 }}>
        <Text style={S.pageTitle}>我的</Text>

        {/* ===== JMComic 账号 ===== */}
        <Section title="JMComic 账号" icon="person">
          {jmLoggedIn ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <View style={S.avatar}>
                  <Text style={S.avatarText}>{(jmUser || 'U')[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.username}>{jmUser}</Text>
                  <View style={{ flexDirection: 'row', gap: 14, marginTop: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialIcons name="monetization-on" size={14} color={Colors.primary} />
                      <Text style={S.statVal}>{info?.coin || '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialIcons name="star" size={14} color={Colors.primary} />
                      <Text style={S.statVal}>Lv.{info?.level || '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialIcons name="trending-up" size={14} color={Colors.primary} />
                      <Text style={S.statVal}>{info?.experience || '-'}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <Pressable onPress={signed ? undefined : handleSign} style={[S.signBtn, signed && S.signedBtn]}>
                <MaterialIcons name={signed ? 'check-circle' : 'today'} size={20} color={signed ? Colors.success : Colors.primary} />
                <Text style={{ color: signed ? Colors.success : Colors.primary, fontWeight: '600' }}>
                  {signed ? `${t('member.signed')}${signData?.days ? ` (${signData.days}d)` : ''}` : t('member.sign_in')}
                </Text>
              </Pressable>
              {unread && (unread.comic_follow > 0 || unread.site_notice > 0) && (
                <Pressable onPress={() => loadNotifications()} style={S.notifBanner}>
                  <MaterialIcons name="notifications" size={18} color={Colors.primary} />
                  <Text style={{ color: Colors.primary, fontWeight: '600', flex: 1, fontSize: FontSize.label }}>
                    未读: {unread.comic_follow + unread.site_notice}
                  </Text>
                </Pressable>
              )}
              <Pressable onPress={handleJmLogout} style={S.logoutSmall}>
                <Text style={S.logoutSmallText}>退出登录</Text>
              </Pressable>
            </>
          ) : showJmLogin ? (
            <>
              <TextInput style={S.input} placeholder="用户名" placeholderTextColor={Colors.textTertiary} value={jmUserInput} onChangeText={setJmUserInput} autoCapitalize="none" />
              <TextInput style={S.input} placeholder="密码" placeholderTextColor={Colors.textTertiary} value={jmPassInput} onChangeText={setJmPassInput} secureTextEntry />
              <Pressable onPress={handleJmLogin} disabled={jmLoginLoading} style={S.primaryBtn}>
                <Text style={S.primaryBtnText}>{jmLoginLoading ? '...' : t('member.login')}</Text>
              </Pressable>
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 10 }}>
                <Pressable onPress={() => nav.navigate('Register' as never)}>
                  <Text style={{ color: Colors.primary, fontSize: FontSize.body }}>{t('member.register')}</Text>
                </Pressable>
                <Pressable onPress={() => nav.navigate('ForgotPassword' as never)}>
                  <Text style={{ color: Colors.primary, fontSize: FontSize.body }}>{t('member.forgot')}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={{ color: Colors.textSecondary, fontSize: FontSize.body, marginBottom: 12 }}>
                登录后可查看收藏、签到、成就
              </Text>
              <Pressable onPress={() => setShowJmLogin(true)} style={S.primaryBtn}>
                <Text style={S.primaryBtnText}>{t('member.login')}</Text>
              </Pressable>
            </>
          )}
        </Section>

        {/* ===== Pica 账号 ===== */}
        <Section title="Pica 账号" icon="bookmark">
          {picaLoggedIn ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MaterialIcons name="check-circle" size={24} color={Colors.success} />
                <Text style={S.username}>{picaUser}</Text>
              </View>
              <Pressable onPress={handlePicaLogout} style={S.logoutSmall}>
                <Text style={S.logoutSmallText}>解绑</Text>
              </Pressable>
            </>
          ) : showPicaLogin ? (
            <>
              <Text style={{ color: Colors.textSecondary, fontSize: FontSize.body, marginBottom: 8 }}>
                绑定 Pica 账号后可搜到 Pica 源内容
              </Text>
              <TextInput style={S.input} placeholder="Pica 邮箱" placeholderTextColor={Colors.textTertiary} value={picaUserInput} onChangeText={setPicaUserInput} autoCapitalize="none" keyboardType="email-address" />
              <TextInput style={S.input} placeholder="Pica 密码" placeholderTextColor={Colors.textTertiary} value={picaPassInput} onChangeText={setPicaPassInput} secureTextEntry />
              <Pressable onPress={handlePicaLogin} disabled={picaLoginLoading} style={S.primaryBtn}>
                <Text style={S.primaryBtnText}>{picaLoginLoading ? '...' : '绑定'}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={{ color: Colors.textSecondary, fontSize: FontSize.body, marginBottom: 12 }}>
                绑定后可同时搜索 JMComic + Pica 双源内容
              </Text>
              <Pressable onPress={() => setShowPicaLogin(true)} style={S.secondaryBtn}>
                <Text style={S.secondaryBtnText}>绑定 Pica 账号</Text>
              </Pressable>
            </>
          )}
        </Section>

        {/* ===== 搜索源状态 ===== */}
        <Section title="搜索源" icon="search">
          <Row label="当前状态" right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name={dualSearch ? 'hub' : 'person-search'} size={18} color={dualSearch ? Colors.success : Colors.textTertiary} />
              <Text style={[S.statusText, { color: dualSearch ? Colors.success : Colors.textSecondary }]}>
                {dualSearch ? '双源搜索 (JM + Pica)' : '仅 JMComic'}
              </Text>
            </View>
          } />
          {!dualSearch && (
            <Text style={{ color: Colors.textTertiary, fontSize: FontSize.label, marginTop: 4 }}>
              在上方绑定 Pica 账号后即可双源聚合搜索
            </Text>
          )}
        </Section>

        {/* ===== 成就 ===== */}
        {jmLoggedIn && achievements.length > 0 && (
          <Section title={t('member.achievements')} icon="emoji-events">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {achievements.slice(0, 6).map((a) => (
                <View key={a.id} style={{ alignItems: 'center', width: '30%', paddingVertical: 6 }}>
                  <View style={S.achieveIcon}>
                    <MaterialIcons name="emoji-events" size={22} color={Colors.primary} />
                  </View>
                  <Text style={S.achieveLabel} numberOfLines={1}>{a.name}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* ===== 通知 ===== */}
        {jmLoggedIn && notifications.length > 0 && (
          <Section title={t('member.notifications')} icon="notifications">
            {notifications.slice(0, 5).map((n) => (
              <View key={n.id} style={S.notifItem}>
                <Text style={S.notifTitle}>{n.title}</Text>
                <Text style={S.notifContent} numberOfLines={2}>{n.content}</Text>
              </View>
            ))}
          </Section>
        )}

        {/* ===== 设置 ===== */}
        <Section title={t('member.settings')} icon="settings">
          <Row label={t('member.reading_mode')} right={
            <View style={S.toggleGroup}>
              {['scroll', 'page'].map((m) => (
                <Pressable key={m} onPress={() => setReadingMode(m as any)} style={[S.toggleBtn, readingMode === m && S.toggleBtnActive]}>
                  <Text style={[S.toggleText, readingMode === m && S.toggleTextActive]}>{t(`member.${m}`)}</Text>
                </Pressable>
              ))}
            </View>
          } />
          {shunts.length > 0 && (
            <Row label="源/线路" right={
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, maxWidth: 200 }}>
                {shunts.map((s) => (
                  <Pressable
                    key={s.key}
                    onPress={() => selectShunt(s.key)}
                    style={[S.toggleBtn, selectedShuntKey === s.key && S.toggleBtnActive]}
                  >
                    <Text style={[S.toggleText, selectedShuntKey === s.key && S.toggleTextActive]}>{s.title}</Text>
                  </Pressable>
                ))}
              </View>
            } />
          )}
          <Row label={t('member.language')} right={
            <View style={S.toggleGroup}>
              {(['zh', 'en'] as const).map((l) => (
                <Pressable key={l} onPress={() => { setLanguage(l); i18n.changeLanguage(l); }} style={[S.toggleBtn, language === l && S.toggleBtnActive]}>
                  <Text style={[S.toggleText, language === l && S.toggleTextActive]}>{l === 'zh' ? '中文' : 'English'}</Text>
                </Pressable>
              ))}
            </View>
          } />
          <Row label="调试日志" right={
            <Pressable onPress={() => setShowDebugLog(!showDebugLog)} style={[S.toggleBtn, showDebugLog && S.toggleBtnActive]}>
              <Text style={[S.toggleText, showDebugLog && S.toggleTextActive]}>{showDebugLog ? '开启' : '关闭'}</Text>
            </Pressable>
          } />
          <Row label={t('member.about')} right={<Text style={S.rowValue}>v1.0.0</Text>} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  cont: { flex: 1, backgroundColor: Colors.background },
  pageTitle: { fontSize: FontSize.largeTitle, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.lg },
  sectionCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.card, padding: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  rowLabel: { fontSize: FontSize.bodyLarge, color: Colors.textPrimary },
  rowValue: { color: Colors.textSecondary, fontSize: FontSize.body },

  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  username: { fontSize: FontSize.title, fontWeight: '700', color: Colors.textPrimary },
  statVal: { color: Colors.textSecondary, fontSize: FontSize.body },

  input: {
    height: 46, backgroundColor: Colors.surfaceLight, borderRadius: Radius.button,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14,
    color: Colors.textPrimary, marginBottom: 10, fontSize: FontSize.body,
  },
  primaryBtn: {
    backgroundColor: Colors.primary, padding: 14, borderRadius: Radius.button,
    alignItems: 'center', marginTop: 4,
  },
  primaryBtnText: { color: Colors.textOnPrimary, fontWeight: '700', fontSize: FontSize.bodyLarge },
  secondaryBtn: {
    borderWidth: 1, borderColor: Colors.primary, padding: 14, borderRadius: Radius.button,
    alignItems: 'center',
  },
  secondaryBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.bodyLarge },

  signBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: 12, borderRadius: Radius.button,
    borderWidth: 1, borderColor: Colors.primary, marginTop: 12,
  },
  signedBtn: { borderColor: Colors.success, backgroundColor: Colors.success + '15' },

  notifBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary + '15', borderRadius: Radius.card,
    padding: 10, marginTop: 10,
  },

  achieveIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center',
  },
  achieveLabel: { fontSize: FontSize.caption, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },

  notifItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  notifTitle: { color: Colors.text, fontWeight: '600', fontSize: FontSize.body },
  notifContent: { color: Colors.textSecondary, fontSize: FontSize.body, marginTop: 2 },

  toggleGroup: { flexDirection: 'row', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, overflow: 'hidden' },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.surface },
  toggleBtnActive: { backgroundColor: Colors.primary },
  toggleText: { color: Colors.textSecondary, fontWeight: '500', fontSize: FontSize.label },
  toggleTextActive: { color: Colors.textOnPrimary },

  logoutSmall: { marginTop: 10, alignSelf: 'flex-end' },
  logoutSmallText: { color: Colors.error, fontSize: FontSize.label, fontWeight: '600' },

  statusText: { fontSize: FontSize.body, fontWeight: '600' },
});
