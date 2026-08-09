/**
 * 架构合规测试 —— 守卫 AGENTS.md 铁律。
 *
 * 铁律#1：剧情文案集中在 src/data/content.ts，不在 HTML 硬编码大段剧情正文。
 * 本测试防止 chat/index.html 等页面再次直接写入剧情引导文案。
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** 读取页面 HTML 源码（相对项目根） */
function readPage(rel: string): string {
  return readFileSync(resolve(__dirname, '..', rel), 'utf-8');
}

/**
 * 架构守卫（结构性规则，不依赖具体文案措辞）——守卫 AGENTS.md 铁律#1：
 *   剧情文案集中在 src/data/content.ts，HTML 只保留结构容器，由 main.ts 注入。
 *
 * 守卫策略（三段式，任一被破坏都能检出）：
 *   ① content.ts 有引导文案（CHAT.afterDialogHint 存在且非空）；
 *   ② chat/index.html 保留空容器 #afterDialogHint；
 *   ③ chat/main.ts 负责注入（引用 afterDialogHint）；
 *   ④ chat/index.html 不含 content.ts 里的引导原文（动态比对，文案怎么改都守得住）。
 */
import { CHAT, MAIL } from '@data/content';

describe('架构铁律#1：剧情文案不硬编码在 HTML', () => {
  it('content.ts 提供 P03→P04 引导文案（CHAT.afterDialogHint 非空）', () => {
    expect(CHAT.afterDialogHint, 'CHAT.afterDialogHint 应为非空字符串').toBeTruthy();
    expect(CHAT.afterDialogHint.length).toBeGreaterThan(10);
  });

  it('chat/index.html 保留空容器 #afterDialogHint（不内联正文）', () => {
    const html = readPage('src/pages/chat/index.html');
    expect(html, '应保留 #afterDialogHint 容器').toContain('id="afterDialogHint"');
  });

  it('chat/main.ts 负责注入 afterDialogHint（引用该 id 与 CHAT 字段）', () => {
    const ts = readPage('src/pages/chat/main.ts');
    expect(ts, 'main.ts 应 getElementById(afterDialogHint)').toContain("getElementById('afterDialogHint')");
    expect(ts, 'main.ts 应引用 CHAT.afterDialogHint').toContain('CHAT.afterDialogHint');
  });

  it('chat/index.html 不含 CHAT.afterDialogHint 的原文（动态比对，非硬编码字符串）', () => {
    const html = readPage('src/pages/chat/index.html');
    // 取文案中一个有辨识度的片段（末尾 12 字）做动态比对，
    // 这样无论文案怎么改，只要正文回到 HTML 就会被检出。
    const tail = CHAT.afterDialogHint.slice(-12);
    expect(
      html,
      `chat/index.html 不得包含 CHAT.afterDialogHint 原文片段 "${tail}"，应由 main.ts 注入`,
    ).not.toContain(tail);
  });

  it('构建产物 dist/src/pages/chat/index.html 也不内联剧情文案（防 vite 插件意外内联）', () => {
    // CI 环境（GitHub Actions 默认设 CI=true）下，dist 缺失必须失败，
    // 否则本守卫会被静默跳过，失去拦截能力。
    // 本地开发（无 CI 环境变量）允许跳过，方便不 build 就跑测试。
    let distHtml: string;
    try {
      distHtml = readPage('dist/src/pages/chat/index.html');
    } catch {
      if (process.env.CI) {
        throw new Error(
          'CI 环境下 dist/src/pages/chat/index.html 必须存在（build 应先于 test）。' +
          '若此断言失败，检查 .github/workflows/deploy.yml 的步骤顺序是否为 typecheck→build→test。',
        );
      }
      return; // 本地无 dist，跳过
    }
    const tail = CHAT.afterDialogHint.slice(-12);
    expect(
      distHtml,
      `构建产物不得内联剧情文案 "${tail}"，应由 JS 运行时注入`,
    ).not.toContain(tail);
  });
});

/**
 * 引导文案禁词守卫 —— 新增的剧情化引导不得出现答案性词语或元叙述。
 * 覆盖 P01→P02（邀请函）和 P03→P04（聊天结束引导）。
 * 答案性词来源：SEARCH_P02_KEYWORDS / SEARCH_P04_KEYWORDS / ANSWERS / CLUE.P11 宠物名。
 */
describe('引导文案不泄露答案、不含元叙述', () => {
  // 禁词：P02/P04 答案性命中词、P11 宠物名、口令相关元词
  const FORBIDDEN_IN_GUIDANCE = [
    '岳圣桩', // P02 答案
    '失踪', '失足', '周某', // P04 答案
    '芝麻', // P11 答案
    '0427ywyxxsc', '0427', 'ywyxxsc', // P05 口令
    'lxzb07', 'lxz', // P08 口令
    'protagonist@yuezhuangshan-conf.cn', // 账号
    '下一步', '点击', '前往 P0', '去 P0', // 元叙述
  ];

  it('P03→P04 引导（CHAT.afterDialogHint）不含禁词', () => {
    const hint = CHAT.afterDialogHint;
    FORBIDDEN_IN_GUIDANCE.forEach((bad) => {
      expect(hint, `CHAT.afterDialogHint 不得包含 "${bad}"`).not.toContain(bad);
    });
  });

  it('P01→P02 引导（邀请函正文）不含禁词', () => {
    // 邀请函正文应在 MAIL.invite.body
    const body = MAIL.invite.body;
    FORBIDDEN_IN_GUIDANCE.forEach((bad) => {
      expect(body, `邀请函正文不得包含 "${bad}"`).not.toContain(bad);
    });
    // 确认引导句确实存在（用"岳桩山生态景区"这个非答案性地名）
    expect(body).toContain('岳桩山生态景区');
  });
});
