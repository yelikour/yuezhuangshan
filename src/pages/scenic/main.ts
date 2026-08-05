/**
 * P02 景区官网：宣传、岳圣桩传说（搜索谜题）、支线县志。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import { discoverClue, unlock, PUZZLE } from '@shared/progress';
import { matchSearch } from '@shared/normalize';
import { SEARCH_P02_KEYWORDS } from '@data/clues';
import { SCENIC } from '@data/content';
import { requestHint, visibleHints } from '@shared/hints';
import { HINTS } from '@data/clues';
import { IMG } from '@data/assets';

const { denied } = bootstrap({
  pageId: 'scenic', brand: '岳桩山生态景区', domain: 'yuezhuangshan-scenic.cn', skin: 'scenic', node: 'P02',
  accessDeniedHint: '景区官网尚未上线。',
});
if (denied) throw new Error('access denied');

const root = document.getElementById('root')!;
root.hidden = false;

document.getElementById('hero')!.textContent = SCENIC.hero;
document.getElementById('intro')!.textContent = SCENIC.intro;
(document.getElementById('heroImg') as HTMLImageElement).src = IMG.mountainMist;

const searchInput = document.getElementById('search') as HTMLInputElement;
const result = document.getElementById('searchResult')!;
const hintArea = document.getElementById('hintArea')!;

function doSearch(): void {
  const q = searchInput.value;
  if (!q.trim()) {
    result.innerHTML = '<span class="error-msg">请输入搜索关键词。</span>';
    return;
  }
  if (matchSearch(q, SEARCH_P02_KEYWORDS)) {
    // 命中传说
    discoverClue(CLUE.YUESHENGZHUANG_LEGEND);
    discoverClue(CLUE.THREE_YEAR_TRADITION);
    showLegend();
    result.innerHTML = '<span class="ok-msg">找到 1 条相关结果：</span> 岳圣桩传说（见下方）。';
  } else {
    result.innerHTML = `<span class="error-msg">未找到与"${escapeHtml(q)}"相关的内容。试试当地著名的那根"桩"。</span>`;
  }
}

function showLegend(): void {
  const lp = document.getElementById('legendPage')!;
  lp.hidden = false;
  document.getElementById('legendTitle')!.textContent = SCENIC.legend.title;
  (document.getElementById('zhuangImg') as HTMLImageElement).src = IMG.yueshengzhuang;
  document.getElementById('legendBody')!.textContent = SCENIC.legend.body;
  document.getElementById('annotation')!.textContent = SCENIC.legend.annotation;
}

document.getElementById('searchBtn')!.addEventListener('click', doSearch);
searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });

document.getElementById('hintBtn')!.addEventListener('click', () => {
  requestHint(PUZZLE.SEARCH_P02);
  renderHints();
});

function renderHints(): void {
  const hs = visibleHints(PUZZLE.SEARCH_P02, HINTS);
  if (hs.length === 0) { hintArea.innerHTML = ''; return; }
  hintArea.innerHTML = `<div class="hint-box"><span class="hint-lvl">提示 L${hs.length}</span><ul>${hs
    .map((h) => `<li>${escapeHtml(h)}</li>`)
    .join('')}</ul></div>`;
}

// 支线：县志残页
import { CLUE } from '@data/clues';
document.getElementById('annalsLink')!.addEventListener('click', (e) => {
  e.preventDefault();
  // 先要展示传说页才能点进来
  if (document.getElementById('legendPage')!.hidden) {
    alert('需要先在搜索框找到"岳圣桩传说"。');
    return;
  }
  unlock('SIDE_ANNALS');
  discoverClue('CLUE_SIDE_ANNALS');
  const ap = document.getElementById('annalsPage')!;
  ap.hidden = false;
  document.getElementById('annalsBody')!.textContent =
    '【岳桩县志 · 民国抄本残页】"……岳圣桩下有根，根入地极深，与山中草木相连，不可撼动。先人诫：桩不可拔，山不可焚，唯敬老以安之……"\n（注：本页为可选支线，揭示"岳圣桩下有根"——母体与地下生态结合，不可移动。此为世界规则之一，但不影响主线推进。）';
  ap.scrollIntoView({ behavior: 'smooth' });
});

renderHints();

// 渲染景点、点评、公告
document.getElementById('spotsList')!.innerHTML = SCENIC.spots.map((s) =>
  `<div style="margin:0.6em 0; padding:0.6em 0.8em; border-left:3px solid #389e0d; background:rgba(56,158,13,0.05)">
    <strong>${escapeHtml(s.name)}</strong> <span style="opacity:0.5; font-size:0.8em">[${s.tag}]</span><br/>
    <span style="font-size:0.9em">${escapeHtml(s.desc)}</span>
  </div>`,
).join('');

document.getElementById('reviewsList')!.innerHTML = SCENIC.reviews.map((r) =>
  `<div style="margin:0.5em 0; padding:0.5em 0.8em; border-bottom:1px solid rgba(255,255,255,0.08)">
    <strong>${escapeHtml(r.user)}</strong> <span style="color:#ffd700">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span>
    <span style="opacity:0.5; font-size:0.8em"> · ${r.date}</span><br/>
    <span style="font-size:0.9em">${escapeHtml(r.text)}</span>
  </div>`,
).join('');

document.getElementById('noticesList')!.innerHTML = SCENIC.notices.map((n) =>
  `<details style="margin:0.5em 0; padding:0.5em 0.8em; border:1px solid rgba(255,255,255,0.1); border-radius:4px">
    <summary style="cursor:pointer"><strong>${escapeHtml(n.title)}</strong> <span style="opacity:0.5; font-size:0.8em">${n.date}</span></summary>
    <div style="margin-top:0.5em; font-size:0.9em; white-space:pre-wrap">${escapeHtml(n.body)}</div>
  </details>`,
).join('');
