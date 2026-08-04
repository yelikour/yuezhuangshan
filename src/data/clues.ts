/**
 * 线索、口令、搜索词、提示文案的【单一真相源】。
 * 见 docs/clue_graph.md。所有答案在此以【标准化后】形式存储。
 * 修改答案请先改 docs/clue_graph.md，再改这里，再跑测试。
 */
import { normalizeInput } from '@shared/normalize';

/** 线索 id 常量 */
export const CLUE = {
  INVITE: 'CLUE_INVITE',
  CREDENTIAL_HINT: 'CLUE_CREDENTIAL_HINT',
  YUESHENGZHUANG_LEGEND: 'CLUE_YUESHENGZHUANG_LEGEND',
  THREE_YEAR_TRADITION: 'CLUE_THREE_YEAR_TRADITION',
  LAST_NORMAL_MSG: 'CLUE_LAST_NORMAL_MSG',
  ABNORMAL_PHOTO: 'CLUE_ABNORMAL_PHOTO',
  OFFLINE_TIME: 'CLUE_OFFLINE_TIME',
  TAMPERED_REPORT: 'CLUE_TAMPERED_REPORT',
  KEYCARD_MAINTENANCE: 'CLUE_KEYCARD_MAINTENANCE',
  FAKE_RETURN: 'CLUE_FAKE_RETURN',
} as const;

/**
 * 谜题答案表（标准化后）。
 * normalizeInput 用于把"人类可读答案"转成比对面，避免数据层手写易错。
 */
export const ANSWERS = {
  /** P05 后台登录账号（来自邀请函） */
  LOGIN_ACCOUNT: normalizeInput('protagonist@yuezhuangshan-conf.cn'),
  /** P05 后台登录口令 = 参会证后四位 + 研讨会拼音首字母 */
  LOGIN_PASSWORD: normalizeInput('0427ywyxxsc'),
} as const;

/** P02 景区官网搜索命中词 */
export const SEARCH_P02_KEYWORDS = ['岳圣桩', '桩', '传说', '敬老', '岳桩山'];

/** P04 资讯搜索命中词（被篡改旧报道） */
export const SEARCH_P04_KEYWORDS = ['失踪', '失足', '岳圣桩', '周某'];

/** P04 资讯库（用于在搜索页展示）。命中项与干扰项混合。 */
export interface NewsItem {
  id: string;
  title: string;
  date: string;
  source: string;
  snippet: string;
  /** 命中这些关键词才会出现在结果里 */
  matchKeywords: string[];
  /** 是否为关键剧情项（被篡改的旧报道） */
  isKey?: boolean;
  /** 完整正文（点开详情时展示） */
  body?: string;
}

export const NEWS_DB: NewsItem[] = [
  {
    id: 'tampered_2019',
    title: '登山客周某于岳桩山自行失足，家属未提异议',
    date: '2019-02-14',
    source: '岳桩县融媒体中心（存档）',
    snippet:
      '……周某（男，34 岁）于本月 14 日在岳桩山景区未开放区域失足。经搜救，判定……（正文一处用词与标题不一致）',
    matchKeywords: ['失踪', '失足', '岳圣桩', '周某'],
    isKey: true,
    body: `【存档原稿 · 注意：本文存在内部修订痕迹，标题与正文用词不一致】
标题：登山客周某于岳桩山自行失足，家属未提异议
日期：2019-02-14
来源：岳桩县融媒体中心

正文：
周某（男，34 岁，外省市户籍）于本月 14 日进入岳桩山景区。据景区监控，周某当日 16 时许偏离标注游步道，进入岳圣桩附近的未开放区域。经三日搜救，搜救队于岳圣桩下方冲沟发现周某随身背包一只，内含水壶、手机（已损坏）及一张 2019 年 2 月 5 日购于外地的火车票。

关于周某下落，正文写为：周某系自愿【返回平原】，与本平台标题所述"自行失足"措辞不一，请编务核实。

文末"家属意见"一栏为空白。

【编辑批注（残）】："……上面要求改成'自愿'，但火车票是单程进的，没有出山记录……"`,
  },
  {
    id: 'scenic_open',
    title: '岳桩山生态景区正式挂牌开放',
    date: '2023-09-01',
    source: '岳桩县融媒体中心',
    snippet: '由岳桩生态文化发展有限公司投资开发的岳桩山生态景区今日正式……',
    matchKeywords: ['景区', '岳桩山', '开放'],
  },
  {
    id: 'filial_festival',
    title: '岳桩村"敬老节"民俗列入县级非遗',
    date: '2022-01-20',
    source: '岳桩县文旅局',
    snippet: '三年一度的正月初十敬老传统，体现岳桩村世代相传的孝老文化……',
    matchKeywords: ['敬老', '正月初十', '民俗'],
  },
  {
    id: 'spring_survey',
    title: '岳桩山春季动植物资源调查启动',
    date: '2024-03-12',
    source: '岳桩县林业局',
    snippet: '本次调查将重点关注山中特有的真菌生态与水源涵养……',
    matchKeywords: ['真菌', '水源', '调查'],
  },
  {
    id: 'writer_conf',
    title: '地方异闻与悬疑叙事创作研讨会将在岳桩山举办',
    date: '2026-05-20',
    source: '岳桩生态文化发展有限公司',
    snippet: '面向全国推理、悬疑类创作者的研讨会即将于 6 月举行……',
    matchKeywords: ['研讨会', '创作', '异闻'],
  },
];

/** P06 房卡刷卡记录 */
export interface KeycardLog {
  time: string;
  gate: string;
  result: string;
  note?: string;
}

export const KEYCARD_LOGS: KeycardLog[] = [
  { time: '2026-06-20 18:55', gate: '岳桩山庄·正门闸机', result: '通过', note: '入住登记' },
  { time: '2026-06-20 19:10', gate: '岳桩山庄·客房区闸机', result: '通过' },
  { time: '2026-06-20 19:42', gate: '岳桩山庄·客房区闸机', result: '通过', note: '与最后一条正常聊天同时' },
  { time: '2026-06-20 23:47', gate: '岳圣桩·维护通道（外层）', result: '通过', note: '⚠ 失联后 2 小时 44 分' },
  { time: '2026-06-21 02:11', gate: '岳圣桩·维护通道（内层）', result: '通过', note: '⚠ 进入更深区域' },
];

/** 三级渐进提示文案（绝不直接给答案） */
export const HINTS: Record<string, string[]> = {
  search_p02: [
    '景区官网的搜索框，或许可以试试当地最著名的那根"桩"的名字。',
    '输入"岳圣桩"或单字"桩"试试。',
    '直接搜索"岳圣桩"三个字。',
  ],
  search_p04: [
    '旧报道的标题里，可能藏着一个和"岳圣桩"或"失踪"相关的词。',
    '试试"失踪"或"失足"——什么样的新闻会被改成"自行返回"。',
    '输入"失踪"二字。再看一眼报道日期，是不是和某个三年一度的传统重合？',
  ],
  login_p05: [
    '口令规则写在邮箱的"入住资料"里；尾号要问"知道你参会证的人"。',
    '口令 = 参会证后四位 + 研讨会名称拼音首字母。沈苒在聊天里提过你的尾号。',
    '尾号 0427，研讨会"地方异闻与悬疑叙事创作"取首字母 ywyxxsc，合起来输入。',
  ],
} as const;
