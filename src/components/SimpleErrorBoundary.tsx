// 错误边界 — 捕获渲染异常，展示可复制的错误信息
// 极简实现，无 SafeAreaView 等外部依赖

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
    // 写入日志文件
    try {
      const { logger } = require('../utils/HaKaLogger');
      logger.error('ErrorBoundary: ' + (this.props.title || ''), error);
    } catch {}
  }

  handleCopy = () => {
    const text = `Error: ${this.state.error?.message || '未知错误'}\n\nStack:\n${this.state.stack}`;
    try {
      const { Clipboard } = require('react-native');
      if (Clipboard?.setString) Clipboard.setString(text);
    } catch {}
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#07070D', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#F0EDE8', marginBottom: 8 }}>
            {this.props.title || '渲染错误'}
          </Text>
          <Text style={{ fontSize: 13, color: '#9895A0', textAlign: 'center', marginBottom: 16, lineHeight: 20 }}>
            请复制下方信息发送给开发者
          </Text>
          <ScrollView
            style={{ width: '100%', maxHeight: 260, backgroundColor: '#13131A', borderRadius: 12, padding: 14, marginBottom: 16 }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#E85D3A', marginBottom: 8 }}>
              {this.state.error?.message || '未知错误'}
            </Text>
            <Text style={{ fontSize: 11, color: '#6B6873', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 16 }}>
              {this.state.stack || '(无堆栈信息)'}
            </Text>
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Pressable
              onPress={this.handleCopy}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E85D3A', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>📋 复制错误信息</Text>
            </Pressable>
            <Pressable
              onPress={() => this.setState({ hasError: false, error: null, stack: '' })}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 }}
            >
              <Text style={{ color: '#E85D3A', fontSize: 14, fontWeight: '600' }}>🔄 重试</Text>
            </Pressable>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}
