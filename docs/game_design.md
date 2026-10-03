# 《岳桩山》游戏设计文档 (Game Design)

> 本文档定义可玩机制、数据/页面架构、状态模型、输入标准化、无障碍与演出规范。
> 与 `world_bible.md` / `timeline.md` / `clue_graph.md` 配合使用。

---

## 一、技术架构

### 1.1 技术栈（确认）

- **Vite + TypeScript** 静态多页面。
- 原生 HTML/CSS/TS，**不引入** React、后端、数据库、复杂游戏引擎。
- 每个虚构网站 = 一个独立 HTML 页面 + 共享 TS 模块。
- 构建产出静态站点，可本地 `vite preview` 或部署到任意静态托管。

### 1.2 目录结构

```
YueZhuangShan/
├─ docs/                       # 设计文档（本目录）
├─ public/                     # 占位图、音频等静态资源
├─ src/
│  ├─ data/
│  │  ├─ pages.ts              # 页面/网站元数据（标题、风格、入口）
│  │  ├─ clues.ts              # 线索、口令、搜索词数据（单一真相源）
│  │  └─ content.ts            # 各页面正文文案（剧情集中管理）
│  ├─ shared/
│  │  ├─ state.ts              # GameState 类型与默认值
│  │  ├─ progress.ts           # 进度/解锁/访问记录逻辑
│  │  ├─ hints.ts              # 三级渐进提示逻辑
│  │  ├─ normalize.ts          # 输入标准化（去空格/大小写/同义词）
│  │  └─ storage.ts            # localStorage 自动存档
│  ├─ ui/
│  │  ├─ theme.ts              # 音量/减少动态/字幕设置应用
│  │  └─ common.css            # 全局样式 + 各站点皮肤变量
│  └─ pages/                   # 每个站点一个目录
│     ├─ index/                # P00 游戏入口
│     ├─ mail/                 # P01 邮箱
│     ├─ scenic/               # P02 景区官网
│     ├─ chat/                 # P03 聊天
│     ├─ news/                 # P04 资讯搜索
│     ├─ backend/              # P05+P06 后台
│     └─ ending/               # P07 结尾
├─ tests/                      # 单元测试（Vitest）
├─ index.html                  # Vite 入口（重定向/链接到 P00）
└─ package.json
```

### 1.3 剧情/组件分离原则

- **剧情文案**全部在 `src/data/content.ts`，不在 HTML 里硬编码大段剧情。
- **口令判断/搜索匹配/进度判断**全部走 `src/shared/*`，不散落在各页面。
- **页面 HTML** 只负责结构和触发，调用 shared 函数。
- 答案数据集中在 `clues.ts`，方便测试和维护。

---

## 二、状态模型 (GameState)

存储于 `localStorage`，key = `yueZhuangShan_save_v1`。

```ts
interface GameState {
  version: number;                 // 存档版本，便于迁移
  createdAt: number;
  updatedAt: number;

  visitedPages: string[];          // 已访问的页面 id
  discoveredClues: string[];       // 已发现线索 id（CLUE_*）
  unlockedNodes: string[];         // 已解锁节点 id（P00..P07 + 支线）

  // 谜题状态
  attempts: Record<string, number>;  // 各谜题错误尝试次数（puzzle_id -> count）
  hintLevel: Record<string, 0|1|2|3>; // 各谜题当前提示等级
  solvedPuzzles: string[];           // 已解谜题 id

  // 设置
  volume: number;                  // 0..1
  muted: boolean;
  reduceMotion: boolean;
  subtitles: boolean;
}
```

### 2.1 进度门控（progress.ts）

- `unlock(nodeId)`：解锁节点，写 unlockedNodes。
- `isUnlocked(nodeId)`：判断是否可访问（页面入口据此启用链接）。
- `markVisited(pageId)`、`discoverClue(clueId)`。
- 节点依赖（硬编码在 progress.ts 的 DEPENDENCIES 表）：
  - P01 依赖 P00 完成（入口确认）。
  - P02、P03 在 P01 之后开放（玩家可自由切换）。
  - P04 依赖 CLUE_OFFLINE_TIME（玩家读过沈苒失联）。
  - P05 依赖 CLUE_TAMPERED_REPORT（解出搜索谜题）。
  - P06 依赖 P05 登录成功。
  - P07 依赖 CLUE_KEYCARD_MAINTENANCE。

### 2.2 自动存档与重新开始

- 每次状态变更后自动写 localStorage。
- "重新开始"清空 key 并重载到 P00。
- 提供"导出存档/导入存档"（JSON 文本），便于调试与未来多设备。

