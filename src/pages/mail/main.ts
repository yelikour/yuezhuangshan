/**
 * P01 虚构邮箱：邀请函、日程、入住资料、干扰邮件。
 * 阅读后解锁相应线索，并开放景区/聊天两个调查入口。
 */
import { bootstrap, escapeHtml, relTo } from '@shared/bootstrap';
import { discoverClue, unlock } from '@shared/progress';
import { CLUE } from '@data/clues';
import { MAIL } from '@data/content';
import { IMG } from '@data/assets';

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
}

const mails: MailItem[] = [
  { id: 'invite', ...MAIL.invite, key: CLUE.INVITE },
  { id: 'schedule', ...MAIL.schedule },
  { id: 'checkin', ...MAIL.checkin, key: CLUE.CREDENTIAL_HINT },
  { id: 'spam', ...MAIL.spam },
];

let readSet = new Set<string>();

const list = document.getElementById('mailList')!;
const view = document.getElementById('mailView')!;

function renderList(): void {
  list.innerHTML = mails
    .map((m) => `<div class="mail-item ${readSet.has(m.id) ? '' : 'unread'}" data-id="${m.id}" tabindex="0" role="button">
        <div style="display:flex; gap:0.6em; align-items:center">
          <img class="mail-avatar" src="${IMG.mailAvatar}" alt="" width="32" height="32" />
          <div>
            <div><strong>${escapeHtml(m.subject)}</strong></div>
            <div style="opacity:0.6; font-size:0.85em">${escapeHtml(m.from)}</div>
            <div style="opacity:0.5; font-size:0.8em">${escapeHtml(m.date)}</div>
          </div>
        </div>
      </div>`,
    )
    .join('');
  list.querySelectorAll<HTMLElement>('.mail-item').forEach((el) => {
    const id = el.dataset.id!;
    el.addEventListener('click', () => open(id));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(id); }
    });
  });
}

function open(id: string): void {
  const m = mails.find((x) => x.id === id)!;
  readSet.add(id);
  renderList();
  list.querySelectorAll<HTMLElement>('.mail-item').forEach((el) => el.classList.toggle('active', el.dataset.id === id));
  view.innerHTML = `
    <div style="opacity:0.7; font-size:0.85em">发件人：${escapeHtml(m.from)}</div>
    <div style="opacity:0.7; font-size:0.85em">收件人：${escapeHtml(m.to ?? '我')}</div>
    <div style="opacity:0.5; font-size:0.8em">${escapeHtml(m.date)}</div>
    <h2 style="margin:0.4em 0">${escapeHtml(m.subject)}</h2>
    <div class="mail-body">${escapeHtml(m.body)}</div>
  `;
  // 阅读关键邮件 → 解锁线索 + 开放后续节点
  if (m.key === CLUE.INVITE) {
    discoverClue(CLUE.INVITE);
    unlock('P02');
    unlock('P03');
  }
  if (m.key === CLUE.CREDENTIAL_HINT) {
    discoverClue(CLUE.CREDENTIAL_HINT);
  }
  updateHint();
}

function updateHint(): void {
  const hint = document.getElementById('readHint')!;
  const hasInvite = readSet.has('invite');
  const hasCheckin = readSet.has('checkin');
  if (!hasInvite) {
    hint.textContent = '建议先阅读"邀请函"。';
  } else if (!hasCheckin) {
    hint.textContent = '别忘了阅读"入住资料"——里面有登录会议后台需要的信息。';
  } else {
    hint.innerHTML = `已阅读关键邮件。可前往
      <a class="btn" href="${relTo('scenic')}">景区官网</a> 或
      <a class="btn" href="${relTo('chat')}">聊天</a> 继续调查。`;
  }
}

renderList();
updateHint();
