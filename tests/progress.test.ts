/**
 * 进度/解锁依赖测试：验证节点门控逻辑正确，避免无提示谜题或越权解锁。
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  isUnlocked, tryUnlock, unlock, discoverClue, markSolved, recordAttempt, PUZZLE,
} from '@shared/progress';
import { CLUE } from '@data/clues';
import { resetState, _resetCacheForTests } from '@shared/storage';

beforeEach(() => {
  localStorage.clear();
  _resetCacheForTests();
});

describe('节点解锁依赖', () => {
  it('P00 默认开放', () => {
    expect(isUnlocked('P00')).toBe(true);
  });

  it('P01 依赖 P00；P00 默认开放故 P01 默认可访问，但需显式 unlock 才写入', () => {
    // P01 的依赖是 NODE:P00，P00 默认在 unlockedNodes 中
    expect(isUnlocked('P01')).toBe(true);
    unlock('P01'); // 游戏入口页会显式调用
    expect(isUnlocked('P01')).toBe(true);
  });

  it('P02/P03 依赖 P01；需先 unlock P01 写入列表', () => {
    // P01 尚未写入 unlockedNodes → P02/P03 依赖 NODE:P01 不满足
    expect(tryUnlock('P02')).toBe(false);
    unlock('P01'); // 邮箱页阅读邀请函后显式解锁
    expect(tryUnlock('P02')).toBe(true);
    expect(tryUnlock('P03')).toBe(true);
  });

  it('P04 依赖 CLUE_OFFLINE_TIME（读过沈苒失联）', () => {
    expect(tryUnlock('P04')).toBe(false);
    discoverClue(CLUE.OFFLINE_TIME);
    expect(tryUnlock('P04')).toBe(true);
  });

  it('P05 依赖 SEARCH_P04 谜题完成', () => {
    expect(tryUnlock('P05')).toBe(false);
    markSolved(PUZZLE.SEARCH_P04);
    expect(tryUnlock('P05')).toBe(true);
  });

  it('P06 依赖 P05 节点 + LOGIN_P05 谜题', () => {
    expect(tryUnlock('P06')).toBe(false);
    unlock('P05');
    expect(tryUnlock('P06')).toBe(false); // 还差谜题
    markSolved(PUZZLE.LOGIN_P05);
    expect(tryUnlock('P06')).toBe(true);
  });

  it('P07 依赖 CLUE_KEYCARD_MAINTENANCE', () => {
    expect(tryUnlock('P07')).toBe(false);
    discoverClue(CLUE.KEYCARD_MAINTENANCE);
    expect(tryUnlock('P07')).toBe(true);
  });

  it('支线 SIDE_ANNALS 依赖 P02', () => {
    expect(tryUnlock('SIDE_ANNALS')).toBe(false);
    unlock('P02');
    expect(tryUnlock('SIDE_ANNALS')).toBe(true);
  });

  it('resetState 清空所有进度', () => {
    unlock('P01');
    unlock('P02');
    discoverClue(CLUE.OFFLINE_TIME);
    resetState();
    expect(isUnlocked('P02')).toBe(false);
    expect(isUnlocked('P00')).toBe(true); // 默认节点仍在
  });
});

describe('错误尝试计数', () => {
  it('recordAttempt 累加', () => {
    expect(recordAttempt('login_p05')).toBe(1);
    expect(recordAttempt('login_p05')).toBe(2);
    expect(recordAttempt('login_p05')).toBe(3);
  });
});
