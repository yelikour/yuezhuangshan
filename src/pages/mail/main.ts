/**
 * P01 虚构邮箱：邀请函、日程、入住资料、干扰邮件。
 * 阅读后解锁相应线索，并开放景区/聊天两个调查入口。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import { discoverClue, unlock, isNodeActive } from '@shared/progress';
import { CLUE } from '@data/clues';
import { IMG, art } from '@data/assets';
import { loadState, updateState } from '@shared/storage';
import { playSfxWithSubtitle } from '@shared/sfx';
import { ALL_MAILS as allMails, type MailItem } from '@data/mail';
import { visibleMails as getVisibleMails } from '@shared/mail';

const { denied } = bootstrap({
  pageId: 'mail', brand: '云雁邮', domain: 'yunyan.mail', skin: 'mail', node: 'P01',
  accessDeniedHint: '邮箱尚未开通。',
});
if (denied) throw new Error('access denied');

const root = document.getElementById('root')!;
root.hidden = false;

function visibleMails(): MailItem[] {
  return getVisibleMails(loadState());
}

// 已读邮件集合：从存档加载，刷新后不回弹（持久化于 GameState.readMails）。
let readSet = new Set<string>(loadState().readMails);

const list = document.getElementById('mailList')!;
const view = document.getElementById('mailView')!;

// 当前文件夹（收件箱 / 垃圾箱）
let currentFolder: 'inbox' | 'spam' = 'inbox';
// 是否首次切到垃圾箱（音效）
let spamVisited = false;

// 初始空状态
view.innerHTML = `<div class="mail-view-empty">← 从左侧选择一封邮件查看</div>`;

function renderList(): void {
  readSet = new Set(loadState().readMails);
  const mails = visibleMails().filter((m) => (m.folder ?? 'inbox') === currentFolder);
  if (mails.length === 0 && !isNodeActive('P01')) {
    // 直接输入 URL 进入（未从导航首页开始）：给出行内引导而非空白列表
    list.innerHTML = `<div style="padding:1em; opacity:0.6; font-size:0.9em">邮箱尚未开通。<br/>请从<b>导航首页</b>的「开始调查」或「云雁邮」进入。</div>`;
    updateSpamBadge();
    return;
  }
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
  // 更新未读计数提示（按当前文件夹）
  updateUnreadHint(mails);
  updateSpamBadge();
}

/** 垃圾箱 tab 的未读角标（全文件夹口径，进入邮箱即提示有可疑信件被隔离） */
function updateSpamBadge(): void {
  const spamMails = visibleMails().filter((m) => m.folder === 'spam');
  const unread = spamMails.filter((m) => !readSet.has(m.id)).length;
  const badge = document.getElementById('spamBadge')!;
  badge.hidden = unread === 0;
  badge.textContent = String(unread);
}

// 文件夹切换
document.querySelectorAll<HTMLElement>('.mail-folder-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const folder = (tab.dataset.folder as 'inbox' | 'spam');
    if (folder === currentFolder) return;
    currentFolder = folder;
    document.querySelectorAll<HTMLElement>('.mail-folder-tab').forEach((t) => {
      const active = (t.dataset.folder) === currentFolder;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });
    if (currentFolder === 'spam' && !spamVisited) {
      spamVisited = true;
      playSfxWithSubtitle('glitchClick', { volumeScale: 0.4 });
    }
    // 切文件夹时正文回到空状态
    view.innerHTML = `<div class="mail-view-empty">← 从左侧选择一封邮件查看</div>`;
    renderList();
  });
});

function open(id: string): void {
  const m = allMails.find((x) => x.id === id)!;
  readSet.add(id);
  // 持久化已读状态（去重写入，避免 updateState 高频触发）
  updateState((st) => {
    if (!st.readMails.includes(id)) st.readMails.push(id);
  });
  view.innerHTML = `
    <div style="opacity:0.7; font-size:0.85em">发件人：${escapeHtml(m.from)}</div>
    <div style="opacity:0.7; font-size:0.85em">收件人：${escapeHtml(m.to ?? '我')}</div>
    <div style="opacity:0.5; font-size:0.8em">${escapeHtml(m.date)}</div>
    <h2 style="margin:0.4em 0">${escapeHtml(m.subject)}</h2>
    <div class="mail-body">${escapeHtml(m.body)}</div>
  `;
  // 附件图位（零代码接图，docs/art_pipeline.md）：AI 图放入 src/assets/art/ 后自动显示
  const attach = m.attachArt ? art(m.attachArt) : null;
  if (attach) {
    view.insertAdjacentHTML('beforeend', `
      <div style="margin-top:0.8em">
        <img src="${attach}" alt="${escapeHtml(m.attachCaption ?? '附件图片')}" style="max-width:min(420px,100%); display:block; border:1px solid rgba(255,255,255,0.15)" />
        <div style="opacity:0.55; font-size:0.8em; margin-top:0.25em">${escapeHtml(m.attachCaption ?? '')}</div>
      </div>`);
  }
  // 正文滚动归零（切换邮件时回到顶部）
  view.scrollTop = 0;
  // 阅读关键邮件 → 解锁线索（通用）+ 开放后续节点（特定）
  if (m.key) {
    discoverClue(m.key);
  }
  if (m.key === CLUE.INVITE) {
    unlock('P02');
    unlock('P03');
  }
  renderList();
  list.querySelectorAll<HTMLElement>('.mail-item').forEach((el) => el.classList.toggle('active', el.dataset.id === id));
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
