/// <reference types="vite/client" />

/** 构建时由 vite.config.ts 的 define 注入，便于线上版本核对（见 src/data/build.ts）。 */
declare const __BUILD_TIME__: string;

declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '*.mp3' {
  const src: string;
  export default src;
}
declare module '*.ogg' {
  const src: string;
  export default src;
}
declare module '*.wav' {
  const src: string;
  export default src;
}
