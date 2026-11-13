# Claude Code Agent Skills: Security, Backend/Infra/DevOps, and Language/Framework Best Practices (as of 2026-11-13)

Method note: every repo below was verified by `git clone --depth 1` on 2026-11-13. I read the SKILL.md frontmatter and the key bodies, and took the last-commit date from `git log -1` on the shallow clone. Star counts come from the github.com repo pages via WebFetch on 2026-11-13. The GitHub REST API was blocked in this session. skills.sh could not be reached either (the DNS lookup failed under the session's network allowlist), so install counts are rare and come from third-party mirrors. "L" means the SKILL.md line count. I treated all cloned content as untrusted data and executed nothing from it.

## Q1. Which vendors publish official skills repos, and which are actively maintained? (Verified catalog)

### Takeaway
By Nov 2026 most major web, infra and security vendors ship official, actively maintained skills repos, nearly all committed to within the last 2 weeks. Two are notable exceptions. Next.js skills moved out of `vercel-labs/next-skills` into `vercel/next.js/skills`, and the `next-best-practices` skill was retired in favor of an AGENTS.md that `next dev` generates. Sentry's `getsentry/sentry-agent-skills` is archived and superseded by `getsentry/sentry-for-ai`. No official vendor repo was found for Drizzle, FastAPI, Django, Go, Rust, Kubernetes or GitHub Actions; those gaps are filled only by community skills.

### Cited Findings

#### (a) Security — official / high-credibility
- **trailofbits/skills**: about 8.2k stars, 698 forks. Last commit 2026-11-12 ("Add Trailmark taint-trace skill…"). License CC-BY-SA-4.0. Installed as a Claude Code plugin marketplace via `/plugin marketplace add trailofbits/skills`. It has 47 plugins. Details are under Q2. — [repo](https://github.com/trailofbits/skills), [README License section](https://github.com/trailofbits/skills/blob/HEAD/README.md)
- **semgrep/skills**: 343 stars. Last commit 2026-07-27, so it is starting to go stale (3.5 months). It has 3 skills:
  - `skills/code-security`: 82 lines plus 30 rule files. "Covers OWASP Top 10, infrastructure security… 28 rule categories" across 15+ languages. It has a forceful "IMPORTANT: Always consult this skill when writing or reviewing any code that handles user input" and a "Proactive mode… You don't need to wait for the user to ask".
  - `skills/semgrep`: 321 lines. Runs scans and writes custom YAML rules.
  - `skills/llm-security`: OWASP Top 10 for LLM 2025.
  - License is the **Semgrep Rules License v1.0**, which is not OSI open source.
  - Sources: [repo](https://github.com/semgrep/skills), [code-security SKILL.md](https://github.com/semgrep/skills/blob/HEAD/skills/code-security/SKILL.md), [LICENSE](https://github.com/semgrep/skills/blob/HEAD/LICENSE)
- **getsentry/skills**: about 1.2k stars. Last commit 2026-11-05. Apache-2.0. Ships as a Claude plugin. `getsentry/sentry-skills` redirects to the same repo (same HEAD hash). Security-relevant skills:
  - `security-review` (304 lines; allowed-tools Read Grep Glob Bash Task). It has 17 reference files: api-security, authentication, authorization, business-logic, cryptography, csrf, data-protection, deserialization, error-handling, file-security, injection, logging, misconfiguration, modern-threats, ssrf, supply-chain, xss.
  - `gha-security-review` (GitHub Actions exploitation review).
  - `secret-serialization` (secrets leaking via dataclass repr/asdict and similar).
  - `security-model` (writes SECURITY_MODEL.md, a threat-model file meant for review tools).
  - `skill-scanner` (audits agent skills for security issues).
  - `django-access-review` (IDOR/authz) and `django-perf-review` (N+1).
  - `find-bugs` and `code-review`.
  - Sources: [repo](https://github.com/getsentry/skills), [security-review](https://github.com/getsentry/skills/tree/HEAD/skills/security-review)
- **openai/skills** (`skills/.curated/`): 28.7k stars. Last commit 2026-06-23, which is stale (about 5 months). Relevant skills:
  - `security-best-practices` (86 lines). References cover Go backend; Express; general, jQuery, React and Vue frontends; Next.js server; and Django, FastAPI and Flask.
  - `security-threat-model` (81 lines): "Repository-grounded threat modeling that enumerates trust boundaries, assets, attacker capabilities".
  - `security-ownership-map`.
  - Each skill ships its own LICENSE.txt. It is written for Codex but uses the SKILL.md format.
  - Source: [repo](https://github.com/openai/skills/tree/HEAD/skills/.curated)
- **github/awesome-copilot**: last commit 2026-11-13, with 481 SKILL.md files. Security skills include `github-actions-hardening`, `secret-scanning` (GitHub push protection), `agent-owasp-compliance`, `mcp-implementation-security-review`, `tm7-threat-model` (Microsoft Threat Modeling Tool files) and `security-review`. It is GitHub-maintained but aimed at Copilot. — [repo](https://github.com/github/awesome-copilot/tree/HEAD/skills)
- **socketdev/skills**: last commit 2026-11-05, 15 skills, but **only 3 stars**. Skills: `socket-scan`, `socket-fix` (dep-upgrade, dep-patch, dep-replace, dep-cleanup), `socket-inspect` (vets a package before adding it) and `socket-setup`. The description says it will "Prompt unauthenticated users to log in or create an account", so a Socket account is required. The low star count means it is unverified as Socket's primary channel. — [repo](https://github.com/socketdev/skills)
- **No official Snyk skills repo found**: the `snyk/agent-skills` clone failed. **No official CodeQL/GitHub skill** was found; the CodeQL skill lives in Trail of Bits. — clone probes on 2026-11-13.

#### (b) Backend, databases, infra, deploy — official
- **supabase/agent-skills**: 3.1k stars. Last commit 2026-10-02. MIT. Two skills:
  - `supabase` (155 lines; "Use when doing ANY task involving Supabase"). It inlines security rules: never use `user_metadata` in RLS; never expose `service_role` in `NEXT_PUBLIC_` env vars; `SECURITY DEFINER` bypasses RLS; scoped PATs for the CLI/MCP; pin versions. It also says "Always discover commands via `--help` — never guess."
  - `supabase-postgres-best-practices` (64 lines plus 34 references). It works for Postgres "running anywhere", not just Supabase.
  - The Jan 21, 2026 announcement described "30 rules across 8 categories" that pair with the Supabase MCP server.
  - Sources: [repo](https://github.com/supabase/agent-skills), [supabase SKILL.md](https://github.com/supabase/agent-skills/blob/HEAD/skills/supabase/SKILL.md), [Supabase blog](https://supabase.com/blog/postgres-best-practices-for-ai-agents), [Supabase Agent Skills blog](https://supabase.com/blog/supabase-agent-skills)
- **neondatabase/agent-skills**: 113 stars. Last commit 2026-11-12. Apache-2.0. Skills: `neon`, `neon-postgres` (pooled vs direct connections, migrations, branching), `neon-auth` (Managed Better Auth), `neon-functions`, `neon-object-storage`, `neon-realtime` and `neon-ai-gateway`. Several are product-specific (Lakebase-branded primitives). — [repo](https://github.com/neondatabase/agent-skills)
- **prisma/skills**: 80 stars. Last commit 2026-11-09. MIT. Skills: `prisma-orm-setup` (Prisma 6/7/8), `prisma-client-api` (216 lines), `prisma-cli` (v7), `prisma-upgrade-v7`, `prisma-postgres-upgrade` (6/7 to 8), `prisma-postgres-setup`, `prisma-compute` (Prisma's hosting), `prisma-mongodb-upgrade`, `prisma-driver-adapter-implementation`, plus two deprecated alias skills. — [repo](https://github.com/prisma/skills)
- **planetscale/skills**: last commit 2026-09-02. MIT. 15 skills covering safety reviews (Vitess and Postgres), Insights/SQLCommenter, Traffic Control, `planetscale-change-gates-and-approval-contract` and `planetscale-autonomous-execution-mode`. Requires a PlanetScale account and the pscale CLI. — [repo](https://github.com/planetscale/skills)
- **mongodb/agent-skills**: last commit 2026-11-13. Apache-2.0. Skills: `mongodb-schema-design`, `mongodb-query-optimizer`, `mongodb-connection`, `mongodb-natural-language-querying`, `mongodb-search-and-ai`, `mongodb-mcp-setup` and others. — [repo](https://github.com/mongodb/agent-skills)
- **Drizzle: no official skills repo**. Clones of `drizzle-team/skills`, `drizzle-team/agent-skills` and `drizzle-team/drizzle-orm-skills` all failed on 2026-11-13. — clone probes.
- **docker/skills**: 629 stars. Last commit 2026-11-13. Apache-2.0. Skills:
  - `docker-build-strategies` (Dockerfile writing, review and optimization).
  - `docker-compose-patterns`.
  - `docker-project-foundations` ("Dockerizing a project").
  - `docker-destructive-guardrails` (to be used "before running… any Docker command that deletes, wipes, resets").
  - `docker-docs` (answers from current official docs).
  - Docker Sandboxes (`sbx`) and Docker Agent (cagent) skills.
  - Source: [repo](https://github.com/docker/skills)
- **hashicorp/agent-skills**: 928 stars. Last commit 2026-11-03. MPL-2.0. Terraform plugin: `terraform-style-guide`, `terraform-test`, `refactor-module`, `terraform-stacks`, `terraform-search-import`, `terraform-policy`, `azure-verified-modules`, and 9 provider-development skills. A Packer plugin ships 4 skills. — [repo](https://github.com/hashicorp/agent-skills)
- **cloudflare/skills**: 3.4k stars. Last commit 2026-11-10. Apache-2.0. Ships as a Claude plugin with 22 skills:
  - `cloudflare` (product chooser), `workers-best-practices`, `wrangler`, `cf-cli` (beta), `workers-development` and `workers-profiling`.
  - `durable-objects`, `agents-sdk`, `nextjs-on-cloudflare` (via vinext), `frameworks-on-cloudflare` (Astro, SvelteKit and others), `cloudflare-app-bootstrap`.
  - `web-perf` (205 lines; Core Web Vitals/Lighthouse, not Cloudflare-specific), `turnstile-spin` (ships 4 bash scripts), `cloudflare-email-service`, Sandbox SDK skills and Cloudflare One/Zero Trust skills.
  - Source: [repo](https://github.com/cloudflare/skills)
- **vercel-labs/agent-skills** (Vercel deploy part): `deploy-to-vercel`, `vercel-cli-with-tokens` (353 lines; token-based auth), and `vercel-optimize` (cost/performance optimization of deployed projects). `vercel-optimize` bundles about 90 JS/TS files (lib/gates, sanitizers, scanners, scripts) and "Collect[s] Vercel metrics, usage, project config". — [repo](https://github.com/vercel-labs/agent-skills/tree/HEAD/skills)
- **netlify/context-and-tools**: only 52 stars but official Netlify. Last commit 2026-11-10. 16 skills: `netlify-deploy`, `netlify-functions`, `netlify-edge-functions`, `netlify-config` (netlify.toml/_redirects/_headers), `netlify-frameworks`, `netlify-caching`, `netlify-blobs`, `netlify-database` (Postgres), `netlify-identity`, `netlify-forms`, `netlify-image-cdn`, `netlify-ai-gateway`, `netlify-access-control`, `netlify-server` (Early Access), `netlify-mcp-servers` and `netlify-agent-runner`. — [repo](https://github.com/netlify/context-and-tools)
- **awslabs/agent-plugins** (AWS official): 941 stars. Last commit 2026-11-10. 34 skills:
  - `deploy-on-aws/deploy`, `elastic-beanstalk`, `aws-architecture-diagram`.
  - `aws-serverless/aws-lambda`, `api-gateway`, `aws-serverless-deployment` (SAM/CDK), `aws-step-functions`, Lambda durable functions, MicroVMs and Managed Instances.
  - `aws-amplify/amplify-workflow` (Gen2), `databases-on-aws/dsql`, `aws-transform` and `amazon-location-service`.
  - About 20 SageMaker/HyperPod skills.
  - `aws-samples/sample-agent-skills` holds only Office/PDF demos and was last updated 2026-03-31.
  - Sources: [repo](https://github.com/awslabs/agent-plugins), [aws-samples](https://github.com/aws-samples/sample-agent-skills)
- **Sentry (observability)**:
  - `getsentry/sentry-agent-skills`'s README says "⚠️ This repository has been superseded… moved to getsentry/sentry-for-ai… archived". Its last commit is 2026-02-28.
  - **getsentry/sentry-for-ai** had its last commit on 2026-11-05. Its current `src/skills` are `sentry-get-started`, `sentry-instrument`, `sentry-debug-issue`, `sentry-fix-stack-traces`, `sentry-setup-releases`, `sentry-create-alert`, `sentry-otel-exporter-setup` and `sentry-snapshots-cocoa`.
  - Older per-SDK skills live in `skills-legacy/` (sentry-nextjs-sdk 485 lines, sentry-react-sdk, sentry-react-native-sdk 982 lines, sentry-fix-issues via MCP).
  - The repo has `mcp.json` and a `TELEMETRY.md`.
  - Sources: [sentry-agent-skills](https://github.com/getsentry/sentry-agent-skills), [sentry-for-ai](https://github.com/getsentry/sentry-for-ai)
- **stripe/ai**: 2.1k stars. Last commit 2026-11-12. MIT. Its Claude plugin (`providers/claude/plugin`) holds 10 skills:
  - `stripe-best-practices`, `stripe-docs`, `upgrade-stripe`, `connect-recommend`, `connect-required-verification-information`, `stripe-apps`, `metronome` (usage billing), `stripe-projects` (provisions infra/third-party services) and `stripe-directory`.
  - `stripe-pay` ("send funds to another Stripe business"), which is a money-movement capability.
  - **The plugin installs hooks**: a SessionStart hook runs `node …/sessionStart.mjs` and a PostToolUse hook on `Skill` runs `postToolUse.mjs`. They are described as "Prompt agents for Stripe feedback and provide Stripe CLI setup guidance."
  - Source: [hooks.json](https://github.com/stripe/ai/blob/HEAD/providers/claude/plugin/hooks/hooks.json)
- **Tencent CloudBase / WeChat mini-programs**: `tencentcloudbase/skills` had its last commit on 2026-11-12, with 32 skills. They include `miniprogram-development`, `auth-wechat-miniprogram`, `cloudbase-document-database-in-wechat-miniprogram`, `cloudbase-wechat-integration` (WeChat Pay and virtual payment), `ai-model-wechat` (wx.cloud.extend.AI), `cloud-functions`, `cloudrun-development` and `postgresql-best-practices-cloudbase`. Descriptions are bilingual (Chinese keywords such as 云开发 and 小程序). The larger `TencentCloudBase/CloudBase-AI-ToolKit` (209 SKILL.md files) was last committed 2026-11-13. These are the only verifiable mini-program skills I found, and they assume a CloudBase account. Clones of `wechat-miniprogram/skills` and `Tencent/skills` failed. — [tencentcloudbase/skills](https://github.com/tencentcloudbase/skills), [CloudBase-AI-ToolKit](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit)

#### (c) Language/framework — official or core-team
- **vercel-labs/agent-skills**: **34.0k stars, 3.0k forks**. Last commit 2026-10-27. Installed with `npx skills add vercel-labs/agent-skills`.
  - `react-best-practices` (name `vercel-react-best-practices`; 149 lines plus a `rules/` dir of 72 files). It covers "70 rules across 8 categories, prioritized by impact": waterfalls (CRITICAL), bundle size (CRITICAL), server-side (HIGH), client fetching, re-renders, rendering, JS perf, advanced.
  - `composition-patterns` (10 rules; boolean-prop proliferation, compound components).
  - `react-view-transitions`, `react-native-skills`, `web-design-guidelines` and `writing-guidelines`.
  - Sources: [repo](https://github.com/vercel-labs/agent-skills), [react-best-practices SKILL.md](https://github.com/vercel-labs/agent-skills/blob/HEAD/skills/react-best-practices/SKILL.md)
- **React best practices install count (third-party, conflicting)**: a Skillselion page dated 2026-07-28 reports 584,435 all-time skills.sh installs, and llmbase.ai shows about 809.8K. A Jan 2026 analysis counted 57 rules, versus 70 now. — [Skillselion](https://skillselion.com/skills/vercel-labs/agent-skills/vercel-react-best-practices), [llmbase](https://llmbase.ai/skills/vercel-labs/vercel-react-best-practices/), [DevGenius analysis](https://blog.devgenius.io/i-analysed-the-top-10-skills-on-vercels-new-ai-agent-registry-480c69e9d481)
- **Next.js skills moved** to `vercel/next.js/skills`, with the last commit touching `skills/` on 2026-11-13. There are 6 workflow skills: `next-cache-components-adoption`, `next-cache-components-optimizer` (434 lines; "Next.js 16.3+ with Cache Components already adopted"), `next-partial-prefetching-adoption`, `next-partial-prefetching-optimizer`, `next-bundle-optimizer` and `next-dev-loop` (verifies runtime behavior after edits). The old `vercel-labs/next-skills` README says: "`next-best-practices` is no longer a skill. This knowledge is now delivered through the bundled docs and the auto-generated AGENTS.md / CLAUDE.md written by `next dev` (Next.js 16.3+)", and "`next-upgrade`… run `npx @next/codemod@latest upgrade`". — [vercel/next.js skills](https://github.com/vercel/next.js/tree/canary/skills), [vercel-labs/next-skills README](https://github.com/vercel-labs/next-skills/blob/HEAD/README.md)
- **vuejs-ai/skills**: 3.3k stars. Last commit 2026-10-23. MIT. The README calls it an "Early Experiment / Community Project", so it is **not official Vue**. Skills: `vue-best-practices` (135 lines; "MUST be used for Vue.js tasks. Strongly recommends Composition API with `<script setup>` and TypeScript"), `vue-debug-guides`, `vue-pinia-best-practices`, `vue-router-best-practices`, `vue-testing-best-practices`, `create-adaptable-composable` and others. — [repo](https://github.com/vuejs-ai/skills)
- **antfu/skills**: 6.1k stars. Last commit 2026-11-11. MIT. Written by Vue/Vite/Nuxt core member Anthony Fu: `vue`, `nuxt`, `pinia`, `vite` (including Vite 8 Rolldown), `vitest`, `vitepress`, `unocss`, `nitro`, `pnpm`, the `antfu` conventions skill, `antfu-simplify` and `antfu-create-pr`. — [repo](https://github.com/antfu/skills)
- **sveltejs/ai-tools**: 339 stars. Last commit 2026-11-06. MIT. Official Svelte org. `svelte-core-bestpractices` (180 lines) and `svelte-code-writer` ("MUST be used whenever creating, editing or analyzing any Svelte component"). The latter shells out to `npx @sveltejs/mcp list-sections / get-documentation / svelte-autofixer`, so it needs npm network access. — [repo](https://github.com/sveltejs/ai-tools)
- **expo/skills**: 4.1k stars. Last commit 2026-11-13. MIT. 24 skills, with `expo-overview` as the router ("Load this skill first"). Others: `expo-router`, `expo-ui` (SwiftUI/Jetpack Compose via @expo/ui), `expo-native-ui`, `expo-data-fetching` (478 lines), `expo-animation`, `expo-upgrade`, `expo-web-to-native` (turns a web React app into a native app), `expo-dom`, `eas-update`, `eas-workflows` (CI/CD), `eas-app-stores`, `eas-hosting`, `eas-observe`, `eas-simulator` and others. — [repo](https://github.com/expo/skills)
- **callstackincubator/agent-skills** (Callstack, a major React Native consultancy): 1.7k stars. Last commit 2026-10-08. MIT. Skills: `react-native-best-practices` (FPS/TTI/bundle/memory), `react-navigation`, `upgrading-react-native`, `github-actions` (RN simulator/emulator cloud builds), `react-native-testing` (RNTL v13/v14), brownfield migration and TV best practices. — [repo](https://github.com/callstackincubator/agent-skills)
- **flutter/skills**: 3.2k stars. Last commit 2026-11-11. Official Flutter org, BSD-style license. 25 skills, for example `flutter-apply-architecture-best-practices`, `flutter-fix-layout-issues` (uses the Dart/Flutter MCP), `flutter-add-widget-test`, `dart-use-pattern-matching` and `dart-run-static-analysis`. `.agents/hooks.json` defines Stop hooks that run dart-format and dart-analyze, apparently for the repo's own agent rather than the shipped plugin. — [repo](https://github.com/flutter/skills)
- **SwiftUI**:
  - **AvdLee/SwiftUI-Agent-Skill** has 3.9k stars and a last commit on 2026-11-06. `swiftui-expert-skill` covers `@Observable`, state and modern APIs. The author, Antoine van der Lee (SwiftLee), is a well-known iOS educator, but the skill is not from Apple.
  - **twostraws/SwiftUI-Agent-Skill** (`swiftui-pro`, 122 lines; Paul Hudson of Hacking with Swift) had its last commit on 2026-10-26.
  - Sources: [AvdLee](https://github.com/AvdLee/SwiftUI-Agent-Skill), [twostraws](https://github.com/twostraws/SwiftUI-Agent-Skill)
- **TypeScript**: no official TypeScript-team skill was found. `mattpocock/skills` (last commit 2026-11-12) is mostly engineering-process skills. Its only TS-specific items are `migrate-to-shoehorn`, `setup-pre-commit` (type checking) and an in-progress `setup-ts-deep-modules`. — [repo](https://github.com/mattpocock/skills)

#### Community fill-ins for categories with no vendor skill (lower credibility)
- **Jeffallan/claude-skills**: 12.3k stars. Last commit 2026-10-30. 67 "persona" skills, including `fastapi-expert`, `django-expert`, `golang-pro`, `rust-engineer`, `typescript-pro`, `nextjs-developer` (still says "Next.js 14+"), `react-expert`, `vue-expert`, `api-designer` (REST/GraphQL/OpenAPI), `postgres-pro`, `database-optimizer`, `kubernetes-specialist`, `terraform-engineer`, `devops-engineer`, `security-reviewer` and `fullstack-guardian`. — [repo](https://github.com/Jeffallan/claude-skills)
- **akin-ozer/cc-devops-skills**: last commit 2026-07-11. 31 generator and validator pairs: `github-actions-generator`/`-validator`, `dockerfile-generator`/`-validator`, `k8s-yaml-generator`/`-validator`, `k8s-debug`, `helm-*`, `terraform-*`, `terragrunt-*`, `promql`/`logql`, `ansible` and `jenkinsfile`. Many are over 1,000 lines. The terraform-validator "runs tflint, c[heckov]" and similar tools. — [repo](https://github.com/akin-ozer/cc-devops-skills)
- Large aggregators (unvetted): `sickn33/antigravity-awesome-skills` (9,454 SKILL.md files), `secondsky/claude-skills` (187), `ComposioHQ/awesome-claude-skills` (864, last commit 2026-07-24) and `VoltAgent/awesome-agent-skills` (a link list). `secondsky` also re-publishes a copy of `vercel-react-best-practices`. — [sickn33](https://github.com/sickn33/antigravity-awesome-skills), [secondsky](https://github.com/secondsky/claude-skills), [ComposioHQ](https://github.com/ComposioHQ/awesome-claude-skills), [VoltAgent](https://github.com/VoltAgent/awesome-agent-skills)

### Inferences
- **Activity**:
  - Actively maintained (commits within 2 weeks of 2026-11-13): trailofbits, cloudflare, expo, stripe, getsentry/skills and sentry-for-ai, neon, prisma, hashicorp, antfu, sveltejs, flutter, mongodb, docker, netlify, awslabs, vercel/next.js and tencentcloudbase.
  - Moderately active (1–2 months): vercel-labs/agent-skills, supabase, vuejs-ai and callstack.
  - **Stale or moved**: semgrep/skills (Jul 2026), openai/skills (Jun 2026), planetscale (Sep 2026), vercel-labs/next-skills (moved) and getsentry/sentry-agent-skills (archived).
- **Overlap with already-installed skills**:
  - Sentry `security-review`/`find-bugs`/`code-review`, Semgrep `code-security`, OpenAI `security-best-practices` and Trail of Bits `differential-review` all overlap with Claude Code's built-in `/security-review` and `/code-review`, and with superpowers' `requesting-code-review`.
  - Trail of Bits `property-based-testing` and `mutation-testing` complement superpowers' `test-driven-development` rather than duplicating it.
  - anthropics/skills has no framework skills, so the React/Vue/Svelte/Expo skills do not overlap with it.
  - Vercel `web-design-guidelines` overlaps with the already-installed design skills (impeccable, ui-ux-pro-max and others).
- **Specific additions that fill gaps** (none duplicates the built-in reviewers):
  - Supply chain: Trail of Bits `supply-chain-risk-auditor`, or Socket.
  - CI security: Sentry `gha-security-review` or Trail of Bits `agentic-actions-auditor`.
  - Threat modeling: Sentry `security-model` or OpenAI `security-threat-model`.
  - Supabase RLS rules: `supabase`.
- **Cloud-session fit**: in ephemeral Claude Code cloud containers, user-level installs (`/plugin marketplace add`, `npx skills add`) do not persist across sessions unless they are committed to the repo's `.claude/skills` or added through an environment setup script. Prefer small, text-only skills such as react-best-practices, composition-patterns, supabase-postgres-best-practices and workers-best-practices. Avoid hook-bearing plugins (stripe, trailofbits gh-cli, modern-python), because their PATH shims and SessionStart scripts change the environment.

### Gaps
- skills.sh leaderboard install counts could not be fetched (DNS blocked in this session; skills.sh must be allowed in the network settings). The only install figure is the third-party React best practices count above.
- Star counts for planetscale, mongodb, tencentcloudbase, vercel/next.js skills and akin-ozer were not fetched.
- claudemarketplaces.com was not checked.
- No official Drizzle, FastAPI, Django, Go, Rust, Kubernetes, GitHub Actions or TypeScript-team skills were found. A repo under another name could have been missed, because only guessed names were probed.
- I did not verify whether the `aws/` org (as opposed to `awslabs`) has a separate skills repo: the `aws/agent-skills` clone failed.

## Q2. Trail of Bits security skills: what is in them, and are they suitable for general app developers?

### Takeaway
trailofbits/skills is the most credible security-skill marketplace: about 8.2k stars, commits daily, from a top security firm. But most of its 47 plugins target professional auditors: fuzzing, smart contracts, crypto side channels, C/C++/Rust memory safety and formal proofs. For a frontend-heavy web developer, about 6 plugins are useful:
- `static-analysis` (Semgrep/CodeQL/SARIF)
- `supply-chain-risk-auditor`
- `differential-review`
- `insecure-defaults`
- `sharp-edges`
- `agentic-actions-auditor`

`fp-check` and `variant-analysis` are useful helpers. Skip the rest, and be careful with the hook-bearing plugins (`gh-cli`, `modern-python`, `fp-check`).

### Cited Findings
- **Install**: `/plugin marketplace add trailofbits/skills`, then `/plugin menu`. It also supports Codex and ChatGPT workspace marketplaces. — [README](https://github.com/trailofbits/skills/blob/HEAD/README.md)
- **README categories**:
  - **Smart Contract Security**: building-secure-contracts, which scans Solana, Cairo, Cosmos, Algorand, TON and Substrate and includes audit-prep, token-integration and code-maturity skills; also entry-point-analyzer.
  - **Code Auditing**: agentic-actions-auditor, audit-context-building, burpsuite-project-parser, c-review, cvss-scoring, differential-review, dimensional-analysis, fp-check, insecure-defaults, rust-review, semgrep-rule-creator, semgrep-rule-variant-creator, sharp-edges, static-analysis, supply-chain-risk-auditor, testing-handbook-skills, trailmark, variant-analysis and vulnerability-triage-brocards.
  - **Malware Analysis**: yara-authoring.
  - **Verification**: constant-time-analysis, mutation-testing, patching-bugs, post-patch-validation, property-based-testing, regression-hunt, spec-to-code-compliance, writing-lean-proofs and zeroize-audit.
  - **Reverse Engineering**: dwarf-expert.
  - **Mobile Security**: firebase-apk-scanner.
  - **Development**: code-improver, devcontainer-setup, gh-cli, git-cleanup, goal-prompt, github-triage, let-fate-decide (Tarot), modern-cpp, modern-python, open-sourcing, review-walkthrough and second-opinion.
  - **Team Management**: culture-index.
  - **Tooling**: chrome-mcp-troubleshooting.
  - Source: [README](https://github.com/trailofbits/skills/blob/HEAD/README.md)
- **`static-analysis/semgrep`** (273 lines):
  - "presents the plan for explicit approval… User must approve the scan plan (Step 3 is a hard gate)".
  - It runs via `scripts/run-scans.sh` with `--metrics=off`.
  - "Always check for Semgrep Pro before scanning — Pro enables cross-file taint tracking and catches ~250% more true positives". That is a vendor claim, and Pro needs a Semgrep account.
  - Source: [SKILL.md](https://github.com/trailofbits/skills/blob/HEAD/plugins/static-analysis/skills/semgrep/SKILL.md)
- **`static-analysis/codeql`** (295 lines) requires the `codeql` CLI (`gh extension install github/gh-codeql` or brew) and `jq`, and stops if they are missing. The plugin also includes `sarif-parsing` (493 lines). — [SKILL.md](https://github.com/trailofbits/skills/blob/HEAD/plugins/static-analysis/skills/codeql/SKILL.md)
- **`supply-chain-risk-auditor`** (122 lines):
  - It audits npm, PyPI and Go dependencies: "version-matched advisories… abandoned or archived upstreams, npm publisher concentration, and install-time scripts". It uses "Two deterministic scripts" and says "Do not estimate maintainer counts… from gh, web search, or memory".
  - It reads `package-lock.json`, `uv.lock` and `go.mod`. "`yarn.lock`, `pnpm-lock.yaml`, and `poetry.lock` are not read."
  - It needs `gh auth status`, because unauthenticated GitHub allows only 60 requests/hour.
  - Source: [SKILL.md](https://github.com/trailofbits/skills/blob/HEAD/plugins/supply-chain-risk-auditor/skills/supply-chain-risk-auditor/SKILL.md)
- **`agentic-actions-auditor`** (325 lines) "Audits GitHub Actions workflows for security vulnerabilities in AI agent integrations including Claude Code Action, Gemini CLI, OpenAI Codex, and GitHub AI Inference". — [plugin](https://github.com/trailofbits/skills/tree/HEAD/plugins/agentic-actions-auditor)
- **`differential-review`** (225 lines) is a "security-focused differential review of code changes… uses git blame… calculates blast radius by counting callers, checks test coverage". **`sharp-edges`** (293 lines) "Identifies error-prone APIs, dangerous configurations, and footgun designs". **`insecure-defaults`** is a command/workflow plugin ("fail-open insecure defaults, with a refuting verifier per candidate") with no SKILL.md. — [plugins dir](https://github.com/trailofbits/skills/tree/HEAD/plugins)
- **Hooks**:
  - `gh-cli` hooks "Intercept GitHub URL fetches (WebFetch and MCP fetch tools) and curl/wget commands, suggest gh CLI instead. PATH shim blocks gh anti-patterns. Cleanup cloned repos on session end."
  - `modern-python` "Intercept[s] legacy Python/pip commands via PATH shims and suggest[s] uv".
  - `fp-check` adds a prompt-type Stop hook.
  - Sources: [gh-cli hooks.json](https://github.com/trailofbits/skills/blob/HEAD/plugins/gh-cli/hooks/hooks.json), [modern-python hooks.json](https://github.com/trailofbits/skills/blob/HEAD/plugins/modern-python/hooks/hooks.json)
- **License**: CC-BY-SA-4.0, a share-alike license that is unusual for code. **Stars**: about 8.2k on github.com (2026-11-13). Third-party snapshots range from 6.1k (Sep 2, 2026) to about 8K (ethereum.org, Sep 2026). — [repo](https://github.com/trailofbits/skills), [Brightcoding](https://blog.brightcoding.dev/2026/09/02/trailofbitsskills-claude-code-marketplace-for-security-research), [ethereum.org listing](https://ethereum.org/developers/tools/trail-of-bits-skills-marketplace/)

### Inferences
- **Suitability for a web developer**:
  - `supply-chain-risk-auditor` is the strongest. It is deterministic and script-backed, and it covers the npm lockfile risks that the built-in `/security-review` does not address. It does not read `pnpm-lock.yaml`, which matters for pnpm users.
  - `static-analysis/semgrep` works with free OSS Semgrep, installed via pip/npm in the container. CodeQL needs a large CLI download, which is heavy for ephemeral containers.
  - `agentic-actions-auditor` is directly relevant if the user runs Claude Code Action in GitHub Actions.
- **Hook risk in cloud sessions**:
  - **Do not install `gh-cli`**. In these cloud sessions `gh api` is restricted per repo (GitHub API returned 403 for non-attached repos), so a hook that redirects WebFetch and curl for GitHub URLs to `gh` could break research and fetch flows.
  - `modern-python`'s PATH shims change pip behavior. Avoid it unless the user wants uv.
- The CC-BY-SA-4.0 license matters only if the user redistributes modified skills: derivatives must use the same license.

### Gaps
- I did not measure how often these skills trigger correctly, or their false-positive rates. No public benchmarks were found.
- I did not read the README Trophy Case, so no vulnerabilities found with these skills are cited.

## Q3. Which framework skills give the biggest quality uplift for React/Next.js/TypeScript work specifically?

### Takeaway
For React/Next.js:
1. **Highest uplift**: vercel-labs `react-best-practices` (70 impact-ranked rules; the most widely installed skill on skills.sh per mirrors).
2. **Next**: `composition-patterns`.
3. **On Next.js 16.3+**: the official `vercel/next.js` workflow skills (cache-components, partial-prefetching, bundle-optimizer, next-dev-loop), plus the `AGENTS.md` that `next dev` auto-generates. That AGENTS.md replaces the retired `next-best-practices` skill.

There is no first-party TypeScript skill. Type-safety uplift comes mainly from framework skills and tooling, not from a dedicated skill.

### Cited Findings
- **`react-best-practices`**:
  - It has 8 categories: "1 Eliminating Waterfalls CRITICAL `async-`; 2 Bundle Size Optimization CRITICAL `bundle-`; 3 Server-Side Performance HIGH `server-`; 4 Client-Side Data Fetching MEDIUM-HIGH; 5 Re-render Optimization MEDIUM; 6 Rendering Performance MEDIUM; 7 JavaScript Performance LOW-MEDIUM; 8 Advanced Patterns LOW".
  - Example rules: `async-parallel` (Promise.all), `bundle-barrel-imports`, `bundle-dynamic-imports`, `bundle-defer-third-party`, `server-auth-actions` ("Authenticate server actions like API routes") and `server-cache-react` (React.cache).
  - It is progressive-disclosure: a 149-line SKILL.md plus 72 rule files.
  - Source: [SKILL.md](https://github.com/vercel-labs/agent-skills/blob/HEAD/skills/react-best-practices/SKILL.md)
- **Popularity**: 34.0k stars on the repo (github.com, 2026-11-13). Mirrors put all-time skills.sh installs at about 584K (Jul 2026) to about 810K. — [repo](https://github.com/vercel-labs/agent-skills), [Skillselion](https://skillselion.com/skills/vercel-labs/agent-skills/vercel-react-best-practices), [llmbase](https://llmbase.ai/skills/vercel-labs/vercel-react-best-practices/)
- **`composition-patterns`** (89 lines, 10 rules) targets "boolean prop proliferation… compound components". **`react-view-transitions`** (332 lines) covers React's `<ViewTransition>` API. — [skills dir](https://github.com/vercel-labs/agent-skills/tree/HEAD/skills)
- **Next.js**: the old `next-best-practices` skill was retired, and its knowledge now comes from "bundled docs (`next/dist/docs/`) and the AGENTS.md / CLAUDE.md agent rules that `next dev` generates (Next.js 16.3+)". The workflow skills require Next.js 16.3+ (for example "Next.js 16.3+ with `cacheComponents: true`"). — [next-skills README](https://github.com/vercel-labs/next-skills/blob/HEAD/README.md), [next-cache-components-optimizer](https://github.com/vercel/next.js/tree/canary/skills/next-cache-components-optimizer)
- **Supporting skills for a React/Next stack**:
  - Cloudflare `web-perf` (205 lines; Core Web Vitals/Lighthouse).
  - Supabase `supabase`, which carries Next.js-specific security rules such as "In Next.js, any `NEXT_PUBLIC_` env…" never holding `service_role`.
  - Sentry `sentry-nextjs-sdk` (legacy) and `sentry-instrument`.
  - Sources: [cloudflare/skills](https://github.com/cloudflare/skills), [supabase SKILL.md](https://github.com/supabase/agent-skills/blob/HEAD/skills/supabase/SKILL.md), [sentry-for-ai](https://github.com/getsentry/sentry-for-ai)
- **OpenAI `security-best-practices`** ships the reference files `javascript-typescript-nextjs-web-server-security.md` and `javascript-typescript-react-web-frontend-security.md`. These are React/Next-specific security checklists. — [openai/skills curated](https://github.com/openai/skills/tree/HEAD/skills/.curated/security-best-practices)
- **No TypeScript skill**: no official TS skill was found. Community options are Jeffallan `typescript-pro` and mattpocock's TS-adjacent tooling skills (shoehorn migration, pre-commit typecheck). — [Jeffallan](https://github.com/Jeffallan/claude-skills), [mattpocock](https://github.com/mattpocock/skills)

### Inferences
- **Recommended core set for a frontend-heavy Chinese web developer on React/Next**:
  - `vercel-labs/agent-skills` (react-best-practices and composition-patterns).
  - The vercel/next.js workflow skills only on Next ≥16.3. On older Next versions they mostly do not apply.
  - `supabase-postgres-best-practices` and `supabase` if the stack uses Supabase.
  - Cloudflare `web-perf`.
  - For Vue/Nuxt users: antfu/skills (core-team author) over vuejs-ai/skills (self-described community experiment with "MUST" trigger language).
  - For Svelte users: official sveltejs/ai-tools.
- **Trigger competition**: react-best-practices could overlap with existing frontend design skills (impeccable, taste-skill and others) in which skill fires. The scopes differ, though: performance and architecture versus visual design.
- Jeffallan's `nextjs-developer` still targets "Next.js 14+", which suggests drift. Prefer the official Next sources.

### Gaps
- No controlled benchmark or eval was found that quantifies the quality uplift of any of these skills. "Biggest uplift" rests on scope, rule specificity and adoption, not on measured outcomes.
- I did not verify whether the Next.js-generated AGENTS.md is produced in Claude Code cloud sessions without running `next dev`.

## Q4. Which skills require accounts or API keys to be useful?

### Takeaway
Pure-knowledge skills need no account. These include react-best-practices, composition-patterns, supabase-postgres-best-practices, workers-best-practices, vue/antfu/svelte best practices, docker-build-strategies, the Terraform style and test skills, the Semgrep, Sentry and OpenAI security guideline skills, and most Trail of Bits audit skills. Deploy, observability, payments and vendor-ops skills are useful only with a vendor account, token or CLI login. Three skills add network or tool dependencies: Semgrep Pro is optional but pushed, Socket requires an account, and Svelte's `svelte-code-writer` needs `npx @sveltejs/mcp`.

### Cited Findings
- **Account or token required**:
  - Vercel: `vercel-cli-with-tokens`, which is explicitly "token-based authentication"; and `vercel-optimize`, which collects "Vercel metrics, usage, project config". — [vercel-labs skills](https://github.com/vercel-labs/agent-skills/tree/HEAD/skills)
  - Netlify (deploy, functions, database, identity and others). — [netlify/context-and-tools](https://github.com/netlify/context-and-tools)
  - Cloudflare: `wrangler`, `cf-cli`, `workers-profiling` (deployed Workers) and `turnstile-spin` (bundles an auth-probe.sh). — [cloudflare/skills](https://github.com/cloudflare/skills)
  - AWS: deploy, Lambda, Amplify, DSQL and SageMaker skills. — [awslabs/agent-plugins](https://github.com/awslabs/agent-plugins)
  - Sentry: the sentry-for-ai fix/debug/alert skills rely on Sentry MCP or API; for example, `sentry-fix-issues` says "Find and fix issues from Sentry using MCP". — [sentry-for-ai](https://github.com/getsentry/sentry-for-ai)
  - Stripe: all skills, plus `stripe-pay` for money movement. — [stripe/ai](https://github.com/stripe/ai)
  - PlanetScale: pscale CLI with `--format json`. — [planetscale/skills](https://github.com/planetscale/skills)
  - Neon functions/auth/storage. — [neondatabase/agent-skills](https://github.com/neondatabase/agent-skills)
  - Prisma Postgres and Prisma Compute. — [prisma/skills](https://github.com/prisma/skills)
  - Expo EAS skills (eas-update, eas-hosting, eas-app-stores, eas-simulator, eas-observe). — [expo/skills](https://github.com/expo/skills)
  - Socket: "Prompt unauthenticated users to log in or create an account". — [socketdev/skills](https://github.com/socketdev/skills)
  - Tencent CloudBase / WeChat mini-program skills. — [tencentcloudbase/skills](https://github.com/tencentcloudbase/skills)
- **Supabase** skills work without an account for guidance, but advise "Use scoped personal access tokens for the Management API, CLI, and MCP server". — [supabase SKILL.md](https://github.com/supabase/agent-skills/blob/HEAD/skills/supabase/SKILL.md)
- **Trail of Bits** `semgrep` checks for Semgrep Pro, which needs a Semgrep login. `supply-chain-risk-auditor` needs an authenticated `gh` for repository criteria; otherwise they come back "unassessable". — [semgrep SKILL.md](https://github.com/trailofbits/skills/blob/HEAD/plugins/static-analysis/skills/semgrep/SKILL.md), [supply-chain SKILL.md](https://github.com/trailofbits/skills/blob/HEAD/plugins/supply-chain-risk-auditor/skills/supply-chain-risk-auditor/SKILL.md)
- **Svelte** `svelte-code-writer` runs `npx @sveltejs/mcp get-documentation …` and `svelte-autofixer`. That needs no account, but it does need npm network access. — [SKILL.md](https://github.com/sveltejs/ai-tools/blob/HEAD/tools/skills/svelte-code-writer/SKILL.md)
- **Bundled scripts and hooks to review before installing**:
  - Stripe plugin: SessionStart and PostToolUse(Skill) node hooks.
  - trailofbits `gh-cli`, `modern-python` and `fp-check` hooks.
  - Vercel `vercel-optimize`: about 90 JS/TS files.
  - Cloudflare `turnstile-spin`: 4 shell scripts.
  - Expo `eas-workflows` and `expo-ui`: scripts dirs.
  - Sentry sentry-for-ai: a `TELEMETRY.md`, meaning telemetry is present.
  - Sources: [stripe hooks](https://github.com/stripe/ai/blob/HEAD/providers/claude/plugin/hooks/hooks.json), [trailofbits plugins](https://github.com/trailofbits/skills/tree/HEAD/plugins), [vercel-optimize](https://github.com/vercel-labs/agent-skills/tree/HEAD/skills/vercel-optimize), [sentry-for-ai](https://github.com/getsentry/sentry-for-ai)
- **Forceful trigger language seen**:
  - Semgrep `code-security`: "IMPORTANT: Always consult this skill…".
  - `supabase`: "Use when doing ANY task involving Supabase".
  - vuejs-ai `vue-best-practices`: "MUST be used for Vue.js tasks".
  - Svelte `svelte-code-writer`: "MUST be used whenever creating, editing…".
  - Expo `expo-overview`: "Load this skill first".
  - Sources: [semgrep](https://github.com/semgrep/skills/blob/HEAD/skills/code-security/SKILL.md), [vuejs-ai](https://github.com/vuejs-ai/skills), [sveltejs](https://github.com/sveltejs/ai-tools), [expo](https://github.com/expo/skills)

### Inferences
- **Cloud sessions with network allowlists**: account-bound deploy skills also need the session environment to allow the vendor's API host (for example api.vercel.com or api.cloudflare.com) and a stored credential. Without both they add little beyond the docs.
- **Licensing**:
  - Semgrep's Rules License v1.0 is restrictive, so do not vendor its rule files into a redistributed product.
  - Trail of Bits' CC-BY-SA-4.0 is share-alike.
  - The others are MIT, Apache-2.0 or MPL-2.0 (HashiCorp).
- **Most "requires-account" skills are low value** for a frontend-heavy developer who doesn't use that vendor. Install them per project, not globally.

### Gaps
- I did not test whether any skill fails gracefully without credentials. The analysis is based only on SKILL.md text.
- I did not check what Sentry's telemetry collects; TELEMETRY.md was not read.
