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
  // 支线 A+：县志档案库
  FAMINE_PUNISHMENT: 'CLUE_FAMINE_PUNISHMENT',
  OLD_MEDICAL_RECORD: 'CLUE_OLD_MEDICAL_RECORD',
  VILLAGE_DECLINE: 'CLUE_VILLAGE_DECLINE',
  // 支线 B+：合奘教内部区
  GUILU_ROSTER: 'CLUE_GUILU_ROSTER',
  RITUAL_LOG: 'CLUE_RITUAL_LOG',
  LIN_LETTER: 'CLUE_LIN_LETTER',
  // 支线 D：周衍家属线
  FORUM_ARCHIVE: 'CLUE_FORUM_ARCHIVE',
  SEARCH_CENSORSHIP: 'CLUE_SEARCH_CENSORSHIP',
  ZHOU_FAMILY: 'CLUE_ZHOU_FAMILY',
  // 支线 E：陆远线（邮箱垃圾箱）
  LUYUAN_INTERCEPT: 'CLUE_LUYUAN_INTERCEPT',
  LUYUAN_SILENCED: 'CLUE_LUYUAN_SILENCED',
} as const;

/** 支线既有线索（非本批次新增，但计入真相完成度） */
const LEGACY_SIDE_CLUES = ['CLUE_SIDE_ANNALS'] as const;

/**
 * 真相完成度分母：全部"玩家可发现"线索。
 * 主线 18 + 县志 3 + 合奘内部 3 + 周衍 3 + 陆远 2 + 既有支线 1 = 30。
 */
export const ALL_DISCOVERABLE_CLUES: string[] = [
  CLUE.INVITE, CLUE.CREDENTIAL_HINT, CLUE.YUESHENGZHUANG_LEGEND, CLUE.THREE_YEAR_TRADITION,
  CLUE.LAST_NORMAL_MSG, CLUE.ABNORMAL_PHOTO, CLUE.OFFLINE_TIME, CLUE.TAMPERED_REPORT,
  CLUE.KEYCARD_MAINTENANCE, CLUE.FAKE_RETURN,
  CLUE.LAB_ACCESS, CLUE.LIN_XUZHI, CLUE.PROTAGONIST_VESSEL, CLUE.SHENRAN_DECOY,
  CLUE.MOTHER_CANT_LEAVE, CLUE.SHELL_LEFTHAND, CLUE.HALF_SHENRAN, CLUE.ONLY_WAY_OUT,
  CLUE.FAMINE_PUNISHMENT, CLUE.OLD_MEDICAL_RECORD, CLUE.VILLAGE_DECLINE,
  CLUE.GUILU_ROSTER, CLUE.RITUAL_LOG, CLUE.LIN_LETTER,
  CLUE.FORUM_ARCHIVE, CLUE.SEARCH_CENSORSHIP, CLUE.ZHOU_FAMILY,
  CLUE.LUYUAN_INTERCEPT, CLUE.LUYUAN_SILENCED,
  ...LEGACY_SIDE_CLUES,
];

