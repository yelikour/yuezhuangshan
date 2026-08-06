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
    volume: 0.5,
    muted: true, // 默认静音，避免自动播放惊吓
    reduceMotion: false,
    subtitles: true,
  };
}

/** 浅合并用于安全加载（兼容旧存档缺失字段） */
export function mergeState(parsed: Partial<GameState>): GameState {
  const def = createDefaultState();
  return {
    ...def,
    ...parsed,
    attempts: { ...def.attempts, ...(parsed.attempts ?? {}) },
    hintLevel: { ...def.hintLevel, ...(parsed.hintLevel ?? {}) },
    visitedPages: parsed.visitedPages ?? [],
    discoveredClues: parsed.discoveredClues ?? [],
    unlockedNodes: parsed.unlockedNodes ?? def.unlockedNodes,
    solvedPuzzles: parsed.solvedPuzzles ?? [],
    readMails: parsed.readMails ?? [],
  };
}
