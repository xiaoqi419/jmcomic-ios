// 个人中心 v2
// @author nyx

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, FontSize } from '../theme';
import { useAuthStore } from '../store/useAuth';
import { useMemberStore } from '../store/useMember';
import { useSettingsStore } from '../store/useSettings';
import { login } from '../api/endpoints';

export function MemberScreen() {
  const nav = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const { username, loggedIn, login: doLogin, logout: doLogout } = useAuthStore();
  const { info, signData, signed, doSignIn, loadInfo, loadSign, loadAchievements, achievements, notifications, loadNotifications, unread } = useMemberStore();
  const { language, setLanguage, readingMode, setReadingMode, shunts, selectedShuntKey, selectShunt } = useSettingsStore();

  const [showLogin, setShowLogin] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (loggedIn) {
      loadInfo();
      loadSign().then(() => {
        if (!useMemberStore.getState().signed) {
          doSignIn().catch(() => {});
        }
      });
      loadAchievements();
      loadNotifications();
    }
  }, [loggedIn]);

  const handleLogin = async () => {
    if (!loginUser.trim() || !loginPass.trim()) return;
    setLoginLoading(true);
    try {
      const data = await login(loginUser.trim(), loginPass.trim());
      if (data.s) {
        await doLogin(data.username || loginUser, data.s, data.photo || '');
        setShowLogin(false);
        setLoginUser('');
        setLoginPass('');
        Alert.alert('', `欢迎回来, ${data.username || loginUser}`);
      }
    } catch (e: any) {
      Alert.alert('登录失败', e.message || '请检查用户名和密码');
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    Alert.alert('确认退出', '', [
      { text: '取消', style: 'cancel' },
      { text: '退出', onPress: () => doLogout() },
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
        <Text style={S.pageTitle}>
          {loggedIn ? t('member.welcome') : t('member.login')}
        </Text>

        {/* 用户卡片 / 登录 */}
        {loggedIn ? (
          <View style={S.userCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={S.avatar}>
                <Text style={S.avatarText}>{(username || 'U')[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.username}>{username}</Text>
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
          </View>
        ) : showLogin ? (
          <View style={S.loginCard}>
            <TextInput style={S.input} placeholder="用户名" placeholderTextColor={Colors.textTertiary} value={loginUser} onChangeText={setLoginUser} autoCapitalize="none" />
            <TextInput style={S.input} placeholder="密码" placeholderTextColor={Colors.textTertiary} value={loginPass} onChangeText={setLoginPass} secureTextEntry />
            <Pressable onPress={handleLogin} disabled={loginLoading} style={S.primaryBtn}>
              <Text style={S.primaryBtnText}>{loginLoading ? '...' : t('member.login')}</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 10 }}>
              <Pressable onPress={() => nav.navigate('Register' as never)}>
                <Text style={{ color: Colors.primary, fontSize: FontSize.body }}>{t('member.register')}</Text>
              </Pressable>
              <Pressable onPress={() => nav.navigate('ForgotPassword' as never)}>
                <Text style={{ color: Colors.primary, fontSize: FontSize.body }}>{t('member.forgot')}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={S.loginCard}>
            <Pressable onPress={() => setShowLogin(true)} style={S.primaryBtn}>
              <Text style={S.primaryBtnText}>{t('member.login')}</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 10 }}>
              <Pressable onPress={() => nav.navigate('Register' as never)}>
                <Text style={{ color: Colors.primary, fontSize: FontSize.body }}>{t('member.register')}</Text>
              </Pressable>
              <Pressable onPress={() => nav.navigate('ForgotPassword' as never)}>
                <Text style={{ color: Colors.primary, fontSize: FontSize.body }}>{t('member.forgot')}</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* 未读通知 */}
        {loggedIn && unread && (unread.comic_follow > 0 || unread.site_notice > 0) && (
          <Pressable onPress={() => loadNotifications()} style={S.notifBanner}>
            <MaterialIcons name="notifications" size={20} color={Colors.primary} />
            <Text style={{ color: Colors.primary, fontWeight: '600', flex: 1 }}>
              未读通知: {unread.comic_follow + unread.site_notice}
            </Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.primary} />
          </Pressable>
        )}

        {/* 成就 */}
        {loggedIn && achievements.length > 0 && (
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

        {/* 通知列表 */}
        {loggedIn && notifications.length > 0 && (
          <Section title={t('member.notifications')} icon="notifications">
            {notifications.slice(0, 5).map((n) => (
              <View key={n.id} style={S.notifItem}>
                <Text style={S.notifTitle}>{n.title}</Text>
                <Text style={S.notifContent} numberOfLines={2}>{n.content}</Text>
              </View>
            ))}
          </Section>
        )}

        {/* 设置 */}
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
          <Row label={t('member.about')} right={<Text style={S.rowValue}>v1.0.0</Text>} />
        </Section>

        {/* 退出登录 */}
        {loggedIn && (
          <Pressable onPress={handleLogout} style={S.logoutBtn}>
            <Text style={S.logoutText}>{t('member.logout')}</Text>
          </Pressable>
        )}
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

  userCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.card, padding: Spacing.md,
    marginBottom: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  username: { fontSize: FontSize.title, fontWeight: '700', color: Colors.textPrimary },
  statVal: { color: Colors.textSecondary, fontSize: FontSize.body },

  loginCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.card, padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
  },
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

  signBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: 12, borderRadius: Radius.button,
    borderWidth: 1, borderColor: Colors.primary, marginTop: 14,
  },
  signedBtn: { borderColor: Colors.success, backgroundColor: Colors.success + '15' },

  notifBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary + '15', borderRadius: Radius.card,
    padding: 12, marginBottom: Spacing.lg,
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

  logoutBtn: {
    backgroundColor: Colors.error + '15', borderRadius: Radius.button,
    padding: 14, alignItems: 'center', marginTop: Spacing.md,
  },
  logoutText: { color: Colors.error, fontWeight: '700', fontSize: FontSize.body },
});
