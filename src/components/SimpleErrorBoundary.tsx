// 极简错误边界 — 无任何依赖，纯 View + Text
// 用于兜住最严重的崩溃

import React, { Component, ErrorInfo } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';

interface Props {
  children: React.ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  stack: string;
}

export class SimpleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, stack: '' };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const stack = error.stack || info.componentStack || '';
    this.setState({ stack });
    console.error('[SimpleErrorBoundary]', error.message);
    console.error('[SimpleErrorBoundary] Stack:', stack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#07070D', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#F0EDE8', marginBottom: 8 }}>
            {this.props.title || '渲染错误'}
          </Text>
          <Text style={{ fontSize: 13, color: '#9895A0', textAlign: 'center', marginBottom: 16 }}>
            请复制下方信息发送给开发者
          </Text>
          <ScrollView
            style={{ width: '100%', maxHeight: 250, backgroundColor: '#13131A', borderRadius: 12, padding: 14, marginBottom: 16 }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#E85D3A', marginBottom: 8 }}>
              {this.state.error?.message || '未知错误'}
            </Text>
            <Text style={{ fontSize: 11, color: '#6B6873', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
              {this.state.stack || '(无堆栈信息)'}
            </Text>
          </ScrollView>
          <Pressable
            onPress={() => this.setState({ hasError: false, error: null, stack: '' })}
            style={{ backgroundColor: '#E85D3A', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>重试</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
