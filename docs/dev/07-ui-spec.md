# 07 · 界面规范（令牌、组件、图表、响应式、可访问性）

视觉方向：浅色导航轨让内容优先；钴蓝只用于交互与 A 期，B 期一律用灰；红、绿、琥珀只表达业务好坏；数字用等宽数字。参考了 Linear（调暗导航、紧凑页签、键盘优先）、Stripe（指标卡即页签、迷你线只看方向）、Shopify Polaris（视图标签 + 批量操作的索引表）、Google Ads 建议页（按影响排序、采纳 / 忽略）、Vercel Geist（克制配色、细线代替重阴影）。

## 1. 设计令牌

所有颜色都通过 CSS 变量（或主题对象）引用。深色模式不是自动反色，而是一套独立取值；系统深色 + 用户显式选择（`data-theme`）两种方式都要生效。

### 1.1 颜色

| 令牌 | 浅色 | 深色 | 用途 |
| --- | --- | --- | --- |
| `--bg` | `#f6f7f9` | `#0a0e16` | 画布 |
| `--surface` | `#ffffff` | `#121824` | 卡片、面板、表格 |
| `--surface-2` | `#f9fafb` | `#161d2b` | 表头、次级底 |
| `--sunken` | `#f0f2f5` | `#0e131d` | 分段控件底、标签底 |
| `--hover` | `#f3f5f8` | `#1a2231` | 悬停 |
| `--line` / `--line-2` | `#e7eaef` / `#d7dce4` | `#222b3b` / `#2f3a4d` | 分隔线 / 控件边框 |
| `--fg` / `--fg-2` / `--fg-3` | `#101828` / `#475467` / `#8a93a3` | `#e8ecf3` / `#a8b2c3` / `#77829a` | 正文 / 次级 / 弱化 |
| `--accent` | `#2f5fef` | `#6f94ff` | 交互、选中、链接 |
| `--accent-weak` / `--accent-line` | `#edf2ff` / `#c3d1fc` | `#18244a` / `#2c4382` | 选中底 / 选中边 |
| `--on-accent` | `#ffffff` | `#0a0f1f` | 主按钮文字 |
| `--a` | `#2f5fef` | `#6f94ff` | A 期 |
| `--b` / `--b-weak` / `--b-ink` | `#9ba5b6` / `#eff1f5` / `#5a6476` | `#6b7689` / `#1c2332` / `#a6b0c0` | B 期 |
| `--good` / `--good-weak` | `#0b935d` / `#e4f5ec` | `#3fcb8b` / `#0f2a1f` | 好 |
| `--bad` / `--bad-weak` | `#dc3c37` / `#fdeceb` | `#ff6b63` / `#351718` | 坏 |
| `--warn` / `--warn-weak` | `#b86f00` / `#fdf3df` | `#f0b14a` / `#2f240e` | 注意 |
| `--c1` / `--c2` | `#2f5fef` / `#eb6834` | `#5b87ff` / `#e8692a` | 图表系列 1 / 2 |
| `--c1-fill` | `rgba(47,95,239,.13)` | `rgba(91,135,255,.2)` | 面积填充 |
| `--band-a` / `--band-b` | `#eef3ff` / `#f2f4f7` | `rgba(111,148,255,.09)` / `rgba(255,255,255,.035)` | 图表中 A / B 期底色带 |
| `--hm-lo` / `--hm-hi` / `--hm-ink` | `#f1f4fa` / `#1c5cab` / `#ffffff` | `#1a2130` / `#5598e7` / `#0b1020` | 顺序色阶两端与深色格文字 |
| `--dv-good` / `--dv-bad` / `--dv-mid` | `#2a78d6` / `#e34948` / `#f0efec` | `#3987e5` / `#e66767` / `#383835` | 发散色阶（有利 / 不利 / 中点） |
| `--mt1`…`--mt5` | `#2a78d6` `#eb6834` `#1baf7a` `#eda100` `#e87ba4` | `#3987e5` `#d95926` `#199e70` `#c98500` `#d55181` | 匹配方式：自动、广泛、词组、精准、ASIN（固定顺序，不随数量变化重排） |
| `--nav-bg` / `--nav-fg` / `--nav-fg-2` | `#f6f7f9` / `#667085` / `#101828` | `#0a0e16` / `#8a95ab` / `#eef2f8` | 导航轨 |
| `--scrim` | `rgba(13,20,36,.42)` | `rgba(0,0,0,.6)` | 遮罩 |