/** 线索的玩家可读标题（用于真相完成度的证据清单展示）。 */
export const CLUE_TITLES: Record<string, string> = {
  [CLUE.INVITE]: '定向邀请（邮箱）',
  [CLUE.CREDENTIAL_HINT]: '口令规则与尾号（入住资料+聊天）',
  [CLUE.YUESHENGZHUANG_LEGEND]: '岳圣桩传说（景区官网）',
  [CLUE.THREE_YEAR_TRADITION]: '三年一度传统的日期规律',
  [CLUE.LAST_NORMAL_MSG]: '沈苒察觉饮用水异常（19:42）',
  [CLUE.ABNORMAL_PHOTO]: '对称菌斑照片（20:15）',
  [CLUE.OFFLINE_TIME]: '失联时间锚点（21:03）',
  [CLUE.TAMPERED_REPORT]: '被篡改的 2019 旧报道',
  [CLUE.KEYCARD_MAINTENANCE]: '维护通道刷卡记录（23:47 / 02:11）',
  [CLUE.FAKE_RETURN]: '"我已经回来了"是假的',
  [CLUE.LAB_ACCESS]: '实验室负责人身份（林叙之 B-07）',
  [CLUE.LIN_XUZHI]: '林叙之其人',
  [CLUE.PROTAGONIST_VESSEL]: '你是 S 级"理想容器"',
  [CLUE.SHENRAN_DECOY]: '沈苒被标注为"诱饵"',
  [CLUE.MOTHER_CANT_LEAVE]: '主体无法离山（EXP-2024-0173）',
  [CLUE.SHELL_LEFTHAND]: '02:11 躯壳用左手',
  [CLUE.HALF_SHENRAN]: '真沈苒仍保留部分意识',
  [CLUE.ONLY_WAY_OUT]: '唯一出路：让证据离开这座山',
  [CLUE.FAMINE_PUNISHMENT]: '嘉靖废礼与大旱（县志·灾异）',
  [CLUE.OLD_MEDICAL_RECORD]: '光绪嗜眠症医案（县志·诊籍）',
  [CLUE.VILLAGE_DECLINE]: '撤校与外迁：供养崩塌（县志·纪事）',
  [CLUE.GUILU_ROSTER]: '《归山名录》末页的现代编号',
  [CLUE.RITUAL_LOG]: '《执礼人手札》：泉变浓了',
  [CLUE.LIN_LETTER]: '林叙之《复执礼人问》',
  [CLUE.FORUM_ARCHIVE]: '论坛回收站：被删的寻人帖',
  [CLUE.SEARCH_CENSORSHIP]: '论坛屏蔽词的存在本身',
  [CLUE.ZHOU_FAMILY]: '周衍：家属从未被咨询',
  [CLUE.LUYUAN_INTERCEPT]: '陆远的邮件被"敏感词"隔离',
  [CLUE.LUYUAN_SILENCED]: '陆远：对门的参会者深夜被带走',
  CLUE_SIDE_ANNALS: '县志残页：岳圣桩下有根',
};

/** 线索 → 来源分组（调查手记按组展示；未发现线索只显示组内计数）。 */
export const CLUE_GROUPS: Record<string, string> = {
  [CLUE.INVITE]: '云雁邮',
  [CLUE.CREDENTIAL_HINT]: '云雁邮 · 谛听',
  [CLUE.YUESHENGZHUANG_LEGEND]: '景区官网',
  [CLUE.THREE_YEAR_TRADITION]: '景区官网',
  [CLUE.LAST_NORMAL_MSG]: '谛听 · 聊天',
  [CLUE.ABNORMAL_PHOTO]: '谛听 · 聊天',
  [CLUE.OFFLINE_TIME]: '谛听 · 聊天',
  [CLUE.TAMPERED_REPORT]: '岳桩资讯',
  [CLUE.KEYCARD_MAINTENANCE]: '研讨会工作台',
  [CLUE.FAKE_RETURN]: '第一阶段结尾',
  [CLUE.LAB_ACCESS]: '实验室内网',
  [CLUE.LIN_XUZHI]: '实验室内网',
  [CLUE.PROTAGONIST_VESSEL]: '实验室内网',
  [CLUE.SHENRAN_DECOY]: '实验室内网',
  [CLUE.MOTHER_CANT_LEAVE]: '实验室内网',
  [CLUE.SHELL_LEFTHAND]: '实验室内网',
  [CLUE.HALF_SHENRAN]: '未知号码',
  [CLUE.ONLY_WAY_OUT]: '未知号码',
  [CLUE.FAMINE_PUNISHMENT]: '县志档案库',
  [CLUE.OLD_MEDICAL_RECORD]: '县志档案库',
  [CLUE.VILLAGE_DECLINE]: '县志档案库',
  [CLUE.GUILU_ROSTER]: '合奘教 · 内部',
  [CLUE.RITUAL_LOG]: '合奘教 · 内部',
  [CLUE.LIN_LETTER]: '合奘教 · 内部',
  [CLUE.FORUM_ARCHIVE]: '乡邻论坛',
  [CLUE.SEARCH_CENSORSHIP]: '乡邻论坛',
  [CLUE.ZHOU_FAMILY]: '云雁邮 · 周衍',
  [CLUE.LUYUAN_INTERCEPT]: '云雁邮 · 垃圾箱',
  [CLUE.LUYUAN_SILENCED]: '云雁邮 · 垃圾箱',
  CLUE_SIDE_ANNALS: '县志档案库',
};

