/**
 * 输入标准化模块 —— 整个游戏的"格式宽容层"。
 *
 * 设计目标（见 docs/game_design.md §三）：
 *   不因细微格式差异让玩家卡关。所有搜索/口令输入必须经过标准化再比对。
 *
 * 重要约定：所有"答案"在数据层也都以【标准化后】的形式存储，
 *   这样玩家输入与答案走同一条标准化路径，比对天然一致。
 */

export interface NormalizeOptions {
  /** 是否区分大小写，默认 false（不区分） */
  caseSensitive?: boolean;
  /** 是否保留内部空白与分隔符，默认 false（去除） */
  keepSeparators?: boolean;
}

/** 全角字符 → 半角（含全角空格 \u3000、全角数字字母、全角标点中的连字符类） */
function toHalfWidth(str: string): string {
  let out = '';
  for (const ch of str) {
    const code = ch.codePointAt(0)!;
    if (code === 0x3000) {
      // 全角空格 → 普通空格
      out += ' ';
    } else if (code >= 0xff01 && code <= 0xff5e) {
      // 全角 ASCII → 半角
      out += String.fromCodePoint(code - 0xfee0);
    } else if (code >= 0xff10 && code <= 0xff19) {
      // 全角数字 0-9（已被上面覆盖，留作防御）
      out += String.fromCodePoint(code - 0xff10 + 0x30);
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * 标准化一段输入。
 * 步骤：去首尾空白 → 全角转半角 → 去除内部空白与分隔符 → 转小写。
 */
export function normalizeInput(raw: string, opts: NormalizeOptions = {}): string {
  const { caseSensitive = false, keepSeparators = false } = opts;
  if (raw == null) return '';
  let s = String(raw);
  s = s.trim();
  s = toHalfWidth(s);
  if (!keepSeparators) {
    // 去除所有内部空白与常见分隔符
    s = s.replace(/[\s\-_./\\|]+/g, '');
  } else {
    s = s.replace(/\s+/g, ' '); // 仅规范化空白
  }
  if (!caseSensitive) {
    s = s.toLowerCase();
  }
  return s;
}

/**
 * 有限同义词表 —— 为关键词搜索提供，避免"换个说法就找不到"。
 * key 为标准化后的主词，value 为该主词的等价命中词（也已标准化）。
 * 注意：中文经 normalizeInput 后不变（无大小写/分隔符问题），保留原形。
 */
export const SYNONYMS: Record<string, string[]> = {
  岳圣桩: ['圣桩', '桩', '岳圣樁'],
  失踪: ['失足', '走失', '下落不明', '失踪人口'],
  周某: ['周'],
};

/** 把一组目标关键词 + 同义词展开，返回标准化后的命中词集合 */
export function expandKeywords(keywords: string[]): string[] {
  const set = new Set<string>();
  for (const kw of keywords) {
    const n = normalizeInput(kw);
    if (n) set.add(n);
    const syns = SYNONYMS[kw] ?? SYNONYMS[n] ?? [];
    for (const syn of syns) {
      const sn = normalizeInput(syn);
      if (sn) set.add(sn);
    }
  }
  return [...set];
}

/**
 * 搜索匹配：玩家输入的 query 是否命中任一目标关键词。
 * 命中条件：标准化后的 query **包含**任一标准化（并展开同义词）后的关键词。
 */
export function matchSearch(query: string, targetKeywords: string[]): boolean {
  const q = normalizeInput(query);
  if (!q) return false;
  const expanded = expandKeywords(targetKeywords);
  return expanded.some((kw) => q.includes(kw));
}

/**
 * 口令比对：玩家输入是否等于给定答案（答案应已标准化存储）。
 * 对玩家输入做相同标准化后比对。
 */
export function checkPassword(
  input: string,
  normalizedAnswer: string,
  opts: NormalizeOptions = {},
): boolean {
  return normalizeInput(input, opts) === normalizedAnswer;
}
