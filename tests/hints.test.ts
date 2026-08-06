/**
 * 提示系统测试：自动升级阈值 + 手动请求 + 禁词策略守卫。
 *
 * 禁词策略：上下文白名单（见 docs/clue_graph.md §四，三层定义与本文件完全一致）
 *   ① 全等级严格禁：账号、完整口令、口令分段、P11 宠物名"芝麻"、"选第 N 条"式指令；
 *   ② L1/L2 禁（搜索题答案性命中词）：
 *      - P02：岳圣桩、圣桩（"桩"作为木桩剧情上下文词，允许）；
 *      - P04：失踪、失足、周某；
 *      - P09：离山、根脉、容器、迁移（"主体"作为剧情上下文高频词，允许）；
 *   ③ 页面/数据上下文词（含"桩""主体"等剧情词）：不计入 HINTS 禁词。
 *   搜索题 L3 允许出现 ② 类词，以确保提示文本本身能命中目标数据集（见"L3 可用性"测试块）。
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { requestHint, getHintLevel, visibleHints, autoLevelFromAttempts } from '@shared/hints';
import { recordAttempt, PUZZLE, type PuzzleId } from '@shared/progress';
import { HINTS, ARCHIVE_DB, SEARCH_P02_KEYWORDS, SEARCH_P04_KEYWORDS } from '@data/clues';
import { matchSearch } from '@shared/normalize';
import { NEWS } from '@data/content';
import { _resetCacheForTests } from '@shared/storage';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

beforeEach(() => {
  localStorage.clear();
  _resetCacheForTests();
});

/** 从 PUZZLE 常量派生谜题 ID 列表，避免手写重复。 */
const SEARCH_PUZZLES = [PUZZLE.SEARCH_P02, PUZZLE.SEARCH_P04, PUZZLE.SEARCH_P09] as PuzzleId[];
const ALL_PUZZLES = Object.values(PUZZLE) as PuzzleId[];

describe('提示等级', () => {
  it('初始无错误尝试，等级为 1（L1 默认可见）', () => {
    expect(getHintLevel(PUZZLE.LOGIN_P05)).toBe(1);
  });

  it('autoLevelFromAttempts 阈值：0/1→1, 2/3→2, 4+→3', () => {
    expect(autoLevelFromAttempts(0)).toBe(1);
    expect(autoLevelFromAttempts(1)).toBe(1);
    expect(autoLevelFromAttempts(2)).toBe(2);
    expect(autoLevelFromAttempts(3)).toBe(2);
    expect(autoLevelFromAttempts(4)).toBe(3);
    expect(autoLevelFromAttempts(10)).toBe(3);
  });

  it('错误尝试 ≥2 自动到 L2', () => {
    recordAttempt(PUZZLE.LOGIN_P05);
    recordAttempt(PUZZLE.LOGIN_P05);
    expect(getHintLevel(PUZZLE.LOGIN_P05)).toBe(2);
  });

  it('错误尝试 ≥4 自动到 L3', () => {
    for (let i = 0; i < 4; i++) recordAttempt(PUZZLE.LOGIN_P05);
    expect(getHintLevel(PUZZLE.LOGIN_P05)).toBe(3);
  });

  it('手动请求从 L1 升到 L2、L3，封顶 L3', () => {
    expect(requestHint(PUZZLE.LOGIN_P05)).toBe(2);
    expect(requestHint(PUZZLE.LOGIN_P05)).toBe(3);
    expect(requestHint(PUZZLE.LOGIN_P05)).toBe(3); // 封顶
  });

  it('手动请求不增加错误尝试', () => {
    requestHint(PUZZLE.LOGIN_P05);
    requestHint(PUZZLE.LOGIN_P05);
    // 错误 0 次 + 手动 2 次 → L3，visibleHints 给 3 条
    expect(visibleHints(PUZZLE.LOGIN_P05, HINTS)).toHaveLength(3);
  });

  it('visibleHints 返回对应等级的提示条数', () => {
    // 初始 L1 → 1 条
    expect(visibleHints(PUZZLE.LOGIN_P05, HINTS)).toHaveLength(1);
    recordAttempt(PUZZLE.LOGIN_P05);
    recordAttempt(PUZZLE.LOGIN_P05); // 自动到 L2
    expect(visibleHints(PUZZLE.LOGIN_P05, HINTS)).toHaveLength(2);
    for (let i = 0; i < 3; i++) recordAttempt(PUZZLE.LOGIN_P05); // 累计 5 → L3
    expect(visibleHints(PUZZLE.LOGIN_P05, HINTS)).toHaveLength(3);
  });

  it('提示文案不直接包含完整答案 0427ywyxxsc（L1/L2）', () => {
    const l1 = visibleHints(PUZZLE.LOGIN_P05, HINTS)[0];
    expect(l1).not.toContain('0427ywyxxsc');
  });
});

