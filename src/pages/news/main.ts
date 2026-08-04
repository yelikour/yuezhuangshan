/**
 * P04 地方资讯搜索：关键词搜索谜题 → 被篡改的旧报道（时间线矛盾#1）。
 * 解出后解锁 CLUE_TAMPERED_REPORT，开放 P05 后台登录。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import { discoverClue, unlock, markSolved, PUZZLE } from '@shared/progress';
import { matchSearch } from '@shared/normalize';
import { NEWS_DB, HINTS, CLUE } from '@data/clues';
import { NEWS } from '@data/content';
import { requestHint, visibleHints } from '@shared/hints';

const { denied } = bootstrap({
  pageId: 'news', brand: '岳桩资讯', domain: 'yuezhuang-news.cn', skin: 'news', node: 'P04',
  accessDeniedHint: '资讯检索暂不可用。先确认沈苒的失联情况。',
});
if (denied) throw new Error('access denied');

const root = document.getElementById('root')!;
root.hidden = false;
document.getElementById('newsTitle')!.textContent = NEWS.title;
(document.getElementById('search') as HTMLInputElement).placeholder = NEWS.placeholder;

const results = document.getElementById('results')!;
const hintArea = document.getElementById('hintArea')!;
const detail = document.getElementById('detailModal')!;
const detailBody = document.getElementById('detailBody')!;

function doSearch(): void {
  const q = (document.getElementById('search') as HTMLInputElement).value;
  if (!q.trim()) {
    results.innerHTML = '<span class="error-msg">请输入检索关键词。</span>';
    return;
  }
  const hits = NEWS_DB.filter((it) => matchSearch(q, it.matchKeywords));
  if (hits.length === 0) {
    results.innerHTML = `<span class="error-msg">未检索到与"${escapeHtml(q)}"相关的存档。</span>`;
    return;
  }
  results.innerHTML = `<div>检索到 ${hits.length} 条：</div>` +
    hits
      .map(
        (it) => `<div class="mail-item" data-id="${it.id}" tabindex="0" role="button">
          <div><strong>${escapeHtml(it.title)}</strong>${it.isKey ? ' <span style="color:#b98a3e">★</span>' : ''}</div>
          <div style="opacity:0.6; font-size:0.85em">${escapeHtml(it.source)} · ${escapeHtml(it.date)}</div>
          <div style="opacity:0.7; font-size:0.85em">${escapeHtml(it.snippet)}</div>
        </div>`,
      )
      .join('');
  results.querySelectorAll<HTMLElement>('.mail-item').forEach((el) => {
    const open = () => showDetail(el.dataset.id!);
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
}

function showDetail(id: string): void {
  const it = NEWS_DB.find((x) => x.id === id)!;
  detail.hidden = false;
  detailBody.innerHTML = `
    <h2>${escapeHtml(it.title)}</h2>
    <div style="opacity:0.6">${escapeHtml(it.source)} · ${escapeHtml(it.date)}</div>
    <div style="margin-top:0.6em">${escapeHtml(it.body ?? it.snippet)}</div>
  `;
  if (it.isKey) {
    // 发现关键剧情项 → 解锁
    discoverClue(CLUE.TAMPERED_REPORT);
    markSolved(PUZZLE.SEARCH_P04);
    unlock('P05');
    (document.getElementById('afterSolve') as HTMLElement).hidden = false;
    detail.scrollIntoView({ behavior: 'smooth' });
  }
}

document.getElementById('closeDetail')!.addEventListener('click', () => { detail.hidden = true; });
document.getElementById('searchBtn')!.addEventListener('click', doSearch);
(document.getElementById('search') as HTMLInputElement).addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doSearch();
});

document.getElementById('hintBtn')!.addEventListener('click', () => {
  requestHint(PUZZLE.SEARCH_P04);
  renderHints();
});
function renderHints(): void {
  const hs = visibleHints(PUZZLE.SEARCH_P04, HINTS);
  hintArea.innerHTML = hs.length
    ? `<div class="hint-box"><span class="hint-lvl">提示 L${hs.length}</span><ul>${hs.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul></div>`
    : '';
}