阴影：`--sh-1: 0 1px 2px rgba(16,24,40,.035)`（卡片，几乎不可见）；`--shadow: 0 4px 12px rgba(16,24,40,.07), 0 18px 44px rgba(16,24,40,.16)`（弹层、对话框）。深色模式阴影加深（见原型）。

匹配方式五色与图表主色已用色觉障碍校验工具检查过相邻对比；改色时需要重新校验。

### 1.2 字体

| 角色 | 字体栈 | 说明 |
| --- | --- | --- |
| 界面 | `Geist, "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif` | 字重 400 / 500 / 600，不超过 600 |
| 数字 | `Geist, "Noto Sans SC", system-ui, sans-serif` + `font-variant-numeric: tabular-nums` | 表格、KPI、金额 |
| 等宽 | `"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace` | ASIN、SKU、投放表达式 |

Geist、Geist Mono、Noto Sans SC 从 Google Fonts 加载；本地离线时回退系统字体。正式版可改为本地打包字体文件。

### 1.3 字号与间距

| 元素 | 规格 |
| --- | --- |
| 正文 | 13px / 1.55 |
| 页标题 h1 | 20–21px / 600；手机 18px |
| 面板标题 h3 | 14px / 600 |
| KPI 数值 | 28px / 600（手机 23px） |
| 结论句（总览） | 18px / 600；报告结论句 20px / 500 |
| 报告章节标题 h2 | 19px / 600（手机 17px）；封面标题 28px（手机 23px） |
| 表格正文 / 表头 | 13px（数字 13.5px / 500）/ 12px / 500 |
| 辅助说明 | 11.5–12.5px，`--fg-3` |
| 页面内边距 | 22px 24px（≤ 1279px 18px 20px；手机 14px 16px，底部为标签栏留出空间） |
| 模块间距 | 16px |
| 圆角 | 卡片 12px、按钮 9px、小按钮 7px、标签 11px（胶囊）、弹层 14px、对话框 16px |

## 2. 组件

| 组件 | 规格 |
| --- | --- |
| 按钮 | 高 34px（小号 28px）；默认白底描边；主按钮强调色；幽灵按钮无边框；危险按钮红；禁用 42% 不透明且不可点 |
| 分段控件 | 凹陷底 + 选中项白底；用于来源、视图模式、指标切换等互斥选项；`aria-pressed` |
| 视图页签 | 文字 + 数量；选中项下划线；`role="tab"` |
| 筛选标签（tchip） | 高 30px，彩点 + 名称 + 数量；选中强调色描边 |
| 业务标签（tag） | 高 21px 胶囊；风险红、机会绿、提升蓝、需核查琥珀、观察灰描边、“+N”灰 |
| 变动标签（mv） | 新增蓝、增长绿、下滑琥珀、消失红、稳定灰 |
| 变化徽标（d） | 高 20px，箭头图标 + 文本；好绿底、坏红底、中性灰底；持平 / 不可计算为纯文字 |
| 结果标签（rs） | 回看结果、判断：好绿、坏红、注意琥珀、中性灰 |
| 置信度（cf） | 高绿、中琥珀、需复核灰描边 |
| 优先级（pri） | 高红、中琥珀、低灰 |
| “新增”标记（newb） | 琥珀虚线框小字，标出需评审的新增展示（正式版可去掉或保留在开发环境） |
| 横幅（bn） | 信息白底、注意琥珀底、错误红底、进行中蓝底；左侧图标，右侧操作按钮 |
| 状态胶囊（status） | 高 28px 圆角；已更新绿、更新中转圈、失败红可点 |
| 空状态（empty） | 居中图标 + 标题 + 一段说明 + 操作按钮 + 可选的格式标签 |
| 弹层（pop） | 白底、14px 圆角、`--shadow`；点外部或 Esc 关闭；手机为底部面板（遮罩 + 18px 上圆角 + 安全区内边距） |
| 对话框（modal） | 最宽 520px；危险操作用 `role="alertdialog"`，写明后果，需勾选确认 |
| 表格（关键词） | 表头 40px 吸顶、`--surface-2` 底；A 列头浅蓝底 + 顶部 2px 蓝线，B 列头浅灰底 + 灰线；行高 48px（紧凑 36px，紧凑时隐藏关键词下方小字）；首列吸左并带右边线；悬停 `--hover`；选中行 `--accent-weak` + 左侧 3px 强调线；最近查看行左侧 3px 浅强调线 |

