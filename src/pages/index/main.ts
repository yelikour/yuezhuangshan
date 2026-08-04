/**
 * 全能导航首页（仿 2345.com 风格）—— 游戏的拟真入口。
 *
 * 设计意图：玩家一进来以为自己打开的是个普通导航站。
 * 游戏的真正入口伪装成：邮箱小部件的"未读邮件"、旅游分类里的"岳桩山生态景区"链接。
 * 体验设置（音量/减少动态/内容提醒）藏进右上角"设置"弹层，不打断沉浸感。
 */
import { loadState, hasSave, updateState } from '@shared/storage';
import { unlock, markVisited } from '@shared/progress';
import { setVolume, setMuted, setReduceMotion, setSubtitles, applyTheme } from '@ui/theme';
import { IMG } from '@data/assets';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

// 注入 favicon
(() => {
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.createElement('link');
  link.rel = 'icon';
  link.href = IMG.favicon;
  if (!link.parentElement) document.head.appendChild(link);
})();

/** 导航数据：大部分是无害占位，少数是游戏内站点（带 game: true） */
interface NavLink {
  name: string;
  icon: string;       // 单字符 emoji/字母做图标底
  color: string;      // 图标背景色
  url?: string;       // 外部占位（不真正跳转，仅装饰）
  game?: boolean;     // 是否为游戏内入口
  badge?: number;     // 红点
}

const NAV: Record<string, NavLink[]> = {
  // 常用网站（全是无害占位）
  common: [
    { name: '搜索引擎', icon: '🔍', color: '#2b6cff', url: '#' },
    { name: '云雁邮', icon: '✉', color: '#ff8a00', game: true, badge: 1 },
    { name: '导航犬', icon: '🐕', color: '#52c41a', url: '#' },
    { name: '网址大全', icon: '🌐', color: '#13c2c2', url: '#' },
    { name: '万年历', icon: '📅', color: '#722ed1', url: '#' },
    { name: '天气预报', icon: '🌤', color: '#1890ff', url: '#' },
  ],
  // 新闻资讯（游戏入口藏这里：岳桩资讯）
  news: [
    { name: '岳桩资讯', icon: '📰', color: '#cf1322', game: true },
    { name: '头条热点', icon: '🔴', color: '#f5222d', url: '#' },
    { name: '国内要闻', icon: '📢', color: '#fa541c', url: '#' },
    { name: '科技频道', icon: '💡', color: '#1890ff', url: '#' },
    { name: '财经动态', icon: '📈', color: '#52c41a', url: '#' },
    { name: '体育赛事', icon: '⚽', color: '#fa8c16', url: '#' },
  ],
  // 影视娱乐
  ent: [
    { name: '在线影视', icon: '🎬', color: '#cf1322', url: '#' },
    { name: '音乐盒子', icon: '🎵', color: '#722ed1', url: '#' },
    { name: '小说阅读', icon: '📖', color: '#13c2c2', url: '#' },
    { name: '谛听', icon: '💬', color: '#52c41a', game: true },
    { name: '搞笑段子', icon: '😄', color: '#faad14', url: '#' },
    { name: '直播平台', icon: '📡', color: '#eb2f96', url: '#' },
  ],
  // 生活服务
  life: [
    { name: '火车票', icon: '🚄', color: '#1890ff', url: '#' },
    { name: '酒店预订', icon: '🏨', color: '#fa541c', url: '#' },
    { name: '外卖美食', icon: '🍜', color: '#fa8c16', url: '#' },
    { name: '招聘求职', icon: '💼', color: '#13c2c2', url: '#' },
    { name: '房产家居', icon: '🏠', color: '#52c41a', url: '#' },
    { name: '医院挂号', icon: '⚕', color: '#f5222d', url: '#' },
  ],
  // 旅游出行（游戏主入口：岳桩山景区）
  travel: [
    { name: '岳桩山景区', icon: '⛰', color: '#389e0d', game: true },
    { name: '游记攻略', icon: '🗺', color: '#13c2c2', url: '#' },
    { name: '机票查询', icon: '✈', color: '#1890ff', url: '#' },
    { name: '周边游', icon: '🧳', color: '#fa8c16', url: '#' },
    { name: '景点门票', icon: '🎫', color: '#cf1322', url: '#' },
    { name: '户外装备', icon: '🏕', color: '#52c41a', url: '#' },
  ],
  // 小游戏（占位，不连游戏）
  game: [
    { name: '益智小游戏', icon: '🧩', color: '#722ed1', url: '#' },
    { name: '棋牌世界', icon: '🃏', color: '#cf1322', url: '#' },
    { name: '消除达人', icon: '💎', color: '#13c2c2', url: '#' },
    { name: '猜谜语', icon: '❓', color: '#faad14', url: '#' },
    { name: '反应测试', icon: '⚡', color: '#1890ff', url: '#' },
    { name: '更多游戏', icon: '🎮', color: '#eb2f96', url: '#' },
  ],
};

