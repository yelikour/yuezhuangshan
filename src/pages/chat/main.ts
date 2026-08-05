/**
 * P03 虚构聊天"谛听"：互动对话（玩家选选项推进）+ 含蓄备忘录 + 历史记录。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import { discoverClue, unlock } from '@shared/progress';
import { CLUE } from '@data/clues';
import { CHAT } from '@data/content';
import { IMG } from '@data/assets';
import { playSfxWithSubtitle } from '@shared/sfx';

const { denied } = bootstrap({
  pageId: 'chat', brand: '谛听', domain: 'diting.app', skin: 'chat', node: 'P03',
  accessDeniedHint: '聊天记录暂不可用。',
});
if (denied) throw new Error('access denied');

const root = document.getElementById('root')!;
root.hidden = false;

document.getElementById('gf')!.textContent = CHAT.girlfriendName;
document.getElementById('offline')!.textContent = CHAT.offlineSince;
document.getElementById('credTime')!.textContent = CHAT.credentialLeak.time;
document.getElementById('credText')!.textContent = CHAT.credentialLeak.text;

const dialogEl = document.getElementById('dialog')!;
const choicesEl = document.getElementById('choicesArea')!;
const memoArea = document.getElementById('memoArea')!;

/** 走廊尽头对称菌斑照片 */
function moldPhotoHtml(): string {
  return `<img class="photo-mold" src="${IMG.corridorMold}" alt="走廊尽头墙根的对称菌斑照片" width="280" />`;
}

/** 统一的对话节点类型（terminal 与 choices 二选一） */
interface DialogNode {
  her: Array<{ time: string; text: string; photo?: string }>;
  choices?: Array<{ text: string; next: string }>;
  terminal?: boolean;
}

/** 收集的疑点（用于备忘录，含蓄表述，不给结论） */
const doubts: string[] = [];

/** 渲染沈苒的一组消息 */
function appendHerMessages(nodeId: string): void {
  const node = (CHAT.dialog as Record<string, DialogNode>)[nodeId];
  if (!node) return;
  for (const m of node.her) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg her';
    let inner = `<div class="chat-time">${m.time}</div>`;
    inner += `<div class="bubble">${escapeHtml(m.text)}</div>`;
    // 菌斑照片
    if ('photo' in m && m.photo) {
      inner += `<div class="bubble" style="margin-top:0.3em">${moldPhotoHtml()}<div class="photo-stamp">IMG_20260620_201501.jpg · 走廊尽头</div></div>`;
    }
    msgDiv.innerHTML = inner;
    dialogEl.appendChild(msgDiv);
  }
  // 根据节点内容收集疑点（含蓄）
  collectDoubts(nodeId);
  dialogEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

/** 根据经过的节点，用含蓄措辞记录疑点 */
function collectDoubts(nodeId: string): void {
  const node = (CHAT.dialog as Record<string, DialogNode>)[nodeId];
  const fullText = node.her.map((m) => m.text).join('');
  if (fullText.includes('芝麻') && !doubts.find((d) => d.includes('芝麻'))) {
    doubts.push('芝麻。她出门前还在惦记那只猫。');
  }
  if (fullText.includes('怪味') && !doubts.find((d) => d.includes('水'))) {
    doubts.push('水有味道。她说像泡过什么东西。');
  }
  if (fullText.includes('右手') && !doubts.find((d) => d.includes('右手'))) {
    doubts.push('她用右手写字。这个习惯记得住。');
  }
  if (fullText.includes('对称') && !doubts.find((d) => d.includes('对称'))) {
    doubts.push('走廊尽头墙根的灰白菌斑，左右对称。她说"像神经"。');
  }
  if (fullText.includes('走廊尽头') && !doubts.find((d) => d.includes('21:03'))) {
    // 最后一段才记失联
  }
  if (nodeId === 'n6' && !doubts.find((d) => d.includes('21:03'))) {
    doubts.push('21:03，她说去走廊尽头看看。然后……就没有然后了。');
  }
}

/** 渲染选项 */
function showChoices(nodeId: string): void {
  const node = (CHAT.dialog as Record<string, DialogNode>)[nodeId];
  if (!node || node.terminal) {
    // 对话结束
    choicesEl.innerHTML = '';
    document.getElementById('dialogEnd')!.hidden = false;
    // 显示备忘录
    showMemo();
    // 解锁线索 + 后续节点
    discoverClue(CLUE.CREDENTIAL_HINT);
    discoverClue(CLUE.LAST_NORMAL_MSG);
    discoverClue(CLUE.ABNORMAL_PHOTO);
    discoverClue(CLUE.OFFLINE_TIME);
    unlock('P04');
    // 水滴音效
    setTimeout(() => playSfxWithSubtitle('waterDrip', { volumeScale: 0.6 }), 500);
    return;
  }
  choicesEl.innerHTML = `<div class="chat-choices">` +
    (node.choices ?? []).map((c) =>
      `<button class="chat-choice" data-next="${c.next}">${escapeHtml(c.text)}</button>`,
    ).join('') +
    `</div>`;
  choicesEl.querySelectorAll<HTMLElement>('.chat-choice').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.next!;
      choicesEl.innerHTML = ''; // 清空选项
      // 显示主角的回复
      const myMsg = document.createElement('div');
      myMsg.className = 'chat-msg me';
      myMsg.innerHTML = `<div class="bubble-me">${escapeHtml(btn.textContent || '')}</div>`;
      dialogEl.appendChild(myMsg);
      // 延迟显示沈苒的下一段（模拟对话节奏）
      setTimeout(() => {
        appendHerMessages(next);
        showChoices(next);
      }, 600);
    });
  });
}

/** 显示含蓄备忘录 */
function showMemo(): void {
  memoArea.hidden = false;
  const body = document.getElementById('memoBody')!;
  body.innerHTML = doubts.map((d) => `<div>· ${escapeHtml(d)}</div>`).join('');
}

// 历史记录
const historyArea = document.getElementById('historyArea')!;
const historyMsgs = document.getElementById('historyMsgs')!;
historyMsgs.innerHTML = CHAT.historyMessages.map((m) =>
  `<div class="chat-msg her">
    <div class="chat-time">${m.time}</div>
    <div class="bubble">${escapeHtml(m.text)}</div>
  </div>`,
).join('');
document.getElementById('toggleHistory')!.addEventListener('click', (e) => {
  const btn = e.target as HTMLElement;
  const shown = !historyArea.hidden;
  historyArea.hidden = shown;
  btn.textContent = shown ? '查看更早的记录 ▾' : '收起更早的记录 ▴';
});

// 启动互动对话
appendHerMessages(CHAT.dialogStart);
showChoices(CHAT.dialogStart);