## 3. 图表

通用规则：单一纵轴（不做双纵轴）；网格线虚线且弱化；轴文字 11px `--fg-3`；文字用文本色，不用系列色；系列 ≥ 2 时必须有图例；悬停有提示框（十字线或单项高亮）；缺日不补零、线条断开。

| 图表 | 位置 | 规格 |
| --- | --- | --- |
| 每日趋势 | 总览 | 面积 + 2.25px 线；A、B 期底色带与“A 期 / B 期”胶囊标签；纵轴 5 档 nice 刻度；缺日竖虚线 + “缺”；末点实心圆；悬停十字线 + 提示（日期、星期、所属期、当前指标与另外三项） |
| KPI 小图 | 总览 KPI | A 逐日实线 + 面积，B 逐日虚线，按第 N 天对齐；无坐标轴 |
| 瀑布图 | 复盘分析 A/B、报告变化归因 | B 期总额（灰）→ 各因素贡献 → A 期总额（强调色）；柱宽 ≤ 68px；纵轴截取到有变化的区间（下限 = 最低点 − 跨度 × 0.7，上限 = 最高点 + 跨度 × 0.22），被截断的总额柱画白色锯齿断轴；柱顶数值、下方因素名与变化百分比；颜色规则见 `02` 第 8 节 |
| 逐日对照小图 | 复盘分析 A/B | 4 个小图，A 实线 + 点、B 虚线，按第 N 天对齐 |
| 周度小图 | 报告趋势背景 | 12 周；A、B 所在周底色；A 实心点、B 空心点、缺日周小空心点；ACOS 目标虚线；首尾周起始日刻度 |
| 周迷你线 | 周期诊断活动表 | 近 8 周 ACOS，目标红虚线 |
| 周小柱 | 变动清单、详情近 12 周 | 订单 / 花费周柱，0 值浅灰 |
| 热力表 | 活动 × 周、关键词 × 周、星期 × 指标 | 顺序色阶（单色浅 → 深）或发散色阶（有利蓝 / 不利红 / 灰中点）；深色格用 `--hm-ink` 文字；缺日格右上圆点；悬停显示区间、值、花费、订单 |
| 发散条 | 变化来自哪些词、报告活动行 | 0 为中线；正向右、负向左；报告中增长绿 / 下滑红，诊断页用系列色（A 高于 B / A 低于 B） |
| 堆叠柱 / 条 | 匹配方式结构、上期动作分布 | 段间 2px 白色间隔；颜色固定对应类别 |
| 散点 | 效率分层 | 横轴花费平方根刻度，纵轴 ACOS（上限 = max(目标 × 2.2, min(160%, 最大值 × 1.05))）；目标 ACOS 红虚线、目标 CPA 竖虚线；象限注释；点半径 5（样本不足 3.5），2px 白描边；点击打开详情 |
| 无效花费柱 | 结构与效率、报告 | 12 周柱；10%–20% 参考带；最新一周强调色 |

