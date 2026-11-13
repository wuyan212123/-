# Claude Code Agent Skills: engineering workflow and meta-capabilities (as of 2026-11-13)

Method note: I shallow-cloned each candidate repo into the scratchpad (`research-clones/`) and checked the latest commit date (`git log -1`), the SKILL.md inventory, the LICENSE file, any hooks.json files and script counts. I treated all cloned content as untrusted and executed none of it. Star counts come from GitHub repo pages via WebFetch on 2026-11-13. The GitHub REST API (`gh api`, `api.github.com`) was blocked in this session, so stars are missing for some repos and are marked "unverified". **skills.sh and blog.fsck.com were unreachable** (blocked by the session network allowlist), so I could not collect skills.sh install counts. "Last commit" means the HEAD commit date of the default branch. Stale means no commit in 6 or more months, i.e. before roughly 2026-05-13.

## Q1. Beyond obra/superpowers, which workflow skill packs are most respected, and do they exist?

### Takeaway
All the packs named in the brief exist and are actively maintained, with one exception: hamelsmu/claude-review-loop is stale and is a plugin rather than a skill pack. The strongest complements to superpowers are:
- **mattpocock/skills**: spec, tickets, PR and handoff skills, mostly user-invoked.
- **getsentry/skills**: commit, PR, AGENTS.md, prompt and skill-writer skills; official vendor, Apache-2.0.
- **addyosmani/agent-skills**: git workflow, ADRs/docs and context engineering.
- **anthropics/claude-plugins-official**: claude-md-management, commit-commands, pr-review-toolkit, feature-dev, skill-creator.

trailofbits/skills is respected but security- and audit-heavy, and it is licensed CC-BY-SA-4.0. EveryInc/compound-engineering and affaan-m/everything-claude-code are large opinionated workflow systems that overlap heavily with superpowers.

### Cited Findings

