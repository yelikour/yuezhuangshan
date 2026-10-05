import { afterEach, describe, expect, it, vi } from 'vitest';
import { prefersReducedMotion, scrollToContent } from '@shared/motion';
import { updateState } from '@shared/storage';

afterEach(() => vi.unstubAllGlobals());

describe('游戏与系统减少动态偏好', () => {
  it.each([[false, false, false], [true, false, true], [false, true, true], [true, true, true]])(
    '游戏 %s / 系统 %s → 减少动态 %s', (game, system, expected) => {
      updateState((state) => { state.reduceMotion = game; });
      vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: system })));
      expect(prefersReducedMotion()).toBe(expected);
    },
  );

  it('减少动态时不自动滚动', () => {
    updateState((state) => { state.reduceMotion = true; });
    const element = document.createElement('div');
    element.scrollIntoView = vi.fn();
    scrollToContent(element);
    expect(element.scrollIntoView).not.toHaveBeenCalled();
  });
});
