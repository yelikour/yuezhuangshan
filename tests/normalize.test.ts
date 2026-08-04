/**
 * 标准化、搜索、口令比对测试。
 */
import { describe, it, expect } from 'vitest';
import {
  normalizeInput, matchSearch, checkPassword, expandKeywords,
} from '@shared/normalize';
import { ANSWERS, SEARCH_P04_KEYWORDS } from '@data/clues';

describe('normalizeInput', () => {
  it('去首尾空白', () => {
    expect(normalizeInput('  abc  ')).toBe('abc');
  });

  it('转小写', () => {
    expect(normalizeInput('ABC')).toBe('abc');
  });

  it('去除内部空白与分隔符', () => {
    expect(normalizeInput('04 27-ywy_xx.sc')).toBe('0427ywyxxsc');
  });

  it('全角数字字母转半角', () => {
    expect(normalizeInput('０４２７')).toBe('0427');
  });

  it('全角空格转普通空格后再去除', () => {
    expect(normalizeInput('a\u3000b')).toBe('ab');
  });

  it('中文保持不变（无大小写/分隔符）', () => {
    expect(normalizeInput('岳圣桩')).toBe('岳圣桩');
  });

  it('keepSeparators 选项保留分隔符', () => {
    expect(normalizeInput('a-b c', { keepSeparators: true })).toBe('a-b c');
  });

  it('caseSensitive 选项保留大小写', () => {
    expect(normalizeInput('AbC', { caseSensitive: true })).toBe('AbC');
  });
});

describe('matchSearch / expandKeywords', () => {
  it('同义词展开：圣桩 命中 岳圣桩', () => {
    const expanded = expandKeywords(['岳圣桩']);
    expect(expanded).toContain('岳圣桩');
    expect(expanded).toContain('圣桩');
    expect(expanded).toContain('桩');
  });

  it('P04 关键词命中：失踪 / 失足 / 岳圣桩 / 周某', () => {
    expect(matchSearch('失踪', SEARCH_P04_KEYWORDS)).toBe(true);
    expect(matchSearch('失足', SEARCH_P04_KEYWORDS)).toBe(true);
    expect(matchSearch('岳圣桩', SEARCH_P04_KEYWORDS)).toBe(true);
    expect(matchSearch('周某', SEARCH_P04_KEYWORDS)).toBe(true);
  });

  it('同义词也应命中：走失 / 下落不明', () => {
    expect(matchSearch('走失', SEARCH_P04_KEYWORDS)).toBe(true);
    expect(matchSearch('下落不明', SEARCH_P04_KEYWORDS)).toBe(true);
  });

  it('无关词不命中', () => {
    expect(matchSearch('天气', SEARCH_P04_KEYWORDS)).toBe(false);
    expect(matchSearch('', SEARCH_P04_KEYWORDS)).toBe(false);
  });

  it('包含式命中：在一句查询中也能命中关键词', () => {
    expect(matchSearch('我想查岳圣桩附近的失踪报道', SEARCH_P04_KEYWORDS)).toBe(true);
  });

  it('全角关键词命中', () => {
    expect(matchSearch('失蹤', SEARCH_P04_KEYWORDS)).toBe(false); // 繁体不在同义词
    expect(matchSearch('　岳圣桩　', SEARCH_P04_KEYWORDS)).toBe(true); // 全角空格
  });
});

describe('checkPassword (P05 口令标准化)', () => {
  // 标准答案 = 0427 + ywyxxsc
  const answer = ANSWERS.LOGIN_PASSWORD;

  it('标准写法通过', () => {
    expect(checkPassword('0427ywyxxsc', answer)).toBe(true);
  });

  it('大小写混合通过', () => {
    expect(checkPassword('0427YWYXXSC', answer)).toBe(true);
    expect(checkPassword('0427YwyxxSC', answer)).toBe(true);
  });

  it('带空格/分隔符通过', () => {
    expect(checkPassword('0427 ywyxxsc', answer)).toBe(true);
    expect(checkPassword('0427-ywyxxsc', answer)).toBe(true);
    expect(checkPassword('0427_ywyxx.sc', answer)).toBe(true);
  });

  it('全角数字通过', () => {
    expect(checkPassword('０４２７ywyxxsc', answer)).toBe(true);
  });

  it('首尾空白通过', () => {
    expect(checkPassword('  0427ywyxxsc  ', answer)).toBe(true);
  });

  it('错误口令不通过', () => {
    expect(checkPassword('1234abcd', answer)).toBe(false);
    expect(checkPassword('0427ywyxx', answer)).toBe(false); // 少了几位
    expect(checkPassword('', answer)).toBe(false);
  });

  it('P05 账号标准化', () => {
    expect(checkPassword('PROTAGONIST@yuezhuangshan-conf.cn', ANSWERS.LOGIN_ACCOUNT)).toBe(true);
    expect(checkPassword('  protagonist@yuezhuangshan-conf.cn  ', ANSWERS.LOGIN_ACCOUNT)).toBe(true);
    expect(checkPassword('someone@else.com', ANSWERS.LOGIN_ACCOUNT)).toBe(false);
  });
});