/** 调查手记分组显示顺序 */
export const CLUE_GROUP_ORDER = [
  '云雁邮', '云雁邮 · 谛听', '云雁邮 · 周衍', '云雁邮 · 垃圾箱',
  '景区官网', '县志档案库', '谛听 · 聊天', '岳桩资讯',
  '研讨会工作台', '第一阶段结尾', '实验室内网', '未知号码',
  '乡邻论坛', '合奘教 · 内部',
] as const;

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
  /** 合奘教内部区（执礼人终端）：礼名"归山"拼音 + 上一届归山礼公历年（2027-3=2024） */
  GUILU_GATE: normalizeInput('guishan2024'),
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
  // —— 扩展新闻（背景/伏笔/干扰）——
  {
    id: 'missing_2016',
    title: '驴友张某在岳桩山失联，搜救未果',
    date: '2016-02-18',
    source: '岳桩县融媒体中心（存档）',
    snippet: '……张某于本月进入岳桩山未归区域。据称当时恰逢"正月初十"前后……（报道措辞与 2019 年事件高度相似）',
    matchKeywords: ['失联', '失踪', '岳桩山', '正月初十'],
  },
  {
    id: 'scenic_approval',
    title: '岳桩山生态景区开发项目获县发改委批复',
    date: '2023-06-10',
    source: '岳桩县发改委',
    snippet: '批复同意岳桩生态文化发展有限公司对岳桩山部分区域进行旅游开发，含住宿、步道与生态研究设施……',
    matchKeywords: ['开发', '批复', '公司', '景区'],
  },
  {
    id: 'filial_protect',
    title: '岳桩村"敬老节"民俗保护工作座谈会召开',
    date: '2024-01-12',
    source: '岳桩县文旅局',
    snippet: '会议强调要"讲好敬老故事""让千年孝老文化焕发新生"……',
    matchKeywords: ['敬老', '民俗', '保护', '正月初十'],
  },
  {
    id: 'lin_award',
    title: '我县青年学者林叙之获神经再生研究大奖',
    date: '2021-11-05',
    source: '岳桩县科协',
    snippet: '林叙之博士在"外周神经再生与记忆接口"领域的突破性研究获奖……据称其近年常驻岳桩山开展田野研究',
    matchKeywords: ['林叙之', '神经', '研究', '学者'],
  },
  {
    id: 'water_quality',
    title: '岳桩山山泉水水质检测：各项指标优良',
    date: '2025-12-20',
    source: '岳桩县疾控中心',
    snippet: '最新检测显示，岳桩山地下泉水含有罕见的矿物质组合，长期饮用"有助于安眠"……',
    matchKeywords: ['水质', '泉水', '检测', '饮用'],
  },
  {
    id: 'env_complaint',
    title: '【存档·已删除】关于后山生态区的不明气味投诉',
    date: '2024-09-08',
    source: '市民热线（残）',
    snippet: '……投诉人称后山夜间有"甜腻的、让人头晕"的气味，并伴有低频嗡鸣。部门回复：经核查系自然生态现象……（本条原已删除，存档缓存残留）',
    matchKeywords: ['后山', '气味', '投诉', '嗡鸣'],
  },
  {
    id: 'traffic_notice',
    title: '岳桩山旅游专线班车夏季时刻表',
    date: '2026-05-01',
    source: '岳桩县交通局',
    snippet: '夏季每日往返县城与岳桩山景区的班车增至 6 班……',
    matchKeywords: ['班车', '交通', '时刻表'],
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

/**
 * 三级渐进提示文案（绝不直接给答案）。
 * 等级约定（详见 docs/clue_graph.md §四「禁词策略：上下文白名单」）：
 *   L1 = 只给搜索方向 / 观察对象，不点出具体命中关键词；
 *   L2 = 点出两条线索之间的关系，仍不出命中关键词原词；
 *   L3 = 帮助玩家脱困。搜索类谜题的 L3 允许出现答案性命中词
 *        （因 matchSearch 用子串匹配，描述性语言不命中，玩家照抄提示必须能得到结果）；
 *        口令类/P11 的 L3 仍不得直接给出完整口令字串或最终识别词。
 *
 * 禁词分三层（由 tests/hints.test.ts 守卫，三层定义与 docs 完全一致）：
 *   ① 全等级严格禁：账号、完整口令、口令分段、P11 宠物名"芝麻"、"选第 N 条"式指令；
 *   ② L1/L2 禁（搜索题答案性命中词）：
 *      - P02：岳圣桩、圣桩（"桩"作为木桩剧情上下文词，允许）；
 *      - P04：失踪、失足、周某；
 *      - P09：离山、根脉、容器、迁移（"主体"作为剧情上下文高频词，允许）；
 *   ③ 页面/数据上下文词（含"桩""主体"等剧情词）：不计入 HINTS 禁词。
 */
export const HINTS: Record<string, string[]> = {
  search_p02: [
    '景区官网多半收录了当地山川与民俗传说——先想想这座山最有名的地标叫什么。',
    '传说页通常按"地名 + 民俗"分类；那根被当作地标的大木桩，民间对它有专有称呼。',
    '官网搜索框支持单字命中：把那根"桩"在民间口头称呼里的核心字打进去，传说页就会浮出来。',
  ],
  search_p04: [
    '资讯库的旧报道标题往往保留了最初的事由——留意那些被官方"温和化"措辞盖住的事件。',
    '把 P02 的民俗传统日期，和这里旧报道的日期对照看：同一时间窗口反复出现，就不是巧合。',
    '标题写的是"自行失足/自行返回"，但正文用词对不上；试着用标题里那个表示"人不见了"的词去搜，被改过的存档才会出现。',
  ],
  login_p05: [
    '账号在邀请函里写得明明白白；口令规则则在另一封"入住资料"邮件里——两封信要一起看。',
    '口令由两段拼成：一段是参会证上的数字尾号（沈苒在聊天里瞟到过），另一段是研讨会全名的拼音首字母。',
    '先去聊天记录里定位沈苒提到"前台登记时看了一眼"的那句，拿到尾号；再把研讨会名称逐字取拼音首字母接在后面，注意去空格、转小写。',
  ],
  login_p08: [
    '这道门禁认的是"本实验室负责人"——先在访客登记表上把他这个人找出来。',
    '登记表负责人的姓名，和工位分布图上 B 区的某个编号，是同一个的两半。',
    '把负责人姓名的拼音首字母（每个字取首个字母）和工位编号拼到一起，去掉分隔符、统一小写，就是门禁要的串。',
  ],
  search_p09: [
    '实验室档案里有一类专门记录"主体"自身局限的实验——想想它最想去却去不成的地方。',
    '把"主体无法脱离的地下网络"和"它想找的人类宿主"这两条线索连起来，对应的档案关键词就在这两段描述里。',
    '检索框支持档案正文命中：直接输入"容器"二字，会调出评估参会者适配性的那份绝密报告——它才是推动你做出判断的关键档案。',
  ],
  identify_p11: [
    '能模仿她的东西擅长复述"你们之间的大事"，却会漏掉那些太小、太琐碎的私密细节。',
    '真沈苒的判断依据不在剧情高潮里，而在 P03 聊天中她随口提到的、关于家里活物的小习惯。',
    '逐条回看聊天里她和宠物相关的只言片语——某条消息复述了只有你们俩知道的宠物日常，那条才是她。母体不知道这种小事的具体名字。',
  ],
  login_hezong: [
    '这个入口只认执礼人——而教义页早已把"下一次仪式"的时间写得明明白白。',
    '三年一度的礼，教义页写的是"下一届"；口令要的是"最近一届"——两个年份之间，正好差一个周期。',
    '把"礼"的名字那两个字的拼音，与上一届的公历年份拼在一起，去分隔符、统一小写即可。',
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
    isReal: false,
  },
  {
    id: 'm5',
    text: '听我说，你是我见过最好的人。别管我了，去过你自己的生活，忘记这里。',
    isReal: false,
  },
];

// ========== 支线 A+：县志数字档案库 ==========

export interface AnnalsEntry {
  id: string;
  /** 志书分类：灾异志 / 祥瑞志 / 诊籍 / 纪事 */
  book: string;
  title: string;
  era: string;
  snippet: string;
  matchKeywords: string[];
  isKey?: boolean;
  /** 命中后授予的线索 id */
  clue?: string;
  body?: string;
}

export const ANNALS_DB: AnnalsEntry[] = [
  {
    id: 'jiajing',
    book: '灾异志',
    title: '嘉靖十一年废礼与大旱',
    era: '明 · 嘉靖十一至十三年',
    snippet: '邑绅议废送老礼……次年大旱，溪赤如血，稼尽枯……',
    matchKeywords: ['大旱', '旱', '废', '送老', '礼', '灾'],
    isKey: true,
    clue: CLUE.FAMINE_PUNISHMENT,
    body: `【岳桩县志 · 灾异志 · 卷七（点校本）】
嘉靖十一年冬，邑绅议废送老礼，以为"伤化悖伦"，官府从之。
十二年，大旱。山溪赤如血，稼尽枯，牲畜多毙，村民大恐。
十三年正月，乡老率众复行礼于圣桩。是岁，大熟。
自是六十余年，无人敢复言废。

（点校注：本条"溪赤如血"与民间"山溪变浑"传说对应；"复行礼……是岁大熟"的因果表述，
在历代修志中被反复抄录，未见官方解释。）`,
  },
  {
    id: 'guangxu',
    book: '诊籍',
    title: '光绪二十六年嗜眠之症',
    era: '清 · 光绪二十六年',
    snippet: '患者多梦山中人呼己名……迁居平原月余自愈，归则复患。',
    matchKeywords: ['嗜眠', '失眠', '梦', '溪水', '症', '医'],
    isKey: true,
    clue: CLUE.OLD_MEDICAL_RECORD,
    body: `【岳桩县志 · 诊籍（邑中医家诊籍辑录）】
光绪二十六年，邑中嗜眠之症流行。患者昼倦夜眠，睡中多梦山中人呼己名，声"轻而温"，醒则怅然若失。饮山溪水者尤甚。
城中医以安神汤投之，不效。
有举家迁居平原者，月余自愈；归村未匝月，复患。
医者不解，记于诊籍，附论曰："此症随水而驻，随人而迁，去山则已，近山则发，非药石所能为力。"

（点校注："去山则已，近山则发"八字典型，可与现代水源检测报告对照阅读。）`,
  },
  {
    id: 'village',
    book: '纪事',
    title: '村小撤并与并村外迁',
    era: '1998 / 2008',
    snippet: '村小撤并……半数村民外迁……敬老节参与户数逐年递减。',
    matchKeywords: ['撤并', '学校', '小学', '搬迁', '外迁', '村庄', '变迁'],
    isKey: true,
    clue: CLUE.VILLAGE_DECLINE,
    body: `【岳桩县志 · 纪事（续编 · 二十一世纪卷）】
1998 年，因生源不足，岳桩村小学撤并，学童转至镇中心校寄宿。
2008 年，并村搬迁政策实施，半数村民迁入镇安置区。
纪事栏附记：敬老节（三年一度民俗）参与户数逐年递减，2016 年届仅旧村留守户参与，
"仪式简办，执礼人言'山不怪罪'"。

（编者按：本县此一民俗之存续，与村落人口结构密切相关。）`,
  },
  {
    id: 'qianlong',
    book: '风土',
    title: '乾隆间伐桩异闻',
    era: '清 · 乾隆年间',
    snippet: '县令禁"淫祀"，遣衙役伐桩，役夫夜见桩下白骨成行……',
    matchKeywords: ['伐', '桩', '淫祀', '衙役', '白骨', '风土'],
    body: `【岳桩县志 · 风土 · 旧闻（节录）】
乾隆间，县令以"送老礼"近淫祀，欲禁之，遣衙役伐岳圣桩。
役夫入山，夜宿桩侧。传其归也，惊惧不能言，但云"桩下白骨成行，皆立"。
县令异之，事遂寝。桩至今存。

（点校注：本条属志怪旧闻类，历代修志者多存而不论。）`,
  },
  {
    id: 'xiangrui',
    book: '祥瑞志',
    title: '历届归山年之"嘉禾"',
    era: '历代',
    snippet: '凡行礼之岁，秋必报"嘉禾""泉香"……',
    matchKeywords: ['嘉禾', '祥瑞', '丰收', '泉香', '归山'],
    body: `【岳桩县志 · 祥瑞志（辑录）】
凡行送老礼之岁，秋必报"嘉禾"（一茎多穗之稻）与"泉香"。
志乘相沿，凡三十七见，跨明、清、民国至今。
修志者按："礼成而岁丰，理不可晓，姑志之。"

（点校注：三十七次"礼成岁丰"的稳定对应关系，用现代语言说，接近一种"服务合同"。）`,
  },
];

// ========== 支线 D：论坛回收站与屏蔽词 ==========

export interface DeletedPost {
  id: string;
  user: string;
  title: string;
  date: string;
  /** 删除通知（系统显示） */
  removedNote: string;
  /** 残留正文 */
  fragment: string;
  isKey?: boolean;
}

export const FORUM_DELETED: DeletedPost[] = [
  {
    id: 'd1',
    user: 'zhouyan2019（周衍）',
    title: '寻找我哥周行野，2月14日进山未归（我们是外地来的家属）',
    date: '2019-03-05',
    removedNote: '该帖已被管理员删除（2019-03-07）· 理由：不实信息',
    fragment: `我哥周行野，34 岁，2 月 14 日进岳桩山拍照片，至今未归。
警方搜救三天，只在山下捡到他的背包，人和相机都没找到。
报上说"自行失足"，可是——
（以下内容已随删除丢失，仅存缓存残片）
……如有目击者请联系：zhouyan2019@yunyan.mail。酬谢。`,
    isKey: true,
  },
  {
    id: 'd2',
    user: 'zhouyan2019（周衍）',
    title: '重发：寻找我哥周行野（上一帖为什么被删？）',
    date: '2019-03-11',
    removedNote: '该帖已被管理员删除（2019-03-12）· 理由：重复发帖',
    fragment: `上一帖被删了，没有人给我解释原因。
我只想问三个问题：
一、报上写"家属未提异议"——没有人来问过我们，何来异议？
二、我哥的相机去哪了？背包在，相机不在。
三、为什么我在这个论坛上，连找个亲人都不行？
（以下内容已随删除丢失）
……联系方式同前。我不会放弃的。`,
    isKey: true,
  },
  {
    id: 'd3',
    user: '用户已注销',
    title: '（标题已丢失）',
    date: '2021-10-02',
    removedNote: '该帖已被管理员删除（2021-10-03）· 理由：旧事重提',
    fragment: `（残片）……我爷爷那辈传下来的规矩，本来不是这样的。
早年的礼，是"山来接人"；后来不知从哪年起，变成"人送人"。
什么时候变的，老人的说法都对不上……
（其后内容不可恢复）`,
  },
  {
    id: 'd4',
    user: '守桩人家的孙女',
    title: '桩子底下的门，是哪年修的？',
    date: '2024-02-20',
    removedNote: '该帖已被管理员删除（2024-02-20）· 理由：涉及内部区域',
    fragment: `问个事：岳圣桩后面那扇铁门（写着"维护通道"）到底是哪年修的？
我小时候（零几年）那边明明只有一道木栅栏。
我们家守桩守了不知多少代，我爸从来不许我问这个。今年送完礼，他一个人坐了一整夜。
（以下内容已随删除丢失）`,
  },
];

/** 论坛搜索屏蔽词：命中即显示"部分结果未予显示"系统条（屏蔽本身即线索）。 */
export const FORUM_CENSOR_KEYWORDS = ['失踪', '失足', '周行野', '周衍', '送老', '失踪案', '白骨'];

/** 屏蔽系统条的文案（N 条由页面计算注入）。 */
export const CENSOR_NOTICE = (n: number) =>
  `根据相关规定，部分结果未予显示（${n} 条）。`;
