/**
 * P12 最终选择：三结局。选择即结局，无对错。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import { ENDING2 } from '@data/content';
import { loadState, updateState } from '@shared/storage';
import { playSfx, stopSfx, showFloatingSubtitle } from '@shared/sfx';
import { truthProgress, truthTierText } from '@shared/truth';

const { denied } = bootstrap({
  pageId: 'ending2', brand: '——', domain: 'localhost', skin: 'ending', node: 'P12',
  accessDeniedHint: '你还没到做选择的时候。',
});
if (denied) throw new Error('access denied');

const root = document.getElementById('root')!;
root.hidden = false;
document.getElementById('title')!.textContent = ENDING2.title;

// 氛围底噪（贯穿选择与结局）
playSfx('ambientDrone', { loop: true, volumeScale: 0.5, onSubtitle: (t) => showFloatingSubtitle(t) });
window.addEventListener('pagehide', () => stopSfx('ambientDrone'));

const choicesEl = document.getElementById('choices')!;

// 渲染三选项（已见结局标 ◈，配合"回到选择"反复收集）
function renderChoices(): void {
  const seen = loadState().endingsSeen ?? [];
  choicesEl.innerHTML = ENDING2.choices.map((c, i) =>
    `<div class="ending-choice" data-id="${c.id}" tabindex="0" role="button">
      <div class="ending-choice-num">${['壹', '贰', '叁'][i]}${seen.includes(c.id) ? ' ◈' : ''}</div>
      <div class="ending-choice-body">
        <div class="ending-choice-label">${escapeHtml(c.label)}</div>
        <div class="ending-choice-desc">${escapeHtml(c.desc)}</div>
      </div>
    </div>`,
  ).join('');

  choicesEl.querySelectorAll<HTMLElement>('.ending-choice').forEach((el) => {
    const choose = () => showResult(el.dataset.id!);
    el.addEventListener('click', choose);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
  });
}
renderChoices();

function showResult(id: string): void {
  const choice = ENDING2.choices.find((c) => c.id === id)!;
  // 记录已见结局（结局图鉴用）
  updateState((st) => {
    if (!st.endingsSeen.includes(id)) st.endingsSeen.push(id);
  });
  // 淡出选择，淡入结果
  (document.getElementById('choiceView') as HTMLElement).hidden = true;
  const rv = document.getElementById('resultView')!;
  rv.hidden = false;

  const reduceMotion = loadState().reduceMotion;
  const body = document.getElementById('resultBody')!;
  body.innerHTML = `<h2 style="color:#b8b8b8">「${escapeHtml(choice.label)}」</h2>`;

  // 逐段显示结局文字（reduce-motion 下直接全显示）
  const paragraphs = choice.result.split('\n').filter((p) => p.trim());
  paragraphs.forEach((p, i) => {
    const div = document.createElement('p');
    div.textContent = p;
    if (!reduceMotion) {
      div.style.opacity = '0';
      div.style.transition = 'opacity 0.8s';
      setTimeout(() => { div.style.opacity = '1'; }, 400 + i * 700);
    }
    body.appendChild(div);
  });

  // 闭合语
  const totalDelay = reduceMotion ? 0 : 400 + paragraphs.length * 700 + 600;
  setTimeout(() => {
    document.getElementById('closingTitle')!.textContent = ENDING2.closingTitle;
    document.getElementById('closingNote')!.textContent = ENDING2.closingNote;
    renderTruth();
    // "成为容器"结局：渐黑 + 不安
    if (id === 'vessel') {
      document.body.style.transition = 'background 4s';
      document.body.style.background = '#000';
    }
    // 回到选择：结局已计数，允许重选其余结局集齐图鉴（docs §6A.5）
    const actions = document.getElementById('closingActions')!;
    actions.hidden = false;
    actions.innerHTML = '';
    const backBtn = document.createElement('button');
    backBtn.className = 'btn';
    backBtn.textContent = ENDING2.rechooseLabel;
    backBtn.addEventListener('click', () => {
      // 还原 vessel 结局的渐黑背景，回到三选项界面
      document.body.style.transition = '';
      document.body.style.background = '';
      rv.hidden = true;
      (document.getElementById('truthPanel') as HTMLElement).hidden = true;
      actions.hidden = true;
      (document.getElementById('choiceView') as HTMLElement).hidden = false;
      renderChoices();
      window.scrollTo({ top: 0 });
    });
    actions.appendChild(backBtn);
    const hint = document.createElement('span');
    hint.style.cssText = 'margin-left:0.8em; opacity:0.55; font-size:0.85em';
    hint.textContent = ENDING2.rechooseHint;
    actions.appendChild(hint);
  }, totalDelay);

  rv.scrollIntoView({ behavior: 'smooth' });
}

/** 真相完成度 + 证据清单（结局后的二周目驱动） */
function renderTruth(): void {
  const holder = document.getElementById('truthPanel')!;
  holder.hidden = false;
  const t = truthProgress(loadState());
  const tierText = truthTierText(t.tier, ENDING2.truth.tiers);
  const items = t.titles.map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  holder.innerHTML = `
    <h3 style="margin:0 0 0.4em">${escapeHtml(ENDING2.truth.label)}　<span style="font-size:1.4em">${t.percent}%</span></h3>
    <p class="readable" style="margin:0.3em 0">${escapeHtml(tierText)}</p>
    <details style="margin:0.6em 0">
      <summary style="cursor:pointer; opacity:0.75">${escapeHtml(ENDING2.truth.evidenceTitle)}（${t.found}/${t.total}）</summary>
      <p class="readable" style="opacity:0.6; font-size:0.85em; margin:0.4em 0">${escapeHtml(ENDING2.truth.evidenceIntro)}</p>
      <ul class="readable" style="margin:0.3em 0 0.5em; padding-left:1.2em; font-size:0.9em">${items}</ul>
      ${t.missing > 0 ? `<p class="readable" style="opacity:0.6; font-size:0.85em">${escapeHtml(ENDING2.truth.missingIntro(t.missing))}</p>` : ''}
    </details>`;
}
