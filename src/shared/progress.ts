/**
 * 进度/解锁/访问/线索记录逻辑 —— 见 docs/game_design.md §二。
 *
 * 节点依赖集中在此处的 DEPENDENCIES 表，不散落各页面。
 */
import { type GameState, type NodeId, type PageId } from './state';
import { loadState, updateState } from './storage';

/** 谜题 id 常量，避免各页面拼写错误 */
export const PUZZLE = {
  SEARCH_P02: 'search_p02',
  SEARCH_P04: 'search_p04',
  LOGIN_P05: 'login_p05',
} as const;

export type PuzzleId = (typeof PUZZLE)[keyof typeof PUZZLE];

/**
 * 节点解锁依赖。key = 要解锁的节点，value = 必须已满足的条件列表。
 * 条件可以是：已解锁某节点 / 已发现某线索 / 已解某谜题。
 * 前缀约定：'NODE:' / 'CLUE:' / 'PUZZLE:'。
 */
export const DEPENDENCIES: Partial<Record<NodeId, string[]>> = {
  P01: ['NODE:P00'], // 确认入口后开放
  P02: ['NODE:P01'],
  P03: ['NODE:P01'],
  P04: ['CLUE:CLUE_OFFLINE_TIME'], // 读过沈苒失联
  P05: ['PUZZLE:search_p04'], // 解出搜索谜题
  P06: ['NODE:P05', 'PUZZLE:login_p05'], // 登录成功
  P07: ['CLUE:CLUE_KEYCARD_MAINTENANCE'], // 看过房卡记录
  SIDE_ANNALS: ['NODE:P02'],
  SIDE_HEZONG: ['NODE:P06'],
};

function meetsConditions(s: GameState, conditions: string[]): boolean {
  return conditions.every((c) => {
    if (c.startsWith('NODE:')) return s.unlockedNodes.includes(c.slice(5) as NodeId);
    if (c.startsWith('CLUE:')) return s.discoveredClues.includes(c.slice(5));
    if (c.startsWith('PUZZLE:')) return s.solvedPuzzles.includes(c.slice(7));
    return false;
  });
}

export function isUnlocked(node: NodeId): boolean {
  const s = loadState();
  // 默认开放的节点（如 P00）直接放行
  if (s.unlockedNodes.includes(node)) return true;
  const deps = DEPENDENCIES[node];
  if (!deps) return false;
  return meetsConditions(s, deps);
}

/** 尝试解锁节点；若依赖未满足则返回 false */
export function tryUnlock(node: NodeId): boolean {
  const s = loadState();
  if (s.unlockedNodes.includes(node)) return true;
  const deps = DEPENDENCIES[node];
  if (deps && !meetsConditions(s, deps)) return false;
  updateState((st) => {
    if (!st.unlockedNodes.includes(node)) st.unlockedNodes.push(node);
  });
  return true;
}

/** 强制解锁（用于剧情触发，如 P00 确认后开放 P01） */
export function unlock(node: NodeId): void {
  updateState((st) => {
    if (!st.unlockedNodes.includes(node)) st.unlockedNodes.push(node);
  });
}

export function markVisited(page: PageId): void {
  updateState((st) => {
    if (!st.visitedPages.includes(page)) st.visitedPages.push(page);
  });
}

export function discoverClue(clueId: string): void {
  updateState((st) => {
    if (!st.discoveredClues.includes(clueId)) st.discoveredClues.push(clueId);
  });
}

export function markSolved(puzzle: string): void {
  updateState((st) => {
    if (!st.solvedPuzzles.includes(puzzle)) st.solvedPuzzles.push(puzzle);
  });
}

/** 注册一次错误尝试 */
export function recordAttempt(puzzle: string): number {
  const s = updateState((st) => {
    st.attempts[puzzle] = (st.attempts[puzzle] ?? 0) + 1;
  });
  return s.attempts[puzzle] ?? 0;
}

export function getAttempts(puzzle: string): number {
  return loadState().attempts[puzzle] ?? 0;
}
