/**
 * 主题/设置应用：音量、静音、减少动态、字幕。
 * 在每个页面入口调用 applyTheme()，把存档里的设置反映到 DOM。
 */
import { loadState, updateState, resetState, hasSave } from '@shared/storage';
import { refreshSfxSettings } from '@shared/sfx';

export function applyTheme(): void {
  const s = loadState();
  const html = document.documentElement;
  html.classList.toggle('reduce-motion', s.reduceMotion);
  // skin 由各页面 body 自带 class，这里不动
  // 字幕：默认 .subtitle 不隐藏；若关字幕则隐藏
  document.querySelectorAll<HTMLElement>('.subtitle').forEach((el) => {
    el.classList.toggle('hidden', !s.subtitles);
  });
  // 音量：应用于所有 audio（占位，本切片无实际音频文件）
  document.querySelectorAll<HTMLAudioElement>('audio').forEach((el) => {
    el.volume = s.muted ? 0 : s.volume;
    el.muted = s.muted;
  });
  // 同步音效系统的设置
  refreshSfxSettings();
}

export function setVolume(v: number): void {
  updateState((st) => { st.volume = Math.max(0, Math.min(1, v)); });
  applyTheme();
}
export function setMuted(m: boolean): void {
  updateState((st) => { st.muted = m; });
  applyTheme();
}
export function setReduceMotion(r: boolean): void {
  updateState((st) => { st.reduceMotion = r; });
  applyTheme();
}
export function setSubtitles(b: boolean): void {
  updateState((st) => { st.subtitles = b; });
  applyTheme();
}

export function restartGame(): void {
  resetState();
  location.href = './index.html';
}

export { loadState, hasSave };
