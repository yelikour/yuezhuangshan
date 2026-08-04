/**
 * 图片资源集中管理。
 * 图片放在 src/assets/，通过 import 引入，Vite 会自动处理成相对路径 + hash，
 * 确保 base:'./' 子路径部署（如 GitHub Pages /yuezhuangshan/）下路径正确。
 *
 * 用法：import { IMG } from '@data/assets'; 然后 el.src = IMG.corridorMold;
 */
import corridorMold from '../assets/corridor_mold.png';
import endingRitual from '../assets/ending_ritual.png';
import yueshengzhuang from '../assets/yueshengzhuang.png';
import mountainMist from '../assets/mountain_mist.png';
import hotelWater from '../assets/hotel_water.png';
import labBlur from '../assets/lab_blur.png';
import favicon from '../assets/favicon.png';
import mailAvatar from '../assets/mail_avatar.png';
import newsOldPaper from '../assets/news_old_paper.png';

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
