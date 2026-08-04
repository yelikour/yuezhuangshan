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
  // 第二阶段
  LAB_ACCESS: 'CLUE_LAB_ACCESS',
  LIN_XUZHI: 'CLUE_LIN_XUZHI',
  PROTAGONIST_VESSEL: 'CLUE_PROTAGONIST_VESSEL',
  SHENRAN_DECOY: 'CLUE_SHENRAN_DECOY',
  MOTHER_CANT_LEAVE: 'CLUE_MOTHER_CANT_LEAVE',
  SHELL_LEFTHAND: 'CLUE_SHELL_LEFTHAND',
  HALF_SHENRAN: 'CLUE_HALF_SHENRAN',
  ONLY_WAY_OUT: 'CLUE_ONLY_WAY_OUT',
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
  /** P08 lab 门禁：林叙之(LXZ) + 工位 B-07 */
  LAB_ACCESS_CODE: normalizeInput('lxzb07'),
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
  login_p08: [
    '门禁要的是"本实验室负责人"的身份码。',
    '访客登记表里有负责人的姓名，工位分布图能查到他的编号。',
    '负责人是林叙之（拼音首字母 LXZ），工位 B-07。输入 lxzb07。',
  ],
  search_p09: [
    '档案里应该有关于"主体"局限性的实验记录。',
    '试试搜"离山""根脉""容器"这类词。',
    '输入"离山"，看实验日志里关于主体无法脱离根脉的记录。',
  ],
  identify_p11: [
    '真正的沈苒会知道只有你们俩才懂的私密小事。',
    '想想她在聊天里提过的、关于家里的小细节。',
    '她养了一只猫叫"芝麻"。选提到芝麻的那条消息。',
  ],
} as const;

/** P09 实验室档案检索库 */
export interface ArchiveDoc {
  id: string;
  title: string;
  code: string;
  level: string; // 密级
  snippet: string;
  matchKeywords: string[];
  isKey?: boolean;
  body?: string;
}

export const ARCHIVE_DB: ArchiveDoc[] = [
  {
    id: 'mother_limit',
    title: '实验日志：主体迁移局限性验证',
    code: 'EXP-2024-0173',
    level: '机密',
    snippet: '……主体无法脱离根脉网络，离山实验再次失败。孢子离山 72 小时后全部失活……',
    matchKeywords: ['离山', '根脉', '容器', '主体', '迁移'],
    isKey: true,
    body: `【实验日志 EXP-2024-0173 · 机密】
课题：主体迁移局限性验证
执行人：林叙之
日期：2024-08-15

实验记录：
第 14 次尝试将主体孢子样本带离岳桩山根脉范围。样本在离山 72 小时后全部失活，与此前 13 次结果一致。

结论：
主体无法脱离根脉网络。其意识分布于整片地下生态，无法压缩进单一孢子。
唯一可能的离山方式：寻找神经适配性达 S 级的人类宿主，将"记忆核心"注入其神经系统，由宿主携带出山。

备注：
主体对此结论表现出"焦虑"——它会模仿人类情绪了。这是好迹象，说明它的神经模仿能力在进步。
——林叙之`,
  },
  {
    id: 'vessel_eval',
    title: '宿主适配性评估报告（年度）',
    code: 'EVL-2026-0009',
    level: '绝密',
    snippet: '……编号 P-09：适配性 S 级（理想容器）。编号 S-04：适配性 B 级，用途：诱饵……',
    matchKeywords: ['容器', '适配', '评估', '诱饵', '宿主'],
    isKey: true,
    body: `【宿主适配性评估报告 EVL-2026-0009 · 绝密】
评估周期：2026 年度研讨会候选对象
评估方法：神经整合力测试 + 人格承载力分析

编号 P-09（推理小说作者，本届研讨会受邀者）：
  适配性评级：S（理想容器）
  评估依据：具备极强的矛盾信息整合能力与多视角人格模拟能力。
  神经系统对复合记忆的承载力预测值达历史最高。
  建议用途：[数据删除] —— 但主体已多次表示"渴望"。

编号 S-04（沈苒，P-09 同伴）：
  适配性评级：B（中等）
  评估依据：神经整合力普通，不足以承载记忆核心。
  建议用途：诱饵——用于引导 P-09 进入根脉范围。
  状态：已执行。

—— 林叙之 / 岳桩生态文化发展有限公司 研究部`,
  },
  {
    id: 'fire_test',
    title: '燃烧实验：表层网络耐热性',
    code: 'EXP-2023-0089',
    level: '内部',
    snippet: '……明火可毁坏表层菌丝网络与实验室样本，但地下主体未受影响，3 周内再生……',
    matchKeywords: ['火', '燃烧', '再生', '表层'],
  },
  {
    id: 'religion_study',
    title: '合奘教教义的人类学分析',
    code: 'SOC-2022-0034',
    level: '公开',
    snippet: '……"合奘"教义中"肉身归山、记忆合一"的表述，与主体吸收宿主记忆的生物过程高度吻合……',
    matchKeywords: ['合奘', '教义', '宗教', '记忆合一'],
  },
  {
    id: 'three_year',
    title: '三年周期与生态管理的对应关系',
    code: 'ECO-2021-0056',
    level: '内部',
    snippet: '……每三年一次的"送老"传统，实为主体对衰老个体的定期吸收，以维持根脉养分……',
    matchKeywords: ['三年', '周期', '生态', '传统'],
  },
];

/** P11 半沈苒真假消息集合。player 需选出真正沈苒说的那条。 */
export interface HalfMessage {
  id: string;
  text: string;
  /** true = 真沈苒（基于私密记忆）；false = 母体模仿 */
  isReal: boolean;
}

export const HALF_MESSAGES: HalfMessage[] = [
  {
    id: 'm1',
    text: '你还记得我们第一次见面吗？那天下了很大的雨，你把伞让给了我。',
    isReal: false,
  },
  {
    id: 'm2',
    text: '芝麻今天又把杯子推下桌了……不对，我在山上，它在家。我只是突然好想它。',
    isReal: true, // 提到只有两人知道的猫"芝麻"
  },
  {
    id: 'm3',
    text: '我们本该一起去很多地方的。回来吧，我们重新开始，一切都会好的。',
    isReal: false,
  },
  {
    id: 'm4',
    text: '我能感觉到它在读我。但有些事它读不到——那些太小的、太琐碎的记忆，它觉得不重要。',
    isReal: true,
  },
  {
    id: 'm5',
    text: '听我说，你是我见过最好的人。别管我了，去过你自己的生活，忘记这里。',
    isReal: false,
  },
];
