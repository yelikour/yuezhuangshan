/**
 * P11 半沈苒：真假消息分辨。玩家选出真正的沈苒（基于私密记忆"芝麻"猫）。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import { discoverClue, unlock, markSolved, recordAttempt, PUZZLE } from '@shared/progress';
import { HALF_MESSAGES, HINTS, CLUE } from '@data/clues';
import { HALF_CHAT } from '@data/content';
import { requestHint, visibleHints } from '@shared/hints';

const { denied } = bootstrap({
  pageId: 'identify', brand: '谛听', domain: 'diting.app', skin: 'chat', node: 'P11',
  accessDeniedHint: '还没有消息到来。先在监控里确认那不是她。',
});
if (denied) throw new Error('access denied');

const root = document.getElementById('root')!;
root.hidden = false;
document.getElementById('title')!.textContent = HALF_CHAT.title;
document.getElementById('intro')!.textContent = HALF_CHAT.intro;
document.getElementById('prompt')!.textContent = HALF_CHAT.prompt;
(document.getElementById('confession') as HTMLElement)!.textContent = HALF_CHAT.realConfession;

// 渲染消息列表（真假混杂）
const messagesEl = document.getElementById('messages')!;
messagesEl.innerHTML = HALF_MESSAGES.map((m) =>
  `<div class="chat-msg her"><div class="bubble" data-id="${m.id}">${escapeHtml(m.text)}</div></div>`,
).join('');

// 渲染选择列表（同消息，让玩家点选）
const choicesEl = document.getElementById('choices')!;
let selectedId: string | null = null;
choicesEl.innerHTML = HALF_MESSAGES.map((m, i) =>
  `<label class="identify-choice" data-id="${m.id}">
    <input type="radio" name="realmsg" value="${m.id}" />
    <span class="choice-text">${i + 1}. ${escapeHtml(m.text)}</span>
  </label>`,
).join('');

choicesEl.querySelectorAll<HTMLInputElement>('input[name="realmsg"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    selectedId = radio.value;
    (document.getElementById('confirmBtn') as HTMLButtonElement).disabled = false;
    document.getElementById('err')!.textContent = '';
  });
});

function confirm(): void {
  if (!selectedId) return;
  const chosen = HALF_MESSAGES.find((m) => m.id === selectedId)!;
  if (!chosen.isReal) {
    const n = recordAttempt(PUZZLE.IDENTIFY_P11);
    document.getElementById('err')!.textContent =
      `不对。这条里的记忆太"大"了——它学的就是这种。真正的她会说更琐碎的小事。（第 ${n} 次）`;
    renderHints();
    return;
  }
  // 正确
  markSolved(PUZZLE.IDENTIFY_P11);
  discoverClue(CLUE.HALF_SHENRAN);
  discoverClue(CLUE.ONLY_WAY_OUT);
  unlock('P12');
  (document.getElementById('afterIdentify') as HTMLElement).hidden = false;
  // 高亮选中的真消息
  document.querySelectorAll('.identify-choice').forEach((el) => {
    el.classList.toggle('chosen', (el as HTMLElement).dataset.id === selectedId);
  });
  document.getElementById('afterIdentify')!.scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('confirmBtn')!.addEventListener('click', confirm);
document.getElementById('hintBtn')!.addEventListener('click', () => {
  requestHint(PUZZLE.IDENTIFY_P11);
  renderHints();
});

function renderHints(): void {
  const hs = visibleHints(PUZZLE.IDENTIFY_P11, HINTS);
  document.getElementById('hintArea')!.innerHTML = hs.length
    ? `<div class="hint-box"><span class="hint-lvl">提示 L${hs.length}</span><ul>${hs.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul></div>`
    : '';
}
