/**
 * 第二阶段测试：P08-P12 节点解锁链 + 口令标准化 + 真假消息判定。
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  tryUnlock, unlock, discoverClue, markSolved, PUZZLE,
} from '@shared/progress';
import { checkPassword } from '@shared/normalize';
import { ANSWERS, ARCHIVE_DB, HALF_MESSAGES, CLUE } from '@data/clues';

beforeEach(() => {
  localStorage.clear();
});

describe('第二阶段节点解锁链', () => {
  it('P08 依赖 P07', () => {
    expect(tryUnlock('P08')).toBe(false);
    unlock('P07');
    expect(tryUnlock('P08')).toBe(true);
  });

  it('P09 依赖 P08 + LOGIN_P08 谜题', () => {
    unlock('P07'); unlock('P08');
    expect(tryUnlock('P09')).toBe(false);
    markSolved(PUZZLE.LOGIN_P08);
    expect(tryUnlock('P09')).toBe(true);
  });

  it('P10 依赖 P09', () => {
    unlock('P07'); unlock('P08'); markSolved(PUZZLE.LOGIN_P08); unlock('P09');
    expect(tryUnlock('P10')).toBe(true);
  });

  it('P11 依赖 CLUE_SHELL_LEFTHAND', () => {
    expect(tryUnlock('P11')).toBe(false);
    discoverClue(CLUE.SHELL_LEFTHAND);
    expect(tryUnlock('P11')).toBe(true);
  });

  it('P12 依赖 IDENTIFY_P11 谜题', () => {
    expect(tryUnlock('P12')).toBe(false);
    markSolved(PUZZLE.IDENTIFY_P11);
    expect(tryUnlock('P12')).toBe(true);
  });
});

describe('P08 门禁口令标准化', () => {
  const answer = ANSWERS.LAB_ACCESS_CODE; // lxzb07
  it('标准写法通过', () => {
    expect(checkPassword('lxzb07', answer)).toBe(true);
  });
  it('大小写混合通过', () => {
    expect(checkPassword('LXZB07', answer)).toBe(true);
    expect(checkPassword('LxzB07', answer)).toBe(true);
  });
  it('带空格/分隔符通过', () => {
    expect(checkPassword('lxz-b07', answer)).toBe(true);
    expect(checkPassword('lxz b07', answer)).toBe(true);
  });
  it('错误不通过', () => {
    expect(checkPassword('lxzb08', answer)).toBe(false);
    expect(checkPassword('zmx a12', answer)).toBe(false);
  });
});

describe('P09 档案检索命中', () => {
  it('关键档案 mother_limit 命中"离山/根脉/容器"', () => {
    const doc = ARCHIVE_DB.find((d) => d.id === 'mother_limit')!;
    expect(doc.matchKeywords).toContain('离山');
    expect(doc.matchKeywords).toContain('根脉');
    expect(doc.isKey).toBe(true);
  });
  it('关键档案 vessel_eval 命中"容器/诱饵"', () => {
    const doc = ARCHIVE_DB.find((d) => d.id === 'vessel_eval')!;
    expect(doc.matchKeywords).toContain('容器');
    expect(doc.matchKeywords).toContain('诱饵');
    expect(doc.body).toContain('S'); // 主角评级 S
    expect(doc.body).toContain('诱饵'); // 沈苒用途
  });
});

describe('P11 真假消息：真沈苒基于"芝麻"私密记忆', () => {
  it('只有 m2（芝麻猫）是真正的沈苒', () => {
    // m2 必须真，且提到芝麻
    const m2 = HALF_MESSAGES.find((m) => m.id === 'm2')!;
    expect(m2.isReal).toBe(true);
    expect(m2.text).toContain('芝麻');
    // 只有 m2 可以作为本题的正确答案，避免任意真消息都能通关
    expect(HALF_MESSAGES.filter((m) => m.isReal).map((m) => m.id)).toEqual(['m2']);
  });
  it('母体模仿的消息不含"芝麻"等私密细节', () => {
    const fake = HALF_MESSAGES.filter((m) => !m.isReal);
    fake.forEach((m) => {
      expect(m.text).not.toContain('芝麻');
    });
  });
  it('真假消息至少 4 条（增加分辨难度）', () => {
    expect(HALF_MESSAGES.length).toBeGreaterThanOrEqual(4);
  });
});
