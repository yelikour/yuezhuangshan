/**
 * P12 最终选择：三结局。选择即结局，无对错。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import { ENDING2 } from '@data/content';
import { loadState } from '@shared/storage';
import { playSfx, stopSfx, showFloatingSubtitle } from '@shared/sfx';

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

// 渲染三选项
const choicesEl = document.getElementById('choices')!;
choicesEl.innerHTML = ENDING2.choices.map((c, i) =>
  `<div class="ending-choice" data-id="${c.id}" tabindex="0" role="button">
    <div class="ending-choice-num">${['壹', '贰', '叁'][i]}</div>
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

function showResult(id: string): void {
  const choice = ENDING2.choices.find((c) => c.id === id)!;
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
    // "成为容器"结局：渐黑 + 不安
    if (id === 'vessel') {
      document.body.style.transition = 'background 4s';
      document.body.style.background = '#000';
    }
  }, totalDelay);

  rv.scrollIntoView({ behavior: 'smooth' });
}