const SECTION_MAP: Record<string, string> = {
  common: 'navCommon', news: 'navNews', ent: 'navEnt',
  life: 'navLife', travel: 'navTravel', game: 'navGame',
};

/** 游戏内入口 → 对应页面 URL */
function gameUrl(name: string): string {
  switch (name) {
    case '云雁邮': return './src/pages/mail/index.html';
    case '岳桩资讯': return './src/pages/news/index.html';
    case '谛听': return './src/pages/chat/index.html';
    case '岳桩山景区': return './src/pages/scenic/index.html';
    default: return './src/pages/mail/index.html';
  }
}

/** 智能跳转：有存档则按最近进度，否则从所选入口进 */
function enterGame(fromEntry?: string): void {
  unlock('P01');
  markVisited('index');
  applyTheme();
  const s = loadState();
  // 若玩家选了具体入口且该入口已解锁，优先从入口进（增强自由度）
  if (fromEntry) {
    location.href = gameUrl(fromEntry);
    return;
  }
  // 否则按最近进度继续
  const order: Array<{ node: string; url: string }> = [
    { node: 'P07', url: './src/pages/ending/index.html' },
    { node: 'P06', url: './src/pages/backend/index.html' },
    { node: 'P05', url: './src/pages/backend/index.html' },
    { node: 'P04', url: './src/pages/news/index.html' },
    { node: 'P03', url: './src/pages/chat/index.html' },
    { node: 'P02', url: './src/pages/scenic/index.html' },
    { node: 'P01', url: './src/pages/mail/index.html' },
  ];
  const target = order.find((o) => s.unlockedNodes.includes(o.node as any));
  location.href = target?.url ?? './src/pages/mail/index.html';
}

function renderNav(): void {
  for (const [key, containerId] of Object.entries(SECTION_MAP)) {
    const container = document.getElementById(containerId);
    if (!container) continue;
    container.innerHTML = NAV[key].map((link) => {
      const isGame = link.game;
      // 游戏内入口：若该节点未解锁，仍可点击（邮箱/景区默认开放），其它按门控
      const href = isGame ? gameUrl(link.name) : '#';
      return `<a class="nav-item" data-name="${escapeHtml(link.name)}" data-game="${isGame ? '1' : ''}" href="${href}">
        <div class="nav-icon" style="background:${link.color}">${link.icon}</div>
        <div class="nav-name">${escapeHtml(link.name)}</div>
        ${link.badge ? `<span class="nav-badge">${link.badge}</span>` : ''}
      </a>`;
    }).join('');
  }

  // 绑定点击
  document.querySelectorAll<HTMLElement>('.nav-item').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (el.dataset.game === '1') {
        // 游戏入口：走 enterGame，避免直接跳到未解锁页时缺乏门控反馈
        // （各页面自身也有门控，这里仅决定起点）
        const name = el.dataset.name!;
        // 景区/邮箱默认开放；聊天需读完邀请函；资讯需读完失联——
        // 但首页允许玩家尝试，由目标页面给出"暂无法访问"提示，符合拟真
        e.preventDefault();
        enterGame(name);
      } else {
        // 占位外链：不真正跳转，给点反馈
        e.preventDefault();
        flashSearch(el.dataset.name ?? '');
      }
    });
  });
}