**Baseline already installed: obra/superpowers**
- GitHub page shows 317.1k stars and 28.2k forks — [GitHub](https://github.com/obra/superpowers)
- Version is 7.0.2 per `.claude-plugin/plugin.json`. Last commit 2026-11-03 (verified by clone).
- It has 15 skills: using-superpowers, brainstorming, writing-plans, executing-plans, subagent-driven-development, dispatching-parallel-agents, TDD, systematic-debugging, requesting- and receiving-code-review, using-git-worktrees, finishing-a-development-branch, verification-before-completion, writing-skills, and diagnosing-superpowers (new) — [repo](https://github.com/obra/superpowers/tree/main/skills)
- Ships a `SessionStart` hook (matcher `startup|clear|compact`) that runs `hooks/run-hook.cmd session-start` synchronously and injects using-superpowers — [hooks.json](https://github.com/obra/superpowers/blob/main/hooks/hooks.json)
- using-superpowers contains the instruction "If you think there is even a 1% chance a skill might apply… you ABSOLUTELY MUST invoke the skill" and "YOU DO NOT HAVE A CHOICE. YOU MUST USE IT", inside `<EXTREMELY-IMPORTANT>` tags — [SKILL.md](https://github.com/obra/superpowers/blob/main/skills/using-superpowers/SKILL.md)
- License: MIT.

**mattpocock/skills**
- Matt Pocock is a well-known TypeScript educator (community, high credibility).
- GitHub page shows 323.6k stars and 27.2k forks — [GitHub](https://github.com/mattpocock/skills)
- Install via plugin or `npx skills@latest add`, then run `/setup-matt-pocock-skills` once per repo — [GitHub](https://github.com/mattpocock/skills)
- Last commit 2026-11-12. License: MIT. 39 SKILL.md files.
- Engineering skills: `skills/engineering/{to-spec, to-tickets, implement-spec, implement, tdd, diagnosing-bugs, code-review, pr, triage, improve-codebase-architecture, domain-modeling, codebase-design, prototype, research, retro, grill-with-docs}`.
- Productivity skills: `skills/productivity/{grill-me, handoff, writing-for-agents, teach, wait-what}`.
- Misc skills: `skills/misc/{git-guardrails-claude-code, setup-pre-commit}`. There is also an `in-progress/` folder (claude-handoff, software-factory and others), which should be treated as unstable — [repo](https://github.com/mattpocock/skills/tree/main/skills)
- Notable skills:
  - `engineering/code-review` reviews the diff along two axes (repo Standards and the originating Spec) in parallel subagents.
  - `engineering/pr` has the description "Use when writing a PR body."
  - `productivity/handoff` is `disable-model-invocation: true` and writes the handoff doc to `$TMPDIR`, not the workspace — [handoff SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md)
  - `misc/git-guardrails-claude-code` sets up Claude Code hooks that block `git push`, `reset --hard`, `clean`, `branch -D` and similar — [SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/misc/git-guardrails-claude-code/SKILL.md)
- No hooks.json in the repo, and only 6 scripts.

**addyosmani/agent-skills**
- Addy Osmani is a Google Chrome engineering lead (community but high credibility).
- GitHub page shows 117.1k stars and 12.2k forks. Install with `npx skills add addyosmani/agent-skills` or through the Claude Code marketplace plugin `agent-skills` — [GitHub](https://github.com/addyosmani/agent-skills)
- Last commit 2026-11-01. License: MIT. 25 skills, including:
  - spec-driven-development, planning-and-task-breakdown, incremental-implementation
  - test-driven-development, debugging-and-error-recovery
  - code-review-and-quality, code-simplification
  - git-workflow-and-versioning, documentation-and-adrs, context-engineering, using-agent-skills
  - doubt-driven-development, interview-me, idea-refine
  - shipping-and-launch, ci-cd-and-automation, security-and-hardening, performance-optimization
  - browser-testing-with-devtools, frontend-ui-engineering
  - Source: [repo](https://github.com/addyosmani/agent-skills/tree/main/skills)
- Skills are long. git-workflow-and-versioning has about 2,118 words; context-engineering about 2,246; doubt-driven-development about 2,558 (local word count).
- `hooks/session-start.sh` injects the using-agent-skills meta-skill, but its own comment says it is "Not wired by the plugin" on Claude Code and Codex, because they already route skills natively. Other scripts: `sdd-cache-*.sh` and `simplify-ignore.sh` — [hooks/session-start.sh](https://github.com/addyosmani/agent-skills/blob/main/hooks/session-start.sh)

**getsentry/skills (official Sentry)**
- GitHub page shows 1.2k stars and 69 forks — [GitHub](https://github.com/getsentry/skills)
- Last commit 2026-11-05. License: Apache-2.0. 31 skills.
- Workflow-relevant skills: `skills/commit`, `pr-writer`, `create-branch`, `iterate-pr`, `pr-link-issue`, `gh-review-requests`, `code-review`, `find-bugs`, `code-simplifier`, `agents-md`, `skill-writer`, `skill-scanner`, `prompt-optimizer`, `claude-settings-audit`, `security-review` and `doc-coauthoring` — [repo](https://github.com/getsentry/skills/tree/main/skills)
- Some skills are Sentry-specific (django-access-review, sred-*, browse-local-sentry).
- `commit` description: "Use for every request to commit changes or draft a commit message. Creates Sentry-style conventional commits with issue references". It also creates a feature branch if you are on main/master — [commit SKILL.md](https://github.com/getsentry/skills/blob/main/skills/commit/SKILL.md)

**trailofbits/skills (official Trail of Bits, a security firm)**
- GitHub page shows 8.2k stars and 698 forks — [GitHub](https://github.com/trailofbits/skills)
- Last commit 2026-11-12. 99 SKILL.md files across about 60 plugins.
- **License is CC-BY-SA-4.0 (share-alike), not MIT** — [LICENSE](https://github.com/trailofbits/skills/blob/main/LICENSE)
- Workflow-relevant plugins:
  - `plugins/gh-cli` (with hooks)
  - `plugins/differential-review`: security-focused diff review with blast radius and git blame
  - `plugins/second-opinion`: external review by **Codex or Antigravity** (external CLIs or paid services)
  - `plugins/code-improver/skills/{pr-improver, skill-improver, code-improver}`: an autonomous review-fix loop. It depends on pr-review-toolkit's `review-pr` and the plugin-dev skill-reviewer agent.
  - `plugins/review-walkthrough`: interactive HTML walkthrough of a diff
  - `plugins/goal-prompt`: drafts `/goal` commands
  - `plugins/patching-bugs`, `regression-hunt`, `mutation-testing`, `property-based-testing`
  - Source: [plugins](https://github.com/trailofbits/skills/tree/main/plugins)
- hooks.json files exist in gh-cli, modern-python and fp-check. There are 306 script files.

**wshobson/agents and wshobson/commands (Seth Hobson, community)**
- wshobson/agents: last commit 2026-11-08, MIT, 92 plugins, 185 SKILL.md files — [repo](https://github.com/wshobson/agents/tree/main/plugins)
- Relevant plugins: git-pr-workflows, tdd-workflows, debugging-toolkit, code-refactoring, code-documentation, documentation-generation, documentation-standards, comprehensive-review, context-management, conductor, agent-teams.
- hooks exist in review-agent-governance and protect-mcp.
- wshobson/commands: last commit 2026-09-30, MIT. It has slash commands, not skills.
- Stars unverified.

**Anthropic official plugins (anthropics/claude-plugins-official)**
- Last commit 2026-11-13. License: Apache-2.0.
- The `plugins/` README in anthropics/claude-code says Anthropic's plugins are now developed in claude-plugins-official, and the old marketplace still lists them — [claude-code plugins README](https://github.com/anthropics/claude-code/blob/main/plugins/README.md)
- Workflow-relevant plugins and what they contain (inventory verified by clone) — [plugins dir](https://github.com/anthropics/claude-plugins-official/tree/main/plugins):

| Plugin | Contents | Type |
|---|---|---|
| `commit-commands` | `/commit`, `/commit-push-pr`, `/clean_gone` | commands, not skills |
| `pr-review-toolkit` | `/review-pr` plus agents: code-reviewer, silent-failure-hunter, pr-test-analyzer, type-design-analyzer, comment-analyzer, code-simplifier | command and agents |
| `feature-dev` | `/feature-dev` plus code-explorer, code-architect and code-reviewer agents | command and agents |
| `code-simplifier` | one agent | agent |
| `code-review` | `/code-review` command | command |
| `claude-md-management` | skill `claude-md-improver` plus `/revise-claude-md` | skill and command |
| `skill-creator` | 5,138-word SKILL.md with evals, benchmarking and description optimization | skill |
| `session-report` | HTML report of token, cache, subagent and skill usage from `~/.claude/projects` | skill |
| `claude-code-setup` | `claude-automation-recommender` | skill |
| `hookify` | writing-rules skill plus hooks | skill and hooks |
| `ralph-loop` | – | – |
| `plugin-dev` | hook-, skill-, command- and agent-development skills | skills |

- None of the plugins above has a hooks file except hookify and security-guidance.

**anthropics/skills**
- Last commit 2026-11-06. 20 skills, including `skill-creator`, `mcp-builder`, `webapp-testing`, `doc-coauthoring`, `frontend-design`, `claude-api`, docx/pptx/xlsx/pdf, and new ones: `discernment-nudge` and `academy-guide`.
- I found no root LICENSE file (licensing appears to be per skill).
- Stars unverified.

**vercel-labs/agent-skills**
- Exists. Last commit 2026-10-27. 9 skills. No root LICENSE found.
- Mostly React/Next/web-perf skills rather than workflow (covered by other researchers).
- Stars unverified.

**EveryInc/compound-engineering-plugin (Every Inc., community company)**
- GitHub page shows 26.1k stars and 2.1k forks — [GitHub](https://github.com/EveryInc/compound-engineering-plugin)
- Last commit 2026-11-13. License: MIT.
- 38 `ce-*` skills: ce-brainstorm, ce-plan, ce-work, ce-debug, ce-code-review, ce-commit, ce-commit-push-pr, ce-resolve-pr-feedback, ce-babysit-pr, ce-worktree, ce-handoff, ce-compound (captures lessons into tests, lint rules or standards), ce-simplify-code, ce-doc-review, and `lfg` (autonomous end-to-end, "pushed without stopping") — [skills](https://github.com/EveryInc/compound-engineering-plugin/tree/main/skills)
- 671 script files.

**affaan-m/everything-claude-code**
- Last commit 2026-11-06. MIT. **1,068 SKILL.md files** and 1,258 scripts.
- hooks/hooks.json plus `hooks/memory-persistence/hooks.json`.
- Stars unverified.

**muratcankoylan/Agent-Skills-for-Context-Engineering**
- Last commit 2026-10-11. MIT. 18 skills: context-fundamentals, context-degradation, context-compression, context-optimization, filesystem-context, memory-systems, multi-agent-patterns, tool-design, harness-engineering, long-horizon-prompting, evaluation and others — [skills](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/main/skills)
- These are design-knowledge skills for building agent systems, not day-to-day workflow. Stars unverified.

**NeoLabHQ/context-engineering-kit**
- Last commit 2026-08-26. **License: GPL-3.0** (copyleft). 204 SKILL.md files.
- Stars unverified.

**Stale repos (no commits in 6+ months)**
- **hamelsmu/claude-review-loop**: last commit **2026-03-14, STALE**.
  - It is a plugin (commands plus a Stop hook plus scripts), not a SKILL.md.
  - The Stop hook "blocks exit" and runs **OpenAI Codex**, which needs an external paid CLI, with up to 4 parallel Codex subagents — [README](https://github.com/hamelsmu/claude-review-loop)
- **glittercowboy/taches-cc-resources**: last commit 2026-04-01, STALE. MIT, 12 skills.
- **softaworks/agent-toolkit**: last commit 2026-03-05, STALE. MIT, 86 skills.

### Inferences
- **Most respected by credibility × activity**:
  - official vendors: Anthropic claude-plugins-official, getsentry/skills, trailofbits/skills
  - high-profile individuals: mattpocock/skills, addyosmani/agent-skills
  - wshobson/agents is popular but broad and shallow
- **Overlap with superpowers**: all of the following overlap almost one to one with superpowers and add little except different style.
  - addyosmani: spec-driven-development, TDD, debugging-and-error-recovery, code-review-and-quality and using-agent-skills (another router meta-skill)
  - mattpocock: tdd, diagnosing-bugs, code-review
  - compound-engineering: ce-plan, ce-brainstorm, ce-debug, ce-code-review, ce-worktree
- Running two "router" meta-skills (using-superpowers plus using-agent-skills or compound-engineering's ce-help/lfg) is likely to cause conflicting process instructions. Pick one framework.
- **Truly additive skills that superpowers lacks**:
  - commit and PR writing: Sentry `commit`/`pr-writer`, mattpocock `pr`, Anthropic commit-commands
  - AGENTS.md/CLAUDE.md upkeep: Anthropic claude-md-improver, Sentry agents-md
  - handoff: mattpocock handoff, ce-handoff
  - prompt optimization: Sentry prompt-optimizer
  - spec to tickets: mattpocock to-spec/to-tickets
  - git safety hooks: mattpocock git-guardrails
  - ADRs and docs: addyosmani documentation-and-adrs
- **Fit for this user** (web, frontend, PPT, video in ephemeral cloud containers): Trail of Bits' security, fuzzing and smart-contract content is mostly irrelevant. Its CC-BY-SA license matters only if the user redistributes modified skills.

### Gaps
- Star counts were not verified for anthropics/skills, claude-plugins-official, wshobson/agents, vercel-labs/agent-skills, everything-claude-code, NeoLab, muratcankoylan, softaworks and taches (GitHub API blocked; not individually fetched).
- skills.sh install counts are missing for all of them (skills.sh blocked by the network allowlist).
- I could not verify any "Hamel Husain skills" pack beyond claude-review-loop. hamelsmu/evals-skills was not checked.

## Q2. Which skills specifically improve git commit/PR quality, CLAUDE.md upkeep, documentation and changelogs?

### Takeaway
- **Commit and PR**: best options are getsentry `commit` plus `pr-writer` (+ `iterate-pr`), Anthropic `commit-commands` (commands), mattpocock `engineering/pr`, and EveryInc `ce-commit`/`ce-commit-push-pr`.
- **CLAUDE.md**: the official choice is `claude-md-management/claude-md-improver`. Sentry `agents-md` is a strong minimalist alternative (single AGENTS.md with CLAUDE.md as a symlink).
- **Docs**: addyosmani `documentation-and-adrs`.
- **Changelogs**: there is no first-party option. The best available is community ComposioHQ `changelog-generator`.

### Cited Findings

**Commit and PR**
- Sentry `commit` (284 words):
  - Conventional commits with issue refs.
  - Checks `git branch --show-current` and creates a feature branch if on main/master.
  - Asks for "one coherent, independently reviewable change at a time".
  - Description says "Use for every request to commit", which is assertive but scoped.
  - Source: [commit SKILL.md](https://github.com/getsentry/skills/blob/main/skills/commit/SKILL.md)
- Sentry `pr-writer` (776 words): "Create or refresh reviewer-facing PR titles and descriptions" — [pr-writer](https://github.com/getsentry/skills/tree/main/skills/pr-writer)
- Sentry `iterate-pr`: "Iterate on a PR until actionable CI passes and high/medium review feedback is addressed… do not wait for human approval" — [iterate-pr](https://github.com/getsentry/skills/tree/main/skills/iterate-pr)
- Sentry `create-branch`: branch naming — [create-branch](https://github.com/getsentry/skills/tree/main/skills/create-branch)
- Anthropic `commit-commands`: `/commit`, `/commit-push-pr`, `/clean_gone` (prunes branches whose remote is gone). These are slash commands, not auto-invoked skills — [commit-commands](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/commit-commands)
- mattpocock `engineering/pr` (560 words), "Use when writing a PR body." — [pr](https://github.com/mattpocock/skills/tree/main/skills/engineering/pr)
- EveryInc skills — [skills](https://github.com/EveryInc/compound-engineering-plugin/tree/main/skills):
  - `ce-commit` (840 words): "clear, value-communicating message"
  - `ce-commit-push-pr` (1,193 words)
  - `ce-resolve-pr-feedback`
  - `ce-babysit-pr`
- addyosmani `git-workflow-and-versioning` (2,118 words) covers atomic commits, splitting a messy tree, PRs, conflicts, release cutting and semver. Its description begins "Use when making any code change", which is a broad trigger — [skill](https://github.com/addyosmani/agent-skills/tree/main/skills/git-workflow-and-versioning)
- JuliusBrussee/caveman `caveman-commit` writes terse commit messages; it is part of the caveman suite — [skills](https://github.com/JuliusBrussee/caveman/tree/main/skills)
- trailofbits `gh-cli` enforces authenticated `gh` CLI over curl or WebFetch for GitHub, and has hooks — [gh-cli](https://github.com/trailofbits/skills/tree/main/plugins/gh-cli)

**CLAUDE.md / AGENTS.md**
- Anthropic `claude-md-improver`: "Audit and improve CLAUDE.md files…".
  - Outputs a quality report first.
  - "ask user for confirmation before updating", then applies changes with Edit.
  - Ships references/templates.md, quality-criteria.md and update-guidelines.md, plus a `/revise-claude-md` command.
  - Source: [claude-md-improver SKILL.md](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/claude-md-management/skills/claude-md-improver/SKILL.md)
- Sentry `agents-md` (458 words):
  - "Create `AGENTS.md`… symlink `CLAUDE.md` to `AGENTS.md`. Do not maintain divergent copies."
  - Rules: bullets and tables, not paragraphs; "Reference existing docs… instead of copying them"; "Do not restate linter, formatter, or typechecker config"; prefer file-scoped test/lint commands.
  - Source: [agents-md SKILL.md](https://github.com/getsentry/skills/blob/main/skills/agents-md/SKILL.md)
- mattpocock `productivity/writing-for-agents` (1,775 words): "Use when creating or editing skills, or modifying AGENTS.md or CLAUDE.md" — [skill](https://github.com/mattpocock/skills/tree/main/skills/productivity/writing-for-agents)
- Built-in Claude Code features: `/init` (built-in command reachable through the Skill tool) and `/doctor prompt-audit`, which "checks your instructions for outdated or conflicting guidance" — [Claude Code docs: skills](https://code.claude.com/docs/en/skills)

**Documentation and changelogs**
- addyosmani `documentation-and-adrs` (1,644 words): ADRs, public API changes, recording context for future engineers and agents — [skill](https://github.com/addyosmani/agent-skills/tree/main/skills/documentation-and-adrs)
- wshobson/agents has `code-documentation`, `documentation-generation` and `documentation-standards` plugins — [plugins](https://github.com/wshobson/agents/tree/main/plugins)
- Sentry `document-api-endpoint` and `doc-coauthoring` — [repo](https://github.com/getsentry/skills/tree/main/skills)
- Changelog: ComposioHQ/awesome-claude-skills `changelog-generator` "creates user-facing changelogs from git commits… customer-friendly release notes". Repo last commit 2026-07-24, which is under 6 months and so not stale — [changelog-generator](https://github.com/ComposioHQ/awesome-claude-skills/tree/master/changelog-generator)
- The sickn33/antigravity-awesome-skills aggregator (last commit 2026-11-12) has changelog-automation, changelog-entry and wiki-changelog. It is a mass aggregator of unknown provenance, so review before use.

### Inferences
- For this user, the minimal high-value set is:
  - Sentry `commit` + `pr-writer` (Apache-2.0, no external services, small)
  - Anthropic `claude-md-management`
  - optionally mattpocock `handoff` + `pr`
  - In ephemeral cloud containers these should be vendored into the repo's `.claude/skills/` (or installed by an environment setup script) so they survive container resets.
- Sentry `commit` auto-creating a feature branch, and `iterate-pr` "do not wait for human approval", may conflict with cloud-session conventions where the harness assigns the branch. Review before adopting.
- **Overlap within the commit/PR group**: Sentry commit, ce-commit, commit-commands `/commit`, caveman-commit and the git-workflow skill all overlap. Install one commit skill to avoid trigger collisions.

### Gaps
- No first-party (Anthropic, Vercel or Sentry) changelog skill was found.
- I did not read the bodies of ComposioHQ changelog-generator or ce-commit in full to judge quality.

## Q3. Which meta skills (skill-creator, context engineering, memory, handoff, orchestration, prompt engineering, verification, token efficiency) are worth having, and which duplicate built-ins?

### Takeaway
Worth having:
- **Anthropic `skill-creator`** (most complete skill authoring, with evals and description tuning). It overlaps with superpowers `writing-skills`, so keep one as primary.
- **Sentry `skill-scanner`**: security-scan third-party skills before installing.
- **Sentry `prompt-optimizer`**.
- **mattpocock `handoff`**: manual-only, tiny.
- **Anthropic `session-report`**: token and skill cost audit.

Duplicates of built-ins:
- the code-simplifier plugin and agents (built-in `/simplify`)
- the code-review plugin (built-in `/code-review`)
- generic security-review skills (built-in `/security-review`)
- verify-type skills (built-in `/verify`, `/run`)
- skill-cost auditing (built-in `/skill-doctor`)

Avoid in ephemeral cloud containers: claude-mem (a persistent local worker plus paid or hosted options) and the caveman CLI/proxy (telemetry on by default). The pure caveman SKILL.md alone is fine.

### Cited Findings

**Built-in bundled skills and commands in Claude Code** — [Claude Code docs: skills](https://code.claude.com/docs/en/skills)
- The list includes `/doctor` (with `prompt-audit`), `/run`, `/verify`, `/run-skill-generator`, `/claude-api`, `/code-review`, `/batch`, `/debug`, `/loop`, `/simplify`, `/skill-doctor` ("reports what each of your skills costs in context and how often it's used") and `/workflow-authoring`.
- `/init` and `/security-review` are built-in commands reachable through the Skill tool.
- All bundled skills can be disabled with `disableBundledSkills`.
- The present session's skill list confirms code-review, simplify, security-review, init, loop, run and fewer-permission-prompts as built-in.

**Context cost rules** — [Claude Code docs: skills](https://code.claude.com/docs/en/skills)
- Descriptions load every turn, and the combined description plus `when_to_use` is truncated at 1,536 characters.
- Bodies load on invocation and stay for the session. Keep SKILL.md under 500 lines.
- After compaction each invoked skill keeps up to 5,000 tokens, within a shared 25,000-token budget.
- `disable-model-invocation: true` removes the description from context entirely.
- `skillOverrides` (`on`, `name-only`, `user-invocable-only`, `off`) does not affect plugin skills.

**Skill authoring**
- Anthropic `skill-creator` (5,138 words): create, modify, run evals, benchmark with variance analysis, optimize description triggering. It exists both in anthropics/skills and as a claude-plugins-official plugin — [skill-creator](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/skill-creator/skills/skill-creator)
- Sentry `skill-writer` (1,290 words): follows the Agent Skills spec; source capture, precision passes, registration, validation — [skill-writer](https://github.com/getsentry/skills/tree/main/skills/skill-writer)
- Sentry `skill-scanner` (1,352 words): "Scan agent skills for security issues" — [skill-scanner](https://github.com/getsentry/skills/tree/main/skills/skill-scanner)
- trailofbits `skill-improver`: an autonomous review-fix loop over a skill. It depends on the plugin-dev skill-reviewer agent — [skill-improver](https://github.com/trailofbits/skills/tree/main/plugins/code-improver/skills/skill-improver)
- Anthropic `plugin-dev` skills: skill-development, hook-development, agent-development and others — [plugin-dev](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/plugin-dev/skills)

**Prompt engineering**
- Sentry `prompt-optimizer` (658 words): optimize system and agent prompts, port prompts between OpenAI, Claude and Gemini, build prompt evals — [prompt-optimizer](https://github.com/getsentry/skills/tree/main/skills/prompt-optimizer)
- trailofbits `goal-prompt` drafts `/goal` commands for goal mode — [goal-prompt](https://github.com/trailofbits/skills/tree/main/plugins/goal-prompt)

**Handoff and session continuity**
- mattpocock `handoff` (144 words): `disable-model-invocation: true`; writes to `$TMPDIR`; references existing artifacts rather than duplicating them; redacts secrets; includes "suggested skills" for the next agent — [handoff](https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md)
- EveryInc `ce-handoff` (929 words): create, resume or find continuity sources — [ce-handoff](https://github.com/EveryInc/compound-engineering-plugin/tree/main/skills/ce-handoff)
- muratcankoylan `context-compression`: structured summarization and durable handoff summaries — [context-compression](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/main/skills/context-compression)

**Context and memory**
- addyosmani `context-engineering` (2,246 words): configure rules files and context per session — [context-engineering](https://github.com/addyosmani/agent-skills/tree/main/skills/context-engineering)
- muratcankoylan pack: memory-systems, filesystem-context, multi-agent-patterns and others, oriented toward designing agent systems — [skills](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/main/skills)
- thedotmack/claude-mem — [GitHub](https://github.com/thedotmack/claude-mem):
  - About 116.8k stars and 10.1k forks. Apache-2.0. Last commit 2026-11-12.
  - Requires a local Bun-managed HTTP worker service, SQLite at `~/.claude-mem/claude-mem.db`, Chroma vector search (uv auto-installed) and plugin hooks.
  - Observer model can be the hosted claude-mem observer (30-day trial, then **asks for a payment method**), OpenRouter, Gemini or your Anthropic plan.
  - Optional cloud sync to cmem.ai.
  - "Anonymous usage analytics are on by default."
  - One installer path uses `curl | bash`.
  - Note: older versions were reportedly AGPL; the current LICENSE is Apache-2.0 (verified).

**Token-efficient output**
- JuliusBrussee/caveman — [GitHub](https://github.com/JuliusBrussee/caveman):
  - 119.6k stars and 7.0k forks. Last commit 2026-11-13. Apache-2.0 plus a LICENSE-MIT file, a LICENSING.md and TRADEMARKS.md.
  - The core `skills/caveman` SKILL.md (744 words) is a terse-voice mode that stays on until "stop caveman".
  - The repo has grown into a product: `@caveman-ai/cli`, a proxy (`caveman providers add`), Caveman Cloud "Auto" routing (sends recent prompts to Caveman Cloud after sign-in), **telemetry on by default** (token counts, install ID, OS, IP; disable with `DO_NOT_TRACK=1`) and 575 script files.
  - README claims "14% cheaper than Claude Code on Terminal-Bench 4" and "33.2% fewer input tokens" (vendor self-benchmarks, unverified).
- caveman also ships workflow skills: `verify-and-stop` ("Prove existing work meets acceptance conditions without expanding scope", 98 words), `investigate-first`, `surgical-patch`, `safe-refactor`, `caveman-review` and `caveman-compress` (sends files to your model provider) — [skills](https://github.com/JuliusBrussee/caveman/tree/main/skills)

**Usage and cost audit**
- Anthropic `session-report` builds an explorable HTML report of tokens, cache, subagents, skills and expensive prompts from `~/.claude/projects` — [session-report](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/session-report/skills/session-report)
- Built-in `/skill-doctor` covers per-skill context cost — [docs](https://code.claude.com/docs/en/skills)

**Setup**
- Anthropic `claude-automation-recommender` recommends hooks, subagents, skills and MCP for a codebase — [skill](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-code-setup/skills/claude-automation-recommender)
- Sentry `claude-settings-audit` generates settings.json permission allowlists. It overlaps with the built-in `fewer-permission-prompts` — [skill](https://github.com/getsentry/skills/tree/main/skills/claude-settings-audit)

### Inferences
- **Skills that duplicate built-ins** (do not add):

| Skill or plugin | Duplicates built-in |
|---|---|
| Anthropic `code-simplifier` plugin, Sentry `code-simplifier`, addyosmani `code-simplification` | `/simplify` |
| Anthropic `code-review` plugin | `/code-review` |
| Sentry `security-review` | `/security-review` |
| caveman `verify-and-stop` | partially `/verify`, plus superpowers verification-before-completion |
| `claude-settings-audit` | `fewer-permission-prompts` |

- pr-review-toolkit's specialized agents (silent-failure-hunter, type-design-analyzer, pr-test-analyzer) are still additive to the built-in `/code-review`.
- superpowers already covers verification-before-completion, subagent-driven-development, dispatching-parallel-agents and writing-skills. Extra orchestration skills (wshobson agent-teams or conductor, ce-work, muratcankoylan multi-agent-patterns) duplicate them.
- **In ephemeral cloud containers**:
  - claude-mem's value (cross-session local memory in `~/.claude-mem`) is largely lost, because the home directory resets. It also adds a background worker, telemetry and a possible paid observer. Not recommended.
  - Repo-committed CLAUDE.md/AGENTS.md plus a handoff doc is the durable memory mechanism.
- **caveman**: if wanted, copy only `skills/caveman/SKILL.md` (pure prompt) rather than installing the CLI, proxy or plugin. Note that it changes response style, which may hurt explanations for a Chinese-speaking user who wants detailed answers.

### Gaps
- I did not verify built-in `/debug` and `/batch` behavior in detail (the docs page names them without describing them).
- Effectiveness data comparing skill-creator, writing-skills and skill-writer was not found.

## Q4. Where do community reviews say superpowers-style forceful skills hurt (token cost, slowness)?

### Takeaway
The critique is consistent but mostly anecdotal: fixed process overhead (brainstorm, plan, TDD, review gates) makes small tasks slow, and large skill bodies cost tokens on every invocation. The maintainer defends the verbose "rationalization tables" as tested and necessary. Measured comparisons are small-sample and mixed; one shows superpowers using about 14% fewer tokens. The forceful "1% chance → MUST invoke" router injected by a SessionStart hook is the main mechanism behind over-triggering.

### Cited Findings
- superpowers issue #832, "Token optimization: 69% line reduction across all 14 skills with no behavioral regression" — [GitHub issue #832](https://github.com/obra/superpowers/issues/832):
  - The author cut 3,150 lines to 977 and noted "Every skill loads fully into context when invoked, so line count directly impacts per-invocation token cost."
  - obra replied that the rationalization tables "are there for a reason and are based on extensive testing and real world use" and that only the description matters for activation.
  - Closed 2026-03-19.
- Superpowers 6.0 was positioned as "faster AI code review and fewer tokens", which implies earlier versions had notable overhead — [Towards AI](https://pub.towardsai.net/superpowers-6-0-unpacked-faster-ai-code-review-and-fewer-tokens-5ab40a6c564c) (member-only; title only). Also [Superpowers 6 post on blog.fsck.com](https://blog.fsck.com/2026/06/15/Superpowers-6.md), which could not be fetched because the host is blocked.
- Search-result summaries (I did not fetch these pages, so treat them as secondary):
  - Reviewers report that every feature starts with 10–20 minutes of brainstorming and planning, and that the five-phase process is "overkill for fast iterative design work" — [mejba.me review](https://www.mejba.me/blog/superpowers-plugin-claude-code-review); [gearscope review](https://gearscope.pages.dev/reviews/superpowers)
  - A 12-session with/without comparison reported about 14% fewer tokens and about 9% lower cost with superpowers. The sample is small, and token variance was reportedly 2–3× lower — [Towards AI test](https://pub.towardsai.net/i-tested-jesse-vincents-175k-star-plugin-plain-markdown-makes-sonnet-4-6-cheat-past-opus-4-7-04687feac7c0); [shiporskip comparison](https://shiporskip.io/compare/caveman-claude-skill-75-percent-token-reduction-vs-obra-superpowers-agentic-skills-framework-tdd-claude-cursor-coding-2026)
  - A claim that the plugin runs git fetch on startup, costing 3+ minutes on slow networks, appears on lzwjava.github.io pages that look AI-generated. **Unverified.** The local hooks dir only references "issue #571" at line 60 of `hooks/session-start` — [lzwjava](https://lzwjava.github.io/skip-superpowers-plugin-en)
  - Headline: "Claude Code Skills Waste 23K Tokens Per Session" — [aiweekly](https://aiweekly.co/alerts/claude-code-skills-waste-23k-tokens-per-session) (content not read).
- Primary-source mechanism:
  - The using-superpowers SKILL.md text ("even a 1% chance… ABSOLUTELY MUST… YOU DO NOT HAVE A CHOICE") — [SKILL.md](https://github.com/obra/superpowers/blob/main/skills/using-superpowers/SKILL.md)
  - SessionStart hook on startup, clear and compact — [hooks.json](https://github.com/obra/superpowers/blob/main/hooks/hooks.json)
  - The brainstorming skill's description in this session begins "You MUST use this before any creative work… in software or out of it".
- addyosmani explicitly does NOT wire its router hook on Claude Code, because a second router on top of native skill routing is harmful — [session-start.sh](https://github.com/addyosmani/agent-skills/blob/main/hooks/session-start.sh)
- Anthropic docs cap the description listing at 1,536 chars and keep loaded skill bodies for the whole session. They recommend `/skill-doctor`, disabling unused skills and `disable-model-invocation` for manual workflows — [docs](https://code.claude.com/docs/en/skills)

### Inferences
- **The user's mix** (frontend pages, PPT, video) is many short creative tasks. The brainstorming "MUST… before any creative work" trigger will likely add a design dialogue before every slide or video tweak.
- **Mitigations**:
  - Keep superpowers for real feature work.
  - Use `/skill-doctor` and the session-report plugin to measure.
  - Prefer small, manual-only (`disable-model-invocation`) skills for commit, handoff and changelog.
  - Avoid stacking a second router meta-skill (addyosmani using-agent-skills, compound-engineering lfg/ce-help, everything-claude-code).
- `skillOverrides` cannot tame plugin-installed superpowers skills (the docs say plugin skills are unaffected). Disabling them would require removing or toggling the plugin.

### Gaps
- No controlled, large-sample benchmark of superpowers' token or time overhead was found.
- Hacker News and Simon Willison discussion were not reached within the tool budget.
- The Superpowers 6/7 changelog details (claimed token reductions) could not be read because blog.fsck.com is blocked.
