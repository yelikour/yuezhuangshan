/**
 * 测试环境辅助：每个测试前重置 localStorage 与内存缓存。
 */
import { beforeEach, vi } from 'vitest';
import { _resetCacheForTests } from '@shared/storage';

beforeEach(() => {
  localStorage.clear();
  _resetCacheForTests();
  // 防止页面模块意外触发 location 跳转
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  vi.spyOn(window, 'confirm').mockImplementation(() => true);
});
