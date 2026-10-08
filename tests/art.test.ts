/**
 * 美术资产接入测试（零代码接图机制 + 聊天照片道具）—— 见 docs/art_pipeline.md。
 *
 * 守卫目标：
 *   1. art() 在图未放入时安全回退 null（页面保持纯文本，不破功能）；
 *   2. 聊天照片（水杯/菌斑）的数据与映射齐备：CHAT.photos 覆盖 dialog 里用到的
 *      每一个 photo 值，stamp/alt 非空——防止新增照片忘配元数据；
 *   3. 页面图位容器存在（scenic 残页图 / mail 附件渲染 / hezong 名录图注入逻辑）；
 *   4. 周衍回信的附件位指向文档约定的文件名。
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { art } from '@data/assets';
import { CHAT, MAIL } from '@data/content';

const readPage = (rel: string) => readFileSync(resolve(__dirname, '..', rel), 'utf-8');

describe('art() 零代码接图机制', () => {
  it('图未放入时返回 null（src/assets/art/ 目前只有 README）', () => {
    expect(art('guilu_roster')).toBeNull();
    expect(art('annals_fragment')).toBeNull();
    expect(art('steel_door_thumb')).toBeNull();
    expect(art('anything-else')).toBeNull();
  });
});

describe('聊天照片道具（水杯 + 菌斑）', () => {
  /** 收集 dialog 全部节点里用到的 photo 值 */
  const usedPhotos = new Set<string>();
  for (const node of Object.values(CHAT.dialog as Record<string, { her: Array<{ photo?: string }> }>)) {
    node.her.forEach((m) => { if (m.photo) usedPhotos.add(m.photo); });
  }

  it('对话中用到的照片：水杯（19:42）与菌斑（20:15）', () => {
    expect(usedPhotos.has('water')).toBe(true);
    expect(usedPhotos.has('mold')).toBe(true);
  });
  it('CHAT.photos 为每个用到的 photo 值配齐 stamp 与 alt（文案集中在数据层）', () => {
    usedPhotos.forEach((p) => {
      const meta = CHAT.photos[p];
      expect(meta, `CHAT.photos 缺少 "${p}" 的元数据`).toBeTruthy();
      expect(meta!.stamp.length).toBeGreaterThan(5);
      expect(meta!.alt.length).toBeGreaterThan(4);
    });
  });
  it('水杯照时间戳为 19:42（与 CLUE_LAST_NORMAL_MSG 消息时间一致）', () => {
    expect(CHAT.photos.water.stamp).toContain('194203');
    expect(CHAT.photos.mold.stamp).toContain('201501');
  });
  it('chat/main.ts 的 PHOTO_SRC 覆盖全部 photo 值（渲染映射不缺项）', () => {
    const ts = readPage('src/pages/chat/main.ts');
    expect(ts).toContain("water: IMG.hotelWater");
    expect(ts).toContain("mold: IMG.corridorMold");
  });
});

describe('页面图位容器（hidden img，等待 art/ 放图后显示）', () => {
  it('scenic 残页有 #annalsFragmentImg 隐藏图位，且由 annalsLink 打开时注入', () => {
    const html = readPage('src/pages/scenic/index.html');
    expect(html).toContain('id="annalsFragmentImg"');
    const ts = readPage('src/pages/scenic/main.ts');
    expect(ts).toContain("art('annals_fragment')");
  });
  it('hezong 名录图注入逻辑存在（guilu_roster）', () => {
    const ts = readPage('src/pages/hezong/main.ts');
    expect(ts).toContain("art('guilu_roster')");
  });
  it('周衍回信声明附件位 steel_door_thumb + 说明文字（与 art_pipeline.md 文件名一致）', () => {
    expect(MAIL.zhouYanLetter.attachArt).toBe('steel_door_thumb');
    expect(MAIL.zhouYanLetter.attachCaption).toContain('云相册');
    const ts = readPage('src/pages/mail/main.ts');
    expect(ts).toContain('attachArt');
    expect(ts).toContain('art(');
  });
});
