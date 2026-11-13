# 砍半技能描述，再把它们合进主分支

现在最该做的不是再多装几个 Skill，而是先修好两个结构问题。第一，现有 68 个 Skill 只提交在功能分支 `claude/kind-sagan-68eiof` 上，本次核对确认 `origin/main` 根本没有 `.claude/` 目录；云端会话每次从仓库全新克隆起步，不读 `~/.claude/`，也不安装仓库 settings 里声明的插件，所以必须把 `.claude/skills/` 合入默认分支，或者改成 claude.ai 账号技能 ([Configure cloud environments](https://code.claude.com/docs/en/cloud-environments))。第二，本次实测这 68 个技能的 description 加起来约 **20,584 字符**，其中 HeyGen HyperFrames 的 21 个就占约 **10,900 字符**。技能列表的预算只有"上下文窗口的 1%"，超出后，最少被调用的技能会先丢掉描述、只剩名字，也就无法自动触发 ([Skills](https://code.claude.com/docs/en/skills))；本会话自己的技能列表里，`webapp-testing`、`writing-plans`、`video-remotion` 等已经只显示名字。最终建议是：删 11 个（output-skill、redesign-skill、design、design-system、ui-styling、video-remotion、video-moviepy、旧版 taste-skill 和 soft/minimalist/brutalist）；更新 impeccable、ui-ux-pro-max、superpowers、HyperFrames、remotion-dev；新增 14 个官方或高可信度技能。这样常驻 71 个技能，其中只有 **34 个带描述、可自动触发**，28 个设成 `name-only` 交给路由技能调用，9 个设 `disable-model-invocation: true` 只能手动用，自动描述总量降到约 1 万字符。安全、后端/DevOps、框架、产品管理、图表和中文发布类技能大多绑定账号或只适用于特定项目，应在对应项目里临时装，不放进常驻集。

## 68 个技能撑爆了 1% 预算，而且只活在功能分支上

预算机制决定了"装得多"不等于"用得上"。官方文档写明，每个 skill 的 `description` 和 `when_to_use` 合计按 **1,536 字符**截断；整个列表的预算"按模型上下文窗口的 1% 缩放"；列表溢出时，所有技能名都还在，但描述会**从调用最少的技能开始丢弃**，Claude 也就失去了匹配请求所需的关键词 ([Skills](https://code.claude.com/docs/en/skills))。文档没说这 1% 按 token 还是按字符算。在 200K 窗口上，1% 大约是 2,000 token，折合 6–8 千英文字符；即使换成 1M 窗口，也还得跟内置技能和账号技能共用这份预算。本会话可见的 `anthropic-skills:*`（pptx、docx、xlsx、pdf、skill-creator、deep-research 等约 20 个）和内置的 `/code-review`、`/simplify`、`/security-review` 等都挤在同一个列表里。而且插件形式的技能不受 `skillOverrides` 控制，只能到 claude.ai 设置里去关 ([Skills](https://code.claude.com/docs/en/skills))。

逐个测量后还有两个细节值得注意。remotion-dev 那 12 个技能的描述只有 23–47 字符，比如 "Router for all Remotion skills"，占预算极少，但单靠描述几乎触发不了，全靠路由技能 `remotion-best-practices` 分发。HyperFrames 则正好相反：`hyperframes-registry`（892）、`media-use`（830）、`hyperframes`（812）、`hyperframes-audio`（702）这些描述很长，而且它们本来就由入口技能 `hyperframes` 统一路由，让它们每轮都把完整描述带进上下文，回报很低。官方给的处理办法有三种。`disable-model-invocation: true` 让描述完全不进上下文，用户仍可用 `/name` 手动调用。`skillOverrides` 的 `"name-only"` 只保留名字。也可以用 `skillListingBudgetFraction`（例如 `0.02`）把预算调高。此外，`/doctor` 能估算列表成本，`/context` 的 Skills 行显示截断后的实际占用，`/skill-doctor` 会按上下文成本列出从未被调用过的技能 ([Skills](https://code.claude.com/docs/en/skills))。

持久化的问题更直接。官方的"哪些东西能带进云端"表说得很清楚：仓库里提交的 `.claude/skills/`、`.claude/agents/`、`.claude/commands/` 属于克隆的一部分，可以用；`~/.claude/skills/`、只在用户设置里启用的插件、仓库 `.claude/settings.json` 里 `enabledPlugins`/`extraKnownMarketplaces` 声明的插件，**都不会在云端会话里安装** ([Configure cloud environments](https://code.claude.com/docs/en/cloud-environments))。云端会话也用不了 `/plugin` 命令 ([Use Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web))。分支未推送时，会话会从"分支历史里已推送的提交，或仓库默认分支"起步 ([Use Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web))。所以只要技能还只在功能分支上，新会话大概率一个都看不到。另一条路是 claude.ai 账号技能，它会出现在"Cowork、云端会话和用该账号登录的终端会话"里 ([Skills](https://code.claude.com/docs/en/skills))。本会话的 deep-research 正是从 `~/.claude/skills/synced/` 加载的，说明账号同步在云端确实有效。但要注意，在 claude.ai **项目**的云端线程里，仓库的 `.claude/skills/` 不可用，只能靠账号技能 ([Skills](https://code.claude.com/docs/en/skills))。

## 已装 68 个逐项裁决：保留 57、删除 11、半数降级

裁决看三件事：上游是否已经合并或废弃某个技能，是否和更强的同类重叠，是否依赖付费 API 或带强制性指令。设计类重叠最严重。taste-skill 2.5 的 CHANGELOG 写明 `redesign-existing-projects` 已并入主技能，`full-output-enforcement`（即 output-skill）已**删除**，soft/minimalist/brutalist 等"经典款"迁到独立仓库 `Leonxlnx/taste-skill-classics`，并改为 `disable-model-invocation: true` 的可选项 ([taste-skill CHANGELOG](https://github.com/Leonxlnx/taste-skill/blob/main/CHANGELOG.md))。已装的 taste-skill 是 1,206 行的旧版 2.1.x。新版 2.5.1 在 SKILL.md frontmatter 里挂了一个 Stop hook（`gate.mjs`，超时 600 秒），检查不通过就不让 agent 结束，最多三轮 ([taste-skill CHANGELOG](https://github.com/Leonxlnx/taste-skill/blob/main/CHANGELOG.md))。有评测者警告，frontend-design、taste、ui-ux-pro-max、impeccable 同时运行"会互相打架" ([critique.sh](https://www.critique.sh/blog/best-ui-skills-for-ai-agents))。所以设计栈定为 **impeccable（主力，打磨和审计）+ frontend-design（新页面的简短方向指引）**，ui-ux-pro-max 降为手动查询库。ui-ux-pro-max 套件里的 `design` 会调用 `GEMINI_API_KEY`、`ATLASCLOUD_API_KEY`、`MUAPI_API_KEY` 等付费图像 API ([ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/.claude/skills/design))，直接删掉。

impeccable 上游已到 **v4.9.0**，现在是一个技能带约 40 个子命令（shape、audit、critique、polish、animate、bolder、quieter 等），Apache-2.0，2026-11-12 仍有提交。已装副本的 description 和上游不一样，说明版本偏旧。另外它的 `scripts/impeccable` 会从 GitHub Releases 下载引擎 ([pbakaus/impeccable](https://github.com/pbakaus/impeccable))，在受限网络里要确认能访问。ui-ux-pro-max 上游 CLI 是 v2.5.0（80 种风格，其中 51 种在用），已装的是 79/50，同样需要更新 ([ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill))。

工作流这一块，obra/superpowers 7.0.2（2026-11-03 提交，MIT）整体保留 ([obra/superpowers](https://github.com/obra/superpowers))，但它的强制性要特别处理。`using-superpowers` 里写着 "even a 1% chance… you ABSOLUTELY MUST invoke the skill"，`brainstorming` 的描述以 "You MUST use this before any creative work… in software or out of it" 开头 ([using-superpowers SKILL.md](https://github.com/obra/superpowers/blob/main/skills/using-superpowers/SKILL.md))。社区评测普遍认为，五阶段流程放在快速迭代型的设计工作上过重 ([mejba.me 评测](https://www.mejba.me/blog/superpowers-plugin-claude-code-review))。不过也有一次 12 个会话的小样本对比显示，用 superpowers 反而省了约 14% 的 token ([Towards AI](https://pub.towardsai.net/i-tested-jesse-vincents-175k-star-plugin-plain-markdown-makes-sonnet-4-6-cheat-past-opus-4-7-04687feac7c0))，维护者也坚持那些冗长的"合理化表"是经过测试的 ([issue #832](https://github.com/obra/superpowers/issues/832))。这位用户大量做 PPT 和视频小改，强制 brainstorming 的代价会被放大。所以我的立场是：保留 11 个执行型技能自动触发；把 `using-superpowers`（"任何对话开始时"都会加载的路由器）、`using-git-worktrees`（云端分支由平台指定）、`writing-skills`（和账号里的 skill-creator 重叠）、`diagnosing-superpowers`（只在出问题时用）改为手动；再给 `brainstorming` 的描述打一行本地补丁，把范围限定在"构建新软件功能或改代码行为之前，不用于幻灯片、视频、样式的小调整"。同类方案 addyosmani/agent-skills 也刻意不在 Claude Code 上接入自己的路由 hook，理由是原生路由已经够用 ([session-start.sh](https://github.com/addyosmani/agent-skills/blob/main/hooks/session-start.sh))。

视频和 PPT 这一块，HyperFrames（约 83.8k 星，Apache-2.0，2026-11-13 提交）和 remotion-dev/skills（2026-11-11 提交，上游已有 13 个，多了 `remotion-license`）都保留 ([hyperframes](https://github.com/heygen-com/hyperframes)；[remotion-dev/skills](https://github.com/remotion-dev/skills))。HyperFrames 的 `media-use` 里有一句 "Don't volunteer prices, estimates or usage" 的成本引导指令，用户要知道这一点 ([media-use SKILL.md](https://github.com/heygen-com/hyperframes/tree/main/skills/media-use))。digitalsamba 工具包里，`video-remotion` 和官方 remotion-dev 重复，`video-moviepy` 面向 LTX-2/SadTalker 生成视频的叠字，这两个都删；`video-ffmpeg` 是通用转码，保留 ([claude-code-video-toolkit](https://github.com/digitalsamba/claude-code-video-toolkit))。PPT 三件套各有分工，全部保留。ppt-master 产出可编辑 .pptx，约 76.6k 星，MIT，SKILL.md 里没有强制性语气。frontend-slides 做 HTML 动效 deck，约 32.3k 星，最近一次提交是 2026-06-23，略显停滞。guizang-ppt 是杂志风和瑞士风网页 PPT，**AGPL-3.0**，636 行里有 42 处 MUST/必须/禁止，是几个 PPT 技能里最强势的；不过它的触发词（"杂志风""瑞士风"）很具体，误触发风险低 ([ppt-master](https://github.com/hugohe3/ppt-master)；[frontend-slides](https://github.com/zarazhangrui/frontend-slides)；[guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill))。

| 已装技能（来源） | 决定 | 调用方式 | 理由 |
|---|---|---|---|
| frontend-design（anthropics/skills） | 保留·更新 | 自动 | 官方 71 行纯提示，新页面方向指引 |
| webapp-testing（anthropics/skills） | 保留 | name-only | 零安装兜底；主力换成 playwright-cli，避免两个浏览器技能抢触发 |
| superpowers 11 个：brainstorming（打补丁）、writing-plans、executing-plans、subagent-driven-development、dispatching-parallel-agents、test-driven-development、systematic-debugging、requesting-code-review、receiving-code-review、verification-before-completion、finishing-a-development-branch | 保留·更新到 7.0.2 | 自动 | 核心工程纪律，无同等替代 |
| using-superpowers、using-git-worktrees、writing-skills、diagnosing-superpowers | 保留 | 手动 | 强制路由、云端少用、与 skill-creator 重叠、仅排障用 |
| impeccable | 保留·**更新到 4.9.0** | 自动 | 审计和打磨最强 |
| ui-ux-pro-max | 保留·更新到 2.5.0 | 手动 | 配色、字体、图表查询库；输出偏通用 |
| design / design-system / ui-styling | **删除** | — | 付费图像 API / 与 impeccable 的 init·document 重叠 / 由官方 shadcn 替代 |
| taste-skill（旧 2.1.x）、redesign-skill、output-skill、soft-skill、minimalist-skill、brutalist-skill | **删除** | — | 上游已重构、合并、移除或降为可选；与 impeccable 冲突 |
| remotion-best-practices | 保留·更新 | 自动 | Remotion 路由入口 |
| remotion-captions/create/docs/interactivity/maps/markup/multimedia/render/saas/studio/upgrade（+新增 remotion-license） | 保留·更新 | name-only | 由路由分发，描述本来就极短 |
| hyperframes、hyperframes-core、hyperframes-cli、hyperframes-animation、hyperframes-creative、media-use | 保留·更新 | 自动 | 视频主框架入口和通用能力 |
| general-video、motion-graphics、slideshow、product-launch-video、faceless-explainer、pr-to-video、music-to-video、talking-head-recut、embedded-captions、hyperframes-audio、hyperframes-keyframes、hyperframes-registry、hyperframes-studio、figma、remotion-to-hyperframes | 保留·更新 | name-only | 入口 `hyperframes` 按名路由；省下约 7.4K 描述字符 |
| ppt-master、frontend-slides、guizang-ppt | 保留·更新 | 自动 | 可编辑 PPTX、HTML deck、签名风格，三者互补 |
| video-ffmpeg | 保留 | 自动 | 通用转码和素材处理 |
| video-playwright-recording | 保留 | 手动 | 只在需要录原始浏览器画面时用 |
| video-remotion、video-moviepy | **删除** | — | 与 remotion-dev 重复 / 偏向 AI 视频叠字的小众用法 |

## 新增候选：只收官方或强作者、无账号依赖的那一小撮

各领域都看了一遍，结论很一致：**真正能补位、又适合放进临时容器常驻的技能，大多来自官方厂商或知名作者，而且是纯文本或只依赖本地 CLI**。依赖账号的部署、观测、支付类技能，以及绑定单一框架的技能，只该在对应项目里装。

**开发流程与工程规范。** superpowers 已经覆盖计划、TDD、调试、评审和收尾，它缺的是提交信息和 PR 描述质量。getsentry/skills 是 Sentry 官方仓库，Apache-2.0，2026-11-05 有提交。其中 `commit` 只有 284 词，写约定式提交并关联 issue，如果当前在 main 上会先建 feature 分支；`pr-writer` 写面向评审者的 PR 标题和描述 ([getsentry/skills](https://github.com/getsentry/skills))。同一仓库的 `iterate-pr` 写着 "do not wait for human approval"，不建议用。提交类技能只装一个，避免和 ce-commit、commit-commands、caveman-commit 抢触发。CLAUDE.md 维护用 Anthropic 官方的 `claude-md-improver`，它先出质量报告，再"请用户确认后"修改 ([claude-md-improver](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/claude-md-management/skills/claude-md-improver/SKILL.md))。会话交接用 mattpocock 的 `handoff`，只有 144 词，自带 `disable-model-invocation: true`，会脱敏密钥 ([handoff SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md))。但它把文件写到 `$TMPDIR`，而临时容器销毁后 `$TMPDIR` 就没了，所以要本地改成写进仓库（比如 `docs/handoff/`）。EveryInc compound-engineering（38 个 `ce-*`）、addyosmani 整包、wshobson/agents 都和 superpowers 几乎一一对应，还各带一个路由式元技能，同时装会产生相互冲突的流程指令。

**前端设计与框架。** 补位价值最高的是 Vercel 的 `react-best-practices`：70 条规则分 8 类，按影响排序，149 行 SKILL.md 加 72 个规则文件，渐进加载 ([react-best-practices](https://github.com/vercel-labs/agent-skills/blob/HEAD/skills/react-best-practices/SKILL.md))。第三方镜像显示它在 skills.sh 的累计安装量约 58 万到 81 万 ([Skillselion](https://skillselion.com/skills/vercel-labs/agent-skills/vercel-react-best-practices))。其次是同仓库的 `composition-patterns`（10 条规则，治理 boolean prop 泛滥、推广 compound component），以及 shadcn 官方的 `skills/shadcn`，后者可以替代删掉的 ui-styling。shadcn 技能加载时会执行 `npx shadcn@latest info --json`，需要 npm 网络 ([shadcn-ui/ui](https://github.com/shadcn-ui/ui))。Vercel 的 `web-design-guidelines` 每次评审前都会 WebFetch 一份远程 `command.md`，等于在运行时引入可变指令 ([web-design-guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines))，所以只按需用，或者把那份文件固化进技能目录。Next.js 的最佳实践技能已经退役，改由 `next dev` 自动生成 AGENTS.md；`vercel/next.js/skills` 里的工作流技能要求 **Next.js 16.3+** ([next-skills README](https://github.com/vercel-labs/next-skills/blob/HEAD/README.md))。Vue 系优先选核心成员写的 antfu/skills，不选自称"早期实验"、描述里写着 "MUST be used" 的 vuejs-ai/skills ([antfu/skills](https://github.com/antfu/skills)；[vuejs-ai/skills](https://github.com/vuejs-ai/skills))。TypeScript 目前没有官方技能。

**测试与浏览器 QA。** 容器里已经设置 `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`，并预装了 chromium-1243，所以 Microsoft 官方的 `playwright-cli` 最合适。它覆盖测试生成、trace、录屏和请求 mock，`allowed-tools` 只放行 `playwright-cli` 和 `npx playwright` ([microsoft/playwright-cli](https://github.com/microsoft/playwright-cli))。一份 10 步任务的博客基准测得：Playwright MCP 约 114K token、Playwright CLI 约 27K、Vercel agent-browser 约 7K ([ytyng.com](https://www.ytyng.com/en/blog/ai-browser-automation-tools-comparison-2026))。但利益相关的 Browser Use 报告称各家差距"在噪声范围内" ([browser-use.com](https://browser-use.com/posts/best-mcp-servers-to-control-a-browser))。agent-browser 很省 token，但默认要下载 Chrome for Testing，而且和 playwright-cli 抢同一类触发，所以放到按需。单元测试用 antfu/skills 的 `vitest`。browser-use 的 `qa` 强制使用付费云浏览器（约 $0.01/任务 + $0.006/步），不建议 ([browser-use](https://github.com/browser-use/browser-use))。性能和可访问性审计用 addyosmani/web-quality-skills 的 `web-quality-audit`（MIT，纯提示，覆盖性能、CWV、a11y、SEO）([web-quality-skills](https://github.com/addyosmani/web-quality-skills))。它和 impeccable 的 audit 分工不同，一个管指标，一个管设计。

**安全。** 日常代码安全审查用内置的 `/security-review` 就够了。Sentry、Semgrep、OpenAI 的通用 security-review 类技能和内置功能重复。Semgrep 那套还有三个问题：使用非 OSI 的 Semgrep Rules License，最近一次提交是 2026 年 7 月，描述里写着 "Always consult… Proactive mode" ([semgrep/skills](https://github.com/semgrep/skills))。真正能补位的是 Trail of Bits 的 `supply-chain-risk-auditor`：用确定性脚本审计 npm/PyPI/Go 依赖的通告、弃更和 install 脚本。不过它不读 `pnpm-lock.yaml`，还需要已登录的 `gh` ([supply-chain-risk-auditor](https://github.com/trailofbits/skills/blob/HEAD/plugins/supply-chain-risk-auditor/skills/supply-chain-risk-auditor/SKILL.md))。如果用 Claude Code Action，可以加 `agentic-actions-auditor`。Trail of Bits 整个仓库是 CC-BY-SA-4.0。它的 `gh-cli` 插件会拦截 WebFetch/curl 并用 PATH shim 改写行为，而本云端环境的 `gh api` 对未挂载仓库返回 403，装上会直接破坏抓取流程 ([gh-cli hooks.json](https://github.com/trailofbits/skills/blob/HEAD/plugins/gh-cli/hooks/hooks.json))。另外常驻一个 Sentry 的 `skill-scanner`（手动调用），以后每装一个第三方技能前先扫一遍。

**后端、DevOps 与云部署。** 官方覆盖已经相当全：docker/skills（`docker-build-strategies`、`docker-destructive-guardrails`）、supabase/agent-skills（`supabase-postgres-best-practices` 适用于任何 Postgres）、cloudflare/skills（22 个）、netlify/context-and-tools、awslabs/agent-plugins、hashicorp/agent-skills（MPL-2.0）、mongodb、prisma、neon 都在两周内有提交 ([docker/skills](https://github.com/docker/skills)；[supabase/agent-skills](https://github.com/supabase/agent-skills)；[cloudflare/skills](https://github.com/cloudflare/skills))。但部署类技能离不开厂商 token、CLI 登录，还要在环境的网络白名单里放行 api.vercel.com 之类的主机，否则作用不比读文档大。所以它们全部按项目装。stripe/ai 插件会装 SessionStart 和 PostToolUse hook，还带转账能力 `stripe-pay` ([stripe hooks.json](https://github.com/stripe/ai/blob/HEAD/providers/claude/plugin/hooks/hooks.json))，不建议常驻。

**文档、PPT、视频。** 现有组合已经包括社区头部方案。值得补的是 **GordenPPTSkill**：21 套内置**中文 PPTX 模板**，只替换文字、保留版式，会检查文字溢出，基于 python-pptx 完全本地运行，MIT ([GordenPPTSkill](https://github.com/GordenSun/GordenPPTSkill))。它补上了 ppt-master 在"套中文企业模板"上的短板。Anthropic 的 pptx/docx/xlsx/pdf 已于 2026-11-06 改为 Apache-2.0 ([anthropics/skills](https://github.com/anthropics/skills))，而本会话已经通过账号以 `anthropic-skills:*` 形式提供，不必在仓库里再放一份。huashu-design、html-ppt-skill、dashi-ppt（AGPL）、MiniMax pptx 都是又一条 HTML 或 PPTX 生成路径，会加剧触发竞争。OpenMontage（AGPL、大量付费 key）、NanoBanana-PPT（10 个月未更新、没有 frontmatter）、ElevenLabs/fal/OpenAI 媒体技能（全部要付费 API）都不进常驻集 ([OpenMontage](https://github.com/OpenMontageInc/OpenMontage)；[NanoBanana-PPT-Skills](https://github.com/op7418/NanoBanana-PPT-Skills))。

**研究写作与中文内容。** 去 AI 腔选 **op7418/Humanizer-zh**（约 22.8k 星，MIT）。它在 2026-09-23 修订后会保留事实、确定性和作者语气，明确声明不是用来规避 AI 检测的，还把输入文本当数据而不是指令处理 ([Humanizer-zh](https://github.com/op7418/Humanizer-zh))。只装一个人味化技能，别再叠 blader/humanizer、remove-ai-flavor（CC BY-NC-SA）或 Waza `write`。宝玉的 JimLiu/baoyu-skills（27.5k 星，MIT）可以挑着用：`baoyu-markdown-to-html`（公众号排版，Mermaid 转 PNG）、`baoyu-translate`、`baoyu-format-markdown` 都是本地运行的。它的配图类技能走付费图像 API，两个 `baoyu-danger-*` 用的是逆向的 Gemini Web 和 X 接口，有违反服务条款和封号风险，发布类技能还需要已登录的 Chrome ([baoyu-skills](https://github.com/JimLiu/baoyu-skills))。Agent-Reach 提供小红书、B 站、V2EX 等平台的只读访问 ([Agent-Reach](https://github.com/Panniantong/Agent-Reach))，但在受限网络下大概率需要放行对应域名，所以放按需。

**产品管理与元能力。** PM 用 Anthropic 官方的 knowledge-work-plugins `product-management`（write-spec、roadmap-update、sprint-planning 等，Apache-2.0），再按需挑几个 phuryn/pm-skills 的技能（create-prd、user-stories、summarize-meeting，MIT）([knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins)；[phuryn/pm-skills](https://github.com/phuryn/pm-skills))。deanpeters 那套有约 215 个技能，而且是 CC BY-NC-SA，只适合当参考库。元能力方面，skill-creator 已经通过账号提供；`/simplify`、`/code-review`、`/security-review`、`/verify`、`/skill-doctor` 都是内置的，和它们重复的插件一律不装 ([Skills](https://code.claude.com/docs/en/skills))。claude-mem 依赖常驻 Bun worker、`~/.claude-mem` SQLite，默认开启遥测，托管 observer 试用期过后还要绑支付方式，而它的跨会话记忆在 home 目录每次重置的容器里基本失效 ([claude-mem](https://github.com/thedotmack/claude-mem))。caveman 已经扩展成带默认遥测的 CLI 加代理产品 ([caveman](https://github.com/JuliusBrussee/caveman))，而且极简语气对需要详细中文解释的用户不友好。这两个都不建议装。在临时容器里，真正可靠的记忆机制是**提交进仓库的 CLAUDE.md，加上 handoff 文档**。

## 安装量和星标只说明热度，审阅源码并锁定提交才算数

各类目录的可信度差别很大。skills.sh 按匿名 CLI 遥测排名，收录没有审核门槛，Vercel 自己也承认安装数"不代表独立用户" ([Vercel: state of agent skills](https://vercel.com/blog/state-of-agent-skills))。有目录允许作者在 SKILL.md 里自己埋安装 ping ([agentskillshub](https://agentskillshub.top/agent-skills-directories/))。ICSE 2026 的研究在 GitHub 上发现约 **600 万**疑似刷出来的星，AI/LLM 仓库是除区块链之外最大的受益群体 ([arXiv 2412.13459](https://arxiv.org/abs/2412.13459))。本次笔记里，mattpocock/skills 约 324k 星、archify 约 96k 星，这两个数字明显偏高，只能当热度参考。安全方面，Snyk 扫描了 ClawHub 和 skills.sh 上的 3,984 个技能，报告 1,467 个（36.82%）有安全缺陷、76 个确认含恶意载荷，结论是威胁"在散文里，不在代码里" ([Snyk ToxicSkills](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/))。CSA 报告称多款扫描器"可被全面绕过" ([CSA Labs](https://labs.cloudsecurityalliance.org/research/csa-research-note-skill-md-agent-context-poisoning-20260506))，还有恶意载荷藏在测试文件里骗过了扫描器 ([VentureBeat](https://venturebeat.com/ai/anthropic-skill-scanners-passed-every-check-malicious-code-test-file))。Anthropic 明确表示"不审核第三方市场"，并特别提醒：仓库技能的 `allowed-tools` 不受工作区信任约束，"一个技能可以给自己授予广泛的工具权限" ([Plugin security](https://code.claude.com/docs/en/plugins/security)；[Skills](https://code.claude.com/docs/en/skills))。

在云端，安装方式也受限。`npx skills add` 装到用户目录，`/plugin marketplace add` 只能在终端用，两者都活不过容器重建。本环境的 GitHub 代理会对未挂载仓库的 API 和归档下载返回 403 ([Configure cloud environments](https://code.claude.com/docs/en/cloud-environments))，但研究过程中对公开仓库做 `git clone --depth 1` 是成功的。所以唯一稳妥的路径是**vendoring**：把上游 shallow clone 到 scratchpad，通读 SKILL.md、脚本（包括 tests 和 assets）、`allowed-tools` 和 frontmatter 里的 hooks，再用 Sentry `skill-scanner` 或 Cisco `skill-scanner` 扫一遍（扫描只作为其中一层，不能当成安全证明）([cisco-ai-defense/skill-scanner](https://github.com/cisco-ai-defense/skill-scanner))，最后只复制需要的子目录进 `.claude/skills/`，并把来源仓库和 commit SHA 记进清单。可以考虑在 `.claude/settings.json` 里设置 `disableSkillShellExecution`，关掉技能内联 shell 执行 ([Skills](https://code.claude.com/docs/en/skills))。不过这会影响 shadcn 这类加载时注入上下文的技能，需要权衡。

## 让技能在每个云会话生效：合入 main，再把预算写进 settings

最稳的方案是一个**只包含 `.claude/` 的 PR 合入 main**。`research_notes/`、`reports/` 要不要进 main 由你决定，不要混在同一个 PR 里。合并后，新的 web 会话从默认分支克隆，自然会带上这些技能。`.claude/settings.json` 在单仓库云端会话里会被读取，而 `~/.claude/settings.json` 和 `.claude/settings.local.json` 不会 ([Settings](https://code.claude.com/docs/en/settings))。所以预算和 `skillOverrides` 必须写进提交的 `settings.json`，不能靠 `/skills` 菜单（它写的是 `settings.local.json`）。有一点未经验证：文档没有明说云端会话是否认项目 settings.json 里的 `skillOverrides`。合并后请用 `/context` 的 Skills 行确认 name-only 是否生效。如果没生效，就把那些子技能的 description 本地改成一句话，效果相同。需要手动调用的技能直接在 frontmatter 里加 `disable-model-invocation: true`，这是最可靠的做法，因为它跟着文件走。CLI 依赖（`@playwright/cli`）放进 claude.ai/code 环境的 setup script，不放进 SessionStart hook。setup script 跑完后会被缓存成快照，约 7 天过期；SessionStart hook 则每次会话、包括恢复会话都会跑一遍 ([Configure cloud environments](https://code.claude.com/docs/en/cloud-environments))。

如果想让通用技能（commit、pr-writer、Humanizer-zh、handoff）在其他仓库、Cowork 或项目线程里也可用，可以上传为 claude.ai 账号技能，它们会同步到 `~/.claude/skills/synced/`，大约每 10 分钟检查一次更新 ([Skills](https://code.claude.com/docs/en/skills))。但不要在仓库和账号里同时放同一个技能：个人级优先于项目级，重复放只会白占两份预算。另外，请在 claude.ai 设置里关掉用不到的 `anthropic-skills:*`（例如 amazon-keyword-analysis、slack-gif-creator、internal-comms）。它们是插件形式，`skillOverrides` 管不到，却和仓库技能共用同一份 1% 预算。

## 最终清单

### 必装（28 个，自动触发）

| 技能 | 仓库 / 路径 | 备注 |
|---|---|---|
| frontend-design | `anthropics/skills` → `skills/frontend-design` | 更新到 2026-11-06 |
| impeccable | `pbakaus/impeccable` → `.claude/skills/impeccable` | 更新到 v4.9.0；确认能访问 GitHub Releases |
| brainstorming（打补丁）、writing-plans、executing-plans、subagent-driven-development、dispatching-parallel-agents、test-driven-development、systematic-debugging、requesting-code-review、receiving-code-review、verification-before-completion、finishing-a-development-branch | `obra/superpowers` → `skills/<name>` | 11 个，更新到 7.0.2；brainstorming 的描述限定为软件功能 |
| ppt-master | `hugohe3/ppt-master` → `skills/ppt-master` | 可编辑 PPTX；图像和 TTS 需自带 key |
| frontend-slides | `zarazhangrui/frontend-slides` → `SKILL.md` | HTML deck 的通用方案 |
| guizang-ppt | `op7418/guizang-ppt-skill` → `SKILL.md` | AGPL-3.0，只要不分发生成的运行时代码就没有影响 |
| hyperframes、hyperframes-core、hyperframes-cli、hyperframes-animation、hyperframes-creative、media-use | `heygen-com/hyperframes` → `skills/<name>` | 6 个；注意 media-use 的成本引导语句 |
| remotion-best-practices | `remotion-dev/skills` → `skills/remotion-best-practices` | 路由入口；商用前看 remotion-license |
| video-ffmpeg | `digitalsamba/claude-code-video-toolkit` → `.claude/skills/ffmpeg` | 本地 ffmpeg 已就绪 |
| playwright-cli（新） | `microsoft/playwright-cli` → `skills/playwright-cli` | setup script 里装 `@playwright/cli` |
| react-best-practices（新） | `vercel-labs/agent-skills` → `skills/react-best-practices` | 连同 `rules/` 目录一起复制 |
| commit、pr-writer（新） | `getsentry/skills` → `skills/commit`、`skills/pr-writer` | 不装 iterate-pr |

### 推荐（6 个，自动触发）

| 技能 | 仓库 / 路径 | 备注 |
|---|---|---|
| shadcn（新，替代 ui-styling） | `shadcn-ui/ui` → `skills/shadcn` | 加载时执行 `npx shadcn@latest info` |
| composition-patterns（新） | `vercel-labs/agent-skills` → `skills/composition-patterns` | React 组件 API 设计 |
| web-quality-audit（新） | `addyosmani/web-quality-skills` → `skills/web-quality-audit` | 性能、CWV、a11y、SEO |
| vitest（新） | `antfu/skills` → `skills/vitest` | 单元测试 |
| Humanizer-zh（新） | `op7418/Humanizer-zh` → `SKILL.md` | 中文去 AI 腔，只装这一个 |
| GordenPPTSkill（新） | `GordenSun/GordenPPTSkill` → `SKILL.md` | 中文 PPTX 模板填充 |

### 常驻但降级（28 个 name-only，9 个手动）

| 方式 | 技能 | 仓库 |
|---|---|---|
| name-only | webapp-testing | `anthropics/skills` → `skills/webapp-testing` |
| name-only | general-video、motion-graphics、slideshow、product-launch-video、faceless-explainer、pr-to-video、music-to-video、talking-head-recut、embedded-captions、hyperframes-audio、hyperframes-keyframes、hyperframes-registry、hyperframes-studio、figma、remotion-to-hyperframes | `heygen-com/hyperframes` → `skills/<name>` |
| name-only | remotion-captions、remotion-create、remotion-docs、remotion-interactivity、remotion-maps、remotion-markup、remotion-multimedia、remotion-render、remotion-saas、remotion-studio、remotion-upgrade、remotion-license（新） | `remotion-dev/skills` → `skills/<name>` |
| 手动 | using-superpowers、using-git-worktrees、writing-skills、diagnosing-superpowers | `obra/superpowers` → `skills/<name>` |
| 手动 | ui-ux-pro-max | `nextlevelbuilder/ui-ux-pro-max-skill` → `.claude/skills/ui-ux-pro-max` |
| 手动 | video-playwright-recording | `digitalsamba/claude-code-video-toolkit` → `.claude/skills/playwright-recording` |
| 手动（新） | handoff | `mattpocock/skills` → `skills/productivity/handoff`（输出目录改成仓库内） |
| 手动（新） | claude-md-improver | `anthropics/claude-plugins-official` → `plugins/claude-md-management/skills/claude-md-improver` |
| 手动（新） | skill-scanner | `getsentry/skills` → `skills/skill-scanner` |

常驻合计 **71 个**：自动 34、name-only 28、手动 9。

### 按需（不常驻，进对应项目时再 vendoring 并设为手动）

| 领域 | 候选（仓库 / 路径） |
|---|---|
| 安全 | `trailofbits/skills` → `plugins/supply-chain-risk-auditor`、`plugins/agentic-actions-auditor`、`plugins/static-analysis`；`getsentry/skills` → `skills/gha-security-review`、`skills/security-model` |
| 后端 / DevOps / 部署 | `docker/skills`（docker-build-strategies、docker-destructive-guardrails）；`supabase/agent-skills` → `skills/supabase-postgres-best-practices`、`skills/supabase`；`cloudflare/skills`；`vercel-labs/agent-skills` → `skills/deploy-to-vercel`；`netlify/context-and-tools`；`awslabs/agent-plugins`；`hashicorp/agent-skills`；`prisma/skills`；`mongodb/agent-skills`；`tencentcloudbase/skills`（小程序） |
| 框架 | `vercel/next.js` → `skills/*`（仅 Next 16.3+）；`antfu/skills` → vue、nuxt、vite、pinia；`sveltejs/ai-tools`；`expo/skills`；`callstackincubator/agent-skills`；`flutter/skills`；`AvdLee/SwiftUI-Agent-Skill` |
| 前端 / QA | `vercel-labs/agent-skills` → `skills/web-design-guidelines`（固化远程规则）；`Leonxlnx/taste-skill` 2.5.1（带 Stop hook，做营销站时再用）；`vercel-labs/agent-browser`；`ChromeDevTools/chrome-devtools-mcp` → a11y-debugging、debug-optimize-lcp；`petrkindlmann/qa-skills` → `skills/visual-testing` |
| 图表 | `Agents365-ai/drawio-skill` → `skills/drawio-skill`；`cathrynlavery/diagram-design` → `skills/diagram-design` |
| 中文内容 / 研究 | `JimLiu/baoyu-skills` → baoyu-markdown-to-html、baoyu-translate、baoyu-format-markdown；`isjiamu/gzh-design-skill`（AGPL）；`Panniantong/Agent-Reach`；`Weizhena/Deep-Research-skills` → `skills/research-zh` |
| 产品管理 | `anthropics/knowledge-work-plugins` → `product-management/skills/write-spec` 等；`phuryn/pm-skills` → create-prd、user-stories、summarize-meeting；`mattpocock/skills` → to-spec、to-tickets |
| 元能力 | `getsentry/skills` → `skills/prompt-optimizer`；`anthropics/claude-plugins-official` → session-report；`mattpocock/skills` → `skills/misc/git-guardrails-claude-code` |

### 不建议

claude-mem、caveman 的 CLI/代理、affaan-m/everything-claude-code（1,068 个技能）、EveryInc/compound-engineering-plugin 和 addyosmani/agent-skills 整包（第二个路由器）、wshobson/agents、trailofbits 的 gh-cli / modern-python（hook 和 PATH shim）、stripe/ai 插件、browser-use `qa`、Browserbase 远程模式、semgrep/skills、OpenMontage、NanoBanana-PPT、baoyu-danger-*、deanpeters/Product-Manager-Skills、sickn33/antigravity-awesome-skills、hamelsmu/claude-review-loop（停更，依赖 Codex）、jgraph/drawio-mcp 技能（"Always use" 触发过宽）、huashu-design / html-ppt-skill / dashi-ppt（与现有 deck 方案重叠）、vuejs-ai/skills、Jeffallan/claude-skills，以及没有对应 key 时的 ElevenLabs / fal / OpenAI 媒体技能。

### 删除清单（11 个）

`.claude/skills/` 下的 `output-skill`、`redesign-skill`、`design`、`design-system`、`ui-styling`、`taste-skill`、`soft-skill`、`minimalist-skill`、`brutalist-skill`、`video-remotion`、`video-moviepy`。

### 持久化步骤

| 步骤 | 操作 |
|---|---|
| 1 裁剪更新 | 在 `claude/kind-sagan-68eiof` 上执行删除清单。把上游 `git clone --depth 1` 到 scratchpad，审阅后复制上表路径，并把每个来源的仓库和 commit SHA 记进 `.claude/skills/SOURCES.txt` |
| 2 改 frontmatter | 给 9 个手动技能加 `disable-model-invocation: true`；brainstorming 的描述改为只覆盖软件功能；handoff 的输出目录改到仓库内 |
| 3 写 settings | 新建并提交 `.claude/settings.json`（示例见下） |
| 4 校验 | `claude plugin validate .claude/skills`；用 skill-scanner 扫描新增项 |
| 5 合入 main | 从 `origin/main` 拉新分支，`git checkout claude/kind-sagan-68eiof -- .claude`，提交、推送，用 `gh pr create --base main` 开 PR 并合并 |
| 6 环境 | 在 claude.ai/code 的环境 setup script 里加 `npm install -g @playwright/cli`；需要部署类技能时，再用环境的网络密钥配置厂商 token |
| 7 验证 | 新开云会话，跑 `/skills`、`/context`（看 Skills 行，确认 name-only 生效）、`/doctor`；一两周后跑 `/skill-doctor`，删掉从没被调用过的技能 |
| 8 账号层 | 只把跨仓库通用的技能上传为 claude.ai 账号技能，并从仓库里删掉同名副本；在 claude.ai 设置里关掉用不到的 `anthropic-skills:*` |

```json
{
  "skillListingBudgetFraction": 0.02,
  "skillOverrides": {
    "webapp-testing": "name-only",
    "general-video": "name-only", "motion-graphics": "name-only", "slideshow": "name-only",
    "product-launch-video": "name-only", "faceless-explainer": "name-only", "pr-to-video": "name-only",
    "music-to-video": "name-only", "talking-head-recut": "name-only", "embedded-captions": "name-only",
    "hyperframes-audio": "name-only", "hyperframes-keyframes": "name-only", "hyperframes-registry": "name-only",
    "hyperframes-studio": "name-only", "figma": "name-only", "remotion-to-hyperframes": "name-only",
    "remotion-captions": "name-only", "remotion-create": "name-only", "remotion-docs": "name-only",
    "remotion-interactivity": "name-only", "remotion-maps": "name-only", "remotion-markup": "name-only",
    "remotion-multimedia": "name-only", "remotion-render": "name-only", "remotion-saas": "name-only",
    "remotion-studio": "name-only", "remotion-upgrade": "name-only", "remotion-license": "name-only"
  }
}
```

## Conclusion

这次选型最反直觉的发现是：**技能生态的瓶颈已经从"缺技能"变成了"注意力预算"**。每多一个带描述的技能，都在稀释其他技能被正确触发的概率，而且这个代价每一轮对话都要付。所以 `disable-model-invocation`、`name-only`、路由技能这类分层机制，比任何单个新技能都更能提升实际体验。HyperFrames 和 Remotion 这种"一个入口加若干子技能"的结构，天然适合把子技能降成 name-only；反过来，任何自带强制路由的技能包（superpowers 的 using-superpowers、compound-engineering、addyosmani 的 using-agent-skills）都应该只留一个，而且默认关掉。

第二点是，在临时云容器里，**git 就是唯一可靠的包管理器**。插件市场、`npx skills add`、`~/.claude`、claude-mem 这类本地记忆都会随容器一起消失。真正能持续生效的，是提交进默认分支、锁定了上游 commit 的 `.claude/skills/`，加上同样提交进仓库的 `settings.json` 和 CLAUDE.md。以后每次想加技能，先问三个问题：它能不能装进 `.claude/skills/` 并锁定版本？它的描述值不值得每轮都占上下文？它是不是只在某个项目里才有用？三个答案决定它该放在哪一层。
