/**
 * 构建版本标识 —— 由 vite.config.ts 的 define 在构建时注入 __BUILD_TIME__。
 *
 * 用途：线上版本核对。index/main.ts 会把它写入 <meta name="build" content="...">，
 * 这样无需比对 JS hash，用 curl 或浏览器 console 查 meta 即可确认线上版本是否更新。
 *
 * 设计取舍：版本号只进 <meta>，不渲染到可见 footer，避免破坏 ARG 沉浸感。
 *
 * 测试环境（vitest）下 __BUILD_TIME__ 未必注入，回退为 'test-build'。
 */
export const BUILD_TIME: string = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'test-build';
