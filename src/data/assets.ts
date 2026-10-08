/**
 * 图片资源集中管理。
 * 图片放在 src/assets/，通过 import 引入，Vite 会自动处理成相对路径 + hash，
 * 确保 base:'/yuezhuangshan/' 子路径部署（如 GitHub Pages /yuezhuangshan/）下路径正确。
 *
 * 用法：import { IMG } from '@data/assets'; 然后 el.src = IMG.corridorMold;
 */
import corridorMold from '../assets/corridor_mold.webp';
import endingRitual from '../assets/ending_ritual.webp';
import yueshengzhuang from '../assets/yueshengzhuang.webp';
import mountainMist from '../assets/mountain_mist.webp';
import hotelWater from '../assets/hotel_water.webp';
import labBlur from '../assets/lab_blur.webp';
import favicon from '../assets/favicon.webp';
import mailAvatar from '../assets/mail_avatar.webp';
import newsOldPaper from '../assets/news_old_paper.webp';
import ambientDrone from '../assets/ambient_drone.wav';
import phoneBuzz from '../assets/phone_buzz.wav';
import glitchClick from '../assets/glitch_click.wav';
import waterDrip from '../assets/water_drip.wav';

export const IMG = {
  corridorMold,
  endingRitual,
  yueshengzhuang,
  mountainMist,
  hotelWater,
  labBlur,
  favicon,
  mailAvatar,
  newsOldPaper,
} as const;

export const SFX = {
  ambientDrone,
  phoneBuzz,
  glitchClick,
  waterDrip,
} as const;

/**
 * 零代码接图（docs/art_pipeline.md §四）：动态收集 src/assets/art/ 下的可选美术。
 * 把按文档命名的图片放进该目录即可让对应页面图位自动显示；
 * 目录为空 / 文件缺失时返回 null，页面维持纯文本形态，功能不受影响。
 */
const ART_GLOB = import.meta.glob<{ default: string }>('../assets/art/*.{webp,png,jpg,jpeg}', {
  eager: true,
});

/** 取可选美术图；不存在返回 null。 */
export function art(name: string): string | null {
  for (const ext of ['webp', 'png', 'jpg', 'jpeg']) {
    const hit = ART_GLOB[`../assets/art/${name}.${ext}`];
    if (hit) return hit.default;
  }
  return null;
}
