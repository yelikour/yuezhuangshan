/**
 * P01 虚构邮箱：邀请函、日程、入住资料、干扰邮件。
 * 阅读后解锁相应线索，并开放景区/聊天两个调查入口。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import { discoverClue, unlock, isNodeActive } from '@shared/progress';
import { CLUE } from '@data/clues';
import { MAIL } from '@data/content';
import { IMG } from '@data/assets';
import { loadState, updateState } from '@shared/storage';
import type { NodeId } from '@shared/state';

const { denied } = bootstrap({
  pageId: 'mail', brand: '云雁邮', domain: 'yunyan.mail', skin: 'mail', node: 'P01',
  accessDeniedHint: '邮箱尚未开通。',
});
if (denied) throw new Error('access denied');

const root = document.getElementById('root')!;
root.hidden = false;

interface MailItem {
  id: string;
  from: string;
  to?: string;
  subject: string;
  date: string;
  body: string;
  key?: string;
  /** 需要解锁到此节点才显示（默认 P01） */
  requireNode?: NodeId;
  /** 标记为"新到达"（当玩家刚解锁该节点时） */
  isNew?: boolean;
}

/** 邮件按进度分批到达：requireNode 越靠后，到达越晚 */
const allMails: MailItem[] = [
  { id: 'awardNotice', ...MAIL.awardNotice, requireNode: 'P01' },
  { id: 'bankStatement', ...MAIL.bankStatement, requireNode: 'P01' },
  { id: 'preInvite', ...MAIL.preInvite, requireNode: 'P01' },
  { id: 'invite', ...MAIL.invite, key: CLUE.INVITE, requireNode: 'P01' },
  { id: 'schedule', ...MAIL.schedule, requireNode: 'P01' },
  { id: 'checkin', ...MAIL.checkin, key: CLUE.CREDENTIAL_HINT, requireNode: 'P01' },
  { id: 'hotelConfirm', ...MAIL.hotelConfirm, requireNode: 'P01' },
  { id: 'spam', ...MAIL.spam, requireNode: 'P01' },
  { id: 'peerAuthor', ...MAIL.peerAuthor, requireNode: 'P02' },       // 到达景区后
  { id: 'shenranWarn', ...MAIL.shenranWarn, requireNode: 'P04' },     // 发现失联后
];

/** 根据当前进度过滤可见邮件，按日期倒序。用 isNodeActive 确保"玩家真正到达过"该进度 */
function visibleMails(): MailItem[] {
  return allMails
    .filter((m) => isNodeActive(m.requireNode ?? 'P01'))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// 已读邮件集合：从存档加载，刷新后不回弹（持久化于 GameState.readMails）。
let readSet = new Set<string>(loadState().readMails);

const list = document.getElementById('mailList')!;
const view = document.getElementById('mailView')!;

// 初始空状态
view.innerHTML = `<div class="mail-view-empty">← 从左侧选择一封邮件查看</div>`;

function renderList(): void {
  const mails = visibleMails();
  list.innerHTML = mails
    .map((m) => {
      const unread = !readSet.has(m.id);
      return `<div class="mail-item ${unread ? 'unread' : ''}" data-id="${m.id}" tabindex="0" role="button">
        <div style="display:flex; gap:0.6em; align-items:center">
          <img class="mail-avatar" src="${IMG.mailAvatar}" alt="" width="32" height="32" />
          <div>
            <div>${unread ? '<span class="mail-dot">●</span> ' : ''}<strong>${escapeHtml(m.subject)}</strong></div>
            <div style="opacity:0.6; font-size:0.85em">${escapeHtml(m.from)}</div>
            <div style="opacity:0.5; font-size:0.8em">${escapeHtml(m.date)}</div>
          </div>
        </div>
      </div>`;
    })
    .join('');
  list.querySelectorAll<HTMLElement>('.mail-item').forEach((el) => {
    const id = el.dataset.id!;
    el.addEventListener('click', () => open(id));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(id); }
    });
  });
  // 更新未读计数提示
  updateUnreadHint(mails);
}

function open(id: string): void {
  const m = allMails.find((x) => x.id === id)!;
  readSet.add(id);
  // 持久化已读状态（去重写入，避免 updateState 高频触发）
  updateState((st) => {
    if (!st.readMails.includes(id)) st.readMails.push(id);
  });
  renderList();
  list.querySelectorAll<HTMLElement>('.mail-item').forEach((el) => el.classList.toggle('active', el.dataset.id === id));
  view.innerHTML = `
    <div style="opacity:0.7; font-size:0.85em">发件人：${escapeHtml(m.from)}</div>
    <div style="opacity:0.7; font-size:0.85em">收件人：${escapeHtml(m.to ?? '我')}</div>
    <div style="opacity:0.5; font-size:0.8em">${escapeHtml(m.date)}</div>
    <h2 style="margin:0.4em 0">${escapeHtml(m.subject)}</h2>
    <div class="mail-body">${escapeHtml(m.body)}</div>
  `;
  // 正文滚动归零（切换邮件时回到顶部）
  view.scrollTop = 0;
  // 阅读关键邮件 → 解锁线索 + 开放后续节点
  if (m.key === CLUE.INVITE) {
    discoverClue(CLUE.INVITE);
    unlock('P02');
    unlock('P03');
  }
  if (m.key === CLUE.CREDENTIAL_HINT) {
    discoverClue(CLUE.CREDENTIAL_HINT);
  }
}

/** 未读计数提示（显示在邮件列表上方） */
function updateUnreadHint(mails: MailItem[]): void {
  const unread = mails.filter((m) => !readSet.has(m.id)).length;
  const hint = document.getElementById('readHint')!;
  if (unread > 0) {
    hint.innerHTML = `<span style="color:#ff8a8a">●</span> ${unread} 封未读`;
  } else {
    hint.textContent = '';
  }
}

renderList();
