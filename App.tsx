// 主入口 — 完整导航结构
// Tab: 首页 | 分类 | 游戏 | 影视 | 论坛 | 我的
// Stack: 所有子页面
// @author nyx

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import './src/i18n';
import { Colors } from './src/theme';
import { useSettingsStore } from './src/store/useSettings';
import { useAuthStore } from './src/store/useAuth';
import { fetchSetting } from './src/api/endpoints';

// Screens
import { MainScreen } from './src/screens/MainScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { ComicDetailScreen } from './src/screens/ComicDetailScreen';
import { ReaderScreen } from './src/screens/ReaderScreen';
import { MoviesScreen, MoviePlayerScreen } from './src/screens/MoviesScreen';
import { NovelsScreen, NovelDetailScreen, NovelReaderScreen } from './src/screens/NovelsScreen';
import { BlogsScreen, BlogDetailScreen } from './src/screens/BlogsScreen';
import { ForumScreen } from './src/screens/ForumScreen';

import { LibraryScreen } from './src/screens/LibraryScreen';
import { MemberScreen } from './src/screens/MemberScreen';
import { WeekRankScreen } from './src/screens/WeekRankScreen';
import { RegisterScreen, ForgotPasswordScreen } from './src/screens/AuthScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme: Theme = {
  dark: true,
  colors: {
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.textPrimary,
    border: Colors.border,
    notification: Colors.primary,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <MaterialIcons
      name={name as any}
      size={24}
      color={focused ? Colors.tabActive : Colors.tabInactive}
    />
  );
}

function HomeTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'web' ? Colors.tabBar : undefined,
          // iOS 26 原生半透明玻璃效果（backgroundColor=undefined 时自动生效）
          borderTopWidth: 0.5,
          borderTopColor: Colors.tabBarBorder,
          paddingBottom: insets.bottom || 8,
          height: 56 + (insets.bottom || 8),
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500', marginBottom: 4 },
        tabBarIconStyle: { marginTop: 4 },
      }}
    >
      <Tab.Screen name="Home" component={MainScreen}
        options={{ tabBarLabel: t('nav.home'), tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }} />
      <Tab.Screen name="Categories" component={CategoriesScreen}
        options={{ tabBarLabel: t('nav.categories'), tabBarIcon: ({ focused }) => <TabIcon name="window" focused={focused} /> }} />
      <Tab.Screen name="Search" component={SearchScreen}
        options={{ tabBarLabel: '搜索', tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} /> }} />
      <Tab.Screen name="Movies" component={MoviesScreen}
        options={{ tabBarLabel: t('nav.movie'), tabBarIcon: ({ focused }) => <TabIcon name="video-library" focused={focused} /> }} />
      <Tab.Screen name="Forum" component={ForumScreen}
        options={{ tabBarLabel: t('nav.forum'), tabBarIcon: ({ focused }) => <TabIcon name="textsms" focused={focused} /> }} />
      <Tab.Screen name="Member" component={MemberScreen}
        options={{ tabBarLabel: t('nav.member'), tabBarIcon: ({ focused }) => <TabIcon name="account-circle" focused={focused} /> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const { load: loadSettings, updateFromSetting } = useSettingsStore();
  const { load: loadAuth } = useAuthStore();

  useEffect(() => {
    (async () => {
      await loadSettings();
      await loadAuth();

      // 从 API 获取动态域名配置
      try {
        const setting = await fetchSetting();
        updateFromSetting(setting);
      } catch {
        // 使用硬编码兜底
      }

      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.textPrimary,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: Colors.background },
            headerBackTitle: '返回',
          }}
        >
          <Stack.Screen name="Main" component={HomeTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ComicDetail" component={ComicDetailScreen}
            options={{ title: '详情', headerBackTitle: '返回' }} />
          <Stack.Screen name="Reader" component={ReaderScreen}
            options={{ headerShown: false, orientation: 'landscape' as const }} />
          <Stack.Screen name="Novels" component={NovelsScreen}
            options={{ headerShown: false }} />
          <Stack.Screen name="NovelDetail" component={NovelDetailScreen}
            options={{ headerShown: false }} />
          <Stack.Screen name="NovelReader" component={NovelReaderScreen}
            options={{ headerShown: false }} />
          <Stack.Screen name="MoviePlayer" component={MoviePlayerScreen}
            options={{ headerShown: false }} />
          <Stack.Screen name="Blogs" component={BlogsScreen}
            options={{ headerShown: false }} />
          <Stack.Screen name="BlogDetail" component={BlogDetailScreen}
            options={{ headerShown: false }} />
          <Stack.Screen name="Library" component={LibraryScreen}
            options={{ headerShown: false }} />
          <Stack.Screen name="WeekRank" component={WeekRankScreen}
            options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen}
            options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}
            options={{ presentation: 'modal', headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
