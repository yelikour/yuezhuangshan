/**
 * GameState 类型与默认值 —— 见 docs/game_design.md §二。
 * 所有状态变更最终都经 storage.ts 落到 localStorage。
 */

export type NodeId =
  | 'P00' | 'P01' | 'P02' | 'P03' | 'P04' | 'P05' | 'P06' | 'P07'
  | 'P08' | 'P09' | 'P10' | 'P11' | 'P12'
  | 'SIDE_ANNALS' // 支线：岳氏族谱/县志残页
  | 'SIDE_HEZONG' // 支线：合奘教宣传页
  | 'SIDE_FORUM'; // 支线：岳桩村论坛

export type PageId =
  | 'index' | 'mail' | 'scenic' | 'scenic_legend' | 'scenic_annals'
  | 'chat' | 'news' | 'backend' | 'backend_records' | 'ending'
  | 'lab' | 'lab_archive' | 'lab_monitor' | 'identify' | 'ending2'
  | 'hezong' | 'forum';

export interface GameState {
  version: number;
  createdAt: number;
  updatedAt: number;

  visitedPages: PageId[];
  discoveredClues: string[];
  unlockedNodes: NodeId[];

  /** 各谜题错误尝试次数 puzzle_id -> count */
  attempts: Record<string, number>;
  /** 各谜题当前提示等级 puzzle_id -> 0..3 */
  hintLevel: Record<string, 0 | 1 | 2 | 3>;
  /** 已解谜题 id */
  solvedPuzzles: string[];

  /** 已读邮件 id（用于邮箱未读计数持久化，刷新后不回弹） */
  readMails: string[];

  /** 已见结局 id（submit / burn / vessel，用于结局图鉴） */
  endingsSeen: string[];

  // 设置
  volume: number; // 0..1
  muted: boolean;
  reduceMotion: boolean;
  subtitles: boolean;
}

export const SAVE_VERSION = 1;

export function createDefaultState(): GameState {
  const now = Date.now();
  return {
    version: SAVE_VERSION,
    createdAt: now,
    updatedAt: now,
    visitedPages: [],
    discoveredClues: [],
    unlockedNodes: ['P00'], // 仅入口默认开放
    attempts: {},
    hintLevel: {},
    solvedPuzzles: [],
    readMails: [],
    endingsSeen: [],
    volume: 0.5,
    muted: true, // 默认静音，避免自动播放惊吓
    reduceMotion: false,
    subtitles: true,
  };
}

/** 存档是不可信输入，逐字段校验并兼容旧存档。 */
export function mergeState(parsed: unknown): GameState {
  const def = createDefaultState();
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return def;
  const value = parsed as Record<string, unknown>;
  const strings = (v: unknown): string[] => Array.isArray(v)
    ? [...new Set(v.filter((item): item is string => typeof item === 'string' && item.trim().length > 0))]
    : [];
  const bool = (v: unknown, fallback: boolean) => typeof v === 'boolean' ? v : fallback;
  const timestamp = (v: unknown, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : fallback;
  const counts = (v: unknown, maximum: number): Record<string, number> => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
    return Object.fromEntries(Object.entries(v).filter(([key, count]) =>
      key !== '__proto__' && key !== 'constructor' && key !== 'prototype' &&
      typeof count === 'number' && Number.isSafeInteger(count) && count >= 0 && count <= maximum,
    )) as Record<string, number>;
  };
  return {
    ...def,
    createdAt: timestamp(value.createdAt, def.createdAt),
    updatedAt: timestamp(value.updatedAt, def.updatedAt),
    attempts: counts(value.attempts, Number.MAX_SAFE_INTEGER),
    hintLevel: counts(value.hintLevel, 3) as GameState['hintLevel'],
    visitedPages: strings(value.visitedPages) as PageId[],
    discoveredClues: strings(value.discoveredClues),
    unlockedNodes: [...new Set(['P00', ...strings(value.unlockedNodes)])] as NodeId[],
    solvedPuzzles: strings(value.solvedPuzzles),
    readMails: strings(value.readMails),
    endingsSeen: strings(value.endingsSeen).filter((id) => ['submit', 'burn', 'vessel'].includes(id)),
    volume: typeof value.volume === 'number' && Number.isFinite(value.volume)
      ? Math.max(0, Math.min(1, value.volume)) : def.volume,
    muted: bool(value.muted, def.muted),
    reduceMotion: bool(value.reduceMotion, def.reduceMotion),
    subtitles: bool(value.subtitles, def.subtitles),
  };
}
