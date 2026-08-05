/**
 * 岳桩村论坛（SIDE_FORUM）：朴素 BBS，混合生活帖/求助帖/旧传闻。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import { FORUM_POSTS, type ForumPost } from '@data/content';

const { denied } = bootstrap({
  pageId: 'forum', brand: '岳桩村乡邻论坛', domain: 'yuezhuang-cun.cn',
  skin: 'forum', node: 'SIDE_FORUM',
  accessDeniedHint: '论坛需要先了解岳桩山的基本情况。',
});
if (denied) throw new Error('access denied');

const root = document.getElementById('root')!;
root.hidden = false;

const list = document.getElementById('forumList')!;
const detail = document.getElementById('forumDetail')!;
const searchInput = document.getElementById('forumSearch') as HTMLInputElement;

let currentFilter = '全部';

function render(posts: ForumPost[]): void {
  list.innerHTML = posts.map((p) =>
    `<li class="forum-item" data-id="${p.id}" tabindex="0" role="button">
      <span class="forum-cat">${escapeHtml(p.category)}</span>
      <span class="forum-title ${p.id === 'f2' ? 'key' : ''}">${escapeHtml(p.title)}</span>
      <span class="forum-meta">${escapeHtml(p.user)} · ${escapeHtml(p.date)}</span>
      <span class="forum-meta">${p.replies} 回复</span>
    </li>`,
  ).join('');
  list.querySelectorAll<HTMLElement>('.forum-item').forEach((el) => {
    const open = () => showPost(el.dataset.id!);
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
}

function showPost(id: string): void {
  const p = FORUM_POSTS.find((x) => x.id === id)!;
  list.hidden = true;
  detail.hidden = false;
  detail.innerHTML = `
    <div class="forum-detail">
      <button class="btn" id="backToList" style="float:right; color:#333; border-color:#999">返回列表</button>
      <h2>${escapeHtml(p.title)}</h2>
      <div class="meta">${escapeHtml(p.user)} · ${escapeHtml(p.date)} · 【${escapeHtml(p.category)}】 · ${p.replies} 回复</div>
      <div class="body">${escapeHtml(p.body ?? p.snippet)}</div>
      <hr style="margin:1em 0; border-color:#ddd" />
      <div style="font-size:13px; color:#999">— 本帖有 ${p.replies} 条回复，暂未显示 —</div>
    </div>`;
  document.getElementById('backToList')!.addEventListener('click', backToList);
  detail.scrollIntoView({ behavior: 'smooth' });
}

function backToList(): void {
  detail.hidden = true;
  list.hidden = false;
}

// 分类过滤
const cats = ['全部', ...Array.from(new Set(FORUM_POSTS.map((p) => p.category)))];
const filterEl = document.getElementById('forumFilter')!;
filterEl.innerHTML = cats.map((c) =>
  `<button class="btn forum-filter-btn ${c === '全部' ? 'active' : ''}" data-cat="${c}" style="color:#333; border-color:#bbb; font-size:13px; padding:3px 10px">${c}</button>`,
).join(' ');

function applyFilter(): void {
  const q = searchInput.value.trim().toLowerCase();
  let posts = currentFilter === '全部' ? FORUM_POSTS : FORUM_POSTS.filter((p) => p.category === currentFilter);
  if (q) {
    posts = posts.filter((p) =>
      p.title.toLowerCase().includes(q) || (p.body ?? p.snippet).toLowerCase().includes(q),
    );
  }
  render(posts);
}

filterEl.querySelectorAll('.forum-filter-btn').forEach((b) => {
  b.addEventListener('click', () => {
    currentFilter = (b as HTMLElement).dataset.cat!;
    filterEl.querySelectorAll('.forum-filter-btn').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    applyFilter();
  });
});

document.getElementById('forumSearchBtn')!.addEventListener('click', applyFilter);
searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyFilter(); });

render(FORUM_POSTS);
