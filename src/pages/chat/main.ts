/**
 * P03 虚构聊天"谛听"：沈苒最后正常消息、异常照片、失联时间、参会证尾号泄露。
 * 读完解锁 OFFLINE_TIME 等线索，开放 P04 资讯搜索。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import { discoverClue, unlock } from '@shared/progress';
import { CLUE } from '@data/clues';
import { CHAT } from '@data/content';

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

/** SVG 占位：走廊尽头的灭火器 + 对称菌斑（安静的不适，非吓人图） */
function moldPhotoSvg(): string {
  return `
  <svg class="photo-mold" width="280" height="180" viewBox="0 0 280 180" aria-label="走廊尽头墙根的对称菌斑照片">
    <rect width="280" height="180" fill="#1a1a1a"/>
    <!-- 走廊透视 -->
    <polygon points="0,0 280,0 180,90 100,90" fill="#232323"/>
    <polygon points="0,180 280,180 180,90 100,90" fill="#1c1c1c"/>
    <!-- 灭火器轮廓 -->
    <rect x="40" y="100" width="26" height="60" fill="#3a2a2a" stroke="#5a3a3a"/>
    <rect x="46" y="92" width="14" height="12" fill="#5a3a3a"/>
    <!-- 对称菌斑（左右镜像） -->
    <g fill="#cfc8b8" opacity="0.85">
      <ellipse cx="90" cy="150" rx="10" ry="5"/>
      <ellipse cx="190" cy="150" rx="10" ry="5"/>
      <ellipse cx="105" cy="160" rx="6" ry="3"/>
      <ellipse cx="175" cy="160" rx="6" ry="3"/>
      <ellipse cx="80" cy="158" rx="5" ry="2.5"/>
      <ellipse cx="200" cy="158" rx="5" ry="2.5"/>
    </g>
  </svg>`;
}

let html = '';
// 先放参会证尾号泄露（更早时间）
html += `
  <div class="chat-msg her">
    <div class="chat-time">${CHAT.credentialLeak.time}</div>
    <div class="bubble">${escapeHtml(CHAT.credentialLeak.text)}</div>
  </div>`;
// 再放失联前的消息序列
for (const m of CHAT.messages) {
  if ('photo' in m && m.photo) {
    html += `
      <div class="chat-msg her">
        <div class="chat-time">${m.time}</div>
        <div class="bubble">${moldPhotoSvg()}
          <div class="photo-stamp">IMG_20260620_201501.jpg</div>
        </div>
        <div class="bubble" style="margin-top:0.3em">${escapeHtml(CHAT.messages[CHAT.messages.indexOf(m)+1]?.text ?? '')}</div>
      </div>`;
  } else if (m.text && !m.text.startsWith('【图片】') && !/对称/.test(m.text) && !/拍清楚/.test(m.text)) {
    // 渲染纯文本消息（跳过与图片配套的"你看走廊尽头"这一条，因为它已被图片气泡涵盖下一条）
    // 这里简化：所有 text 都渲染，但避免重复
  }
}
// 简化：重新干净地渲染文本消息（避免上面逻辑重复）
html = `
  <div class="chat-msg her">
    <div class="chat-time">${CHAT.credentialLeak.time}</div>
    <div class="bubble">${escapeHtml(CHAT.credentialLeak.text)}</div>
  </div>`;

CHAT.messages.forEach((m, i) => {
  if (m.photo) {
    html += `
      <div class="chat-msg her">
        <div class="chat-time">${m.time}</div>
        <div class="bubble">${escapeHtml(m.text)}</div>
      </div>`;
    // 紧跟图片 + 下一句注释
    const next = CHAT.messages[i + 1];
    html += `
      <div class="chat-msg her">
        <div class="bubble">${moldPhotoSvg()}
          <div class="photo-stamp">IMG_20260620_201501.jpg · 走廊尽头</div>
        </div>
      </div>`;
    if (next && next.text) {
      html += `
        <div class="chat-msg her">
          <div class="bubble">${escapeHtml(next.text)}</div>
        </div>`;
    }
  } else if (i > 0 && CHAT.messages[i - 1].photo) {
    // 已被上面的 next 渲染，跳过
  } else {
    html += `
      <div class="chat-msg her">
        <div class="chat-time">${m.time}</div>
        <div class="bubble">${escapeHtml(m.text)}</div>
      </div>`;
  }
});

thread.innerHTML = html;

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
