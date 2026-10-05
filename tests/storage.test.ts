import { describe, expect, it, vi } from 'vitest';
import { mergeState } from '@shared/state';
import { exportSave, hasSave, importSave, loadState, updateState, _resetCacheForTests } from '@shared/storage';

const SAVE_KEY = 'yueZhuangShan_save_v1';

describe('损坏存档与旧存档恢复', () => {
  it.each([null, [], 'invalid', 42])('非对象 %j 返回安全默认态', (value) => {
    expect(mergeState(value).unlockedNodes).toEqual(['P00']);
    expect(mergeState(value).muted).toBe(true);
  });

  it('修复错误字段，保留有效进度并去重', () => {
    const state = mergeState({
      discoveredClues: ['CLUE_INVITE', null, 2, '', 'CLUE_INVITE'],
      unlockedNodes: ['P02', 'P02'], readMails: 'invite', visitedPages: null,
      endingsSeen: ['burn', 'burn', 'unknown'],
      attempts: { good: 2, negative: -1, text: '2', fraction: 1.5 },
      hintLevel: { good: 3, tooHigh: 4, text: '3' },
      muted: 'false', reduceMotion: null, subtitles: 0, volume: 50,
    });
    expect(state.discoveredClues).toEqual(['CLUE_INVITE']);
    expect(state.unlockedNodes).toEqual(['P00', 'P02']);
    expect(state.readMails).toEqual([]);
    expect(state.attempts).toEqual({ good: 2 });
    expect(state.hintLevel).toEqual({ good: 3 });
    expect(state.endingsSeen).toEqual(['burn']);
    expect(state.muted).toBe(true);
    expect(state.subtitles).toBe(true);
    expect(state.volume).toBe(1);
  });

  it('错误 JSON 与 null 存档不会使游戏崩溃', () => {
    for (const raw of ['{oops', 'null']) {
      localStorage.setItem(SAVE_KEY, raw);
      _resetCacheForTests();
      expect(loadState().unlockedNodes).toEqual(['P00']);
    }
  });

  it.each(['null', '[]', '"hello"', '{"version":2}', '{"version":"1"}'])('拒绝 %s 导入且保留原存档', (raw) => {
    updateState((state) => state.discoveredClues.push('CLUE_INVITE'));
    const before = exportSave();
    expect(() => importSave(raw)).toThrow();
    expect(exportSave()).toBe(before);
  });

  it('隐私模式读写失败仍可使用内存进度', () => {
    const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied'); });
    try {
      expect(hasSave()).toBe(false);
      expect(() => updateState((state) => state.unlockedNodes.push('P01'))).not.toThrow();
      expect(loadState().unlockedNodes).toContain('P01');
      expect(hasSave()).toBe(true);
    } finally {
      read.mockRestore(); write.mockRestore();
    }
  });

  it('其他标签更新存档后，下一次修改保留新线索', () => {
    loadState();
    localStorage.setItem(SAVE_KEY, JSON.stringify({ discoveredClues: ['CLUE_INVITE'] }));
    window.dispatchEvent(new StorageEvent('storage', { key: SAVE_KEY }));
    updateState((state) => state.readMails.push('invite'));
    expect(loadState().discoveredClues).toEqual(['CLUE_INVITE']);
  });
});
