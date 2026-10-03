/**
 * 第三批次（支线与背景扩充）测试：
 *   支线 B+ 合奘教内部区（LOGIN_HEZONG 口令 + 三件文献）
 *   支线 A+ 县志档案库（ANNALS_DB 检索 + placeholder 零命中守卫）
 *   支线 D 论坛回收站 + 屏蔽词（FORUM_DELETED / FORUM_CENSOR_KEYWORDS）
 *   真相完成度（truth.ts 分档与计数）
 * 见 docs/game_design.md §6A。
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { checkPassword, matchSearch } from '@shared/normalize';
import {
  ANSWERS, ANNALS_DB, FORUM_DELETED, FORUM_CENSOR_KEYWORDS,
  ALL_DISCOVERABLE_CLUES, CLUE_TITLES, CLUE_GROUPS, CLUE_GROUP_ORDER, CLUE,
} from '@data/clues';
import { SCENIC, HEZONG, MAIL, FORUM_POSTS, ENDING2, CHAT, JOURNAL_UI, GAME_CLOCK } from '@data/content';
import { truthProgress, truthTierText, journalGroups } from '@shared/truth';
import { _resetCacheForTests } from '@shared/storage';

beforeEach(() => {
  localStorage.clear();
  _resetCacheForTests();
});

describe('支线 B+：合奘教执礼人终端口令', () => {
  const answer = ANSWERS.GUILU_GATE; // guishan2024
  it('标准写法通过', () => {
    expect(checkPassword('guishan2024', answer)).toBe(true);
  });
  it('大小写混合通过', () => {
    expect(checkPassword('GuiShan2024', answer)).toBe(true);
    expect(checkPassword('GUISHAN2024', answer)).toBe(true);
  });
  it('带空格/分隔符通过', () => {
    expect(checkPassword('guishan 2024', answer)).toBe(true);
    expect(checkPassword('gui-shan-2024', answer)).toBe(true);
  });
  it('错误口令不通过（含常见误推）', () => {
    expect(checkPassword('guishan2027', answer)).toBe(false); // 教义页写的是"下一届"
    expect(checkPassword('guishan', answer)).toBe(false);
    expect(checkPassword('2024', answer)).toBe(false);
    expect(checkPassword('guishan2023', answer)).toBe(false);
  });
  it('双线索成立：教义页含"下一届 2027"与"三年一度"，可推出上一届 2024', () => {
    const ritual = HEZONG.sections.find((s) => s.id === 'ritual')!.body;
    expect(ritual).toContain('2027'); // 线索①：下一届年份
    expect(ritual).toContain('三年'); // 线索②：周期
    expect(HEZONG.slogan).toContain('归山'); // 礼名反复出现于教义页
  });
  it('内部文献三件齐备且不空', () => {
    const i = HEZONG.inner;
    expect(i.rosterBody.length).toBeGreaterThan(50);
    expect(i.journalBody.length).toBeGreaterThan(50);
    expect(i.letterBody.length).toBeGreaterThan(30);
  });
  it('名录末页含现代编号（P-09/S-04），与实验室档案编号体系一致', () => {
    const roster = HEZONG.inner.rosterBody;
    expect(roster).toContain('P-09');
    expect(roster).toContain('S-04');
    expect(roster).toContain('已归');
  });
  it('林叙之复函闭合 2019 周案（"归""补录"）并暗示出山动机', () => {
    const letter = HEZONG.inner.letterBody;
    expect(letter).toContain('补录');
    expect(letter).toContain('想念山外');
    expect(letter).toContain('林');
  });
});

describe('支线 A+：县志数字档案库', () => {
  it('三个关键词条各挂唯一线索 id', () => {
    const keyed = ANNALS_DB.filter((e) => e.isKey);
    expect(keyed.map((e) => e.id).sort()).toEqual(['guangxu', 'jiajing', 'village']);
    const clues = keyed.map((e) => e.clue);
    expect(new Set(clues).size).toBe(3);
    expect(clues).toContain(CLUE.FAMINE_PUNISHMENT);
    expect(clues).toContain(CLUE.OLD_MEDICAL_RECORD);
    expect(clues).toContain(CLUE.VILLAGE_DECLINE);
  });
  it('检索"大旱/送老"命中嘉靖灾异条', () => {
    const hits = ANNALS_DB.filter((e) => matchSearch('大旱', e.matchKeywords));
    expect(hits.some((e) => e.id === 'jiajing')).toBe(true);
    expect(matchSearch('送老', ANNALS_DB.find((e) => e.id === 'jiajing')!.matchKeywords)).toBe(true);
  });
  it('检索"嗜眠/梦"命中光绪医案条，且正文含"迁居平原自愈"（与 EXP-2024-0173 古今互证）', () => {
    const entry = ANNALS_DB.find((e) => e.id === 'guangxu')!;
    expect(matchSearch('嗜眠', entry.matchKeywords)).toBe(true);
    expect(matchSearch('梦', entry.matchKeywords)).toBe(true);
    expect(entry.body).toContain('迁居平原');
  });
  it('检索"撤并/搬迁"命中村庄变迁条（动机链）', () => {
    const entry = ANNALS_DB.find((e) => e.id === 'village')!;
    expect(matchSearch('撤并', entry.matchKeywords)).toBe(true);
    expect(matchSearch('搬迁', entry.matchKeywords)).toBe(true);
    expect(entry.body).toContain('1998');
  });
  it('placeholder 对全部词条 matchKeywords 零命中（不含蓄约定）', () => {
    const ph = SCENIC.annalsArchive.placeholder;
    ANNALS_DB.forEach((e) => {
      expect(
        matchSearch(ph, e.matchKeywords),
        `placeholder 不应直接命中词条 ${e.id} 的关键词`,
      ).toBe(false);
    });
  });
});

describe('支线 D：论坛回收站与屏蔽词', () => {
  it('回收站含周衍两条被删寻人帖，且留有联系方式线索', () => {
    const zhou = FORUM_DELETED.filter((d) => d.user.includes('周衍'));
    expect(zhou.length).toBe(2);
    expect(zhou[0].fragment).toContain('zhouyan2019@yunyan.mail');
  });
  it('回收站条目均带删除通知（审查存在的物证）', () => {
    FORUM_DELETED.forEach((d) => {
      expect(d.removedNote).toContain('已被管理员删除');
    });
  });
  it('屏蔽词命中"失踪/周行野"等失踪话题词', () => {
    expect(matchSearch('失踪', FORUM_CENSOR_KEYWORDS)).toBe(true);
    expect(matchSearch('周行野', FORUM_CENSOR_KEYWORDS)).toBe(true);
    expect(matchSearch('天气', FORUM_CENSOR_KEYWORDS)).toBe(false); // 无关词不触发
  });
  it('周衍回信存在于数据层，且推翻"家属未提异议"', () => {
    const body = MAIL.zhouYanLetter.body;
    expect(body).toContain('未提异议');
    expect(body).toContain('没有任何部门找过');
    expect(body).toContain('对称'); // 与沈苒 P03 菌斑照片跨七年互证
  });
  it('论坛主列表含 2026 研讨会氛围帖（f11/f12）', () => {
    expect(FORUM_POSTS.some((p) => p.id === 'f11')).toBe(true);
    expect(FORUM_POSTS.some((p) => p.id === 'f12')).toBe(true);
  });
});

describe('真相完成度（TruthProgress）', () => {
  it('总数 = 主线 18 + 县志 3 + 合奘内部 3 + 周衍 3 + 陆远 2 + 既有支线 1 = 30', () => {
    expect(ALL_DISCOVERABLE_CLUES).toHaveLength(30);
    expect(new Set(ALL_DISCOVERABLE_CLUES).size).toBe(30); // 无重复
  });
  it('每条可发现线索都有可读标题与分组', () => {
    ALL_DISCOVERABLE_CLUES.forEach((c) => {
      expect(CLUE_TITLES[c], `线索 ${c} 缺少标题`).toBeTruthy();
      expect(CLUE_GROUPS[c], `线索 ${c} 缺少分组`).toBeTruthy();
    });
  });
  it('零线索 → 0%，tier 0', () => {
    const t = truthProgress({ discoveredClues: [] });
    expect(t.found).toBe(0);
    expect(t.percent).toBe(0);
    expect(t.tier).toBe(0);
    expect(t.missing).toBe(30);
  });
  it('半数线索 → tier 1（50%-79% 档）', () => {
    const half = ALL_DISCOVERABLE_CLUES.slice(0, 15);
    const t = truthProgress({ discoveredClues: half });
    expect(t.percent).toBe(50);
    expect(t.tier).toBe(1);
  });
  it('80% 及以上 → tier 2', () => {
    const most = ALL_DISCOVERABLE_CLUES.slice(0, 24); // 24/30 = 80%
    const t = truthProgress({ discoveredClues: most });
    expect(t.tier).toBe(2);
  });
  it('不在分母内的线索不计入（防止内部记号灌水）', () => {
    const t = truthProgress({ discoveredClues: ['CLUE_INTERNAL_TECH', 'NOT_A_CLUE'] });
    expect(t.found).toBe(0);
  });
  it('证据清单按发现顺序给出标题', () => {
    const t = truthProgress({ discoveredClues: [CLUE.TAMPERED_REPORT, CLUE.ZHOU_FAMILY] });
    expect(t.titles).toEqual([CLUE_TITLES[CLUE.TAMPERED_REPORT], CLUE_TITLES[CLUE.ZHOU_FAMILY]]);
  });
  it('三档文案齐备且 truthTierText 按档取文', () => {
    expect(ENDING2.truth.tiers).toHaveLength(3);
    expect(truthTierText(2, ENDING2.truth.tiers)).toBe(ENDING2.truth.tiers[0].text);
    expect(truthTierText(1, ENDING2.truth.tiers)).toBe(ENDING2.truth.tiers[1].text);
    expect(truthTierText(0, ENDING2.truth.tiers)).toBe(ENDING2.truth.tiers[2].text);
  });
});

describe('支线 E：陆远线（邮箱垃圾箱）', () => {
  it('两封被隔离邮件存在于数据层，正文含隔离提示', () => {
    expect(MAIL.luYanSpam1.body).toContain('已被投递至垃圾箱');
    expect(MAIL.luYanSpam2.body).toContain('已被投递至垃圾箱');
    // 时间与 timeline 一致：22:47 / 23:58
    expect(MAIL.luYanSpam1.date).toBe('2026-06-20 22:47');
    expect(MAIL.luYanSpam2.date).toBe('2026-06-20 23:58');
  });
  it('第二封含目击细节与"闭幕式"预感（CLUE_LUYUAN_SILENCED 依据）', () => {
    const body = MAIL.luYanSpam2.body;
    expect(body).toContain('搀扶');
    expect(body).toContain('闭幕式');
  });
  it('第一封含茶水异常证词（与沈苒 19:42 水味消息互证）', () => {
    expect(MAIL.luYanSpam1.body).toContain('茶');
    expect(MAIL.luYanSpam1.body).toContain('麻');
  });
  it('与《归山名录》P-03 陆远（备）交叉印证', () => {
    expect(HEZONG.inner.rosterBody).toContain('P-03');
    expect(HEZONG.inner.rosterBody).toContain('陆远');
  });
});

describe('调查手记与结局图鉴', () => {
  it('journalGroups：分组计数守恒（found + missing = 总数）', () => {
    const state = { discoveredClues: [CLUE.INVITE, CLUE.ZHOU_FAMILY, CLUE.LUYUAN_SILENCED] };
    const groups = journalGroups(state);
    const totalItems = groups.reduce((acc, g) => acc + g.found.length + g.missing, 0);
    expect(totalItems).toBe(ALL_DISCOVERABLE_CLUES.length);
    expect(groups.reduce((a, g) => a + g.found.length, 0)).toBe(3);
  });
  it('journalGroups：未发现线索不泄露标题', () => {
    const groups = journalGroups({ discoveredClues: [] });
    groups.forEach((g) => {
      expect(g.found).toHaveLength(0);
      expect(g.missing).toBeGreaterThan(0);
    });
  });
  it('结局图鉴：endingNames 覆盖全部三结局 id', () => {
    ENDING2.choices.forEach((c) => {
      expect(ENDING2.endingNames[c.id], `结局 ${c.id} 缺少图鉴名`).toBeTruthy();
    });
    expect(Object.keys(ENDING2.endingNames).sort()).toEqual(['burn', 'submit', 'vessel']);
  });
  it('手记 UI 文案齐备', () => {
    expect(JOURNAL_UI.title).toBeTruthy();
    expect(JOURNAL_UI.endingUnknown).toContain('？');
    expect(JOURNAL_UI.pendingLabel(3)).toContain('3');
  });
  it('CLUE_GROUP_ORDER 覆盖全部分组名（手记排序不遗漏）', () => {
    const usedGroups = new Set(ALL_DISCOVERABLE_CLUES.map((c) => CLUE_GROUPS[c]));
    usedGroups.forEach((g) => {
      expect((CLUE_GROUP_ORDER as readonly string[]).includes(g!), `分组 ${g} 不在显示顺序表`).toBe(true);
    });
  });
  it('journalGroups 输出顺序严格等于 CLUE_GROUP_ORDER（docs §6A.4）', () => {
    const groups = journalGroups({ discoveredClues: [] });
    const order = groups.map((g) => g.group);
    const expected = (CLUE_GROUP_ORDER as readonly string[]).filter((g) => order.includes(g));
    expect(order).toEqual(expected);
  });
});

describe('第五批次：文案集中与拟真细节', () => {
  it('县志残页正文集中在 content.ts（铁律#1），不再硬编码于页面脚本', () => {
    expect(SCENIC.annalsFragment).toContain('岳圣桩下有根');
    expect(SCENIC.annalsFragment).toContain('不可移动');
  });
  it('首页农历与真实万年历一致：2026-06-21 = 丙午年五月初七', () => {
    expect(GAME_CLOCK.dateDay).toContain('6月21日');
    expect(GAME_CLOCK.dateLunar).toContain('五月初七');
    expect(GAME_CLOCK.dateLunar).not.toContain('六月');
  });
  it('ending2"回到选择"文案齐备（结局图鉴配套）', () => {
    expect(ENDING2.rechooseLabel).toBeTruthy();
    expect(ENDING2.rechooseHint).toBeTruthy();
  });
});

describe('论坛叙事化指引（支线入口）', () => {
  it('沈苒行前聊天提到乡邻论坛（为支线 D 提供有机入口）', () => {
    const hit = CHAT.historyMessages.find((m) => m.text.includes('乡邻论坛'));
    expect(hit).toBeTruthy();
    expect(hit!.time).toBe('2026-06-19 23:40');
  });
});
