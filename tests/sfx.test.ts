import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let audios: Array<{ paused: boolean; loop: boolean; volume: number; muted: boolean; play: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn> }>;
let audioConstructor: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.resetModules();
  audios = [];
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  audioConstructor = vi.fn(function () {
    const audio = { paused: true, loop: false, volume: 1, muted: false, currentTime: 0, preload: '',
      play: vi.fn(() => { audio.paused = false; return Promise.resolve(); }),
      pause: vi.fn(() => { audio.paused = true; }),
    };
    audios.push(audio);
    return audio;
  });
  vi.stubGlobal('Audio', audioConstructor);
});
afterEach(() => { vi.unstubAllGlobals(); document.querySelectorAll('.sfx-subtitle').forEach((el) => el.remove()); });

describe('音频按需加载与设置同步', () => {
  it('默认静音仍有字幕，但不创建 Audio 或加载音频', async () => {
    const { playSfx } = await import('@shared/sfx');
    const subtitle = vi.fn();
    playSfx('ambientDrone', { loop: true, onSubtitle: subtitle });
    expect(subtitle).toHaveBeenCalledWith(expect.stringContaining('低频嗡鸣'));
    expect(audioConstructor).not.toHaveBeenCalled();
  });

  it('解除静音才启动循环，调音量保留倍率，停止后不能复活', async () => {
    const { playSfx, refreshSfxSettings, stopSfx } = await import('@shared/sfx');
    const { updateState } = await import('@shared/storage');
    playSfx('ambientDrone', { loop: true, volumeScale: 0.5 });
    updateState((state) => { state.muted = false; state.volume = 0.8; });
    refreshSfxSettings();
    expect(audioConstructor).toHaveBeenCalledTimes(1);
    expect(audios[0].volume).toBeCloseTo(0.4);
    updateState((state) => { state.volume = 0.6; }); refreshSfxSettings();
    expect(audios[0].volume).toBeCloseTo(0.3);
    stopSfx('ambientDrone');
    const count = audios[0].play.mock.calls.length;
    refreshSfxSettings();
    expect(audios[0].play).toHaveBeenCalledTimes(count);
  });

  it('系统减少动态时不加载，静音期间的短音效不延迟重播', async () => {
    const { playSfx, refreshSfxSettings } = await import('@shared/sfx');
    const { updateState } = await import('@shared/storage');
    playSfx('phoneBuzz');
    updateState((state) => { state.muted = false; });
    refreshSfxSettings();
    expect(audioConstructor).not.toHaveBeenCalled();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    playSfx('ambientDrone', { loop: true });
    expect(audioConstructor).not.toHaveBeenCalled();
  });
});
