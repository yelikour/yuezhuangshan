/**
 * 进度/解锁依赖测试：验证节点门控逻辑正确，避免无提示谜题或越权解锁。
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  isUnlocked, tryUnlock, unlock, discoverClue, markSolved, isSolved, recordAttempt, PUZZLE,
} from '@shared/progress';
import { CLUE } from '@data/clues';
import { resetState, loadState, updateState, _resetCacheForTests } from '@shared/storage';

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

  it('isSolved 反映谜题完成状态', () => {
    expect(isSolved(PUZZLE.SEARCH_P09)).toBe(false);
    markSolved(PUZZLE.SEARCH_P09);
    expect(isSolved(PUZZLE.SEARCH_P09)).toBe(true);
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

  it('P08 依赖 P07；第一阶段结尾必须显式 unlock P08 才能开放第二阶段入口', () => {
    // 回归守卫：ending/main.ts 在显示 endPage 时调用 unlock('P08')，
    // 否则首页收藏栏不显示"实验室内网"、"继续游戏"永远回到 P07。
    expect(tryUnlock('P08')).toBe(false);
    unlock('P07');
    // P07 解锁后 P08 依赖满足（tryUnlock 返回 true 并写入 unlockedNodes）
    expect(tryUnlock('P08')).toBe(true);
    // 但 ending 页是显式调用 unlock('P08')，确保无论何种路径都写入
    unlock('P08');
    expect(isUnlocked('P08')).toBe(true);
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

describe('邮件已读状态持久化', () => {
  it('默认 readMails 为空数组', () => {
    const s = loadState();
    expect(s.readMails).toEqual([]);
  });

  it('updateState 写入 readMails 后，重载缓存仍可读到', () => {
    updateState((st) => { st.readMails.push('invite'); st.readMails.push('checkin'); });
    _resetCacheForTests(); // 模拟"刷新页面"——清内存缓存，强制重读 localStorage
    expect(loadState().readMails).toEqual(['invite', 'checkin']);
  });

  it('mergeState 兼容无 readMails 字段的旧存档（补默认空数组）', () => {
    // 模拟旧版本存档（不含 readMails 字段）
    localStorage.setItem('yueZhuangShan_save_v1', JSON.stringify({
      unlockedNodes: ['P00'], discoveredClues: [], solvedPuzzles: [],
      attempts: {}, hintLevel: {}, visitedPages: [],
    }));
    _resetCacheForTests();
    const s = loadState();
    expect(s.readMails).toEqual([]);
    expect(s.unlockedNodes).toEqual(['P00']); // 其它字段不受影响
  });
});