---

## 三、输入标准化 (normalize.ts)  ★核心可维护性★

> 目标：不因细微格式差异让玩家卡关。所有搜索/口令输入必须经过标准化再比对。

### 3.1 标准化函数 `normalizeInput(raw, opts?)`

默认行为：
1. 去除首尾空白。
2. 全角字符 → 半角（全角数字字母、全角空格）。
3. 转小写（除非 opts.caseSensitive）。
4. 去除所有内部空白与常见分隔符（空格、`-`、`_`、`.`、`/`），除非 opts.keepSeparators。

### 3.2 同义词表 `SYNONYMS`

为关键词搜索提供有限同义词，避免"换个说法就找不到"：
- "岳圣桩" ≡ "圣桩" ≡ "桩"
- "失踪" ≡ "失足" ≡ "走失" ≡ "下落不明"
- "周某" ≡ "周" (作为搜索词的前缀命中)

### 3.3 搜索匹配 `matchSearch(query, targetKeywords[])`

- 对 query 和每个 target keyword 都做 normalize。
- 命中条件：标准化后的 query **包含**任一标准化后的 keyword，或经同义词展开后包含。
- P04 旧报道的命中关键词集合：`["失踪","失足","岳圣桩","周某"]`。

### 3.4 口令比对 `checkPassword(input, answerId)`

- 从 clues.ts 取 answer 的标准答案（已标准化形式）。
- 对玩家 input 做**相同**标准化后比对。
- 错误时 attempts++，并按阈值提升 hintLevel（见下）。

---

## 四、提示系统 (hints.ts)

### 4.1 自动升级阈值

每个谜题的错误尝试达到以下阈值时，自动提升提示等级（最高 L3）：
- L1：默认可见（玩家可随时查看"我卡住了"）。
- L2：错误尝试 ≥ 2 次。
- L3：错误尝试 ≥ 4 次。

### 4.2 手动请求

玩家可手动"请求提示"，每谜题每次手动请求升 1 级（封顶 L3）。
手动请求会被记录，但不增加 attempts。

### 4.3 提示文案

集中在 clues.ts 的 HINTS 表，内容见 clue_graph.md §四，绝不直接给答案。

---

## 五、无障碍与演出规范

### 5.1 无障碍（必须）

- **音频静音**：全局 mute，默认静音（避免自动播放惊吓）。
- **音量**：0..1 滑块。
- **字幕**：所有音效/演出附文字字幕（subtitles 开关）。
- **减少动态效果**（reduceMotion）：开启后关闭所有 >1px 的位移动画、闪烁、视差、自动滚动；CSS 用 `@media (prefers-reduced-motion)` + JS 运行时开关双重保障。
- **减少闪烁**：任何闪烁频率 ≤ 3Hz（遵守光敏安全）；reduceMotion 下完全静止。
- **键盘可达**：所有交互元素可用 Tab + Enter 操作。
- **对比度**：正文文字与背景对比度 ≥ 4.5:1（即使暗调恐怖氛围，文字区单独提亮）。半透明文字（opacity 叠加）同样按混合后色值核算：手记弹层未解锁结局槽位 opacity 0.6（混合后 5.1:1）；首页天气标签用 #26690c（浅绿底 5.9:1，原 #52c41a 仅 1.97:1，已修）。

### 5.2 恐怖演出（克制原则）

- 切片只做**一次**克制演出（P07 结尾）：
  - 不用 jump-scare 音效；用静态图像的细微"不对劲"（菌斑、对称、时间戳）。
  - 文字逐字淡入（reduceMotion 下改为直接显示）。
  - 不血腥、不露骨。
- P03 异常照片仅为"安静的不适"（对称菌斑），不是吓人图。

### 5.3 音频系统（已实现）

音效经 `src/shared/sfx.ts` 统一管理，遵守全部无障碍原则：

| 音效 | 文件 | 落点 | 触发 |
|------|------|------|------|
| 氛围底噪（循环） | ambient_drone.wav | P07 结尾 | 进入即循环播放，pagehide 停止 |
| 故障电流音 | glitch_click.wav | P07 结尾 | 假消息逐字出现时的"信号接入" |
| 手机震动 | phone_buzz.wav | P06 后台 | 发现房卡记录 1.2s 后"手机震了一下" |
| 水滴回声 | water_drip.wav | P03 聊天 | 菌斑照渲染后 0.5s |

