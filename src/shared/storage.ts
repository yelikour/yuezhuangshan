/**
 * localStorage 自动存档。集中读写，便于统一迁移与"重新开始"。
 */
import {
  type GameState,
  SAVE_VERSION,
  createDefaultState,
  mergeState,
} from './state';

const SAVE_KEY = 'yueZhuangShan_save_v1';

/** 内存缓存，避免高频读 localStorage；首次 get 时加载 */
let cache: GameState | null = null;

export function loadState(): GameState {
  if (cache) return cache;
  if (typeof localStorage === 'undefined') {
    cache = createDefaultState();
    return cache;
  }
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      cache = createDefaultState();
      return cache;
    }
    const parsed = JSON.parse(raw) as Partial<GameState>;
    cache = mergeState(parsed);
    return cache;
  } catch {
    cache = createDefaultState();
    return cache;
  }
}

export function saveState(state: GameState): void {
  state.updatedAt = Date.now();
  cache = state;
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // 配额或隐私模式：静默失败，内存中仍保留
  }
}

/** 以函数式更新状态并立即落盘（推荐用法） */
export function updateState(mutator: (s: GameState) => void): GameState {
  const s = loadState();
  mutator(s);
  saveState(s);
  return s;
}

export function resetState(): GameState {
  const fresh = createDefaultState();
  saveState(fresh);
  return fresh;
}

export function hasSave(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(SAVE_KEY) !== null;
}

/** 导出/导入存档（JSON 文本），便于调试与未来多设备 */
export function exportSave(): string {
  return JSON.stringify(loadState());
}

export function importSave(json: string): GameState {
  const parsed = JSON.parse(json) as Partial<GameState>;
  // 仅接受版本号 <= 当前版本的存档
  if (parsed.version && parsed.version > SAVE_VERSION) {
    throw new Error('存档版本过高，无法导入');
  }
  const merged = mergeState(parsed);
  saveState(merged);
  return merged;
}

/** 仅供测试：清空内存缓存，强制下次重新读盘 */
export function _resetCacheForTests(): void {
  cache = null;
}