/**
 * 禁词策略守卫：上下文白名单（见 docs/clue_graph.md §四）。
 *   全等级严格禁词（口令/账号/芝麻/指令）+ L1/L2 搜索命中词禁用 + L3 白名单。
 */
describe('提示文案禁词策略（上下文白名单）', () => {
  // ① 全等级严格禁：任何等级出现都算泄露。
  const STRICT_FORBIDDEN = [
    // P05 完整口令及其分段
    'protagonist@yuezhuangshan-conf.cn',
    '0427ywyxxsc',
    '0427',
    'ywyxxsc',
    // P08 完整口令及其分段
    'lxzb07',
    'lxz',
    'b07',
    'b-07',
    // P11 最终识别词（宠物名）
    '芝麻',
    // "选第 N 条 / 选提到…那条"式明确选项指令
    '选择第',
    '选第',
    '选提到',
    '选那条',
  ];

  // ② L1/L2 禁用的搜索命中关键词原词（L3 允许引导到）。
  //   来源：SEARCH_P02_KEYWORDS / SEARCH_P04_KEYWORDS / ARCHIVE_DB.matchKeywords。
  const SEARCH_HITS_L1L2_FORBIDDEN: Record<PuzzleId, string[]> = {
    [PUZZLE.SEARCH_P02]: ['岳圣桩', '圣桩'], // "桩" 单字过于常见不禁（"木桩"等剧情词合法）
    [PUZZLE.SEARCH_P04]: ['失踪', '失足', '周某'],
    [PUZZLE.SEARCH_P09]: ['离山', '根脉', '容器', '迁移'], // "主体"是剧情上下文词不禁
    [PUZZLE.LOGIN_P05]: [],
    [PUZZLE.LOGIN_P08]: [],
    [PUZZLE.IDENTIFY_P11]: [],
  };

  it('每个谜题都各有 3 级提示', () => {
    ALL_PUZZLES.forEach((id) => {
      expect(HINTS[id], `谜题 ${id} 应有 3 级提示`).toHaveLength(3);
    });
  });

  it('全等级严格禁词：L1/L2/L3 都不得包含口令/账号/芝麻/指令', () => {
    ALL_PUZZLES.forEach((id) => {
      HINTS[id].forEach((hint, idx) => {
        const lower = hint.toLowerCase();
        STRICT_FORBIDDEN.forEach((bad) => {
          expect(
            lower,
            `谜题 ${id} 的 L${idx + 1} 不得包含严格禁词 "${bad}"（原文：${hint}）`,
          ).not.toContain(bad.toLowerCase());
        });
      });
    });
  });

  it('L1/L2 不得包含本谜题的搜索命中关键词原词', () => {
    SEARCH_PUZZLES.forEach((id) => {
      const forbidden = SEARCH_HITS_L1L2_FORBIDDEN[id];
      [HINTS[id][0], HINTS[id][1]].forEach((hint, i) => {
        forbidden.forEach((bad) => {
          expect(
            hint,
            `谜题 ${id} 的 L${i + 1} 不得包含命中词 "${bad}"（L3 才允许引导到）`,
          ).not.toContain(bad);
        });
      });
    });
  });

  it('L3 允许引导到命中词（搜索题白名单）——不对此层做命中词断言', () => {
    // 占位说明：L3 是脱困层，搜索题 L3 可出现命中词以引导玩家。
    // 真正的可命中性由下方"P09 L3 实际命中 ARCHIVE_DB"测试保证。
    expect(HINTS[PUZZLE.SEARCH_P09][2]).toBeTruthy();
  });
});

/**
 * 搜索题 L3 可用性守卫：L3 提示文本本身必须能命中目标数据集。
 * 因 matchSearch 用子串匹配，描述性语言不命中；L3 允许出现答案性命中词（docs §四 ②），
 * 故直接把 HINTS[id][2] 当作 query 跑 matchSearch，断言命中关键条目。
 * 不硬编码任何命中词字符串——命中性完全由数据层 keywords 决定。
 */
