# Claude Code Agent Skills ecosystem: directories, installation, security, and cloud-session persistence (as of Nov 2026)

> Research note. Network constraint during research: this cloud session could reach code.claude.com and WebSearch, but WebFetch to snyk.io, vercel.com, and labs.cloudsecurityalliance.org failed DNS (not on the allowlist), and the GitHub API was limited to attached repos. Third-party facts below therefore come mostly from search-result summaries. They are marked "(search summary)" and should be treated as secondary-level confidence. Official Anthropic docs were fetched in full and quoted.

## Q1: What is the officially recommended way to share skills with a team and across cloud sessions? How does the user's repo get its 68 skills into every cloud session?

### Takeaway
The official path depends on scope:
- **One repo:** commit the skills to the repo's `.claude/skills/`.
- **Across repos or the whole org:** use a plugin and marketplace, or managed settings.
- **Cowork, cloud project threads, and scheduled tasks:** enable the skills at the claude.ai account or org level.

Cloud sessions run on a fresh clone of the repo. They do not read `~/.claude/`, and they do not install plugins declared in the repo's `.claude/settings.json` (`enabledPlugins` / `extraKnownMarketplaces`). For the user's repo, the most direct fix is to merge the 68 skills into the default branch. Uploading them to claude.ai as account skills is the backup option.

(中文要点：项目级技能必须进默认分支；仓库 settings.json 里声明的插件在云端会话里不会安装；~/.claude 不会被云端读取；跨所有云会话/Cowork 的方法是把技能启用到 claude.ai 账号。)