**无障碍保障**：
- 默认静音（state.muted = true）。
- `canPlaySound()` = `!muted && !reduceMotion`——**减少动态效果开启时，所有音效自动静音**（恐怖音效本质是刺激）。
- 字幕独立于声音：只要 `subtitles` 开，即使静音也浮现 `[音效描述]`。
- 设置变更经 `refreshSfxSettings()` 实时同步（如播放中切换静音立即生效）。

> **已知技术债**：当前音频为 wav 无损格式，总体积约 18MB（其中 ambient_drone 占 13MB）。
> 后续可转 ogg/mp3 压缩至 2-3MB。需 ffmpeg 或在线工具。当前优先功能，体积可接受。

### 5.3 内容提醒 (P00)

入口必须提示：本作含**悬疑、失踪、心理操控主题**虚构内容；提供"减少动态效果"与"静音"预设开关；明确"所有人物机构均为虚构，不读取真实个人信息"。

---

## 六、第一阶段纵向切片范围（≈15 分钟）

| 节点 | 时长估计 | 必含机制 |
|------|----------|----------|
| P00 入口 | 1 min | 内容提醒、音量、减少动态、字幕、开始/继续/重开 |
| P01 邮箱 | 1.5 min | 阅读邀请函/日程/入住资料，提取账号与口令规则 |
| P02 景区官网 | 2 min | 关键词搜索（岳圣桩），传说页 + 支线入口 |
| P03 聊天 | 1.5 min | 查看消息/照片，建立失联时间锚点 |
| P04 资讯搜索 | 2 min | **关键词搜索谜题** → 被篡改旧报道 → 时间线矛盾#1 |
| P05 后台登录 | 2 min | **口令推理谜题**（账号+密码，双线索） |
| P06 后台记录 | 2 min | 房卡刷卡记录 → 时间线矛盾#2 |
| P07 结尾 | 1 min | 假消息+照片矛盾 → **克制演出** → 阶段结束页 |

必含项核对：
- [x] 一道口令推理（P05）
- [x] 一道关键词搜索（P04）
- [x] 一处时间线矛盾（P04 报道 + P06 刷卡，两处互证）
- [x] 一个可选支线（P02 岳氏族谱/县志残页）
- [x] 三级渐进提示（所有谜题）
- [x] 自动存档与重新开始
- [x] 一次克制恐怖演出（P07）
- [x] 清晰阶段结束页

---

## 六A. 支线与背景扩充（第三批次，借鉴《No Results Found》叙事手法）

> 本批次引入三条支线 + 主线结局增强，全部为**可选内容**，不影响主线 P00–P12 推进。

### 6A.1 支线 A+：县志数字档案库（scenic 页内）

- 县志残页下方新增"档案库检索"（`ANNALS_DB` 词条库，matchSearch 命中展开）。
- 三个关键词条各挂一条新线索：CLUE_FAMINE_PUNISHMENT / CLUE_OLD_MEDICAL_RECORD / CLUE_VILLAGE_DECLINE。
- 自由探索，无 attempts/hints；placeholder 只给志书体裁方向，不含任何命中词（测试守卫：placeholder 对 ANNALS_DB 全部 matchKeywords 零命中）。

### 6A.2 支线 B+：合奘教内部区——执礼人终端（hezong 页内）

- 宣传页底部"执礼人入口"（SIDE_HEZONG 解锁后可见）→ 口令谜题 `LOGIN_HEZONG`（答案 `guishan2024`，双线索：教义页"下一届 2027"+ 三年一度 → 上一届 2024；礼名"归山"）。
- 解开后展示三件教内文献（名录/手札/林叙之复函），挂 CLUE_GUILU_ROSTER / CLUE_RITUAL_LOG / CLUE_LIN_LETTER。
- 口令框接入 hints 三级体系（PUZZLE.LOGIN_HEZONG）。

### 6A.3 支线 D：周衍家属线（forum + mail 跨站）

- **回收站**：论坛页脚"存档区"链接 → 被删帖列表（`FORUM_DELETED`）。首次阅读 → CLUE_FORUM_ARCHIVE。
- **搜索屏蔽词**（"无结果即叙事"）：论坛搜索命中 `FORUM_CENSOR_KEYWORDS` 时，结果区顶部显示"根据相关规定，部分结果未予显示（N 条）"系统条 → CLUE_SEARCH_CENSORSHIP。屏蔽不减少实际展示（被删帖本就不在列表），提示条本身就是线索。
- **周衍回信**：发现 CLUE_FORUM_ARCHIVE 后，邮箱新增《回复：关于 2019 年进山未归的周行野》（邮件可见性条件从 requireNode 扩展为可 requireClue）。→ CLUE_ZHOU_FAMILY。

### 6A.4 真相完成度（TruthProgress，ending2）

