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

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === SAVE_KEY || event.key === null) cache = null;
  });
}

export function loadState(): GameState {
  if (cache) return cache;
  try {
    const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(SAVE_KEY);
    if (!raw) {
      cache = createDefaultState();
      return cache;
    }
    const parsed: unknown = JSON.parse(raw);
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
  try {
    if (typeof localStorage === 'undefined') return;
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
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(SAVE_KEY) !== null;
  } catch {
    return cache !== null && cache.unlockedNodes.length > 1;
  }
}

/** 导出/导入存档（JSON 文本），便于调试与未来多设备 */
export function exportSave(): string {
  return JSON.stringify(loadState());
}

export function importSave(json: string): GameState {
  const parsed: unknown = JSON.parse(json);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('存档必须是 JSON 对象');
  }
  const version = (parsed as Record<string, unknown>).version;
  if (version !== undefined && (typeof version !== 'number' || !Number.isSafeInteger(version) || version < 1)) {
    throw new Error('存档版本无效');
  }
  // 仅接受版本号 <= 当前版本的存档
  if (typeof version === 'number' && version > SAVE_VERSION) {
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