/** 占位外链的装饰性反馈：把网站名塞进搜索框假装在搜 */
function flashSearch(key: string): void {
  const input = $('searchInput') as HTMLInputElement;
  input.value = key;
  input.focus();
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

/** 顶部搜索：纯装饰，不真正外连 */
function setupSearch(): void {
  const tabs = document.querySelectorAll('.search-tab');
  tabs.forEach((t) => t.addEventListener('click', () => {
    tabs.forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
  }));
  const doSearch = () => {
    const q = ($('searchInput') as HTMLInputElement).value.trim();
    if (!q) return;
    // 若搜的是"岳桩山"，悄悄引导进景区（沉浸式钩子）
    if (/岳桩/.test(q)) {
      enterGame('岳桩山景区');
      return;
    }
    alert(`搜索：${q}\n（本站为虚构导航站，不提供真实搜索结果）`);
  };
  $('searchBtn').addEventListener('click', doSearch);
  $('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
  // 热搜词
  document.querySelectorAll('.search-hot a').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      ($('searchInput') as HTMLInputElement).value = (a as HTMLElement).dataset.key || '';
    });
  });
}

/** 邮箱小部件：未读提示 + 点击进游戏 */
function setupMailWidget(): void {
  const s = loadState();
  const hasProgress = hasSave() && s.unlockedNodes.length > 1;
  const unread = $('unreadCount');
  const widget = $('mailWidget');
  const link = $('mailLink');

  if (hasProgress) {
    // 老玩家：未读归零，提示继续
    unread.textContent = '0';
    widget.classList.remove('has-unread');
    $('mailStatus').innerHTML = `云雁邮 · 已读 · 存档可继续`;
    link.textContent = '继续上次调查 →';
    link.addEventListener('click', (e) => { e.preventDefault(); enterGame(); });
  } else {
    // 新玩家：1 封未读邀请函
    widget.classList.add('has-unread');
    link.addEventListener('click', (e) => { e.preventDefault(); enterGame('云雁邮'); });
  }
}

/** 日期小部件 */
function setupDate(): void {
  const now = new Date();
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()];
  $('dateDay').textContent = `${now.getMonth() + 1}月${now.getDate()}日 ${week}`;
  // 虚构农历，仅装饰
  $('dateLunar').textContent = '丙午年 · 六月廿一';
}

/* ===== 设置弹层 ===== */
function setupSettings(): void {
  const mask = $('settingsMask');
  const open = () => { renderSettings(); mask.hidden = false; };
  const close = () => { mask.hidden = true; };
  $('openSettings').addEventListener('click', (e) => { e.preventDefault(); open(); });
  $('openSettings2').addEventListener('click', (e) => { e.preventDefault(); open(); });
  $('aboutLink').addEventListener('click', (e) => {
    e.preventDefault();
    alert('导航犬 Daohan v0.1\n\n一个虚构的上网导航站，所有链接均为演示内容。\n本站为《岳桩山》ARG 的拟真入口。');
  });
  $('closeSettings').addEventListener('click', close);
  mask.addEventListener('click', (e) => { if (e.target === mask) close(); });

  // 设置控件
  $('vol').addEventListener('input', (e) => {
    const v = Number((e.target as HTMLInputElement).value);
    setVolume(v);
    $('volVal').textContent = `${Math.round(v * 100)}%`;
  });
  $('mute').addEventListener('change', (e) => setMuted((e.target as HTMLInputElement).checked));
  $('rm').addEventListener('change', (e) => setReduceMotion((e.target as HTMLInputElement).checked));
  $('sub').addEventListener('change', (e) => setSubtitles((e.target as HTMLInputElement).checked));

  $('restartBtn').addEventListener('click', () => {
    if (!confirm('确定清除当前存档并重新开始？所有进度将丢失。')) return;
    localStorage.removeItem('yueZhuangShan_save_v1');
    updateState(() => {});
    renderSettings();
    setupMailWidget();
    $('saveStatus').textContent = '已清除存档。';
    applyTheme();
  });
}

function renderSettings(): void {
  const s = loadState();
  ($('vol') as HTMLInputElement).value = String(s.volume);
  $('volVal').textContent = `${Math.round(s.volume * 100)}%`;
  ($('mute') as HTMLInputElement).checked = s.muted;
  ($('rm') as HTMLInputElement).checked = s.reduceMotion;
  ($('sub') as HTMLInputElement).checked = s.subtitles;
  $('saveStatus').textContent = hasSave()
    ? `存档：${s.unlockedNodes.length} 节点 / ${s.discoveredClues.length} 线索`
    : '尚无存档。';
}

// 初始化
renderNav();
setupSearch();
setupMailWidget();
setupDate();
setupSettings();
applyTheme();
