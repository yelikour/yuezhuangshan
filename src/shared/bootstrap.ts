/**
 * 每个站点页面启动时的公共引导：应用主题、标记访问、渲染虚构浏览器条。
 * 各页面 TS 调用 bootstrap({...}) 即可。
 */
import { applyTheme } from '@ui/theme';
import { markVisited, isUnlocked } from './progress';
import type { PageId, NodeId } from './state';
import { loadState } from './storage';
import { IMG } from '@data/assets';

/** 动态注入 favicon（所有页面共享） */
function injectFavicon(): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = IMG.favicon;
}

export interface BootstrapOptions {
  pageId: PageId;
  /** 站点显示名（虚构浏览器条用） */
  brand: string;
  /** 虚构域名 */
  domain: string;
  /** 皮肤 class */
  skin: 'mail' | 'scenic' | 'chat' | 'news' | 'backend' | 'ending' | 'system' | 'hezong' | 'forum';
  /** 该页面所属节点（若未解锁则跳回入口） */
  node: NodeId;
  /** 可选：入口前的提示文案 */
  accessDeniedHint?: string;
}

/** 渲染顶部虚构浏览器条 */
function renderFauxBar(brand: string, domain: string): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'faux-bar';
  bar.innerHTML = `
    <span class="faux-brand">${escapeHtml(brand)}</span>
    <span class="faux-url">https://${escapeHtml(domain)}/</span>
    <a class="btn" href="${rel('index')}">返回导航首页</a>
  `;
  return bar;
}

/** 相对路径回到站点根的 index.html */
function rel(page: 'index' | 'mail' | 'scenic' | 'chat' | 'news' | 'backend' | 'ending'): string {
  const map: Record<string, string> = {
    // 从 src/pages/xxx/ 回到项目根 index.html 需退 3 级：xxx→pages→src→根
    index: '../../../index.html',
    mail: '../mail/index.html',
    scenic: '../scenic/index.html',
    chat: '../chat/index.html',
    news: '../news/index.html',
    backend: '../backend/index.html',
    ending: '../ending/index.html',
  };
  return map[page];
}

export function relTo(target: 'index' | 'mail' | 'scenic' | 'chat' | 'news' | 'backend' | 'ending'): string {
  return rel(target);
}

export function bootstrap(opts: BootstrapOptions): { denied: boolean } {
  applyTheme();
  injectFavicon();
  document.body.classList.add(`skin-${opts.skin}`);

  // 访问校验：未解锁则不展示内容（但仍渲染条 + 提示），避免硬墙造成"无提示谜题"
  const denied = !isUnlocked(opts.node);
  const bar = renderFauxBar(opts.brand, opts.domain);
  document.body.prepend(bar);

  if (denied) {
    const deny = document.createElement('div');
    deny.className = 'page';
    deny.innerHTML = `
      <h1>暂无法访问</h1>
      <p>${escapeHtml(opts.accessDeniedHint ?? '你还没有找到通往这里的入口。回到之前的线索继续调查。')}</p>
      <p><a class="btn" href="${rel('index')}">返回导航首页</a></p>
    `;
    document.body.appendChild(deny);
    return { denied: true };
  }

  markVisited(opts.pageId);
  return { denied: false };
}

/** 通用 HTML 转义，避免文案里的 < > 破坏结构 */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  );
}

/** 重新读取设置（供需要响应设置变化的页面） */
export function getState() {
  return loadState();
}
