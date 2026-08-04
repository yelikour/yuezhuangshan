/**
 * 音频播放器 —— 见 docs/game_design.md §无障碍与演出。
 *
 * 设计原则：
 * 1. 默认静音（避免自动播放惊吓 + 浏览器自动播放策略限制）。
 * 2. 实时读取设置：音量/静音/减少动态。
 * 3. 减少动态效果开启时，静音所有音效（恐怖音效本质是"刺激"，reduce-motion 用户不应受刺激）。
 * 4. 所有播放都附带文字描述（字幕），由调用方决定如何显示。
 *
 * 浏览器自动播放策略：未交互过的页面不能自动播放带声音的内容。
 * 本游戏所有音效都由玩家点击/进入页面触发，符合"已交互"前提；
 * 且默认静音，首次播放无声，进一步规避策略限制。
 */
import { loadState } from './storage';
import { SFX as SFX_FILES } from '@data/assets';

export type SfxName = keyof typeof SFX_FILES;

/** 音效的可读描述（用于字幕） */
export const SFX_SUBTITLE: Record<SfxName, string> = {
  ambientDrone: '[低频嗡鸣 · 地下空间的回响]',
  phoneBuzz: '[手机震动]',
  glitchClick: '[电流杂音]',
  waterDrip: '[水滴落在石壁上的回声]',
};

/** 单例 audio 池，避免重复创建 */
const pool = new Map<SfxName, HTMLAudioElement>();

function getAudio(name: SfxName): HTMLAudioElement {
  let el = pool.get(name);
  if (!el) {
    el = new Audio(SFX_FILES[name]);
    el.preload = 'auto';
    pool.set(name, el);
  }
  return el;
}

/** 当前是否允许发声（综合静音 + 减少动态） */
function canPlaySound(): boolean {
  const s = loadState();
  return !s.muted && !s.reduceMotion;
}

export interface PlayOptions {
  /** 循环播放（适用于氛围音 ambient） */
  loop?: boolean;
  /** 音量倍率（0..1，最终音量 = 设置音量 × 倍率） */
  volumeScale?: number;
  /** 字幕显示回调，返回描述文字 */
  onSubtitle?: (text: string) => void;
}

/**
 * 播放一个音效。无论是否静音都会触发字幕（字幕独立于声音）。
 */
export function playSfx(name: SfxName, opts: PlayOptions = {}): HTMLAudioElement {
  const { loop = false, volumeScale = 1, onSubtitle } = opts;
  const el = getAudio(name);

  // 重置（非循环音效重复播放时从头开始）
  if (!loop) {
    el.pause();
    el.currentTime = 0;
  }
  el.loop = loop;

  // 音量
  const s = loadState();
  const vol = canPlaySound() ? s.volume * volumeScale : 0;
  el.volume = Math.max(0, Math.min(1, vol));
  el.muted = !canPlaySound();

  // 播放（play 返回 Promise，静音时通常不会因自动播放策略被拒）
  el.play().catch(() => {
    // 自动播放被拒：静默失败（玩家交互后会恢复）
  });

  // 字幕（独立于声音，只要字幕开关开就显示）
  if (s.subtitles && onSubtitle) {
    onSubtitle(SFX_SUBTITLE[name]);
  }

  return el;
}

/** 停止某个音效 */
export function stopSfx(name: SfxName): void {
  const el = pool.get(name);
  if (el) {
    el.pause();
    el.currentTime = 0;
  }
}

/** 停止所有音效（页面切换/重新开始时调用） */
export function stopAllSfx(): void {
  pool.forEach((el) => {
    el.pause();
    el.currentTime = 0;
  });
}

/** 设置变更时同步所有正在播放的音效音量/静音状态 */
export function refreshSfxSettings(): void {
  const s = loadState();
  pool.forEach((el, name) => {
    const vol = canPlaySound() ? s.volume : 0;
    el.volume = Math.max(0, Math.min(1, vol));
    el.muted = !canPlaySound();
    // 若减少动态或静音，停止循环音
    if (!canPlaySound() && el.loop) {
      el.pause();
    } else if (canPlaySound() && el.loop && el.paused) {
      el.play().catch(() => {});
    }
    void name;
  });
}

/**
 * 便捷播放 + 屏幕浮现字幕。适合一次性短音效。
 * 氛围循环音请直接用 playSfx 并自行管理字幕。
 */
export function playSfxWithSubtitle(name: SfxName, opts: { volumeScale?: number } = {}): void {
  playSfx(name, {
    volumeScale: opts.volumeScale,
    onSubtitle: (text) => showFloatingSubtitle(text),
  });
}

/** 在屏幕底部短暂浮现一行字幕，3 秒后自动消失 */
export function showFloatingSubtitle(text: string): void {
  // 若已存在先移除
  document.querySelectorAll('.sfx-subtitle').forEach((el) => el.remove());
  const el = document.createElement('div');
  el.className = 'sfx-subtitle';
  el.textContent = text;
  document.body.appendChild(el);
  // reduce-motion 下不自动消失，停留更久；否则 3s 后移除
  const s = loadState();
  const ttl = s.reduceMotion ? 4500 : 3000;
  setTimeout(() => el.remove(), ttl);
}
