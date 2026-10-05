import { loadState } from './storage';

/** 游戏和系统偏好同时生效，不能由游戏关闭系统的无障碍偏好。 */
export function prefersReducedMotion(): boolean {
  return loadState().reduceMotion ||
    (typeof window !== 'undefined' && typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

/** 减少动态时完全跳过自动滚动。 */
export function scrollToContent(element: HTMLElement, block: ScrollLogicalPosition = 'start'): void {
  if (!prefersReducedMotion()) element.scrollIntoView({ behavior: 'smooth', block });
}