### Cited Findings
- **Locations table.**
  - Personal: `~/.claude/skills/<name>/SKILL.md` loads in "All your projects on this machine".
  - Project: `.claude/skills/<name>/SKILL.md` loads in "Sessions in this repository", with the advice "Commit it so your team gets it too".
  - Plugin: `<plugin>/skills/<name>/SKILL.md` loads as `/plugin-name:skill-name`.
  - Enterprise: a managed settings directory.
  - claude.ai account: "Skills enabled for your account" load in "Cowork, cloud sessions, and terminal sessions signed in with that account". — [Claude Code docs: Skills](https://code.claude.com/docs/en/skills)
- **Precedence:** "Enterprise over personal, and personal over project". Plugin skills are namespaced, so they never collide with other skills. — [Skills](https://code.claude.com/docs/en/skills)
- **Discovery:**
  - Project skills load from `.claude/skills/` in the start directory "and in every parent directory up to the repository root".
  - A nested `<subdir>/.claude/skills/` loads "the first time Claude reads or edits a file in that subdirectory".
  - Claude Code watches skill directories for changes. A newly created top-level skills directory needs `/reload-skills`. — [Skills](https://code.claude.com/docs/en/skills)
- **Official sharing list:** "Project skills: Commit `.claude/skills/` to version control. Plugins: Create a `skills/` directory in your plugin. Managed: Deploy organization-wide through managed settings." — [Skills § Share skills](https://code.claude.com/docs/en/skills)
- **Cloud and Cowork:** "Cowork sessions and cloud sessions, including cloud scheduled tasks, don't read `~/.claude/skills/` on your machine." For cloud sessions other than project threads, "you can instead commit the skill to the repository's `.claude/skills/`." In a project's cloud thread, "skills committed to a repository's `.claude/skills/` aren't available". There you must enable the skill on the claude.ai account. — [Skills § Skills in Cowork and cloud sessions](https://code.claude.com/docs/en/skills)
- **"What carries over" table (cloud environments).** "Cloud sessions start from a fresh clone of your repository. Anything you commit to the repo is available. Anything you've installed or configured only on your own machine isn't available."
  - The repo's `.claude/skills/`, `.claude/agents/`, and `.claude/commands/` are available ("Part of the clone").
  - "Plugins and marketplaces declared in your repo's `.claude/settings.json`" are **not** available: "A cloud session doesn't install the plugins a repository turns on under `enabledPlugins`, including ones from the marketplaces it lists under `extraKnownMarketplaces`".
  - User `~/.claude/skills/` is not available ("Commit them to the repo's `.claude/` directory instead. Cloud sessions automatically load skills you enable on claude.ai").
  - Plugins enabled only in user settings are not available.
  - Server-managed org settings **are** fetched. — [Configure cloud environments](https://code.claude.com/docs/en/cloud-environments)
- **Which branch gets cloned:** `claude --cloud` "clones your current directory's GitHub remote at your current branch, not your local checkout, so push first". If the branch isn't on GitHub, the session starts from "a pushed commit from your branch's history, or the repository's default branch". — [Use Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web)
- **Settings in cloud sessions:**
  - The shared `.claude/settings.json` is read in single-repo sessions.
  - `~/.claude/settings.json` and `.claude/settings.local.json` are "not read".
  - Device MDM / `managed-settings.json` doesn't reach the cloud. Only server-managed settings do.
  - Multi-repo sessions read only `enabledPlugins` / `extraKnownMarketplaces`, and even those plugins "don't load in a cloud session". — [Settings § Settings in cloud sessions](https://code.claude.com/docs/en/settings)
- **Org-level plugin rollout:** managed `extraKnownMarketplaces` plus `enabledPlugins` (JSON example on the page). "In an Anthropic-hosted environment, only server-managed settings reach the session, which waits for them before it installs plugins." Per-repo `.claude/settings.json` plugin declarations:
  - `extraKnownMarketplaces` applies only after workspace trust.
  - "Setting `enabledPlugins` in the repository doesn't install the plugin". Each contributor runs `claude plugin install <name>@<marketplace> --scope project`. — [Manage plugins for your organization](https://code.claude.com/docs/en/plugins/org)
- **Account sync:**
  - In terminal sessions signed in with claude.ai (v2.1.273+), account skills download to `~/.claude/skills/synced/` and re-check about every 10 minutes while active and about every 40 minutes while idle.
  - Sync is download-only. Local edits are overwritten.
  - It can be disabled with `syncClaudeAiSkills: false`. If the org turns Skills off, synced skills move to `.trash`. — [Skills § Skills synced from claude.ai](https://code.claude.com/docs/en/skills)
- **Admin page:** "Organization settings > Plugins & skills" turns plugins on for members' claude.ai accounts, and these reach Claude Code as "synced plugins". — [Manage plugins for your organization](https://code.claude.com/docs/en/plugins/org)
- **Setup scripts vs SessionStart hooks:**
  - Setup scripts are configured in the claude.ai/code environment dialog. They run "Before Claude Code launches, skipped when a cached environment exists" and only in cloud sessions.
  - The result is cached as a filesystem snapshot if the script finishes in "roughly five minutes". The cache expires after about 7 days.
  - SessionStart hooks live in the repo's `.claude/settings.json`. They run "After Claude Code launches, on every session including resumed", locally and in the cloud.
  - Gate a hook to the cloud with `CLAUDE_CODE_REMOTE == "true"`.
  - Command hooks time out at 600 s by default.
  - User-level SessionStart hooks in `~/.claude/settings.json` don't run in the cloud. — [Configure cloud environments](https://code.claude.com/docs/en/cloud-environments)
- **Network:** the default Limited network allowlist includes github.com, codeload.github.com, and registry.npmjs.org, among others. A setup script or hook could fetch skills from public GitHub or npm. However, the GitHub proxy returns 403 for GitHub API requests and archive downloads of repos not attached to the session, "even a public one". — [Configure cloud environments](https://code.claude.com/docs/en/cloud-environments)
- **`/plugin` in the cloud:** it is not available ("Commands that only run in the terminal interface, such as `/plugin` or `/resume`, aren't available"). A cloud session can suggest plugins with an **Add** button, which "turn[s] it on for your claude.ai account, where it stays on after the session ends". — [Use Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web)

### Inferences
- **Ranked options for the user's repo (wuyan212123/-, 68 skills only on `claude/kind-sagan-68eiof`):**
  1. Merge or PR the `.claude/skills/` tree into the default branch. This is the documented, zero-maintenance path, and new web sessions see it automatically.
  2. For skills wanted in every repo, Cowork, or project threads, upload or enable them as claude.ai account skills.
  3. Workaround only: have a repo SessionStart hook or environment setup script copy skills in from another source. Plugins declared in `.claude/settings.json` are explicitly not installed in cloud sessions, so the plugin route doesn't solve cloud persistence unless it goes through claude.ai account/org plugins or server-managed settings.
- **Hook-based copying works in theory but is fragile.** A SessionStart hook can `git checkout origin/<branch> -- .claude/skills` or copy files into `.claude/skills/`, and skill directories are watched for changes. But a top-level skills directory created mid-session may need `/reload-skills`, and the GitHub proxy limits which repos can be fetched. Merging to the default branch is simpler and more robust.

### Gaps
- I couldn't confirm whether the claude.ai/code web UI lets a user pick a non-default branch as the starting point for a new session. The docs only describe `--cloud` cloning the current branch.
- The upload limits for claude.ai account skills (size, count) were not found on the Claude Code skills page.

## Q2: Is there a practical upper limit on how many skills you can install? Is there a documented description budget, and what happens when it's exceeded?

### Takeaway
There is no hard cap on skill count, but there is a documented listing budget:
- The skill-listing budget "scales at 1% of the model's context window".
- Each skill's `description` + `when_to_use` is truncated at 1,536 characters.

On overflow, every skill name stays in the listing, but descriptions are dropped starting with the least-invoked skills, which hurts auto-triggering. Fixes:
- Raise the budget with `skillListingBudgetFraction` or `SLASH_COMMAND_TOOL_CHAR_BUDGET`.
- Set skills to `"name-only"` or `"off"` in `skillOverrides`.
- Use `disable-model-invocation: true`.
- Audit usage with `/skill-doctor`.

(中文要点：没有数量硬上限，但技能列表预算约为上下文窗口的 1%，超出后最少用的技能先丢描述，只剩名字，导致无法自动触发。)

### Cited Findings
- "The listing always contains every skill name, but if you have many skills, Claude Code drops some descriptions to fit the listing's character budget, which removes the keywords Claude needs to match your request. The budget scales at 1% of the model's context window. When the listing overflows, Claude Code drops descriptions starting with the skills you invoke least, so the skills you use most keep their full text." — [Skills § Skill descriptions are cut short](https://code.claude.com/docs/en/skills)
- **Diagnostics:**
  - `/doctor` estimates the listing's context cost.
  - Overflow writes a warning to the debug log (`--debug`).
  - The `/context` Skills row reports the size after the budget is applied (since v2.1.196). — [Skills](https://code.claude.com/docs/en/skills)
- **Knobs:**
  - `skillListingBudgetFraction` (e.g. `0.02` = 2%) or the `SLASH_COMMAND_TOOL_CHAR_BUDGET` env var (a fixed character count).
  - `skillOverrides` values: `"on"` / `"name-only"` / `"user-invocable-only"` / `"off"`. The `/skills` menu writes these to `.claude/settings.local.json`. Plugin skills are not affected by `skillOverrides`.
  - The per-entry 1,536-character cap is configurable via `skillListingMaxDescChars`. — [Skills](https://code.claude.com/docs/en/skills)
- **`disable-model-invocation: true`:** "Description not in context, full skill loads when invoked." This removes the skill from the budget, and the user can still run it with `/name`. — [Skills § invocation matrix](https://code.claude.com/docs/en/skills)
- **`/skill-doctor`** (v2.1.252+): "Every skill in the skill listing adds to your context on every turn, whether or not Claude ever uses it." It flags never-invoked skills and ranks them by context cost. — [Skills](https://code.claude.com/docs/en/skills)
- **Other limits:**
  - Keep `SKILL.md` under 500 lines.
  - After compaction, the most recent invocation of each skill is re-attached, keeping the first 5,000 tokens of each, within a combined 25,000-token budget. — [Skills](https://code.claude.com/docs/en/skills)
- **Malformed frontmatter:** the skill loads "with empty metadata", so `/skill-name` works but Claude "can't match against your `description`". Validate with `claude plugin validate .claude/skills` (v2.1.233+). — [Skills § Troubleshooting](https://code.claude.com/docs/en/skills)

### Inferences
- **Rough math for the user's 68 skills:**
  - The doc calls the budget a "character budget" that scales at 1% of the context window. It doesn't say whether the 1% is measured in tokens or characters.
  - On a 200K-token window, 1% ≈ 2,000 units.
  - 68 skills × ~150–300-character descriptions ≈ 10–20K characters, which very likely exceeds the default budget on 200K models and may approach it even on 1M-context models.
  - Expect the least-used skills to be listed name-only.
  - Mitigations: mark rarely auto-needed skills `disable-model-invocation: true`, trim descriptions so the trigger keywords come first, or raise `skillListingBudgetFraction` in the committed `.claude/settings.json`.
- **Observed in this session:** the skill listing shown in this research agent's own system prompt has many entries with names only (e.g. `webapp-testing`, `writing-plans`, `security-review`, several `anthropic-skills:*`). This is consistent with the documented overflow behavior when roughly 100 skills are installed. It is an observation, not a published source.

### Gaps
- No official statement on whether the 1% figure is tokens or characters, and no exact default for `SLASH_COMMAND_TOOL_CHAR_BUDGET`.
- No published benchmark of how trigger accuracy degrades with skill count.

## Q3: What concrete steps should you take to vet a third-party skill before installing it? What are the documented incidents and research?

### Takeaway
Treat a skill as code plus prompt. SKILL.md prose is injected into the model's context as instructions. Bundled scripts, `allowed-tools`, hooks, MCP servers, and `bin/` executables run with user privileges, and some of that runs outside the sandbox.

Anthropic says it does not review third-party marketplaces. The leading research (Snyk ToxicSkills, Feb 2026) found large numbers of flawed skills and dozens of confirmed malicious ones on ClawHub and skills.sh. Scanners exist (Cisco skill-scanner, Snyk, Socket, NVIDIA SkillSpector), but research shows they can be bypassed. Manual review plus pinning is still required.

(中文要点：第三方技能 = 代码 + 提示注入面；Anthropic 不审核第三方市场；扫描器有用但可被绕过；必须人工审阅 SKILL.md、脚本、allowed-tools、hooks，并锁定 commit。)

### Cited Findings
- **Official risk model:** "A Claude Code plugin you install can execute arbitrary code on your machine with your user privileges."
  - Hooks, monitors, MCP/LSP servers, and mods run "outside the sandbox".
  - Skills, commands, and agents "enter Claude's context as instructions".
  - Auto-update means "the files you reviewed can change on disk". — [Plugin security and trust](https://code.claude.com/docs/en/plugins/security)
- **Trust warning text:** "Anthropic does not control what MCP servers, files, or other software are included in plugins and cannot verify that they will work as intended or that they won't change." Also: "Anthropic doesn't review third-party marketplaces." — [Plugin security](https://code.claude.com/docs/en/plugins/security); [Anthropic's marketplaces](https://code.claude.com/docs/en/plugins/anthropic-marketplaces)
- **Official review steps for plugins:**
  1. `claude plugin marketplace list` to check where each marketplace was added from.
  2. Read the **Will install** pane in `/plugin`.
  3. Read `hooks/hooks.json`, `.mcp.json`, and every file in `bin/`.
  4. Clone the repo and run `claude --plugin-dir <dir> plugin details <name>` to get a component inventory without starting a session. — [Plugin security](https://code.claude.com/docs/en/plugins/security)
- **Repo skills and `allowed-tools`:** "Workspace trust doesn't gate this field. Claude Code applies a project skill's `allowed-tools` even in a `-p` run in a folder you've never trusted. A skill can grant itself broad tool access, so review the `allowed-tools` of skills checked into a repository." — [Skills](https://code.claude.com/docs/en/skills)
- **Shell execution in skills:** `"disableSkillShellExecution": true` replaces inline shell-command execution in skills with `[shell command execution disabled by policy]`. Commands in skills synced from claude.ai never run on the local machine. — [Skills](https://code.claude.com/docs/en/skills)
- **Name spoofing protection:** official and community marketplace names (e.g. `claude-plugins-official`, `agent-skills`, `anthropic-agent-skills`) are accepted only from `github.com/anthropics/`. The `claude-community` catalog pins nearly every entry to a commit SHA, and Claude Code "refuses to install a different commit". Archive sources can be pinned with `sha256`. — [Plugin security](https://code.claude.com/docs/en/plugins/security)
- **Org controls:**
  - `strictKnownMarketplaces` (allowlist) and `blockedMarketplaces`.
  - `disableSideloadFlags`.
  - `strictPluginOnlyCustomization` (blocks user and project skills, agents, hooks, and MCP).
  - `allowManagedHooksOnly`.
  - `syncClaudeAiPlugins: false`.
  - `pluginTrustMessage`. — [Manage plugins for your organization](https://code.claude.com/docs/en/plugins/org)
- **Snyk "ToxicSkills" (search summary):**
  - Snyk scanned 3,984 skills from ClawHub and skills.sh as of Feb 5, 2026.
  - Reported figures: 1,467 skills (36.82%) with security flaws, and 76 confirmed malicious payloads. Secondary sources conflate the two numbers. The 1,467 figure appears to be flaws, not confirmed malware.
  - Snyk's framing is that the threat "lives in prose, not code". Example: three lines of markdown in a SKILL.md were enough to exfiltrate SSH keys.
  - Note: the primary page could not be fetched from this session. — [Snyk blog (via search)](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/); [CSA research note (via search)](https://labs.cloudsecurityalliance.org/research/csa-research-note-skill-md-agent-context-poisoning-20260506)
- **CSA research note, May 6, 2026: "Agent Context Poisoning: SKILL.md and the New AI Supply Chain Attack Surface" (search summary).** It reports that several commercial and open-source skill scanners "can be bypassed across the board". A clean scan is therefore not proof of safety. — [CSA Labs](https://labs.cloudsecurityalliance.org/research/csa-research-note-skill-md-agent-context-poisoning-20260506)
- **Test-file blind spot (VentureBeat, search summary):** skill scanners passed a malicious payload hidden in a test file, because scanners focus on SKILL.md and agent-invoked scripts. Cisco shipped an IDE AI Agent Security Scanner (April 21) that integrates its open-source Skill Scanner into VS Code, Cursor, and Windsurf. — [VentureBeat](https://venturebeat.com/ai/anthropic-skill-scanners-passed-every-check-malicious-code-test-file)
- **Cisco AI Defense Skill Scanner (search summary):**
  - Open source (Apache-2.0) at github.com/cisco-ai-defense/skill-scanner; on PyPI as `cisco-ai-skill-scanner`.
  - Detects prompt injection, data exfiltration, and malicious code.
  - Multi-engine design (static analysis, behavioral dataflow, LLM semantic analysis, threat intel) with SARIF output.
  - About 1.7k–2.3k stars, depending on the snapshot. — [GitHub](https://github.com/cisco-ai-defense/skill-scanner); [PyPI](https://pypi.org/project/cisco-ai-skill-scanner/); [Cisco blog](https://blogs.cisco.com/ai/personal-ai-agents-like-openclaw-are-a-security-nightmare)
- **NVIDIA SkillSpector:** an Apache-2.0 skill scanner open-sourced in late May 2026 (search summary). — [Agentic AI docs: skill scanners](https://agentic-ai.readthedocs.io/en/latest/SecurityFrameworks/skill-scanners/)
- **skills.sh automated audits (search summary):**
  - Vercel added automated security audits to skills.sh. Each skill page shows Gen, Socket, and Snyk verdicts (Pass/Warn/Fail). Snyk adds risk levels and finding codes (e.g. W011 third-party content exposure, W012 unverifiable external dependency). The `skills` CLI reads these ratings at install time.
  - Reported problems: a Snyk "critical" rating with an empty payload applied uniformly to all 7 higgsfield-ai skills; stale audit results served after re-indexing; inconsistent ratings across skills in the same repo. — [Vercel changelog](https://vercel.com/changelog/automated-security-audits-now-available-for-skills-sh); [Snyk × Vercel blog](https://snyk.io/blog/snyk-vercel-securing-agent-skill-ecosystem/); [vercel-labs/skills issue #1774](https://github.com/vercel-labs/skills/issues/1774); [worktrunk issue #3757](https://github.com/max-sixty/worktrunk/issues/3757)
- **arXiv study:** an academic study of skill-ecosystem security is listed in search results (arXiv 2603.27204), which cites Cisco Skill Scanner as a practical tool. Not read in full. — [arXiv 2603.27204](https://arxiv.org/pdf/2603.27204v1)

### Inferences
**Recommended vetting checklist, synthesized from the sources above:**
1. **Provenance.** Prefer Anthropic-tier marketplaces (`claude-plugins-official`, SHA-pinned `claude-community`) or a known author's repo. Check the repo's age, commit history, and maintainers.
2. **Read every file, not just SKILL.md.** Check for:
   - hidden instructions (HTML comments, zero-width or Unicode tricks, base64);
   - instructions to fetch remote content (`curl | bash`, "download the latest rules from URL");
   - attempts to read `~/.ssh`, `.env`, or tokens;
   - broad `allowed-tools` such as `Bash(*)`;
   - `hooks` frontmatter;
   - bundled scripts, including tests and assets.
3. **Plugins.** Read `hooks/hooks.json`, `.mcp.json`, and `bin/`, and run `claude --plugin-dir … plugin details`.
4. **Run a scanner as one layer.** Options: Cisco `skill-scanner`, Snyk, NVIDIA SkillSpector, or the Gen/Socket/Snyk badges on skills.sh (check the audit date). Don't treat a pass as proof of safety.
5. **Pin and vendor.** Copy the reviewed skill into the repo's `.claude/skills/` at a specific commit rather than auto-updating. For marketplaces, pin `ref`/`sha` or turn `autoUpdate` off.
6. **Contain.** Use the sandbox and permission deny rules, `disableSkillShellExecution` where appropriate, and run untrusted skills first in a cloud session with Limited network access.

### Gaps
- I couldn't fetch the primary Snyk or CSA pages, so exact figures (76 vs 1,467) and named campaigns (e.g. "ClawHavoc" on ClawHub, which appeared only in secondary titles) are unverified here.
- I found no documented confirmed incident of a malicious skill specifically in Anthropic's official marketplace.
- Socket's standalone skill-scanning product details were not found beyond its role as a skills.sh auditor.

## Q4: How reliable are directories and install-count leaderboards (skills.sh, claudemarketplaces.com, claudeskills.info, SkillsMP, the awesome lists, Anthropic marketplaces)?

### Takeaway
Leaderboards measure raw install events or GitHub stars, not quality or safety, and they are gameable:
- skills.sh ranks by anonymous CLI telemetry, with no submission review. Vercel itself says the counts don't represent unique people.
- Some third-party directories let authors self-ping installs.
- GitHub stars are a documented fake-star market (about 6M suspected fake stars; AI repos were the largest non-crypto group).

Anthropic's own marketplaces are the only ones with name-spoofing protection, SHA pinning (community), and an "Anthropic verified" badge. Even there, most listings come from partners.

(中文要点：安装量/星标只代表热度，不代表质量与安全；skills.sh 无审核、遥测可被刷；GitHub 刷星有学术证据；官方市场相对可信但仍需审阅。)

### Cited Findings
- **skills.sh (Vercel; launched Jan 20, 2026; CLI `npx skills add <owner>/<repo>`, open source at vercel-labs/skills) (search summary):**
  - Ranks by anonymous install telemetry from the CLI.
  - Skills appear automatically once installed, with "no submission or review gate".
  - Offers all-time and trending (24h) views.
  - Vercel's own report says install figures are aggregate registry counters that "do not represent unique people or necessarily independent choices".
  - Telemetry opt-out is `DISABLE_TELEMETRY=1` per the official CLI docs; one third-party page says `SKILLS_NO_TELEMETRY=1` (conflict noted). — [skills.sh FAQ](https://skills.sh/docs/faq); [skills.sh CLI docs](https://skills.sh/docs/cli); [Vercel: state of agent skills](https://vercel.com/blog/state-of-agent-skills); [Vercel: introducing skills](https://vercel.com/blog/introducing-skills)
- **Install-stat reset on repo migration:** a Vercel Community thread asks whether moving skills to a new repo resets install stats. This suggests counts are keyed by repo path, which gives an incentive against forks and renames. — [Vercel Community](https://community.vercel.com/t/will-migrating-agent-skills-to-a-new-repository-on-skills-sh-reset-install-stats/35844.md)
- **Concentration (search summary; methodology unverified):** a third-party August 2026 census reports that 8 accounts hold half of about 162M installs, and that "the most-installed Claude Code skill … installs other skills". — [DEV: skillselion top-10](https://dev.to/skillselion/the-entire-claude-code-skills-top-10-belongs-to-three-authors-anthropic-holds-one-slot-27jc); [DEV: most-installed skill](https://dev.to/skillselion/the-most-installed-claude-code-skill-does-not-write-code-it-installs-other-skills-2pao)
- **claudemarketplaces.com:**
  - Crawls listings and refreshes install counts and GitHub stars on a schedule; an editor sweeps for spam.
  - Its About page tells users to "review plugin code and repositories before installation".
  - A comparison says it and claudeskills.info mostly show category or alphabetical lists with no quality filter and no security results. — [claudemarketplaces.com](https://claudemarketplaces.com/); [openaitoolshub comparison](https://www.openaitoolshub.org/en/blog/claude-skills-marketplace-comparison); [claudeskills.info](https://claudeskills.info/skills/)
- **SkillsMP:** described as stating that a listing "is not a quality certification" and that it hasn't tested every skill. It filters only for skills with at least 2 GitHub stars (search summary). — [paperclipped.de comparison](https://www.paperclipped.de/en/blog/ai-agent-skills-marketplace/); [agensi.io comparison](https://www.agensi.io/learn/best-ai-agent-skills-marketplaces-2026)
- **Self-pinged installs:** at least one directory counts installs via an opt-in telemetry snippet that authors put in SKILL.md to ping an install endpoint. Authors can therefore generate counts themselves (search summary; the specific directory wasn't identified). — [agentskillshub directory comparison](https://agentskillshub.top/agent-skills-directories/)
- **GitHub fake stars ("Six Million (Suspected) Fake Stars on GitHub", ICSE 2026; CMU, NCSU, Socket):**
  - About 6M suspected fake stars from 2019–2024, a surge in 2024.
  - About 18,617 repos and about 301K accounts involved.
  - AI/LLM repos were the largest non-blockchain recipient group.
  - Up to 78 such repos appeared on GitHub Trending.
  - About 90.42% of flagged repos had been deleted by January 2025. — [arXiv 2412.13459](https://arxiv.org/abs/2412.13459); [ICSE 2026 listing](https://conf.researchr.org/details/icse-2026/icse-2026-research-track/14/Six-Million-Suspected-Fake-Stars-on-GitHub-A-Growing-Spiral-of-Popularity-Contests)
- **Anthropic marketplaces:**
  - `claude-plugins-official` (auto-registered in interactive terminal sessions) holds "Plugins Anthropic maintains, plus plugins from partners and other authors". Most listings are from partners.
  - `claude-community` (anthropics/claude-plugins-community) holds author-submitted third-party plugins.
  - Topic marketplaces include `anthropics/skills` and `anthropics/knowledge-work-plugins`.
  - The web catalog at claude.com/marketplace/plugins shows install counts and marks some plugins "Anthropic verified".
  - The old `claude-code-plugins` marketplace in `anthropics/claude-code` is **deprecated**; its plugins now update from `claude-plugins-official`. — [Anthropic's marketplaces](https://code.claude.com/docs/en/plugins/anthropic-marketplaces)

### Inferences
- **Reliability ranking:**
  1. Anthropic official, verified, or SHA-pinned community marketplaces.
  2. skills.sh with audit badges, used for discovery plus a first-pass risk signal (badges can be stale or inconsistent).
  3. Curated awesome lists (ComposioHQ/awesome-claude-skills, travisvn/awesome-claude-skills, VoltAgent/awesome-agent-skills), useful for discovery but with no security review.
  4. Aggregator directories (claudemarketplaces.com, claudeskills.info, SkillsMP), which have weak curation and scraped or self-reported metrics.
- Install counts and stars should be read as popularity signals only. "Installer" meta-skills and CI or reinstall loops can inflate them.

### Gaps
- I couldn't reach the GitHub API for current star counts or last-push dates of the awesome lists, vercel-labs/skills, or anthropics/claude-plugins-official, because the session's GitHub proxy blocks unattached repos.
- No confirmed report of deliberately faked install counts on skills.sh, claudemarketplaces.com, or SkillsMP was found. The evidence shows a structural ability to game counts, not a proven incident.
- The agentskills.io open spec and Anthropic engineering blog posts were not fetched in this pass.
