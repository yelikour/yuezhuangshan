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
import { GAME_CLOCK } from '@data/content';

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
  // 岳桩山资料库（游戏内站点集中入口）
  yzs: [
    { name: '岳桩山景区', icon: '⛰', color: '#389e0d', game: true },
    { name: '云雁邮', icon: '✉', color: '#ff8a00', game: true, badge: 1 },
    { name: '谛听', icon: '💬', color: '#52c41a', game: true },
    { name: '岳桩资讯', icon: '📰', color: '#cf1322', game: true },
    { name: '研讨会工作台', icon: '🖥', color: '#722ed1', game: true },
    { name: '实验室内网', icon: '⚗', color: '#13c2c2', game: true },
    { name: '岳桩村论坛', icon: '🏡', color: '#eb2f96', game: true },
    { name: '合奘教', icon: '🕯', color: '#8a6d3b', game: true },
  ],
  // 常用网站
  common: [
    { name: '搜索引擎', icon: '🔍', color: '#2b6cff', url: 'https://www.baidu.com' },
    { name: '导航犬', icon: '🐕', color: '#52c41a', url: 'https://www.hao123.com' },
    { name: '网址大全', icon: '🌐', color: '#13c2c2', url: 'https://www.2345.com' },
    { name: '万年历', icon: '📅', color: '#722ed1', url: 'https://wannianli.tianqi.com' },
    { name: '天气预报', icon: '🌤', color: '#1890ff', url: 'https://weather.cma.cn' },
    { name: '在线翻译', icon: '🌐', color: '#fa541c', url: 'https://fanyi.baidu.com' },
  ],
  // 新闻资讯
  news: [
    { name: '头条热点', icon: '🔴', color: '#f5222d', url: 'https://www.toutiao.com' },
    { name: '国内要闻', icon: '📢', color: '#fa541c', url: 'https://news.sina.com.cn' },
    { name: '科技频道', icon: '💡', color: '#1890ff', url: 'https://www.36kr.com' },
    { name: '财经动态', icon: '📈', color: '#52c41a', url: 'https://finance.eastmoney.com' },
    { name: '体育赛事', icon: '⚽', color: '#fa8c16', url: 'https://sports.sina.com.cn' },
    { name: '国际时讯', icon: '🌍', color: '#13c2c2', url: 'https://news.ifeng.com' },
  ],
  // 影视娱乐
  ent: [
    { name: '在线影视', icon: '🎬', color: '#cf1322', url: 'https://www.bilibili.com' },
    { name: '音乐盒子', icon: '🎵', color: '#722ed1', url: 'https://music.163.com' },
    { name: '小说阅读', icon: '📖', color: '#13c2c2', url: 'https://www.qidian.com' },
    { name: '搞笑段子', icon: '😄', color: '#faad14', url: 'https://www.qiushibaike.com' },
    { name: '直播平台', icon: '📡', color: '#eb2f96', url: 'https://live.bilibili.com' },
    { name: '短视频', icon: '📱', color: '#fa541c', url: 'https://www.douyin.com' },
  ],
  // 生活服务
  life: [
    { name: '火车票', icon: '🚄', color: '#1890ff', url: 'https://www.12306.cn' },
    { name: '酒店预订', icon: '🏨', color: '#fa541c', url: 'https://hotels.ctrip.com' },
    { name: '外卖美食', icon: '🍜', color: '#fa8c16', url: 'https://www.meituan.com' },
    { name: '招聘求职', icon: '💼', color: '#13c2c2', url: 'https://www.zhipin.com' },
    { name: '房产家居', icon: '🏠', color: '#52c41a', url: 'https://www.lianjia.com' },
    { name: '医院挂号', icon: '⚕', color: '#f5222d', url: 'https://www.guahao.com' },
  ],
  // 旅游出行
  travel: [
    { name: '游记攻略', icon: '🗺', color: '#13c2c2', url: 'https://www.mafengwo.cn' },
    { name: '机票查询', icon: '✈', color: '#1890ff', url: 'https://flights.ctrip.com' },
    { name: '酒店预订', icon: '🏨', color: '#fa541c', url: 'https://hotels.ctrip.com' },
    { name: '周边游', icon: '🧳', color: '#fa8c16', url: 'https://you.ctrip.com' },
    { name: '景点门票', icon: '🎫', color: '#cf1322', url: 'https://piao.ctrip.com' },
    { name: '户外装备', icon: '🏕', color: '#52c41a', url: 'https://www.8264.com' },
  ],
  // 小游戏
  game: [
    { name: '益智小游戏', icon: '🧩', color: '#722ed1', url: 'https://www.4399.com' },
    { name: '棋牌世界', icon: '🃏', color: '#cf1322', url: 'https://www.17173.com' },
    { name: '消除达人', icon: '💎', color: '#13c2c2', url: 'https://www.7k7k.com' },
    { name: '猜谜语', icon: '❓', color: '#faad14', url: 'https://zhidao.baidu.com' },
    { name: '反应测试', icon: '⚡', color: '#1890ff', url: 'https://www.4399.com/flash' },
    { name: '更多游戏', icon: '🎮', color: '#eb2f96', url: 'https://www.3dmgame.com' },
  ],
};

