/**
 * 岳桩村论坛（SIDE_FORUM）：朴素 BBS，混合生活帖/求助帖/旧传闻。
 * 支线 D：存档区（被删帖残片）+ 搜索屏蔽词（"无结果即叙事"）。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import { FORUM_POSTS, FORUM_ARCHIVE_UI, type ForumPost } from '@data/content';
import { FORUM_DELETED, FORUM_CENSOR_KEYWORDS, CENSOR_NOTICE, CLUE } from '@data/clues';
import { discoverClue } from '@shared/progress';
import { matchSearch } from '@shared/normalize';
import { playSfxWithSubtitle } from '@shared/sfx';

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
  const q = searchInput.value.trim();
  let posts = currentFilter === '全部' ? FORUM_POSTS : FORUM_POSTS.filter((p) => p.category === currentFilter);
  if (q) {
    posts = posts.filter((p) =>
      p.title.toLowerCase().includes(q.toLowerCase()) || (p.body ?? p.snippet).toLowerCase().includes(q.toLowerCase()),
    );
  }
  render(posts);

  // 支线 D：命中屏蔽词 → 显示"部分结果未予显示"系统条（屏蔽行为本身即线索）
  const censorHit = matchSearch(q, FORUM_CENSOR_KEYWORDS);
  if (q && censorHit) {
    discoverClue(CLUE.SEARCH_CENSORSHIP);
    const notice = document.createElement('div');
    notice.id = 'censorNotice';
    notice.style.cssText = 'margin:0.4em 0; padding:0.4em 0.7em; background:#fff7e6; border:1px solid #e6d19a; color:#7a5c00; font-size:13px; border-radius:3px';
    notice.textContent = CENSOR_NOTICE(FORUM_DELETED.length);
    document.getElementById('forumFilter')!.after(notice);
    // 屏蔽系统条出现：短促电流杂音（信号被截断的手感）
    playSfxWithSubtitle('glitchClick', { volumeScale: 0.4 });
  } else {
    document.getElementById('censorNotice')?.remove();
  }
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

// ===== 支线 D：存档区（回收站）=====

const archiveSection = document.getElementById('archiveSection')!;
document.getElementById('archiveTitle')!.textContent = FORUM_ARCHIVE_UI.title;
document.getElementById('archiveIntro')!.textContent = FORUM_ARCHIVE_UI.intro;
document.getElementById('archiveBack')!.textContent = FORUM_ARCHIVE_UI.backLabel;

document.getElementById('archiveLink')!.addEventListener('click', (e) => {
  e.preventDefault();
  discoverClue(CLUE.FORUM_ARCHIVE);
  archiveSection.hidden = false;
  // 首次打开存档区：水滴回声（地下空间的暗示）
  playSfxWithSubtitle('waterDrip', { volumeScale: 0.5 });
  archiveSection.scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('archiveBack')!.addEventListener('click', () => {
  archiveSection.hidden = true;
});

document.getElementById('archiveList')!.innerHTML = FORUM_DELETED.map((d) => `
  <details style="margin:0.6em 0; padding:0.5em 0.8em; background:#fff; border:1px solid #ddd; border-radius:4px; color:#333">
    <summary style="cursor:pointer">
      <span style="text-decoration:line-through; opacity:0.7">${escapeHtml(d.title)}</span>
      <span style="opacity:0.5; font-size:0.8em"> · ${escapeHtml(d.user)} · ${escapeHtml(d.date)}</span>
    </summary>
    <div style="margin:0.5em 0; padding:0.4em 0.6em; background:#f6f6f6; border-left:3px solid #c00; font-size:0.85em; color:#a00">
      ${escapeHtml(d.removedNote)}
    </div>
    <div style="white-space:pre-wrap; font-size:0.9em; color:#555">${escapeHtml(d.fragment)}</div>
  </details>`).join('');
