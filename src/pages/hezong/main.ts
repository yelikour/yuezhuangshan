/**
 * 合奘教宣传页（SIDE_HEZONG）：温和诗意的宗教官网，细读脊背发凉。
 */
import { bootstrap, escapeHtml } from '@shared/bootstrap';
import { HEZONG } from '@data/content';

const { denied } = bootstrap({
  pageId: 'hezong', brand: '合奘', domain: 'hezong-teachings.cn',
  skin: 'hezong', node: 'SIDE_HEZONG',
  accessDeniedHint: '这个页面似乎来自一个内部的链接。也许等你知道得更多时，再回来看。',
});
if (denied) throw new Error('access denied');

const root = document.getElementById('root')!;
root.hidden = false;
document.getElementById('brand')!.textContent = HEZONG.brand;
document.getElementById('slogan')!.textContent = HEZONG.slogan;

// 渲染左侧板块导航
const nav = document.getElementById('sectionNav')!;
nav.innerHTML = HEZONG.sections.map((s, i) =>
  `<button class="hezong-nav-btn ${i === 0 ? 'active' : ''}" data-id="${s.id}">${escapeHtml(s.title)}</button>`,
).join('');

const body = document.getElementById('sectionBody')!;

function showSection(id: string): void {
  const s = HEZONG.sections.find((x) => x.id === id)!;
  body.innerHTML = `<h2>${escapeHtml(s.title)}</h2><div class="mail-body">${escapeHtml(s.body)}</div>`;
  nav.querySelectorAll('.hezong-nav-btn').forEach((b) => b.classList.toggle('active', (b as HTMLElement).dataset.id === id));
  body.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

nav.querySelectorAll('.hezong-nav-btn').forEach((b) => {
  b.addEventListener('click', () => showSection((b as HTMLElement).dataset.id!));
});

// 默认显示第一个板块
showSection(HEZONG.sections[0].id);
