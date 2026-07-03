// 简繁中文转换器 — 简化版，只转换常见字符
// 参考 haka_comic dev chinese_converter.dart 简化实现

// 常见简繁对照表（简→繁）
const S2T_MAP: Record<string, string> = {
  '后': '後', '里': '裡', '面': '面', '干': '幹', '发': '發',
  '复': '復', '斗': '鬥', '系': '係', '体': '體', '台': '臺',
  '国': '國', '会': '會', '学': '學', '对': '對', '动': '動',
  '当': '當', '电': '電', '话': '話', '点': '點', '開': '開',
  '关': '關', '门': '門', '间': '間', '问': '問',
  '说': '說', '读': '讀', '书': '書', '长': '長',
  '东': '東', '乐': '樂', '车': '車', '飞': '飛',
  '马': '馬', '鱼': '魚', '鸟': '鳥', '时': '時',
  '樣': '樣', '個': '個', '這': '這',
  '們': '們', '來': '來', '爲': '為', '麼': '麼',
};

// 常见繁简对照表（繁→简）
const T2S_MAP: Record<string, string> = {};
for (const [s, t] of Object.entries(S2T_MAP)) {
  T2S_MAP[t] = s;
}

/** 简体转繁体 */
export function s2t(text: string): string {
  return text.split('').map((c) => S2T_MAP[c] || c).join('');
}

/** 繁体转简体 */
export function t2s(text: string): string {
  return text.split('').map((c) => T2S_MAP[c] || c).join('');
}

/** 文本是否包含繁体字 */
export function hasTraditional(text: string): boolean {
  for (const c of text) {
    if (T2S_MAP[c]) return true;
  }
  return false;
}

/** 文本是否包含简体字 */
export function hasSimplified(text: string): boolean {
  for (const c of text) {
    if (S2T_MAP[c]) return true;
  }
  return false;
}

/** 规范化搜索词（可配置方向） */
export type NormalizeDirection = 'off' | 's2t' | 't2s';

export function normalizeSearchTerm(text: string, direction: NormalizeDirection): string {
  switch (direction) {
    case 's2t': return s2t(text);
    case 't2s': return t2s(text);
    default: return text;
  }
}
