import { describe, expect, it } from 'vitest';
import { visibleMails, unreadMailCount } from '@shared/mail';
import { createDefaultState } from '@shared/state';
import { CLUE } from '@data/clues';

describe('邮件可见性与首页未读计数', () => {
  it('初始预览只包含欢迎邮件，不修改进度', () => {
    const state = createDefaultState();
    expect(visibleMails(state)).toEqual([]);
    expect(unreadMailCount(state, 'inbox', true)).toBe(7);
    expect(state.unlockedNodes).toEqual(['P00']);
    expect(visibleMails(state, true).some((mail) => mail.id === 'peerAuthor')).toBe(false);
  });

  it('邀请码阅读后到达的新邮件立即计入', () => {
    const state = createDefaultState();
    state.unlockedNodes.push('P01', 'P02');
    state.readMails.push('invite');
    expect(unreadMailCount(state, 'inbox')).toBe(7);
    expect(visibleMails(state).map((mail) => mail.id)).toContain('peerAuthor');
    expect(visibleMails(state).map((mail) => mail.id)).not.toContain('shenranWarn');
  });

  it('周衍回信依赖论坛存档线索，陆远邮件依赖各自到达节点', () => {
    const state = createDefaultState();
    state.unlockedNodes.push('P01', 'P04');
    expect(visibleMails(state).map((mail) => mail.id)).toContain('luYanSpam1');
    expect(visibleMails(state).map((mail) => mail.id)).not.toContain('luYanSpam2');
    expect(visibleMails(state).map((mail) => mail.id)).not.toContain('zhouYanLetter');
    state.discoveredClues.push(CLUE.FORUM_ARCHIVE);
    expect(visibleMails(state).map((mail) => mail.id)).toContain('zhouYanLetter');
  });

  it('收件箱和垃圾箱分别统计已读，重开恢复初始未读', () => {
    const state = createDefaultState();
    state.unlockedNodes.push('P01');
    state.readMails = visibleMails(state).filter((mail) => mail.folder !== 'spam').map((mail) => mail.id);
    expect(unreadMailCount(state, 'inbox')).toBe(0);
    expect(unreadMailCount(state, 'spam')).toBe(3);
    expect(unreadMailCount(createDefaultState(), 'inbox', true)).toBe(7);
  });
});