用 Recharts 重做时：`ResponsiveContainer` + `ComposedChart`；A/B 底色带用 `ReferenceArea`；目标线用 `ReferenceLine`；缺日传 `null` 并设 `connectNulls={false}`；瀑布图用堆叠 `Bar`（透明底座 + 数值段）。

## 4. 图标

Lucide 0.460.0（`lucide-react` 同名组件），线宽 1.75，默认 16px。原型用到的图标：

`refresh-ccw` `layout-dashboard` `chart-line` `list-checks` `file-text` `database` `folder-kanban` `sliders-horizontal` `book-open` `flask-conical` `search` `circle-help` `chevrons-up-down` `chevron-down` `chevron-right` `chevron-left` `chevron-up` `calendar-range` `calendar-days` `calendar-x-2` `list-filter` `filter-x` `circle-check` `circle-alert` `triangle-alert` `circle-x` `info` `loader-circle` `x` `check` `plus` `pencil` `trash-2` `copy` `download` `file-down` `file-up` `upload` `file-spreadsheet` `file-question` `file-pen-line` `sparkles` `lightbulb` `history` `layers` `table-2` `user-round-check` `arrow-right` `arrow-left` `arrow-up` `arrow-down` `arrow-up-right` `arrow-down-right` `arrow-up-down` `git-compare-arrows` `trending-up` `rocket` `crosshair` `shield-alert` `mouse-pointer-click` `eye` `eye-off` `tag` `columns-3` `rotate-ccw` `list-x` `search-x` `cloud-off` `refresh-cw` `languages` `lock` `undo` `repeat` `sprout` `ban` `gauge` `circle-pause` `piggy-bank` `square` `circle` `circle-dot` `wallet` `banknote` `shopping-cart` `percent` `target` `plug-zap` `ellipsis` `folder-plus` `minus` `star`

## 5. 响应式断点

| 断点 | 变化 |
| --- | --- |
| ≤ 1499px | 状态胶囊只留图标 |
| ≤ 1439px | 日期按钮隐藏天数；⌘K 按钮只留图标 |
| ≤ 1279px | 导航收为 64px 图标栏；关键词详情改为覆盖；KPI 3 × 2；总览两栏改单栏；周期说明栏移到下方；报告左栏 216px |
| ≤ 1100px | 隐藏“数据截至”；报告单栏、隐藏目录、历史改横向卡片 |
| ≤ 760px | 底部标签栏；顶栏只有项目与范围摘要；弹层改底部面板；KPI 2 × 3；关键词改卡片列表、详情全屏；表格只在自己的容器内横向滚动，页面本身不横向滚动；所有触控目标 ≥ 40px |

页面左右留白至少 16px，并叠加安全区内边距（`env(safe-area-inset-*)`）。

## 6. 可访问性与交互细节

- 所有可交互元素有可见焦点（2px 强调色描边）；图标按钮有 `aria-label`。
- 页签 `role="tab"` / `aria-selected`；分段控件 `aria-pressed`；弹层 `role="dialog"`；危险确认 `role="alertdialog"`；步骤条 `aria-current="step"`；列宽拖柄 `role="separator"`、可聚焦、← → 调整。
- 排序列表头 `aria-sort`。
- 状态不只用颜色：同时用图标、文字或箭头。
- 尊重 `prefers-reduced-motion`：关闭弹层入场动画与平滑滚动。
- 每个表单控件有稳定的 `id`。
- 键盘快捷键见 `04` 第 5.6 节；输入框中不触发单字母快捷键。
- 文案写用户能认出的名字（“导出批量操作表”，不是“生成 bulk 文件”）；按钮写清动作结果。
