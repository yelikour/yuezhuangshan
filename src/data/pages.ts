/**
 * 页面/站点元数据。统一管理标题、风格主题、URL、节点映射。
 * 用于：导航栏渲染、皮肤切换、节点访问校验。
 */
import type { NodeId, PageId } from '@shared/state';

export interface SiteMeta {
  id: PageId;
  /** 站点显示名（用于"浏览器"导航与提示） */
  name: string;
  /** 站点品牌域名（虚构，仅展示用） */
  domain: string;
  /** HTML 文件相对路径（相对站点根） */
  url: string;
  /** 所属节点 */
  node: NodeId;
  /** CSS 皮肤变量组名 */
  skin: 'mail' | 'scenic' | 'chat' | 'news' | 'backend' | 'ending' | 'system';
}

export const SITES: Record<PageId, SiteMeta> = {
  index: { id: 'index', name: '系统启动器', domain: 'localhost', url: './index.html', node: 'P00', skin: 'system' },
  mail: { id: 'mail', name: '云雁邮', domain: 'yunyan.mail', url: './src/pages/mail/index.html', node: 'P01', skin: 'mail' },
  scenic: { id: 'scenic', name: '岳桩山生态景区官网', domain: 'yuezhuangshan-scenic.cn', url: './src/pages/scenic/index.html', node: 'P02', skin: 'scenic' },
  scenic_legend: { id: 'scenic_legend', name: '岳圣桩传说', domain: 'yuezhuangshan-scenic.cn', url: './src/pages/scenic/index.html', node: 'P02', skin: 'scenic' },
  scenic_annals: { id: 'scenic_annals', name: '岳桩县数字县志', domain: 'yuezhuangshan-annals.cn', url: './src/pages/scenic/index.html', node: 'SIDE_ANNALS', skin: 'scenic' },
  chat: { id: 'chat', name: '谛听', domain: 'diting.app', url: './src/pages/chat/index.html', node: 'P03', skin: 'chat' },
  news: { id: 'news', name: '岳桩资讯', domain: 'yuezhuang-news.cn', url: './src/pages/news/index.html', node: 'P04', skin: 'news' },
  backend: { id: 'backend', name: '研讨会工作台', domain: 'conf-backend.yuezhuangshan.cn', url: './src/pages/backend/index.html', node: 'P05', skin: 'backend' },
  backend_records: { id: 'backend_records', name: '门禁与房卡记录', domain: 'conf-backend.yuezhuangshan.cn', url: './src/pages/backend/index.html', node: 'P06', skin: 'backend' },
  ending: { id: 'ending', name: '——', domain: 'localhost', url: './src/pages/ending/index.html', node: 'P07', skin: 'ending' },
  // 第二阶段
  lab: { id: 'lab', name: '实验室内网', domain: 'lab.yuezhuangshan.cn', url: './src/pages/lab/index.html', node: 'P08', skin: 'backend' },
  lab_archive: { id: 'lab_archive', name: '宿主适配性档案', domain: 'lab.yuezhuangshan.cn', url: './src/pages/lab/index.html', node: 'P09', skin: 'backend' },
  lab_monitor: { id: 'lab_monitor', name: '维护通道监控', domain: 'lab.yuezhuangshan.cn', url: './src/pages/lab/index.html', node: 'P10', skin: 'backend' },
  identify: { id: 'identify', name: '未知号码', domain: 'diting.app', url: './src/pages/identify/index.html', node: 'P11', skin: 'chat' },
  ending2: { id: 'ending2', name: '——', domain: 'localhost', url: './src/pages/ending2/index.html', node: 'P12', skin: 'ending' },
};

/** 虚构平台名一览（避免与现实产品混淆，集中管理） */
export const FICTIONAL_BRANDS = {
  mail: '云雁邮',
  chat: '谛听',
  news: '岳桩资讯',
  scenic: '岳桩山生态景区',
  company: '岳桩生态文化发展有限公司',
  conf: '地方异闻与悬疑叙事创作研讨会',
  religion: '合奘教',
} as const;
