/**
 * P07 切片结尾：克制的恐怖演出。
 * 沈苒"已关机"账号发来假消息 + 照片矛盾 → 玩家识破 → 阶段结束页。
 * 演出原则：无 jump-scare，用静态细节的"不对劲"营造不安。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import { discoverClue } from '@shared/progress';
import { CLUE } from '@data/clues';
import { ENDING } from '@data/content';
import { loadState } from '@shared/storage';
import { IMG } from '@data/assets';
import { playSfx, stopSfx, showFloatingSubtitle } from '@shared/sfx';

const { denied } = bootstrap({
  pageId: 'ending', brand: '——', domain: 'localhost', skin: 'ending', node: 'P07',
  accessDeniedHint: '还没有消息到来。',
});
if (denied) throw new Error('access denied');

const root = document.getElementById('root')!;
root.hidden = false;

const s = loadState();
const reduceMotion = s.reduceMotion;

// 氛围底噪：进入结尾页即循环播放，贯穿整个演出（默认静音时无声，仅字幕）
playSfx('ambientDrone', {
  loop: true,
  volumeScale: 0.55,
  onSubtitle: (t) => showFloatingSubtitle(t),
});
// 页面离开时停止氛围音
window.addEventListener('pagehide', () => stopSfx('ambientDrone'));

// 消息逐字淡入（reduce-motion 下直接显示）
const fakeMsgEl = document.getElementById('fakeMsg')!;
const text = ENDING.fakeMessage.text;
const bubble = document.createElement('div');
bubble.className = 'bubble';
bubble.classList.add('typewriter');
// 逐字包裹 span
const delay = reduceMotion ? 0 : 60;
[...text].forEach((ch, i) => {
  const sp = document.createElement('span');
  sp.textContent = ch;
  if (!reduceMotion) sp.style.animationDelay = `${i * delay}ms`;
  bubble.appendChild(sp);
});
fakeMsgEl.innerHTML = `<div class="chat-time">${ENDING.fakeMessage.time}</div>`;
fakeMsgEl.appendChild(bubble);

// 消息出现时的"信号接入"故障音（默认静音则无声，仅配合视觉）
if (!reduceMotion) {
  setTimeout(() => playSfx('glitchClick', { volumeScale: 0.5 }), 200);
}

// 文字动画结束后显示照片 + 线索 + 结束页
const totalDelay = reduceMotion ? 0 : text.length * delay + 700;
setTimeout(() => {
  (document.getElementById('photoRow') as HTMLElement).hidden = false;
  (document.getElementById('ritualPhoto') as HTMLImageElement).src = IMG.endingRitual;
  discoverClue(CLUE.FAKE_RETURN);

  // 照片矛盾细节（逐条淡入或直接显示）
  const cluesEl = document.getElementById('clues')!;
  cluesEl.hidden = false;
  cluesEl.innerHTML = `<h2 style="color:#b8b8b8">照片里的不对劲</h2><ul>` +
    ENDING.photoDetails.map((d) => `<li class="readable">${escapeHtml(d)}</li>`).join('') +
    `</ul>`;

  // 再过一会儿显示阶段结束页
  setTimeout(() => {
    (document.getElementById('scene') as HTMLElement).hidden = true;
    const end = document.getElementById('endPage')!;
    end.hidden = false;
    document.getElementById('endTitle')!.textContent = ENDING.stageTitle;
    document.getElementById('endSummary')!.textContent = ENDING.stageSummary;
  }, reduceMotion ? 400 : 2600);
}, totalDelay);
