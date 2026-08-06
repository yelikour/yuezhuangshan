/**
 * P05 会议后台登录（口令推理） + P06 房卡记录（时间线矛盾#2）。
 * 登录成功 → 解锁记录视图 → 发现房卡在失联后仍被刷于维护通道 → 开放 P07 结尾。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import {
  discoverClue, unlock, markSolved, recordAttempt, isUnlocked, PUZZLE,
} from '@shared/progress';
import { checkPassword } from '@shared/normalize';
import { ANSWERS, KEYCARD_LOGS, HINTS, CLUE } from '@data/clues';
import { BACKEND } from '@data/content';
import { requestHint, visibleHints } from '@shared/hints';
import { IMG } from '@data/assets';
import { playSfxWithSubtitle } from '@shared/sfx';

const { denied } = bootstrap({
  pageId: 'backend', brand: '研讨会工作台', domain: 'conf-backend.yuezhuangshan.cn',
  skin: 'backend', node: 'P05',
  accessDeniedHint: '工作台需要授权访问。先在岳桩资讯找到那篇被改的报道。',
});
if (denied) throw new Error('access denied');

const root = document.getElementById('root')!;
root.hidden = false;

document.getElementById('welcome')!.textContent = BACKEND.welcome;
document.getElementById('loginHint')!.textContent = BACKEND.loginHint;
document.getElementById('recordsTitle')!.textContent = BACKEND.recordsTitle;

const accountEl = document.getElementById('account') as HTMLInputElement;
const pwdEl = document.getElementById('password') as HTMLInputElement;
const errEl = document.getElementById('err')!;
const hintArea = document.getElementById('hintArea')!;

document.getElementById('loginBtn')!.addEventListener('click', tryLogin);
pwdEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryLogin(); });

function tryLogin(): void {
  const acc = accountEl.value;
  const pwd = pwdEl.value;
  errEl.textContent = '';

  if (!acc.trim() || !pwd.trim()) {
    errEl.textContent = '请填写账号与口令。';
    return;
  }
  // 账号与口令都必须正确（均走标准化）
  const accOk = checkPassword(acc, ANSWERS.LOGIN_ACCOUNT);
  const pwdOk = checkPassword(pwd, ANSWERS.LOGIN_PASSWORD);
  if (!accOk || !pwdOk) {
    const n = recordAttempt(PUZZLE.LOGIN_P05);
    errEl.textContent = `账号或口令错误（第 ${n} 次）。`;
    // 自动升级提示（getHintLevel 会综合 attempts）
    requestAutoHintIfStuck();
    return;
  }
  // 登录成功
  markSolved(PUZZLE.LOGIN_P05);
  unlock('P06');
  showRecords();
}

function requestAutoHintIfStuck(): void {
  renderHints();
}

document.getElementById('hintBtn')!.addEventListener('click', () => {
  requestHint(PUZZLE.LOGIN_P05);
  renderHints();
});

function renderHints(): void {
  const hs = visibleHints(PUZZLE.LOGIN_P05, HINTS);
  hintArea.innerHTML = hs.length
    ? `<div class="hint-box"><span class="hint-lvl">提示 L${hs.length}</span><ul>${hs.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul></div>`
    : '';
}

function showRecords(playReveal = true): void {
  document.getElementById('loginView')!.hidden = true;
  const rv = document.getElementById('recordsView')!;
  rv.hidden = false;

  const tbl = document.getElementById('logsTable')!;
  tbl.innerHTML = `
    <thead><tr><th>时间</th><th>闸机</th><th>结果</th><th>备注</th></tr></thead>
    <tbody>
      ${KEYCARD_LOGS.map((l) => `
        <tr class="${l.note?.startsWith('⚠') ? 'warn' : ''}">
          <td>${escapeHtml(l.time)}</td>
          <td>${escapeHtml(l.gate)}</td>
          <td>${escapeHtml(l.result)}</td>
          <td>${escapeHtml(l.note ?? '')}</td>
        </tr>`).join('')}
    </tbody>`;

  discoverClue(CLUE.KEYCARD_MAINTENANCE);
  unlock('P07');
  // 显示关联监控截图
  (document.getElementById('surveillanceCap') as HTMLElement).hidden = false;
  (document.getElementById('labImg') as HTMLImageElement).src = IMG.labBlur;
  (document.getElementById('afterRead') as HTMLElement).hidden = false;
  // "手机震了一下"——播放震动音效（稍延迟，让玩家先读到房卡记录）
  if (playReveal) {
    setTimeout(() => playSfxWithSubtitle('phoneBuzz', { volumeScale: 0.7 }), 1200);
  }
}

// 存档后重新进入后台，直接恢复已登录的记录视图，不要求玩家重复输入口令。
if (isUnlocked('P06')) showRecords(false);
