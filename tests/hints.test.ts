/**
 * 提示系统测试：自动升级阈值 + 手动请求。
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { requestHint, getHintLevel, visibleHints, autoLevelFromAttempts } from '@shared/hints';
import { recordAttempt, PUZZLE } from '@shared/progress';
import { HINTS } from '@data/clues';
import { _resetCacheForTests } from '@shared/storage';

beforeEach(() => {
  localStorage.clear();
  _resetCacheForTests();
});

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
