/**
 * P08 门禁 + P09 档案 + P10 监控（lab 站点，三视图 tab 切换）。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import { discoverClue, unlock, markSolved, recordAttempt, PUZZLE } from '@shared/progress';
import { checkPassword, matchSearch } from '@shared/normalize';
import { ANSWERS, ARCHIVE_DB, HINTS, CLUE } from '@data/clues';
import { LAB } from '@data/content';
import { IMG } from '@data/assets';
import { requestHint, visibleHints } from '@shared/hints';

// P08 门禁：节点 P08 在通过后才进入，但首次访问 lab 时 P08 默认要求门禁通过
const { denied } = bootstrap({
  pageId: 'lab', brand: '实验室内网', domain: 'lab.yuezhuangshan.cn', skin: 'backend', node: 'P08',
  accessDeniedHint: '内网需要从维护通道进入。先完成第一阶段的调查。',
});
if (denied) throw new Error('access denied');

const root = document.getElementById('root')!;
root.hidden = false;
document.getElementById('labTitle')!.textContent = LAB.welcome;

const doorView = document.getElementById('doorView')!;
const archiveView = document.getElementById('archiveView')!;
const monitorView = document.getElementById('monitorView')!;
const labTabs = document.getElementById('labTabs')!;

// ===== P08 门禁 =====
document.getElementById('doorHint')!.textContent = LAB.doorHint;
document.getElementById('visitorLog')!.textContent = LAB.visitorLog;
document.getElementById('workstationMap')!.textContent = LAB.workstationMap;
document.getElementById('doorPrompt')!.textContent = LAB.doorPrompt;

function tryDoor(): void {
  const code = (document.getElementById('doorCode') as HTMLInputElement).value;
  const err = document.getElementById('err')!;
  err.textContent = '';
  if (!code.trim()) { err.textContent = '请输入身份码。'; return; }
  if (!checkPassword(code, ANSWERS.LAB_ACCESS_CODE)) {
    const n = recordAttempt(PUZZLE.LOGIN_P08);
    err.textContent = `身份码错误（第 ${n} 次）。`;
    renderHints('login_p08', 'hintArea');
    return;
  }
  // 通过
  markSolved(PUZZLE.LOGIN_P08);
  discoverClue(CLUE.LAB_ACCESS);
  discoverClue(CLUE.LIN_XUZHI);
  unlock('P09');
  // 切到档案视图
  doorView.hidden = true;
  archiveView.hidden = false;
  labTabs.hidden = false;
}

document.getElementById('doorBtn')!.addEventListener('click', tryDoor);
(document.getElementById('doorCode') as HTMLInputElement).addEventListener('keydown', (e) => {
  if (e.key === 'Enter') tryDoor();
});
document.getElementById('hintBtn')!.addEventListener('click', () => {
  requestHint(PUZZLE.LOGIN_P08);
  renderHints('login_p08', 'hintArea');
});

function renderHints(puzzle: string, containerId: string): void {
  const hs = visibleHints(puzzle, HINTS);
  const c = document.getElementById(containerId)!;
  c.innerHTML = hs.length
    ? `<div class="hint-box"><span class="hint-lvl">提示 L${hs.length}</span><ul>${hs.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul></div>`
    : '';
}

// ===== P09 档案检索 =====
document.getElementById('archiveTitle')!.textContent = LAB.archiveTitle;

function searchArchive(): void {
  const q = (document.getElementById('archiveSearch') as HTMLInputElement).value;
  const results = document.getElementById('archiveResults')!;
  if (!q.trim()) { results.innerHTML = '<span class="error-msg">请输入检索关键词。</span>'; return; }
  const hits = ARCHIVE_DB.filter((d) => matchSearch(q, d.matchKeywords));
  if (hits.length === 0) {
    results.innerHTML = `<span class="error-msg">未检索到与"${escapeHtml(q)}"相关的档案。</span>`;
    return;
  }
  results.innerHTML = `<div>检索到 ${hits.length} 份档案：</div>` +
    hits.map((d) => `<div class="mail-item" data-id="${d.id}" tabindex="0" role="button">
      <div><strong>[${escapeHtml(d.level)}] ${escapeHtml(d.title)}</strong> ${d.isKey ? '<span style="color:#b98a3e">★</span>' : ''}</div>
      <div style="opacity:0.6; font-size:0.85em">${escapeHtml(d.code)}</div>
      <div style="opacity:0.7; font-size:0.85em">${escapeHtml(d.snippet)}</div>
    </div>`).join('');
  results.querySelectorAll<HTMLElement>('.mail-item').forEach((el) => {
    const open = () => showArchive(el.dataset.id!);
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
}

function showArchive(id: string): void {
  const d = ARCHIVE_DB.find((x) => x.id === id)!;
  const detail = document.getElementById('archiveDetail')!;
  const body = document.getElementById('archiveDetailBody')!;
  detail.hidden = false;
  body.innerHTML = `<h2>[${escapeHtml(d.level)}] ${escapeHtml(d.title)}</h2>
    <div style="opacity:0.6">${escapeHtml(d.code)}</div>
    <div style="margin-top:0.6em">${escapeHtml(d.body ?? d.snippet)}</div>`;
  // 关键档案 → 解锁线索
  if (d.id === 'mother_limit') {
    discoverClue(CLUE.MOTHER_CANT_LEAVE);
  }
  if (d.id === 'vessel_eval') {
    discoverClue(CLUE.PROTAGONIST_VESSEL);
    discoverClue(CLUE.SHENRAN_DECOY);
    markSolved(PUZZLE.SEARCH_P09);
    unlock('P10');
    (document.getElementById('afterArchive') as HTMLElement).hidden = false;
  }
  detail.scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('archiveBtn')!.addEventListener('click', searchArchive);
(document.getElementById('archiveSearch') as HTMLInputElement).addEventListener('keydown', (e) => { if (e.key === 'Enter') searchArchive(); });
document.getElementById('closeArchiveDetail')!.addEventListener('click', () => { (document.getElementById('archiveDetail') as HTMLElement).hidden = true; });
document.getElementById('hintBtn2')!.addEventListener('click', () => {
  requestHint(PUZZLE.SEARCH_P09);
  renderHints('search_p09', 'archiveHintArea');
});

// afterArchive → 切到监控
document.getElementById('goMonitor')!.addEventListener('click', () => switchView('monitor'));

// ===== P10 监控 =====
document.getElementById('monitorTitle')!.textContent = LAB.monitorTitle;
(document.getElementById('monitorImg') as HTMLImageElement).src = IMG.labBlur;
document.getElementById('monitorNote')!.textContent = LAB.monitorNote;

function switchView(view: 'archive' | 'monitor'): void {
  archiveView.hidden = view !== 'archive';
  monitorView.hidden = view !== 'monitor';
  labTabs.querySelectorAll('.lab-tab').forEach((t) => t.classList.toggle('active', (t as HTMLElement).dataset.view === view));
  if (view === 'monitor') {
    discoverClue(CLUE.SHELL_LEFTHAND);
    unlock('P11');
    (document.getElementById('afterMonitor') as HTMLElement).hidden = false;
  }
}

labTabs.querySelectorAll('.lab-tab').forEach((t) => {
  t.addEventListener('click', () => switchView((t as HTMLElement).dataset.view as 'archive' | 'monitor'));
});
