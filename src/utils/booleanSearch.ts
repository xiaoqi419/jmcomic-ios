// 布尔搜索查询解析器 — 参考 haka_comic dev boolean_parser.dart
// 语法: "萝莉 +教师 -NTR" → OR:["萝莉"], AND:["教师"], NOT:["NTR"]

export interface SearchQuery {
  /** OR 词（默认空格分隔） */
  orTerms: string[];
  /** AND 词（+ 前缀） */
  andTerms: string[];
  /** NOT 词（- 前缀） */
  notTerms: string[];
  /** 原始查询 */
  raw: string;
  /** 第一个关键字（用于服务端搜索） */
  firstServerKeyword: string;
  /** 候选关键字列表（用于并行探测） */
  candidateKeywords: string[];
}

/**
 * 解析布尔搜索查询
 * @param input 用户输入，如 "萝莉 +教师 -NTR"
 */
export function parseBooleanQuery(input: string): SearchQuery {
  const raw = input.trim();
  const tokens = raw.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];

  const orTerms: string[] = [];
  const andTerms: string[] = [];
  const notTerms: string[] = [];

  for (const token of tokens) {
    const t = token.replace(/["']/g, '').trim();
    if (!t) continue;

    if (t.startsWith('+')) {
      andTerms.push(t.slice(1).trim());
    } else if (t.startsWith('-')) {
      notTerms.push(t.slice(1).trim());
    } else {
      orTerms.push(t);
    }
  }

  // 第一个服务端搜索关键字（取 OR 词第一个，或 AND 词第一个）
  const firstServerKeyword = orTerms[0] || andTerms[0] || '';

  // 候选关键字列表（用于并行探测哪个关键字返回最少结果）
  const candidateKeywords = [...orTerms, ...andTerms].filter(Boolean);

  return {
    orTerms,
    andTerms,
    notTerms,
    raw,
    firstServerKeyword,
    candidateKeywords,
  };
}

/**
 * 客户端布尔过滤
 * 在服务端返回结果后，用 AND/NOT 条件过滤
 */
export function applyBooleanFilter<T extends Record<string, any>>(
  items: T[],
  query: SearchQuery,
  /** 提取文本字段的函数，默认取 title */
  getText: (item: T) => string = (item) => item.title || '',
): T[] {
  let result = [...items];

  // AND: 必须包含所有 andTerms
  for (const term of query.andTerms) {
    const lower = term.toLowerCase();
    result = result.filter((item) => getText(item).toLowerCase().includes(lower));
  }

  // NOT: 不能包含任何 notTerms
  for (const term of query.notTerms) {
    const lower = term.toLowerCase();
    result = result.filter((item) => !getText(item).toLowerCase().includes(lower));
  }

  return result;
}