const SECTION_MAP: Record<string, string> = {
  yzs: 'navYzs',
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
    case '研讨会工作台': return './src/pages/backend/index.html';
    case '实验室内网': return './src/pages/lab/index.html';
    case '岳桩村论坛': return './src/pages/forum/index.html';
    case '合奘教': return './src/pages/hezong/index.html';
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
    { node: 'P12', url: './src/pages/ending2/index.html' },
    { node: 'P11', url: './src/pages/identify/index.html' },
    { node: 'P10', url: './src/pages/lab/index.html' },
    { node: 'P09', url: './src/pages/lab/index.html' },
    { node: 'P08', url: './src/pages/lab/index.html' },
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
      const href = isGame ? gameUrl(link.name) : link.url ?? '#';
      // 外部链接在新标签页打开；游戏入口当前页跳转
      const target = isGame ? '' : ' target="_blank" rel="noopener noreferrer"';
      return `<a class="nav-item" data-name="${escapeHtml(link.name)}" data-game="${isGame ? '1' : ''}" href="${href}"${target}>
        <div class="nav-icon" style="background:${link.color}">${link.icon}</div>
        <div class="nav-name">${escapeHtml(link.name)}</div>
        ${link.badge ? `<span class="nav-badge">${link.badge}</span>` : ''}
      </a>`;
    }).join('');
  }

  // 绑定点击：仅游戏入口需 JS 接管（外部链接交给浏览器原生跳转）
  document.querySelectorAll<HTMLElement>('.nav-item[data-game="1"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      enterGame(el.dataset.name!);
    });
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

/** 顶部搜索：纯装饰，不真正外连 */
/** 各搜索 tab 对应的真实搜索引擎模板（{q} 替换为关键词） */
const SEARCH_ENGINES: Record<string, string> = {
  web: 'https://www.baidu.com/s?wd={q}',
  news: 'https://www.toutiao.com/search/?keyword={q}',
  image: 'https://image.baidu.com/search/index?tn=baiduimage&word={q}',
  video: 'https://search.bilibili.com/all?keyword={q}',
  map: 'https://map.baidu.com/search/?querytype=s&wd={q}',
};

let currentEngine = 'web';

function setupSearch(): void {
  const tabs = document.querySelectorAll('.search-tab');
  tabs.forEach((t) => {
    t.addEventListener('click', () => {
      tabs.forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      currentEngine = (t as HTMLElement).dataset.engine || 'web';
    });
  });

  const doSearch = () => {
    const q = ($('searchInput') as HTMLInputElement).value.trim();
    if (!q) return;
    // 若搜的是"岳桩"，悄悄引导进景区（沉浸式钩子，当前页跳转）
    if (/岳桩/.test(q)) {
      enterGame('岳桩山景区');
      return;
    }
    // 其余关键词跳真实搜索引擎（新标签页）
    const tpl = SEARCH_ENGINES[currentEngine] || SEARCH_ENGINES.web;
    window.open(tpl.replace('{q}', encodeURIComponent(q)), '_blank', 'noopener');
  };

  $('searchBtn').addEventListener('click', doSearch);
  $('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
  // 热搜词点击填入搜索框（不自动搜，让玩家自己点搜索）
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
    // 老玩家：未读归零，提示去收藏栏继续
    unread.textContent = '0';
    widget.classList.remove('has-unread');
    $('mailStatus').innerHTML = `云雁邮 · 已读`;
    link.textContent = '查看收件箱 →';
    link.addEventListener('click', (e) => { e.preventDefault(); enterGame('云雁邮'); });
  } else {
    // 新玩家：1 封未读邀请函，点击进邮箱
    widget.classList.add('has-unread');
    link.addEventListener('click', (e) => { e.preventDefault(); enterGame('云雁邮'); });
  }
}

/** 日期小部件 */
function setupDate(): void {
  $('dateDay').textContent = GAME_CLOCK.dateDay;
  $('dateLunar').textContent = GAME_CLOCK.dateLunar;
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

/** 收藏栏：根据玩家进度显示已解锁的游戏快捷入口 */
function setupBookmarks(): void {
  const s = loadState();
  const container = $('bookmarkItems')!;

  // 游戏节点 → 收藏栏入口（按流程顺序）
  const allBookmarks: Array<{ node: string; name: string; icon: string }> = [
    { node: 'P01', name: '云雁邮', icon: '✉' },
    { node: 'P02', name: '岳桩山景区', icon: '⛰' },
    { node: 'P03', name: '谛听', icon: '💬' },
    { node: 'P04', name: '岳桩资讯', icon: '📰' },
    { node: 'P08', name: '实验室内网', icon: '⚗' },
    { node: 'P12', name: '最终抉择', icon: '◉' },
  ];

  // 只显示已解锁的入口；若无进度（新玩家），显示"开始调查"引导
  const unlocked = allBookmarks.filter((b) => s.unlockedNodes.includes(b.node as any));

  if (unlocked.length === 0) {
    container.innerHTML = `<a class="bookmark-item bookmark-start" href="#" data-entry="云雁邮">
      <span class="bookmark-icon">▶</span> 开始调查
    </a>`;
  } else {
    container.innerHTML = unlocked.map((b) =>
      `<a class="bookmark-item" href="#" data-entry="${b.name}">
        <span class="bookmark-icon">${b.icon}</span> ${b.name}
      </a>`,
    ).join('');
  }

  // 绑定点击 → 进入对应游戏入口
  container.querySelectorAll<HTMLElement>('.bookmark-item').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const entry = el.dataset.entry!;
      if (entry === '最终抉择') {
        location.href = './src/pages/ending2/index.html';
      } else {
        enterGame(entry);
      }
    });
  });
}

// 初始化
renderNav();
setupSearch();
setupBookmarks();
setupMailWidget();
setupDate();
setupSettings();
applyTheme();
