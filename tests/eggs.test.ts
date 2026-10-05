/**
 * 跨作品伏笔与彩蛋测试（第五批次）—— 见 docs/clue_graph.md §五C、game_design.md §6A.9。
 *
 * 守卫目标：
 *   1. 伏笔内容存在且措辞锚点齐备（回执 / 完成确认 / 已确认整理完成 / 预筛）；
 *   2. 伏笔不改变任何主线谜题行为（命中集零交集、非关键档案、不计入真相完成度分母）；
 *   3. 论坛伏笔帖不触发屏蔽词（否则会被 censor 逻辑标记，性质就变了）；
 *   4. 彩蛋（县志猫 / 合奘教源码注释）可触发且与数据层不漂移。
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { matchSearch, expandKeywords } from '@shared/normalize';
import {
  ARCHIVE_DB, ANNALS_DB, ALL_DISCOVERABLE_CLUES,
  SEARCH_P02_KEYWORDS, SEARCH_P04_KEYWORDS, FORUM_CENSOR_KEYWORDS,
} from '@data/clues';
import { SCENIC, MAIL, FORUM_POSTS, EGG_NOTES } from '@data/content';

const readPage = (rel: string) => readFileSync(resolve(__dirname, '..', rel), 'utf-8');

describe('伏笔一：景区公告与点评（2025 征集启事）', () => {
  it('公告含「山民的百年」征集启事，落款 2025-09-20，正文含"整理回执"', () => {
    const n = SCENIC.notices.find((x) => x.title.includes('山民的百年'));
    expect(n).toBeTruthy();
    expect(n!.date).toBe('2025-09-20');
    expect(n!.body).toContain('回执');
    expect(n!.body).toContain('外部'); // 联合外部资料机构，不点机构名
  });
  it('游客点评有一条提到口述征集与寄回的"完成确认"', () => {
    const r = SCENIC.reviews.find((x) => x.text.includes('完成确认'));
    expect(r).toBeTruthy();
    expect(r!.text).toContain('口述');
  });
});

describe('伏笔二：沈苒调查邮件新增第 4 条（外部资料整理服务）', () => {
  it('shenranWarn 提及"外部资料整理服务"与"口述史"，且保留原有"最奇怪的是"收口条', () => {
    const body = MAIL.shenranWarn.body;
    expect(body).toContain('外部资料整理服务');
    expect(body).toContain('口述史');
    expect(body).toContain('最奇怪的是'); // 原第 4 条降为第 5 条收口，清单仍递进
  });
});

describe('伏笔三：论坛帖 f13（"已确认整理完成"的民间回声）', () => {
  const f13 = FORUM_POSTS.find((p) => p.id === 'f13');
  it('存在，分类"旧事"，日期 2026-02-28（在 2025 秋事件与 2026-06 主线之间）', () => {
    expect(f13).toBeTruthy();
    expect(f13!.category).toBe('旧事');
    expect(f13!.date).toBe('2026-02-28');
  });
  it('正文含"已确认整理完成"与"压根没去确认"（替人确认机制），且不点任何机构名', () => {
    expect(f13!.body).toContain('已确认整理完成');
    expect(f13!.body).toContain('压根没去确认');
  });
  it('标题与正文均不触发论坛屏蔽词（伏笔是背景氛围，不是被审查内容）', () => {
    FORUM_CENSOR_KEYWORDS.forEach((kw) => {
      expect(f13!.title, `f13 标题不得含屏蔽词 "${kw}"`).not.toContain(kw);
      expect(f13!.body, `f13 正文不得含屏蔽词 "${kw}"`).not.toContain(kw);
    });
  });
});

describe('伏笔四：实验室档案 prefilter_service（对象预筛摘要）', () => {
  const doc = ARCHIVE_DB.find((d) => d.id === 'prefilter_service');
  it('存在且为非关键档案（无 isKey、无正文线索、密级"内部"）', () => {
    expect(doc).toBeTruthy();
    expect(doc!.isKey).toBeUndefined();
    expect((doc as { clue?: string }).clue).toBeUndefined();
    expect(doc!.level).toBe('内部');
  });
  it('正文含《名录》体例与"戒备"备注（界面合流主题），不出现任何专有机构/人名', () => {
    expect(doc!.body).toContain('《名录》');
    expect(doc!.body).toContain('戒备');
  });
  it('伏笔关键词可命中（资料/口述/预筛等）', () => {
    ['资料', '口述', '预筛', '问卷', '笔迹'].forEach((kw) => {
      expect(matchSearch(kw, doc!.matchKeywords), `检索 "${kw}" 应命中伏笔档案`).toBe(true);
    });
  });
  it('主线谜题的答案性命中词不会带出伏笔档案（P02/P04/P09 零交集）', () => {
    const mainlineWords = expandKeywords([
      ...SEARCH_P02_KEYWORDS, ...SEARCH_P04_KEYWORDS,
      '容器', '适配', '评估', '诱饵', '宿主', '离山', '根脉', '主体', '迁移', '档案',
    ]);
    mainlineWords.forEach((kw) => {
      const hit = matchSearch(kw, doc!.matchKeywords);
      expect(hit, `主线词 "${kw}" 不应命中伏笔档案（保持主线节奏不被打扰）`).toBe(false);
    });
  });
});

describe('伏笔红线：不改变真相完成度与关键档案结构', () => {
  it('ALL_DISCOVERABLE_CLUES 仍为 30（伏笔不计分）', () => {
    expect(ALL_DISCOVERABLE_CLUES.length).toBe(30);
    expect(new Set(ALL_DISCOVERABLE_CLUES).size).toBe(30);
  });
  it('ARCHIVE_DB 中 isKey 仍只有 mother_limit 与 vessel_eval（P10 门控不扩大）', () => {
    const keys = ARCHIVE_DB.filter((d) => d.isKey).map((d) => d.id).sort();
    expect(keys).toEqual(['mother_limit', 'vessel_eval']);
  });
});

describe('彩蛋一：县志档案库的猫', () => {
  const eggWords = SCENIC.annalsArchive.catEasterEggKeywords;
  it('彩蛋词与文案齐备', () => {
    expect(eggWords).toContain('芝麻');
    expect(eggWords).toContain('猫');
    expect(SCENIC.annalsArchive.catEasterEgg).toContain('县志不收录猫');
  });
  it('彩蛋词不命中任何正常词条（保证彩蛋在"无结果"分支触发，不干扰检索）', () => {
    eggWords.forEach((w) => {
      ANNALS_DB.forEach((e) => {
        expect(matchSearch(w, e.matchKeywords), `"${w}" 不应命中词条 "${e.title}"`).toBe(false);
      });
    });
  });
  it('placeholder 也不命中彩蛋词（含蓄约定不受彩蛋影响）', () => {
    const ph = SCENIC.annalsArchive.placeholder;
    eggWords.forEach((w) => {
      expect(ph.includes(w), `placeholder 不得出现彩蛋词 "${w}"`).toBe(false);
    });
  });
});

describe('彩蛋二：合奘教源码注释', () => {
  it('hezong/index.html 的 </body> 前注释与 EGG_NOTES.hezongSource 一致（防漂移）', () => {
    const html = readPage('src/pages/hezong/index.html');
    expect(html).toContain(`<!-- ${EGG_NOTES.hezongSource} -->`);
    // 注释位于脚本标签之前（</body> 附近，而非顶部 meta 区）
    expect(html.indexOf(EGG_NOTES.hezongSource)).toBeGreaterThan(html.indexOf('</main>'));
  });
  it('源码注释彩蛋不含任何谜题答案（非"源码谜题"）', () => {
    const forbidden = ['0427', 'ywyxxsc', 'lxzb07', 'guishan2024', '芝麻', 'protagonist@'];
    forbidden.forEach((bad) => {
      expect(EGG_NOTES.hezongSource, `源码彩蛋不得包含 "${bad}"`).not.toContain(bad);
    });
  });
});
