import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LAB } from '@data/content';

vi.mock('@shared/sfx', () => ({
  refreshSfxSettings: vi.fn(), playSfxWithSubtitle: vi.fn(),
  playSfx: vi.fn(), stopSfx: vi.fn(), showFloatingSubtitle: vi.fn(),
}));

beforeEach(() => {
  vi.resetModules();
  document.documentElement.className = '';
  document.body.className = '';
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn() })));
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

function mount(path: string): void {
  const html = readFileSync(resolve(__dirname, '..', path), 'utf8');
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  document.body.innerHTML = parsed.body.innerHTML;
  document.body.className = parsed.body.className;
}
const el = (id: string) => document.getElementById(id)!;
const fill = (id: string, value: string) => { (el(id) as HTMLInputElement).value = value; };

describe('首页与邮件页面回归', () => {
  it('重开后收藏、手记和邮箱角标全部恢复，重复重开也不报错', async () => {
    const storage = await import('@shared/storage');
    storage.updateState((state) => {
      state.unlockedNodes.push('P01', 'P02', 'P03', 'P12');
      state.discoveredClues.push('CLUE_INVITE');
      state.readMails.push('invite');
      state.endingsSeen.push('burn');
    });
    mount('index.html');
    await import('../src/pages/index/main');
    expect(el('bookmarkItems').textContent).toContain('最终抉择');
    expect(el('journalBookmark')).not.toBeNull();
    el('restartBtn').click();
    expect(el('bookmarkItems').textContent).toContain('开始调查');
    expect(document.getElementById('journalBookmark')).toBeNull();
    expect(el('unreadCount').textContent).toBe('7');
    expect(el('mailWidget').classList.contains('has-unread')).toBe(true);
    expect(storage.loadState().unlockedNodes).toEqual(['P00']);
    expect(() => el('restartBtn').click()).not.toThrow();
    expect(el('saveStatus').textContent).toBe('已清除存档。');
  });

  it('首页演示入口和普通搜索留在本地，输入不写入存档', async () => {
    mount('index.html');
    await import('../src/pages/index/main');
    const storage = await import('@shared/storage');
    const before = storage.exportSave();
    fill('searchInput', '天气'); el('searchBtn').click();
    expect(el('homeFeedback').textContent).toContain('未收录');
    document.querySelector<HTMLElement>('.nav-item[data-game="0"]')!.click();
    expect(el('homeFeedback').textContent).toContain('导航演示项目');
    expect(document.querySelectorAll('a[href^="https://"]').length).toBe(0);
    expect(storage.exportSave()).toBe(before);
  });

  it('读邀请函后立即显示新到达邮件，不用刷新', async () => {
    const storage = await import('@shared/storage');
    storage.updateState((state) => state.unlockedNodes.push('P01'));
    mount('src/pages/mail/index.html');
    await import('../src/pages/mail/main');
    expect(document.querySelector('[data-id="peerAuthor"]')).toBeNull();
    document.querySelector<HTMLElement>('[data-id="invite"]')!.click();
    expect(document.querySelector('[data-id="peerAuthor"]')).not.toBeNull();
    expect(storage.loadState().readMails).toContain('invite');
    expect(el('readHint').textContent).toContain('7');
  });
});

describe('论坛与实验室流程回归', () => {
  it('论坛重复标准化搜索只有一条审查提示，普通搜索清除且从详情回到列表', async () => {
    const storage = await import('@shared/storage');
    storage.updateState((state) => state.unlockedNodes.push('P02'));
    mount('src/pages/forum/index.html');
    await import('../src/pages/forum/main');
    document.querySelector<HTMLElement>('.forum-item')!.click();
    expect(el('forumList').hidden).toBe(true);
    fill('forumSearch', ' 失-踪 ');
    for (let count = 0; count < 3; count++) el('forumSearchBtn').click();
    expect(el('forumList').hidden).toBe(false);
    expect(document.querySelectorAll('#censorNotice')).toHaveLength(1);
    expect(storage.loadState().discoveredClues).toContain('CLUE_SEARCH_CENSORSHIP');
    fill('forumSearch', '管 道'); el('forumSearchBtn').click();
    expect(document.querySelectorAll('#censorNotice')).toHaveLength(0);
    expect(el('forumList').textContent).toContain('山泉水管道');
  });

  it('门禁通过后不能跳过档案；读评估报告后开放监控，补读日志清除防漏提示', async () => {
    const storage = await import('@shared/storage');
    storage.updateState((state) => state.unlockedNodes.push('P08'));
    mount('src/pages/lab/index.html');
    await import('../src/pages/lab/main');
    fill('doorCode', 'ＬＸＺ－Ｂ０７'); el('doorBtn').click();
    expect(el('archiveView').hidden).toBe(false);
    expect(el('labTabs').hidden).toBe(true);
    expect(el('monitorImg').getAttribute('src')).toBeNull();
    el('goMonitor').click(); // 即便程序触发隐藏按钮，也不能绕过门控。
    expect(el('monitorView').hidden).toBe(true);
    expect(storage.loadState().discoveredClues).not.toContain('CLUE_SHELL_LEFTHAND');
    fill('archiveSearch', ' 容-器 '); el('archiveBtn').click();
    document.querySelector<HTMLElement>('[data-id="vessel_eval"]')!.click();
    expect(el('labTabs').hidden).toBe(false);
    expect(el('afterArchiveBody').textContent).toContain(LAB.afterArchiveExtra);
    document.querySelector<HTMLElement>('[data-id="mother_limit"]')!.click();
    expect(el('afterArchiveBody').textContent).not.toContain(LAB.afterArchiveExtra);
    el('goMonitor').click();
    expect(el('monitorView').hidden).toBe(false);
    expect(storage.loadState().unlockedNodes).toContain('P11');
  });

  it('减少动态时结尾照片不自动消失，主动继续才开放第二阶段', async () => {
    vi.useFakeTimers();
    const storage = await import('@shared/storage');
    storage.updateState((state) => { state.unlockedNodes.push('P07'); state.reduceMotion = true; });
    mount('src/pages/ending/index.html');
    await import('../src/pages/ending/main');
    vi.advanceTimersByTime(20_000);
    expect(el('scene').hidden).toBe(false);
    expect(el('photoRow').hidden).toBe(false);
    expect(el('endPage').hidden).toBe(true);
    expect(storage.loadState().unlockedNodes).not.toContain('P08');
    el('clues').querySelector<HTMLButtonElement>('button')!.click();
    expect(el('endPage').hidden).toBe(false);
    expect(storage.loadState().unlockedNodes).toContain('P08');
  });
});
