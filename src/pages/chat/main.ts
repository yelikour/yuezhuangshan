/**
 * P03 虚构聊天"谛听"：沈苒最后正常消息、异常照片、失联时间、参会证尾号泄露。
 * 读完解锁 OFFLINE_TIME 等线索，开放 P04 资讯搜索。
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

const thread = document.getElementById('thread')!;

/** 走廊尽头对称菌斑照片（真实素材） */
function moldPhotoHtml(): string {
  return `<img class="photo-mold" src="${IMG.corridorMold}" alt="走廊尽头墙根的对称菌斑照片" width="280" />`;
}

/** 床头柜水杯照片（真实素材，配合"水有怪味"消息） */
function waterPhotoHtml(): string {
  return `<img class="photo-mold" src="${IMG.hotelWater}" alt="床头柜上一杯微微浑浊的水" width="280" />`;
}

let html = '';

// 1) 参会证尾号泄露（最早一条）
html += `
  <div class="chat-msg her">
    <div class="chat-time">${CHAT.credentialLeak.time}</div>
    <div class="bubble">${escapeHtml(CHAT.credentialLeak.text)}</div>
  </div>`;

// 2) 失联前消息序列：水杯照 + 菌斑照分别插入对应位置
CHAT.messages.forEach((m, i) => {
  // 19:42 "饮用水怪味" —— 配一张水杯照
  if (m.text.includes('怪味')) {
    html += `
      <div class="chat-msg her">
        <div class="chat-time">${m.time}</div>
        <div class="bubble">${escapeHtml(m.text)}</div>
        <div class="bubble" style="margin-top:0.3em">${waterPhotoHtml()}
          <div class="photo-stamp">IMG_20260620_194205.jpg · 房间水杯</div>
        </div>
      </div>`;
    return;
  }
  // 20:15 "【图片】你看走廊尽头" —— 配菌斑照 + 下一条"对称"说明
  if (m.photo) {
    const next = CHAT.messages[i + 1];
    html += `
      <div class="chat-msg her">
        <div class="chat-time">${m.time}</div>
        <div class="bubble">${escapeHtml(m.text)}</div>
      </div>
      <div class="chat-msg her">
        <div class="bubble">${moldPhotoHtml()}
          <div class="photo-stamp">IMG_20260620_201501.jpg · 走廊尽头</div>
        </div>
      </div>`;
    if (next && next.text) {
      html += `
        <div class="chat-msg her">
          <div class="bubble">${escapeHtml(next.text)}</div>
        </div>`;
    }
    return;
  }
  // 被菌斑照"下一条"消费掉的消息跳过
  if (i > 0 && CHAT.messages[i - 1].photo) return;
  // 其余普通文本消息
  html += `
    <div class="chat-msg her">
      <div class="chat-time">${m.time}</div>
      <div class="bubble">${escapeHtml(m.text)}</div>
    </div>`;
});

thread.innerHTML = html;

// 菌斑照片是核心线索，渲染后来一声水滴回声（配合"走廊尽头"氛围，默认静音则无声仅字幕）
setTimeout(() => playSfxWithSubtitle('waterDrip', { volumeScale: 0.6 }), 500);

// 解锁线索
discoverClue(CLUE.CREDENTIAL_HINT); // 聊天里泄露的尾号（双线索之二）
discoverClue(CLUE.LAST_NORMAL_MSG);
discoverClue(CLUE.ABNORMAL_PHOTO);
discoverClue(CLUE.OFFLINE_TIME);
unlock('P04'); // 读完沈苒失联 → 开放资讯搜索

document.getElementById('afterRead')!.hidden = false;
const sum = document.getElementById('clueSummary')!;
sum.innerHTML = `
  <li>饮用水怪味（19:42）—— 山庄饮用水可能被动过手脚。</li>
  <li>墙根对称菌斑（20:15 照片）—— 不符合自然真菌分布。</li>
  <li>21:03 "我去走廊尽头看看"—— 此后离线。</li>
  <li>参会证尾号 0427（19:15 消息）—— 登录后台可能用得上。</li>
`;

// 历史记录展开
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
