import { describe, expect, it } from 'vitest';
import { matchTextSearch } from '@shared/normalize';

describe('全文检索统一标准化', () => {
  it.each(['林 叙 之', '林-叙_之', 'ＳＤ', 'sd'])('容忍输入格式 %s', (query) => {
    expect(matchTextSearch(query, ['林叙之归还的 SD 卡是空的'])).toBe(true);
  });
  it('有限同义词双向命中，普通短词仍可检索', () => {
    expect(matchTextSearch('走失', ['外乡人失踪'])).toBe(true);
    expect(matchTextSearch('失踪', ['外乡人走失'])).toBe(true);
    expect(matchTextSearch('管道', ['今年的山泉水管道是不是在修？'])).toBe(true);
  });
  it('空输入和无关输入不会命中', () => {
    expect(matchTextSearch(' - _ ', ['山泉'])).toBe(false);
    expect(matchTextSearch('天气', ['山泉'])).toBe(false);
  });
});
