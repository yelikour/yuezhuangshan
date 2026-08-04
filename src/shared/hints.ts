/**
 * 三级渐进提示逻辑 —— 见 docs/game_design.md §四、clue_graph.md §四。
 *
 * 自动升级阈值：错误尝试 ≥2 → L2，≥4 → L3。玩家也可手动请求升 1 级。
 * 提示文案集中在 clues.ts 的 HINTS 表，本模块只管等级。
 */
import { loadState, updateState } from './storage';
import { getAttempts } from './progress';

export type HintLevel = 0 | 1 | 2 | 3;

const AUTO_THRESHOLDS: Array<{ at: number; level: HintLevel }> = [
  { at: 2, level: 2 },
  { at: 4, level: 3 },
];

/** 根据当前错误尝试次数计算"应达到"的自动提示等级 */
export function autoLevelFromAttempts(attempts: number): HintLevel {
  let level: HintLevel = 1; // 默认 L1 可见
  for (const t of AUTO_THRESHOLDS) {
    if (attempts >= t.at) level = t.level;
  }
  return level;
}

export function getHintLevel(puzzle: string): HintLevel {
  const s = loadState();
  const stored = s.hintLevel[puzzle] ?? 0;
  const auto = autoLevelFromAttempts(getAttempts(puzzle));
  return Math.max(stored, auto) as HintLevel;
}

/** 玩家手动请求提示，升 1 级（封顶 L3），不增加 attempts */
export function requestHint(puzzle: string): HintLevel {
  updateState((st) => {
    const cur = st.hintLevel[puzzle] ?? 0;
    const auto = autoLevelFromAttempts(st.attempts[puzzle] ?? 0);
    const eff = Math.max(cur, auto);
    const next = Math.min(3, eff + 1) as HintLevel;
    st.hintLevel[puzzle] = next;
  });
  return getHintLevel(puzzle);
}

/** 返回当前可见的提示文案列表（L1..当前等级），文案来自 clues.HINTS */
export function visibleHints(puzzle: string, hintsTable: Record<string, string[]>): string[] {
  const level = getHintLevel(puzzle);
  const all = hintsTable[puzzle] ?? [];
  if (level <= 0) return [];
  return all.slice(0, level);
}
