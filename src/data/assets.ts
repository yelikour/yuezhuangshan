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