- 新模块 `src/shared/truth.ts`：`truthProgress(state)` 返回 `{ found, total, ratio, tier }`。
- 分母 = `ALL_DISCOVERABLE_CLUES`（主线 18 条 + 支线 8 条 + 陆远线 2 条 = 28 + 2 = 30）。
- ending2 完成页展示"真相还原度 X%" + 分级文案 + 证据清单（已收集线索标题列表、未收集计数）。
- 证据清单只显示线索**标题**，不重复正文（正文在来源页）。

### 6A.5 调查手记与结局图鉴（首页收藏栏，第四批次）

- **调查手记**：首页收藏栏新增"📋 调查手记"入口（发现 ≥1 条线索后出现），弹层展示：
  - 真相还原度 X% + 分档文案（复用 truth.ts）；
  - 线索按来源分组（`CLUE_GROUPS`：邮箱 / 聊天 / 景区·县志 / 论坛 / 合奘教 / 实验室内网 / 结局·其他）；
  - 未收集线索不显示标题，仅按分组给出"待发现"计数（防剧透 + 暗示挖掘方向）。
- **结局图鉴**：`GameState.endingsSeen: string[]`（存档 v1 向后兼容，mergeState 补默认空数组）。
  - ending2 选定结局时写入选项 id（submit / burn / vessel）。
  - 手记弹层展示三个结局槽位：已见显示名称，未见显示"？？（尚未抵达）"。
- **空收件箱引导修复**：邮箱在 P01 未激活且无可见邮件时，列表区显示"邮箱尚未开通——请从导航首页开始"（修复直接输 URL 进入时白屏式空列表）。

### 6A.6 垃圾箱与陆远线（支线 E，第四批次）

- 邮箱新增**垃圾箱**文件夹（收件箱/垃圾箱两个 tab，垃圾箱 tab 带未读计数）。
- 原"推广"邮件移入垃圾箱；新增 2 封干扰邮件（刷单/游戏广告）。
- **陆远线**（呼应《归山名录》"P-03 陆远（备）"）：
  - `luYanSpam1`（06-20 22:47，requireNode P04）：晚宴茶水有问题的警告，被山庄邮件网关以"敏感词"隔离 → CLUE_LUYUAN_INTERCEPT。
  - `luYanSpam2`（06-20 23:58，requireNode P06）：目击对门参会者深夜被"搀扶"带走；"如果我明天没出现在闭幕式" → CLUE_LUYUAN_SILENCED。
- **论坛叙事化指引**：CHAT.historyMessages 新增一条 06-19 消息（沈苒行前提到"乡邻论坛"），为支线 D 提供有机入口。

### 6A.7 新增音效落点（第四批次）

| 音效 | 落点 | 触发 |
|------|------|------|
| water_drip | 论坛存档区 | 首次打开存档区 |
| glitch_click | 论坛屏蔽系统条 | 系统条出现时 |
| glitch_click | 合奘教执礼人终端 | 口令通过时 |
| glitch_click | 邮箱垃圾箱 tab | 首次切换到垃圾箱 |

---

## 七、测试范围（tests/）

1. **state / progress**：解锁依赖、访问记录、线索发现。
2. **normalize**：
   - 全角→半角、去空格、去分隔符、大小写。
   - 同义词展开（"圣桩"命中"岳圣桩"）。
3. **search**：P04 命中集合（"失踪"/"失足"/"岳圣桩"/"周某"命中；无关词不命中）。
4. **password**：P05 标准答案及多种等价写法通过（`0427 ywyxxsc`、`0427-YWYXXSC` 等都应通过）。
5. **hints**：错误次数达阈值自动升级；手动请求升级。

---

## 八、已采用的合理假设（不改变核心方向，记录在案）

1. 切片年份定为 **2026**（与现实同步），后续可调整。
2. 女友本名定为"**沈苒**"，科学家对外身份"**林叙之**"——均为虚构，便于指代。
3. 主角不给出真实姓名，全程第一人称"我"，增强代入；会议账号用代号 `protagonist` 对应的虚构邮箱。
4. 口令答案 `0427ywyxxsc` 为切片用，后续阶段可改；集中在 clues.ts。
5. 占位图用 CSS/SVG 绘制（菌斑、灭火器轮廓、工牌挂钩），不生成最终美术。
6. 旧报道日期 2019-02-14 经核对 = 当年正月初十，与传统一致（已在 timeline 自检）。
7. 框架用 Vite 多页面（rollupOptions.input 配置多个 HTML），不引入路由库，保持"拟真独立网站"观感（每个站点是真实 URL）。
