import { scrollToContent } from '@shared/motion';
/**
 * 合奘教宣传页（SIDE_HEZONG）：温和诗意的宗教官网，细读脊背发凉。
 * 支线 B+：底部"执礼人入口"→ 口令谜题 → 三件教内文献（名录/手札/林叙之复函）。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import { discoverClue, markSolved, recordAttempt, isSolved, PUZZLE } from '@shared/progress';
import { checkPassword } from '@shared/normalize';
import { HEZONG } from '@data/content';
import { ANSWERS, HINTS, CLUE } from '@data/clues';
import { requestHint, visibleHints } from '@shared/hints';
import { playSfxWithSubtitle } from '@shared/sfx';
import { art } from '@data/assets';

const { denied } = bootstrap({
  pageId: 'hezong', brand: '合奘', domain: 'hezong-teachings.cn',
  skin: 'hezong', node: 'SIDE_HEZONG',
  accessDeniedHint: '这个页面似乎来自一个内部的链接。也许等你知道得更多时，再回来看。',
});
if (denied) throw new Error('access denied');

const root = document.getElementById('root')!;
root.hidden = false;
document.getElementById('brand')!.textContent = HEZONG.brand;
document.getElementById('slogan')!.textContent = HEZONG.slogan;

// 渲染左侧板块导航
const nav = document.getElementById('sectionNav')!;
nav.innerHTML = HEZONG.sections.map((s, i) =>
  `<button class="hezong-nav-btn ${i === 0 ? 'active' : ''}" data-id="${s.id}">${escapeHtml(s.title)}</button>`,
).join('');

const body = document.getElementById('sectionBody')!;

function showSection(id: string): void {
  const s = HEZONG.sections.find((x) => x.id === id)!;
  body.innerHTML = `<h2>${escapeHtml(s.title)}</h2><div class="mail-body">${escapeHtml(s.body)}</div>`;
  nav.querySelectorAll('.hezong-nav-btn').forEach((b) => b.classList.toggle('active', (b as HTMLElement).dataset.id === id));
  scrollToContent(body, 'start');
}

nav.querySelectorAll('.hezong-nav-btn').forEach((b) => {
  b.addEventListener('click', () => showSection((b as HTMLElement).dataset.id!));
});

// 默认显示第一个板块
showSection(HEZONG.sections[0].id);

// ===== 支线 B+：执礼人终端 =====

const gate = document.getElementById('innerGate')!;
const docs = document.getElementById('innerDocs')!;
document.getElementById('innerGateTitle')!.textContent = HEZONG.inner.gateTitle;
document.getElementById('innerGateIntro')!.textContent = HEZONG.inner.gateIntro;
document.getElementById('innerGatePrompt')!.textContent = HEZONG.inner.gatePrompt;

function renderInnerHints(): void {
  const hs = visibleHints(PUZZLE.LOGIN_HEZONG, HINTS);
  document.getElementById('innerHintArea')!.innerHTML = hs.length
    ? `<div class="hint-box"><span class="hint-lvl">提示 L${hs.length}</span><ul>${hs.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul></div>`
    : '';
}

function renderDocs(): void {
  const i = HEZONG.inner;
  docs.innerHTML = `
    <div class="mail-body readable" style="margin-bottom:1.2em">
      <h3 style="margin:0 0 0.3em">${escapeHtml(i.rosterTitle)}</h3>
      <div style="white-space:pre-wrap">${escapeHtml(i.rosterBody)}</div>
    </div>
    <div class="mail-body readable" style="margin-bottom:1.2em">
      <h3 style="margin:0 0 0.3em">${escapeHtml(i.journalTitle)}</h3>
      <div style="white-space:pre-wrap">${escapeHtml(i.journalBody)}</div>
    </div>
    <div class="mail-body readable" style="margin-bottom:1.2em">
      <h3 style="margin:0 0 0.3em">${escapeHtml(i.letterTitle)}</h3>
      <div style="white-space:pre-wrap">${escapeHtml(i.letterBody)}</div>
    </div>
    <p class="readable" style="opacity:0.7; font-style:italic">${escapeHtml(i.outro)}</p>`;
  // 《归山名录》末页图位（零代码接图，docs/art_pipeline.md）：AI 图放入 src/assets/art/ 后自动显示
  const rosterArt = art('guilu_roster');
  if (rosterArt) {
    const first = docs.querySelector<HTMLElement>('.mail-body');
    first?.insertAdjacentHTML('afterbegin',
      `<img src="${rosterArt}" alt="《归山名录》末页：毛笔历届条目的最后三行是打印体编号" style="max-width:min(420px,100%); display:block; margin:0.4em auto; border:1px solid rgba(0,0,0,0.25)" />`);
  }
}

function tryGate(): void {
  const input = document.getElementById('innerGateInput') as HTMLInputElement;
  const msg = document.getElementById('innerGateMsg')!;
  const code = input.value;
  msg.textContent = '';
  if (!code.trim()) { msg.textContent = '请输入口令。'; return; }
  if (!checkPassword(code, ANSWERS.GUILU_GATE)) {
    const n = recordAttempt(PUZZLE.LOGIN_HEZONG);
    msg.textContent = `${HEZONG.inner.gateDenied}（第 ${n} 次）`;
    renderInnerHints();
    return;
  }
  // 通过：展示三件教内文献
  markSolved(PUZZLE.LOGIN_HEZONG);
  discoverClue(CLUE.GUILU_ROSTER);
  discoverClue(CLUE.RITUAL_LOG);
  discoverClue(CLUE.LIN_LETTER);
  gate.hidden = true;
  docs.hidden = false;
  renderDocs();
  // 古册开启：短促电流杂音（老终端联机感）
  playSfxWithSubtitle('glitchClick', { volumeScale: 0.5 });
  scrollToContent(docs);
}

document.getElementById('innerGateBtn')!.addEventListener('click', tryGate);
document.getElementById('innerGateInput')!.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') tryGate();
});
document.getElementById('innerHintBtn')!.addEventListener('click', () => {
  requestHint(PUZZLE.LOGIN_HEZONG);
  renderInnerHints();
});

// 已解过则直接展示文献（刷新恢复）
if (isSolved(PUZZLE.LOGIN_HEZONG)) {
  gate.hidden = true;
  docs.hidden = false;
  renderDocs();
} else {
  gate.hidden = false;
}
renderInnerHints();
