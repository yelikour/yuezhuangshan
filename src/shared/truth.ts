/**
 * 真相完成度（TruthProgress）—— 见 docs/game_design.md §6A.4。
 *
 * 分母 = data/clues.ts 的 ALL_DISCOVERABLE_CLUES（主线 + 全部支线线索）。
 * 用于 ending2 完成页的"真相还原度 X%"与证据清单展示，驱动二周目挖掘。
 */
import { ALL_DISCOVERABLE_CLUES, CLUE_TITLES, CLUE_GROUPS, CLUE_GROUP_ORDER } from '@data/clues';
import type { GameState } from './state';

export interface TruthProgress {
  /** 已发现线索数 */
  found: number;
  /** 全部可发现线索数 */
  total: number;
  /** 0..1 */
  ratio: number;
  /** 百分比整数（向下取整） */
  percent: number;
  /** 分档：0 = <50%，1 = 50..79%，2 = ≥80% */
  tier: 0 | 1 | 2;
  /** 证据清单（按发现顺序） */
  titles: string[];
  /** 未收集数 */
  missing: number;
}

export function truthProgress(state: Pick<GameState, 'discoveredClues'>): TruthProgress {
  const total = ALL_DISCOVERABLE_CLUES.length;
  const discovered = state.discoveredClues.filter((c) => ALL_DISCOVERABLE_CLUES.includes(c));
  const found = discovered.length;
  const ratio = total === 0 ? 0 : found / total;
  const tier: 0 | 1 | 2 = ratio >= 0.8 ? 2 : ratio >= 0.5 ? 1 : 0;
  return {
    found,
    total,
    ratio,
    percent: Math.floor(ratio * 100),
    tier,
    titles: discovered.map((c) => CLUE_TITLES[c] ?? c),
    missing: total - found,
  };
}

/** 按档位选取 ENDING2.truth.tiers 文案。 */
export function truthTierText(tier: 0 | 1 | 2, tiers: { min: number; text: string }[]): string {
  // tiers 按阈值从高到低排列；tier 2 取最高档，0 取最低档
  const idx = tier >= 2 ? 0 : tier === 1 ? Math.min(1, tiers.length - 1) : tiers.length - 1;
  return tiers[idx]?.text ?? '';
}

/** 调查手记的分组视图：每组 = 组名 + 已发现标题 + 待发现计数。 */
export interface JournalGroup {
  group: string;
  found: string[];
  missing: number;
}

export function journalGroups(state: Pick<GameState, 'discoveredClues'>): JournalGroup[] {
  const discovered = new Set(state.discoveredClues);
  const byGroup = new Map<string, { found: string[]; missing: number }>();
  for (const c of ALL_DISCOVERABLE_CLUES) {
    const g = CLUE_GROUPS[c] ?? '其他';
    const entry = byGroup.get(g) ?? { found: [], missing: 0 };
    if (discovered.has(c)) entry.found.push(CLUE_TITLES[c] ?? c);
    else entry.missing += 1;
    byGroup.set(g, entry);
  }
  // 显示顺序严格按 CLUE_GROUP_ORDER（docs/game_design.md §6A.4）；
  // 数据里新出现的组名排在最后，避免排序表与数据漂移时悄悄换位。
  const orderIndex = (g: string) => {
    const i = (CLUE_GROUP_ORDER as readonly string[]).indexOf(g);
    return i === -1 ? CLUE_GROUP_ORDER.length : i;
  };
  return Array.from(byGroup.entries())
    .map(([group, { found, missing }]) => ({ group, found, missing }))
    .sort((a, b) => orderIndex(a.group) - orderIndex(b.group));
}