describe('搜索题 L3 提示可用性（提示文本本身必须命中目标数据集）', () => {
  it('P02 L3 命中 SEARCH_P02_KEYWORDS', () => {
    const hint = HINTS[PUZZLE.SEARCH_P02][2];
    expect(
      matchSearch(hint, SEARCH_P02_KEYWORDS),
      `P02 L3 提示文本必须命中 SEARCH_P02_KEYWORDS，否则玩家照抄无结果（原文：${hint}）`,
    ).toBe(true);
  });

  it('P04 L3 命中 SEARCH_P04_KEYWORDS', () => {
    const hint = HINTS[PUZZLE.SEARCH_P04][2];
    expect(
      matchSearch(hint, SEARCH_P04_KEYWORDS),
      `P04 L3 提示文本必须命中 SEARCH_P04_KEYWORDS，否则玩家照抄无结果（原文：${hint}）`,
    ).toBe(true);
  });

  it('P09 L3 至少命中一个 ARCHIVE_DB 关键档案（isKey）', () => {
    const hint = HINTS[PUZZLE.SEARCH_P09][2];
    const hits = ARCHIVE_DB.filter((d) => matchSearch(hint, d.matchKeywords));
    expect(
      hits.length,
      `P09 L3 提示文本必须命中至少一个档案，否则玩家照抄无结果（原文：${hint}）`,
    ).toBeGreaterThan(0);
    expect(
      hits.some((d) => d.isKey),
      `P09 L3 应命中标记为 isKey 的关键档案以推动剧情（原文：${hint}）`,
    ).toBe(true);
  });

  it('P09 关键档案 mother_limit 的 matchKeywords 覆盖核心检索词', () => {
    // 数据层守卫：防止 matchKeywords 被误删导致 L3 即使文案正确也无法命中。
    const motherLimit = ARCHIVE_DB.find((d) => d.id === 'mother_limit')!;
    expect(motherLimit.isKey).toBe(true);
    expect(motherLimit.matchKeywords).toContain('离山');
    expect(motherLimit.matchKeywords).toContain('根脉');
    expect(motherLimit.matchKeywords).toContain('容器');
  });
});

/**
 * 搜索框 placeholder 含蓄性守卫：搜索框不得直接列出 ② 类答案性命中词。
 * 见 docs/clue_graph.md §四「placeholder 含蓄约定」。
 * 注意：HTML 硬编码 placeholder 需读文件检查（scenic、lab）；news 走数据层 NEWS.placeholder。
 *
 * 禁词范围（与 docs §四 表格 ② 完全一致）：
 *   - P02：岳圣桩、圣桩（"桩"是木桩剧情上下文词，允许；"传说/敬老/岳桩山"是通用民俗词，允许）；
 *   - P04：失踪、失足、周某；
 *   - P09：离山、根脉、容器、迁移（"主体"是剧情高频词，允许）。
 */
describe('搜索框 placeholder 不得直接泄露答案性命中词', () => {
  // P02 答案性命中词：只禁"岳圣桩/圣桩"，不禁剧情词"桩/传说/敬老/岳桩山"。
  const P02_HITS = ['岳圣桩', '圣桩'];
  const P04_HITS = [...SEARCH_P04_KEYWORDS]; // 失踪/失足/岳圣桩/周某
  const P09_HITS = ['离山', '根脉', '容器', '迁移'];

  /** 判定一个 placeholder 字符串是否泄露任一命中词（子串匹配，大小写不敏感） */
  function leaksHit(placeholder: string, hits: string[]): string | null {
    const low = placeholder.toLowerCase();
    for (const kw of hits) {
      if (low.includes(kw.toLowerCase())) return kw;
    }
    return null;
  }

  it('news placeholder（NEWS.placeholder）不含 P04 命中词', () => {
    const leaked = leaksHit(NEWS.placeholder, P04_HITS);
    expect(leaked, `NEWS.placeholder 泄露命中词 "${leaked}"`).toBeNull();
  });

  it('scenic placeholder（HTML）不含 P02 命中词', () => {
    const html = readFileSync(
      resolve(__dirname, '../src/pages/scenic/index.html'),
      'utf-8',
    );
    const m = html.match(/id="search"[^>]*placeholder=['"]([^'"]+)['"]/);
    expect(m, 'scenic 搜索框 placeholder 应存在').not.toBeNull();
    const leaked = leaksHit(m![1], P02_HITS);
    expect(leaked, `scenic placeholder 泄露命中词 "${leaked}"`).toBeNull();
  });

  it('lab archive placeholder（HTML）不含 P09 命中词', () => {
    const html = readFileSync(
      resolve(__dirname, '../src/pages/lab/index.html'),
      'utf-8',
    );
    const m = html.match(/id="archiveSearch"[^>]*placeholder=['"]([^'"]+)['"]/);
    expect(m, 'lab 档案检索框 placeholder 应存在').not.toBeNull();
    const leaked = leaksHit(m![1], P09_HITS);
    expect(leaked, `lab placeholder 泄露命中词 "${leaked}"`).toBeNull();
  });
});
